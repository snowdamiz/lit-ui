/**
 * Gesture handler for swipe detection on calendar
 *
 * Uses Pointer Events API for unified touch/mouse/pen input handling.
 * Detects horizontal swipe gestures and invokes callback with direction.
 *
 * Note: Calendar should apply `touch-action: pan-y` CSS on the grid element
 * to allow vertical scrolling while capturing horizontal swipes.
 *
 * @example
 * ```typescript
 * const handler = new GestureHandler(gridElement, (result) => {
 *   if (result.direction === 'left') navigateNext();
 *   if (result.direction === 'right') navigatePrev();
 * });
 *
 * // Cleanup when done
 * handler.destroy();
 * ```
 */

/**
 * Result of a detected swipe gesture
 */
export interface SwipeResult {
  /** Direction of the swipe */
  direction: 'left' | 'right';
  /** Absolute distance in pixels */
  distance: number;
  /** Duration in milliseconds */
  duration: number;
}

/** Internal tracking of swipe start state */
interface SwipeStart {
  x: number;
  y: number;
  time: number;
}

/**
 * GestureHandler detects horizontal swipe gestures via Pointer Events.
 *
 * Design decisions:
 * - Uses Pointer Events (not Touch Events) for unified input handling
 * - `setPointerCapture()` ensures reliable tracking even if pointer leaves element
 * - 50px threshold prevents accidental swipes
 * - Requires horizontal distance > 1.5x vertical distance to distinguish from scrolling
 * - 500ms max duration distinguishes swipe from drag/hold
 */
export class GestureHandler {
  /** Minimum swipe distance in pixels */
  private readonly threshold = 50;

  /** Maximum swipe duration in milliseconds */
  private readonly maxDuration = 500;

  /** Element to listen on */
  private element: HTMLElement | null;

  /** Callback invoked on successful swipe */
  private onSwipe: ((result: SwipeResult) => void) | null;

  /** Tracks swipe start position and time, null when no active gesture */
  private _swipeStart: SwipeStart | null = null;

  /**
   * Create a GestureHandler
   * @param element - Element to detect swipes on
   * @param onSwipe - Callback invoked when a valid swipe is detected
   */
  constructor(element: HTMLElement, onSwipe: (result: SwipeResult) => void) {
    // Server-side guard: no-op when not in browser
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      this.element = null;
      this.onSwipe = null;
      return;
    }

    this.element = element;
    this.onSwipe = onSwipe;

    this.element.addEventListener('pointerdown', this.handlePointerDown);
    this.element.addEventListener('pointerup', this.handlePointerUp);
    this.element.addEventListener('pointercancel', this.handlePointerCancel);
  }

  /**
   * Record swipe start position and capture pointer for reliable tracking.
   */
  private handlePointerDown = (e: PointerEvent): void => {
    this._swipeStart = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
    // Capture pointer to track even if it leaves the element
    this.element?.setPointerCapture(e.pointerId);
  };

  /**
   * Evaluate if pointer up constitutes a valid horizontal swipe.
   *
   * Validation criteria:
   * - Duration < maxDuration (500ms)
   * - Horizontal distance > threshold (50px)
   * - Horizontal distance > 1.5x vertical distance (distinguishes from scroll)
   */
  private handlePointerUp = (e: PointerEvent): void => {
    if (!this._swipeStart) return;

    const dx = e.clientX - this._swipeStart.x;
    const dy = e.clientY - this._swipeStart.y;
    const duration = Date.now() - this._swipeStart.time;

    // Reset state
    this._swipeStart = null;

    // Reject if too slow
    if (duration > this.maxDuration) return;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Must exceed threshold and be primarily horizontal
    if (absDx > this.threshold && absDx > absDy * 1.5) {
      this.onSwipe?.({
        direction: dx > 0 ? 'right' : 'left',
        distance: absDx,
        duration,
      });
    }
  };

  /**
   * Reset state when pointer is cancelled (e.g., system gesture interruption).
   */
  private handlePointerCancel = (): void => {
    this._swipeStart = null;
  };

  /**
   * Remove all event listeners and clean up references.
   * Call this when the calendar is disconnected or destroyed.
   */
  destroy(): void {
    if (this.element) {
      this.element.removeEventListener('pointerdown', this.handlePointerDown);
      this.element.removeEventListener('pointerup', this.handlePointerUp);
      this.element.removeEventListener('pointercancel', this.handlePointerCancel);
      this.element = null;
    }
    this.onSwipe = null;
    this._swipeStart = null;
  }
}
