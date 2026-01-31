/**
 * Animation controller for calendar month transitions
 *
 * Manages slide and fade animations when navigating between months.
 * Respects `prefers-reduced-motion` by using fade instead of slide.
 * Handles rapid navigation gracefully with isAnimating guard.
 *
 * CSS class names used (defined in Calendar styles, plan 43-05):
 * - `fade-out` - opacity transition for reduced motion
 * - `slide-out-left` - slide left exit (next month)
 * - `slide-out-right` - slide right exit (prev month)
 * - `slide-in-left` - slide in from left (prev month)
 * - `slide-in-right` - slide in from right (next month)
 *
 * @example
 * ```typescript
 * const controller = new AnimationController(() =>
 *   this.shadowRoot?.querySelector('[role="grid"]')
 * );
 *
 * await controller.animateTransition('next', () => {
 *   this.currentMonth = addMonths(this.currentMonth, 1);
 * });
 *
 * // Cleanup
 * controller.destroy();
 * ```
 */

/**
 * AnimationController manages slide/fade transitions for month navigation.
 *
 * Design decisions:
 * - CSS transitions (not Web Animations API) for broadest browser support
 * - prefers-reduced-motion replaces slide with fade (does NOT remove animation)
 * - isAnimating guard skips animation on rapid navigation (instant update)
 * - 300ms timeout fallback prevents stuck animations if transitionend never fires
 * - getGridElement callback allows lazy element resolution
 */
export class AnimationController {
  /** Whether an animation is currently in progress */
  private isAnimating = false;

  /** Callback to get the grid element (may change between renders) */
  private getGridElement: (() => HTMLElement | null | undefined) | null;

  /** Pending animation timeout for cleanup */
  private pendingTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Create an AnimationController
   * @param getGridElement - Callback that returns the grid element to animate
   */
  constructor(getGridElement: () => HTMLElement | null | undefined) {
    // Server-side guard
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      this.getGridElement = null;
      return;
    }

    this.getGridElement = getGridElement;
  }

  /**
   * Check if user prefers reduced motion.
   * Returns false on server side.
   */
  get prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Animate a month transition with slide or fade effect.
   *
   * Flow:
   * 1. If already animating, call updateFn immediately (skip animation)
   * 2. For reduced motion: fade-out -> updateFn -> fade-in
   * 3. For full motion: slide-out -> updateFn -> slide-in
   * 4. isAnimating guard prevents overlapping animations
   *
   * @param direction - 'next' slides left, 'prev' slides right
   * @param updateFn - Function that updates the month data (called mid-animation)
   */
  async animateTransition(
    direction: 'next' | 'prev',
    updateFn: () => void,
  ): Promise<void> {
    // Server-side: just call updateFn
    if (!this.getGridElement) {
      updateFn();
      return;
    }

    // Rapid navigation guard: skip animation, update instantly
    if (this.isAnimating) {
      updateFn();
      return;
    }

    const element = this.getGridElement();
    if (!element) {
      updateFn();
      return;
    }

    this.isAnimating = true;

    try {
      if (this.prefersReducedMotion) {
        // Reduced motion: fade out, update, fade in
        element.classList.add('fade-out');
        await this.waitForTransition(element);

        updateFn();

        element.classList.remove('fade-out');
        await this.waitForTransition(element);
      } else {
        // Full motion: slide out, update, slide in
        const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
        const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';

        // Slide out
        element.classList.add(outClass);
        await this.waitForTransition(element);

        // Update content mid-animation
        updateFn();

        // Replace out class with in class
        element.classList.remove(outClass);
        element.classList.add(inClass);

        // Force reflow to ensure the in-class position is applied before transition
        void element.offsetHeight;

        // Remove in class to animate back to normal position
        element.classList.remove(inClass);
        await this.waitForTransition(element);
      }
    } finally {
      this.isAnimating = false;
    }
  }

  /**
   * Wait for a CSS transition to complete on an element.
   * Includes 300ms timeout fallback to prevent stuck animations
   * (e.g., if transition is interrupted or element is removed).
   *
   * @param element - Element to wait for transitionend on
   */
  private waitForTransition(element: Element): Promise<void> {
    return new Promise((resolve) => {
      let resolved = false;

      const done = () => {
        if (resolved) return;
        resolved = true;
        if (this.pendingTimeout !== null) {
          clearTimeout(this.pendingTimeout);
          this.pendingTimeout = null;
        }
        resolve();
      };

      // Listen for transitionend (once)
      element.addEventListener('transitionend', done, { once: true });

      // Timeout fallback: resolve after 300ms if transitionend never fires
      this.pendingTimeout = setTimeout(done, 300);
    });
  }

  /**
   * Cancel pending animations and clean up.
   * Call this when the calendar is disconnected or destroyed.
   */
  destroy(): void {
    if (this.pendingTimeout !== null) {
      clearTimeout(this.pendingTimeout);
      this.pendingTimeout = null;
    }
    this.isAnimating = false;
    this.getGridElement = null;
  }
}
