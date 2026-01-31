/**
 * Keyboard navigation utilities for calendar grid
 *
 * Implements roving tabindex pattern per WAI-ARIA Grid Pattern:
 * https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 *
 * Only one cell has tabindex="0" at a time (in tab sequence).
 * Other cells have tabindex="-1" (focusable but not in tab order).
 *
 * @example
 * ```typescript
 * const manager = new KeyboardNavigationManager(gridCells);
 * manager.setInitialFocus(selectedIndex);
 * const nextIndex = manager.moveFocus(currentIndex, 'right');
 * const element = manager.getElement(nextIndex);
 * element?.focus();
 * ```
 */

/**
 * Keyboard navigation direction for grid movement
 */
export type NavigationDirection =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'home'
  | 'end';

/**
 * KeyboardNavigationManager manages roving tabindex for grid navigation.
 *
 * Responsibilities:
 * - Track focusable elements in the grid
 * - Calculate next focus position based on direction
 * - Update tabindex attributes (only one element has tabindex="0")
 * - Provide element access for focus() calls
 *
 * Grid layout assumptions:
 * - 7 columns (standard calendar week)
 * - Cells are ordered left-to-right, top-to-bottom
 * - Index 0 is top-left cell
 */
export class KeyboardNavigationManager {
  private focusableElements: HTMLElement[];
  private readonly columns = 7; // Calendar week has 7 days

  /**
   * Create a KeyboardNavigationManager
   * @param elements Array of focusable grid cells
   */
  constructor(elements: HTMLElement[]) {
    this.focusableElements = elements;
  }

  /**
   * Set initial focus to selected element.
   * Sets tabindex="0" on selected element, "-1" on all others.
   *
   * @param selectedIndex Index of element to receive initial focus
   */
  setInitialFocus(selectedIndex: number): void {
    this.focusableElements.forEach((element, index) => {
      if (index === selectedIndex) {
        element.setAttribute('tabindex', '0');
      } else {
        element.setAttribute('tabindex', '-1');
      }
    });
  }

  /**
   * Calculate next index and update tabindex based on navigation direction.
   *
   * Grid navigation math:
   * - Right: currentIndex + 1 (if not at row end)
   * - Left: currentIndex - 1 (if not at row start)
   * - Down: currentIndex + 7 (one week down)
   * - Up: currentIndex - 7 (one week up)
   * - Home: First cell in current row (Math.floor(currentIndex / 7) * 7)
   * - End: Last cell in current row (Math.floor(currentIndex / 7) * 7 + 6)
   *
   * Boundary checks prevent focus moving outside grid.
   *
   * @param fromIndex Current focused element index
   * @param direction Navigation direction
   * @returns Next element index, or current index if move is invalid
   */
  moveFocus(fromIndex: number, direction: NavigationDirection): number {
    const totalCells = this.focusableElements.length;
    let nextIndex = fromIndex;

    switch (direction) {
      case 'right':
        // Move right if not at last column
        if ((fromIndex + 1) % this.columns !== 0) {
          nextIndex = fromIndex + 1;
        }
        break;

      case 'left':
        // Move left if not at first column
        if (fromIndex % this.columns !== 0) {
          nextIndex = fromIndex - 1;
        }
        break;

      case 'down':
        // Move down one row (7 cells) if not in last row
        nextIndex = fromIndex + this.columns;
        if (nextIndex >= totalCells) {
          nextIndex = fromIndex; // Stay in place if would go past end
        }
        break;

      case 'up':
        // Move up one row (7 cells) if not in first row
        nextIndex = fromIndex - this.columns;
        if (nextIndex < 0) {
          nextIndex = fromIndex; // Stay in place if would go before start
        }
        break;

      case 'home':
        // Move to first cell in current row
        nextIndex = Math.floor(fromIndex / this.columns) * this.columns;
        break;

      case 'end':
        // Move to last cell in current row
        nextIndex = Math.floor(fromIndex / this.columns) * this.columns + (this.columns - 1);
        // Clamp to last cell if row is incomplete (end of month)
        if (nextIndex >= totalCells) {
          nextIndex = totalCells - 1;
        }
        break;

      default:
        return fromIndex;
    }

    // Update tabindex: old cell gets -1, new cell gets 0
    if (nextIndex !== fromIndex && nextIndex >= 0 && nextIndex < totalCells) {
      this.focusableElements[fromIndex].setAttribute('tabindex', '-1');
      this.focusableElements[nextIndex].setAttribute('tabindex', '0');
    }

    return nextIndex;
  }

  /**
   * Get element at specific index.
   * @param index Element index
   * @returns HTMLElement or null if index out of bounds
   */
  getElement(index: number): HTMLElement | null {
    if (index >= 0 && index < this.focusableElements.length) {
      return this.focusableElements[index];
    }
    return null;
  }

  /**
   * Update elements array (call when grid cells change).
   * Use this when month changes and grid is re-rendered.
   *
   * @param elements New array of focusable elements
   */
  updateElements(elements: HTMLElement[]): void {
    this.focusableElements = elements;
  }

  /**
   * Get total number of focusable elements.
   * @returns Element count
   */
  get count(): number {
    return this.focusableElements.length;
  }
}

/**
 * Helper function to calculate row start index.
 * @param index Current cell index
 * @param columns Number of columns in grid
 * @returns First index in current row
 */
export function getRowStartIndex(index: number, columns: number = 7): number {
  return Math.floor(index / columns) * columns;
}

/**
 * Helper function to calculate row end index.
 * @param index Current cell index
 * @param columns Number of columns in grid
 * @returns Last index in current row
 */
export function getRowEndIndex(index: number, columns: number = 7): number {
  return Math.floor(index / columns) * columns + (columns - 1);
}
