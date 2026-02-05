/**
 * Tooltip component template
 */
export const TOOLTIP_TEMPLATE = `/**
 * lui-tooltip - An accessible tooltip component
 *
 * Features:
 * - Hover trigger with configurable show delay
 * - Keyboard focus trigger with same delay behavior
 * - Escape key dismissal
 * - 12 Floating UI placement options with collision avoidance
 * - Optional arrow indicator positioned by Floating UI
 * - aria-describedby linking trigger to tooltip content
 * - Non-interactive content only (role="tooltip")
 * - Auto-repositioning on scroll/resize via autoUpdate
 * - Delay group for skip-delay when moving between tooltips
 * - Rich variant with title + description
 * - Hide delay cursor bridge for gap traversal
 * - Touch device filtering via pointerType
 * - Reduced motion support via prefers-reduced-motion
 * - SSR safety with isServer guard
 * - AbortController cleanup in disconnectedCallback
 * - CSS custom properties (--ui-tooltip-*) for theming
 *
 * @slot - Default slot for trigger element
 * @slot content - Named slot for rich tooltip content (overrides content property)
 * @slot title - Named slot for rich tooltip title (overrides tooltip-title property)
 *
 * @csspart trigger - The trigger wrapper
 * @csspart tooltip - The tooltip panel
 * @csspart content - The tooltip content container
 * @csspart arrow - The arrow indicator
 *
 * @example Basic usage
 * \`\`\`html
 * <lui-tooltip content="Save document">
 *   <button>Save</button>
 * </lui-tooltip>
 * \`\`\`
 *
 * @example Rich tooltip
 * \`\`\`html
 * <lui-tooltip rich tooltip-title="Keyboard Shortcut" content="Ctrl+S to save" placement="bottom">
 *   <button>Save</button>
 * </lui-tooltip>
 * \`\`\`
 */

import { html, css, nothing } from 'lit';
import { isServer } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '../../lib/lit-ui/tailwind-element';
import {
  computePosition as _computePosition,
  autoUpdate as _autoUpdate,
  platform,
  flip,
  shift,
  offset,
  arrow,
  type Placement,
  type ComputePositionConfig,
  type ComputePositionReturn,
  type AutoUpdateOptions,
} from '@floating-ui/dom';
import { offsetParent } from 'composed-offset-position';
import { delayGroup, type TooltipInstance } from './delay-group';

export type { Placement };

// Shadow DOM-safe platform configuration
const shadowDomPlatform = {
  ...platform,
  getOffsetParent: (element: Element) =>
    platform.getOffsetParent(element, offsetParent),
};

function computePosition(
  reference: Element,
  floating: HTMLElement,
  config?: Partial<ComputePositionConfig>
): Promise<ComputePositionReturn> {
  return _computePosition(reference, floating, {
    ...config,
    platform: shadowDomPlatform,
  });
}

function autoUpdatePosition(
  reference: Element,
  floating: HTMLElement,
  update: () => void,
  options?: AutoUpdateOptions
): () => void {
  return _autoUpdate(reference, floating, update, options);
}

@customElement('lui-tooltip')
export class Tooltip extends TailwindElement implements TooltipInstance {
  // ---------------------------------------------------------------------------
  // Public properties
  // ---------------------------------------------------------------------------

  /** Text content for the tooltip. Alternative to the content slot. */
  @property({ type: String })
  content = '';

  /** Preferred placement relative to trigger. Floating UI may flip if space is insufficient. */
  @property({ type: String })
  placement: Placement = 'top';

  /** Delay in ms before showing tooltip on hover */
  @property({ type: Number, attribute: 'show-delay' })
  showDelay = 300;

  /** Delay in ms before hiding tooltip after pointer leaves */
  @property({ type: Number, attribute: 'hide-delay' })
  hideDelay = 100;

  /** Whether to show an arrow pointing at the trigger */
  @property({ type: Boolean })
  arrow = true;

  /** Offset distance from trigger in pixels */
  @property({ type: Number })
  offset = 8;

  /** Whether this is a rich tooltip with title + description */
  @property({ type: Boolean })
  rich = false;

  /** Title text for rich tooltip variant */
  @property({ type: String, attribute: 'tooltip-title' })
  tooltipTitle = '';

  /** Disable tooltip display */
  @property({ type: Boolean })
  disabled = false;

  // ---------------------------------------------------------------------------
  // Internal state
  // ---------------------------------------------------------------------------

  @state()
  private open = false;

  private triggerEl: HTMLElement | null = null;
  private showTimeout?: ReturnType<typeof setTimeout>;
  private hideTimeout?: ReturnType<typeof setTimeout>;
  private cleanupAutoUpdate?: () => void;
  private abortController?: AbortController;

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  static override styles = [
    ...tailwindBaseStyles,
    css\`
      :host {
        display: inline-block;
        position: relative;
      }

      .tooltip-panel {
        position: fixed;
        z-index: var(--ui-tooltip-z-index);
        pointer-events: auto;
        max-width: var(--ui-tooltip-max-width);
        width: max-content;

        /* Animation: fade only */
        opacity: 0;
        transition:
          opacity 100ms ease-out,
          display 100ms allow-discrete,
          overlay 100ms allow-discrete;
      }

      .tooltip-panel[data-open] {
        opacity: 1;
      }

      @starting-style {
        .tooltip-panel[data-open] {
          opacity: 0;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .tooltip-panel {
          transition: none;
        }
      }

      .tooltip-content {
        background: var(--ui-tooltip-bg);
        color: var(--ui-tooltip-text);
        border-radius: var(--ui-tooltip-radius);
        padding: var(--ui-tooltip-padding-y) var(--ui-tooltip-padding-x);
        font-size: var(--ui-tooltip-font-size);
        box-shadow: var(--ui-tooltip-shadow);
        line-height: 1.4;
      }

      /* Rich tooltip variant */
      :host([rich]) .tooltip-content {
        padding: 0.75rem 1rem;
      }

      .tooltip-title {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .tooltip-description {
        opacity: 0.9;
      }

      /* Arrow */
      .tooltip-arrow {
        position: absolute;
        width: var(--ui-tooltip-arrow-size);
        height: var(--ui-tooltip-arrow-size);
        background: var(--ui-tooltip-bg);
        transform: rotate(45deg);
      }
    \`,
  ];

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  override connectedCallback(): void {
    super.connectedCallback();
    if (isServer) return;

    this.abortController = new AbortController();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.abortController?.abort();
    this.cleanupAutoUpdate?.();
    clearTimeout(this.showTimeout);
    clearTimeout(this.hideTimeout);

    if (this.open) {
      this.open = false;
      if (this.triggerEl) {
        this.triggerEl.removeAttribute('aria-describedby');
      }
      delayGroup.clearActive(this);
      delayGroup.notifyClosed();
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  override render() {
    return html\`
      <div class="tooltip-trigger" part="trigger">
        <slot
          @slotchange=\${this.handleSlotChange}
          @pointerenter=\${this.handlePointerEnter}
          @pointerleave=\${this.handlePointerLeave}
          @focusin=\${this.handleFocusIn}
          @focusout=\${this.handleFocusOut}
          @keydown=\${this.handleKeyDown}
        ></slot>
      </div>
      \${this.open && !isServer
        ? html\`
            <div
              id="tooltip"
              role="tooltip"
              part="tooltip"
              class="tooltip-panel"
              data-open
              @pointerenter=\${this.handleTooltipPointerEnter}
              @pointerleave=\${this.handleTooltipPointerLeave}
            >
              <div class="tooltip-content" part="content">
                \${this.rich
                  ? html\`
                      <div class="tooltip-title">
                        \${this.tooltipTitle}
                        <slot name="title"></slot>
                      </div>
                      <div class="tooltip-description">
                        \${this.content}
                        <slot name="content"></slot>
                      </div>
                    \`
                  : html\`
                      \${this.content}
                      <slot name="content"></slot>
                    \`}
              </div>
              \${this.arrow
                ? html\`<div class="tooltip-arrow" part="arrow"></div>\`
                : nothing}
            </div>
          \`
        : nothing}
    \`;
  }

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  private handleSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const assigned = slot.assignedElements({ flatten: true });
    const trigger = assigned[0] as HTMLElement | undefined;

    if (trigger) {
      this.triggerEl = trigger;
    }
  }

  private handlePointerEnter = (e: PointerEvent): void => {
    // Skip touch -- tooltips are hover-only
    if (e.pointerType === 'touch') return;
    if (this.disabled) return;
    this.scheduleShow();
  };

  private handlePointerLeave = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return;
    this.scheduleHide();
  };

  private handleFocusIn = (): void => {
    if (this.disabled) return;
    this.scheduleShow();
  };

  private handleFocusOut = (): void => {
    this.scheduleHide();
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.open) {
      e.preventDefault();
      this.hide();
      delayGroup.notifyClosed();
    }
  };

  private handleTooltipPointerEnter = (): void => {
    clearTimeout(this.hideTimeout);
  };

  private handleTooltipPointerLeave = (): void => {
    this.scheduleHide();
  };

  // ---------------------------------------------------------------------------
  // Show/hide state machine
  // ---------------------------------------------------------------------------

  private scheduleShow(): void {
    clearTimeout(this.hideTimeout);
    if (this.open) return;

    const delay = delayGroup.isInGroupWindow() ? 0 : this.showDelay;
    this.showTimeout = setTimeout(() => this.show(), delay);
  }

  private scheduleHide(): void {
    clearTimeout(this.showTimeout);
    if (!this.open) return;

    this.hideTimeout = setTimeout(() => {
      this.hide();
      delayGroup.notifyClosed();
    }, this.hideDelay);
  }

  private show(): void {
    this.open = true;

    // Set aria-describedby when tooltip becomes visible
    if (this.triggerEl) {
      this.triggerEl.setAttribute('aria-describedby', 'tooltip');
    }

    // Track in delay group for force-close behavior
    delayGroup.setActive(this);

    // Position after render
    this.updateComplete.then(() => {
      this.updatePosition();
      this.startAutoUpdate();
    });
  }

  hide(): void {
    this.open = false;

    // Remove aria-describedby when tooltip hides
    if (this.triggerEl) {
      this.triggerEl.removeAttribute('aria-describedby');
    }

    // Stop auto-update (no need to reposition when invisible)
    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = undefined;

    // Clear from delay group
    delayGroup.clearActive(this);

    // Clear pending timeouts
    clearTimeout(this.showTimeout);
    clearTimeout(this.hideTimeout);
  }

  // ---------------------------------------------------------------------------
  // Positioning
  // ---------------------------------------------------------------------------

  private async updatePosition(): Promise<void> {
    const tooltipEl = this.renderRoot.querySelector<HTMLElement>('#tooltip');
    const arrowEl = this.renderRoot.querySelector<HTMLElement>('.tooltip-arrow');

    if (!this.triggerEl || !tooltipEl) return;

    const middleware = [
      offset(this.offset),
      flip(),
      shift({ padding: 8 }),
    ];

    if (this.arrow && arrowEl) {
      middleware.push(arrow({ element: arrowEl, padding: 4 }));
    }

    const { x, y, placement: resolvedPlacement, middlewareData } =
      await computePosition(this.triggerEl, tooltipEl, {
        placement: this.placement,
        strategy: 'fixed',
        middleware,
      });

    Object.assign(tooltipEl.style, {
      left: \`\${x}px\`,
      top: \`\${y}px\`,
    });

    // Position arrow based on resolved placement
    if (this.arrow && middlewareData.arrow && arrowEl) {
      const { x: ax, y: ay } = middlewareData.arrow;
      const side = resolvedPlacement.split('-')[0];
      const staticSide: Record<string, string> = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left',
      };

      Object.assign(arrowEl.style, {
        left: ax != null ? \`\${ax}px\` : '',
        top: ay != null ? \`\${ay}px\` : '',
        [staticSide[side]!]: '-4px',
      });
    }
  }

  private startAutoUpdate(): void {
    const tooltipEl = this.renderRoot.querySelector<HTMLElement>('#tooltip');

    if (!this.triggerEl || !tooltipEl) return;

    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = autoUpdatePosition(
      this.triggerEl,
      tooltipEl,
      () => this.updatePosition()
    );
  }
}

// TypeScript global interface declaration for HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
    'lui-tooltip': Tooltip;
  }
}
`;
