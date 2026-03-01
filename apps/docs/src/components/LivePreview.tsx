/**
 * LivePreview component for rendering live web components in documentation
 *
 * Imports the lui-button component to register it as a custom element,
 * then renders it in a styled preview container.
 */

// Side-effect import to register the custom elements from built library
import '@lit-ui/button';
import '@lit-ui/checkbox';
import '@lit-ui/input';
import '@lit-ui/radio';
import '@lit-ui/select';
import '@lit-ui/switch';
import '@lit-ui/textarea';
import '@lit-ui/calendar';
import '@lit-ui/date-picker';
import '@lit-ui/date-range-picker';
import '@lit-ui/time-picker';
import '@lit-ui/tooltip';
import '@lit-ui/popover';
import '@lit-ui/accordion';
import '@lit-ui/tabs';
import '@lit-ui/toast';

// TypeScript JSX declaration for lui-button and lui-input
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-accordion': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string;
          'default-value'?: string;
          multiple?: boolean;
          collapsible?: boolean;
          disabled?: boolean;
        },
        HTMLElement
      >;
      'lui-accordion-item': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string;
          expanded?: boolean;
          disabled?: boolean;
          'heading-level'?: number;
          lazy?: boolean;
        },
        HTMLElement
      >;
      'lui-tabs': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string;
          'default-value'?: string;
          disabled?: boolean;
          label?: string;
          orientation?: 'horizontal' | 'vertical';
          'activation-mode'?: 'automatic' | 'manual';
        },
        HTMLElement
      >;
      'lui-tab-panel': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string;
          label?: string;
          disabled?: boolean;
          active?: boolean;
          lazy?: boolean;
        },
        HTMLElement
      >;
      'lui-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
          size?: 'sm' | 'md' | 'lg';
          loading?: boolean;
          disabled?: boolean;
          'btn-class'?: string;
        },
        HTMLElement
      >;
      'lui-input': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          type?: 'text' | 'email' | 'password' | 'number' | 'search';
          size?: 'sm' | 'md' | 'lg';
          name?: string;
          value?: string;
          placeholder?: string;
          label?: string;
          'helper-text'?: string;
          required?: boolean;
          'required-indicator'?: 'asterisk' | 'text';
          disabled?: boolean;
          readonly?: boolean;
          minlength?: number;
          maxlength?: number;
          pattern?: string;
          min?: number;
          max?: number;
          clearable?: boolean;
          'show-count'?: boolean;
        },
        HTMLElement
      >;
      'lui-textarea': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          size?: 'sm' | 'md' | 'lg';
          name?: string;
          value?: string;
          placeholder?: string;
          label?: string;
          'helper-text'?: string;
          rows?: number;
          resize?: 'none' | 'vertical' | 'horizontal' | 'both';
          autoresize?: boolean;
          'max-rows'?: number;
          'max-height'?: string;
          required?: boolean;
          'required-indicator'?: 'asterisk' | 'text';
          disabled?: boolean;
          readonly?: boolean;
          minlength?: number;
          maxlength?: number;
          'show-count'?: boolean;
        },
        HTMLElement
      >;
      'lui-select': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          size?: 'sm' | 'md' | 'lg';
          name?: string;
          value?: string;
          placeholder?: string;
          label?: string;
          options?: Array<{ value: string; label: string; disabled?: boolean }>;
          required?: boolean;
          disabled?: boolean;
          clearable?: boolean;
          multiple?: boolean;
          maxSelections?: number;
          showSelectAll?: boolean;
          searchable?: boolean;
          creatable?: boolean;
          noResultsMessage?: string;
          onCreate?: (e: CustomEvent) => void;
        },
        HTMLElement
      >;
      'lui-option': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string;
          label?: string;
          disabled?: boolean;
        },
        HTMLElement
      >;
      'lui-option-group': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          label?: string;
        },
        HTMLElement
      >;
      'lui-checkbox': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          checked?: boolean;
          disabled?: boolean;
          required?: boolean;
          indeterminate?: boolean;
          name?: string;
          value?: string;
          label?: string;
          size?: 'sm' | 'md' | 'lg';
        },
        HTMLElement
      >;
      'lui-checkbox-group': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          label?: string;
          disabled?: boolean;
          required?: boolean;
          error?: string;
          'select-all'?: boolean;
        },
        HTMLElement
      >;
      'lui-radio': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string;
          checked?: boolean;
          disabled?: boolean;
          label?: string;
          size?: 'sm' | 'md' | 'lg';
        },
        HTMLElement
      >;
      'lui-radio-group': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          name?: string;
          value?: string;
          required?: boolean;
          disabled?: boolean;
          label?: string;
          error?: string;
        },
        HTMLElement
      >;
      'lui-calendar': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string;
          locale?: string;
          'min-date'?: string;
          'max-date'?: string;
          'first-day-of-week'?: string | number;
          'display-month'?: string;
          'hide-navigation'?: boolean;
          'show-week-numbers'?: boolean;
          'show-constraint-tooltips'?: boolean;
          'disabled-dates'?: string;
        },
        HTMLElement
      >;
      'lui-calendar-multi': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string;
          locale?: string;
          'min-date'?: string;
          'max-date'?: string;
          months?: number;
          'show-week-numbers'?: boolean;
          'first-day-of-week'?: string | number;
        },
        HTMLElement
      >;
      'lui-switch': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          checked?: boolean;
          disabled?: boolean;
          required?: boolean;
          name?: string;
          value?: string;
          label?: string;
          size?: 'sm' | 'md' | 'lg';
        },
        HTMLElement
      >;
      'lui-date-picker': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string;
          name?: string;
          locale?: string;
          placeholder?: string;
          'helper-text'?: string;
          'min-date'?: string;
          'max-date'?: string;
          label?: string;
          error?: string;
          required?: boolean;
          disabled?: boolean;
          inline?: boolean;
          presets?: boolean;
        },
        HTMLElement
      >;
      'lui-date-range-picker': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'start-date'?: string;
          'end-date'?: string;
          name?: string;
          locale?: string;
          placeholder?: string;
          'helper-text'?: string;
          'min-date'?: string;
          'max-date'?: string;
          'min-days'?: number;
          'max-days'?: number;
          label?: string;
          error?: string;
          required?: boolean;
          disabled?: boolean;
          comparison?: boolean;
          'compare-start-date'?: string;
          'compare-end-date'?: string;
          presets?: boolean;
        },
        HTMLElement
      >;
      'lui-time-picker': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string;
          name?: string;
          label?: string;
          placeholder?: string;
          required?: boolean;
          disabled?: boolean;
          readonly?: boolean;
          hour12?: boolean;
          locale?: string;
          step?: number;
          'min-time'?: string;
          'max-time'?: string;
          'allow-overnight'?: boolean;
          'show-timezone'?: boolean;
          timezone?: string;
          voice?: boolean;
          'interface-mode'?: 'clock' | 'dropdown' | 'both' | 'wheel' | 'range';
          presets?: boolean;
          'additional-timezones'?: string;
        },
        HTMLElement
      >;
      'lui-tooltip': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          content?: string;
          placement?: string;
          'show-delay'?: number;
          'hide-delay'?: number;
          arrow?: boolean;
          offset?: number;
          rich?: boolean;
          'tooltip-title'?: string;
          disabled?: boolean;
        },
        HTMLElement
      >;
      'lui-popover': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          placement?: string;
          open?: boolean;
          arrow?: boolean;
          modal?: boolean;
          offset?: number;
          'match-trigger-width'?: boolean;
          disabled?: boolean;
        },
        HTMLElement
      >;
      'lui-toaster': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          position?: string;
          'max-visible'?: number;
          gap?: number;
        },
        HTMLElement
      >;
      'lui-toast': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'toast-id'?: string;
          variant?: string;
          'toast-title'?: string;
          description?: string;
          duration?: number;
          dismissible?: boolean;
          position?: string;
        },
        HTMLElement
      >;
      'lui-line-chart': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { smooth?: boolean; zoom?: boolean }, HTMLElement>;
      'lui-area-chart': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { smooth?: boolean; stacked?: boolean; zoom?: boolean }, HTMLElement>;
      'lui-bar-chart': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { stacked?: boolean; horizontal?: boolean; 'show-labels'?: boolean; 'color-by-data'?: boolean }, HTMLElement>;
      'lui-pie-chart': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { 'min-percent'?: number; 'inner-radius'?: string | number; 'center-label'?: string }, HTMLElement>;
      'lui-scatter-chart': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { bubble?: boolean; 'enable-gl'?: boolean }, HTMLElement>;
      'lui-heatmap-chart': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { 'x-categories'?: string; 'y-categories'?: string }, HTMLElement>;
      'lui-candlestick-chart': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { 'bull-color'?: string; 'bear-color'?: string; 'show-volume'?: boolean }, HTMLElement>;
      'lui-treemap-chart': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { breadcrumb?: boolean; rounded?: boolean }, HTMLElement>;
    }
  }
}

export function LivePreview() {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mt-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Result:</p>
      <lui-button variant="primary">Click me</lui-button>
    </div>
  );
}
