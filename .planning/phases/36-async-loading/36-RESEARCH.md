# Phase 36: Async Loading - Research

**Researched:** 2026-01-27
**Domain:** Async data loading, virtual scrolling, and performance optimization for select/combobox components
**Confidence:** HIGH

## Summary

This phase adds async loading capabilities to the Select component including Promise-based options, loading/error states, debounced async search, infinite scroll pagination, and virtual scrolling for large datasets. The implementation leverages established patterns from the Lit ecosystem.

**Key findings:**
- `@lit/task` provides a robust reactive controller for async operations with built-in state management (INITIAL, PENDING, COMPLETE, ERROR) and AbortController support
- `@tanstack/lit-virtual` provides the recommended virtual scrolling solution via `VirtualizerController` reactive controller pattern
- Debouncing should use simple setTimeout/clearTimeout pattern with AbortController for request cancellation
- Skeleton loading placeholders are preferred over spinners for perceived performance and should match the option layout
- IntersectionObserver provides the cleanest solution for infinite scroll trigger detection

**Primary recommendation:** Use `@lit/task` for async state management and `@tanstack/lit-virtual` for virtual scrolling, implementing custom debounce and IntersectionObserver patterns inline.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @lit/task | ^1.0.3 | Async state management | Official Lit package; reactive controller pattern; handles cancellation, status tracking, re-running |
| @tanstack/lit-virtual | ^3.x | Virtual scrolling | Framework-agnostic; uses Lit reactive controllers; production-tested with 100k+ items |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lit/directives/ref.js | (included in lit) | Element references for virtualizer | Required for virtualizer scroll container binding |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @tanstack/lit-virtual | @lit-labs/virtualizer | Labs status (pre-1.0); uses custom element vs controller pattern |
| @lit/task | Custom state machine | More control but reinvents robust patterns already solved |

**Installation:**
```bash
pnpm add @lit/task @tanstack/lit-virtual
```

## Architecture Patterns

### Recommended Component Structure

The async loading features extend the existing Select component rather than creating new components:

```
packages/select/src/
├── select.ts              # Extended with async props and state
├── option.ts              # No changes needed
├── option-group.ts        # No changes needed
├── skeleton-option.ts     # NEW: Skeleton loading placeholder
└── index.ts               # Export skeleton if needed externally
```

### Pattern 1: Promise-Based Options

**What:** Allow `options` prop to accept a Promise that resolves to an array of options
**When to use:** Initial async data fetch on component mount

```typescript
// Source: Derived from @lit/task documentation
import { Task, TaskStatus } from '@lit/task';

export class Select extends TailwindElement {
  /**
   * Options can be a static array OR a Promise that resolves to options.
   * When a Promise is provided, component shows loading state until resolved.
   */
  @property({ attribute: false })
  options: SelectOption[] | Promise<SelectOption[]> = [];

  private _optionsTask = new Task(this, {
    task: async ([optionsProp], { signal }) => {
      if (Array.isArray(optionsProp)) {
        return optionsProp; // Sync options, return immediately
      }
      // Await Promise-based options
      const resolved = await optionsProp;
      signal.throwIfAborted();
      return resolved;
    },
    args: () => [this.options] as const,
  });

  // Use in render:
  private renderDropdownContent() {
    return this._optionsTask.render({
      pending: () => this.renderSkeletonOptions(),
      complete: (options) => this.renderOptions(options),
      error: (error) => this.renderErrorState(error),
    });
  }
}
```

### Pattern 2: Debounced Async Search

**What:** Debounce API calls during search with AbortController for race condition prevention
**When to use:** Combobox/searchable select with server-side filtering

```typescript
// Source: Derived from AbortController best practices
export class Select extends TailwindElement {
  /**
   * Debounce delay in milliseconds for async search.
   * @default 300
   */
  @property({ type: Number })
  debounceDelay = 300;

  /**
   * Minimum characters before triggering search.
   * @default 0
   */
  @property({ type: Number })
  minSearchLength = 0;

  /**
   * Async search function. Called with search query, returns Promise of options.
   * Pass AbortSignal to support cancellation.
   */
  @property({ attribute: false })
  asyncSearch?: (query: string, signal: AbortSignal) => Promise<SelectOption[]>;

  private _searchDebounceTimeout?: ReturnType<typeof setTimeout>;
  private _searchAbortController?: AbortController;

  @state()
  private _searchLoading = false;

  @state()
  private _searchError: Error | null = null;

  private async handleSearchInput(query: string): Promise<void> {
    // Clear previous debounce
    if (this._searchDebounceTimeout) {
      clearTimeout(this._searchDebounceTimeout);
    }

    // Abort previous request
    if (this._searchAbortController) {
      this._searchAbortController.abort();
    }

    // Check minimum length
    if (query.length < this.minSearchLength) {
      // Re-fetch default options or clear
      await this.fetchDefaultOptions();
      return;
    }

    // Debounce the search
    this._searchDebounceTimeout = setTimeout(async () => {
      this._searchAbortController = new AbortController();
      this._searchLoading = true;
      this._searchError = null;

      try {
        const results = await this.asyncSearch!(
          query,
          this._searchAbortController.signal
        );
        this._loadedOptions = results;
        this._searchLoading = false;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          this._searchError = err as Error;
          this._searchLoading = false;
        }
        // AbortError is expected, don't update state
      }
    }, this.debounceDelay);
  }
}
```

### Pattern 3: Virtual Scrolling Integration

**What:** Virtualize option rendering for large datasets
**When to use:** Always for async selects (per CONTEXT.md decision)

```typescript
// Source: @tanstack/lit-virtual npm documentation
import { VirtualizerController } from '@tanstack/lit-virtual';
import { Ref, createRef, ref } from 'lit/directives/ref.js';

export class Select extends TailwindElement {
  private _listboxRef: Ref<HTMLDivElement> = createRef();
  private _virtualizer?: VirtualizerController<HTMLDivElement, HTMLDivElement>;

  private initVirtualizer(): void {
    // Only initialize for async selects
    if (!this._isAsyncMode || this._virtualizer) return;

    this._virtualizer = new VirtualizerController(this, {
      getScrollElement: () => this._listboxRef.value ?? null,
      count: this.effectiveOptions.length,
      estimateSize: () => 36, // Standard option height
      overscan: 5, // Render 5 extra items outside viewport
    });
  }

  private renderVirtualizedOptions() {
    const virtualizer = this._virtualizer!.getVirtualizer();
    const virtualItems = virtualizer.getVirtualItems();

    return html`
      <div
        class="listbox"
        ${ref(this._listboxRef)}
        style="height: ${virtualizer.getTotalSize()}px; position: relative;"
      >
        ${virtualItems.map((item) => {
          const option = this.effectiveOptions[item.index];
          return html`
            <div
              style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                transform: translateY(${item.start}px);
              "
            >
              ${this.renderOption(option, item.index)}
            </div>
          `;
        })}
      </div>
    `;
  }

  // Update virtualizer count when options change
  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (this._virtualizer) {
      this._virtualizer.getVirtualizer().options.count =
        this.effectiveOptions.length;
    }
  }
}
```

### Pattern 4: Infinite Scroll with IntersectionObserver

**What:** Load more options when user scrolls near the bottom
**When to use:** Paginated API endpoints

```typescript
// Source: IntersectionObserver best practices
export class Select extends TailwindElement {
  /**
   * Callback to load more options. Return additional options to append.
   * Return empty array when no more data.
   */
  @property({ attribute: false })
  loadMore?: () => Promise<SelectOption[]>;

  @state()
  private _hasMore = true;

  @state()
  private _loadingMore = false;

  private _loadMoreObserver?: IntersectionObserver;
  private _sentinelRef: Ref<HTMLDivElement> = createRef();

  private setupInfiniteScroll(): void {
    if (this._loadMoreObserver || !this.loadMore) return;

    this._loadMoreObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && this._hasMore && !this._loadingMore) {
          this.handleLoadMore();
        }
      },
      {
        root: this._listboxRef.value,
        rootMargin: '0px 0px 80% 0px', // Trigger at 80% scroll (20% from bottom)
        threshold: 0,
      }
    );

    if (this._sentinelRef.value) {
      this._loadMoreObserver.observe(this._sentinelRef.value);
    }
  }

  private async handleLoadMore(): Promise<void> {
    if (!this.loadMore || this._loadingMore) return;

    this._loadingMore = true;
    try {
      const moreOptions = await this.loadMore();
      if (moreOptions.length === 0) {
        this._hasMore = false;
      } else {
        this._loadedOptions = [...this._loadedOptions, ...moreOptions];
      }
    } catch (err) {
      // Handle error - could show inline error or toast
      console.error('Failed to load more options:', err);
    } finally {
      this._loadingMore = false;
    }
  }

  // Render sentinel at end of options list
  private renderLoadMoreSentinel() {
    if (!this.loadMore || !this._hasMore) return nothing;

    return html`
      <div ${ref(this._sentinelRef)} class="load-more-sentinel" aria-hidden="true">
        ${this._loadingMore ? this.renderSkeletonOptions(3) : nothing}
      </div>
    `;
  }
}
```

### Pattern 5: Skeleton Loading Placeholders

**What:** Animated placeholder elements that mimic option shapes during loading
**When to use:** Initial load, search loading, and load-more states

```typescript
// Source: CSS skeleton loading best practices
private renderSkeletonOptions(count = 4) {
  return html`
    ${Array.from({ length: count }).map(() => html`
      <div class="option-skeleton" role="presentation" aria-hidden="true">
        <div class="skeleton-checkbox"></div>
        <div class="skeleton-text"></div>
      </div>
    `)}
  `;
}

// CSS for skeletons
static override styles = [
  ...tailwindBaseStyles,
  css`
    .option-skeleton {
      display: flex;
      align-items: center;
      padding: var(--ui-select-option-padding-y) var(--ui-select-option-padding-x);
      gap: 0.5rem;
    }

    .skeleton-checkbox {
      width: 1rem;
      height: 1rem;
      border-radius: var(--radius-sm);
      background: var(--ui-skeleton-bg, hsl(200, 20%, 88%));
      animation: skeleton-pulse 1.5s ease-in-out infinite;
    }

    .skeleton-text {
      height: 1rem;
      width: 60%;
      border-radius: var(--radius-sm);
      background: var(--ui-skeleton-bg, hsl(200, 20%, 88%));
      animation: skeleton-pulse 1.5s ease-in-out infinite;
    }

    @keyframes skeleton-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
];
```

### Pattern 6: Error State with Retry

**What:** Display error message inside dropdown with retry action
**When to use:** When async load fails

```typescript
private renderErrorState(error: Error) {
  return html`
    <div class="error-state" role="alert">
      <slot name="error">
        <div class="error-content">
          <span class="error-message">Failed to load options</span>
          <button
            type="button"
            class="retry-button"
            @click=${this.handleRetry}
          >
            Try again
          </button>
        </div>
      </slot>
    </div>
  `;
}

private handleRetry(): void {
  // Clear error and re-run task
  this._optionsTask.run();
}
```

### Anti-Patterns to Avoid

- **Race conditions without AbortController:** Always abort previous requests when new ones start
- **Loading all options then filtering client-side:** Defeats purpose of async loading; filter server-side
- **Spinner instead of skeleton:** Spinners provide no spatial context; skeletons reduce perceived latency
- **Preserving selection on error:** User decisions noted this should clear selection on error
- **Not resetting scroll position when data changes:** Virtual scroller can jump; reset on new data

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Async state machine | Custom pending/error/complete tracking | @lit/task | Handles edge cases, cancellation, reactive updates |
| Virtual scrolling | Manual DOM recycling | @tanstack/lit-virtual | Complex math, measurement, edge cases already solved |
| Intersection detection | scroll event + getBoundingClientRect | IntersectionObserver | Native API, performant, handles edge cases |
| Debounce timing | Custom timer management | Simple setTimeout pattern | But DO use AbortController for async cleanup |

**Key insight:** The async loading domain has subtle edge cases (race conditions, unmount during pending, scroll position preservation) that established libraries handle robustly. Focus implementation effort on integration with existing Select API.

## Common Pitfalls

### Pitfall 1: Race Conditions in Async Search

**What goes wrong:** User types "abc", API call starts. User types "d", second call starts. First call returns stale results after second call.
**Why it happens:** Network latency is unpredictable; earlier requests can complete after later ones.
**How to avoid:** AbortController to cancel previous requests; check signal.aborted before updating state.
**Warning signs:** Results flicker or show incorrect data after fast typing.

### Pitfall 2: Memory Leaks from Uncleared Observers

**What goes wrong:** IntersectionObserver or ResizeObserver continues firing after component disconnects.
**Why it happens:** Observers not disconnected in disconnectedCallback.
**How to avoid:** Always call `observer.disconnect()` in disconnectedCallback.
**Warning signs:** Console warnings about state updates on unmounted components; memory growth over time.

### Pitfall 3: Virtual Scroll + Keyboard Navigation Conflict

**What goes wrong:** Arrow keys navigate but focused option scrolls out of view or wrong option receives visual focus.
**Why it happens:** Virtualizer only renders visible items; active option may not be in DOM.
**How to avoid:** Use virtualizer's `scrollToIndex()` method when changing activeIndex; ensure option is measured before scrolling.
**Warning signs:** Keyboard navigation feels "jumpy" or visual focus disappears.

### Pitfall 4: Infinite Loop from Data Updates

**What goes wrong:** Loading more options triggers re-render, which triggers IntersectionObserver, which loads more.
**Why it happens:** Sentinel element re-observed after data update while still in viewport.
**How to avoid:** Guard with `_loadingMore` flag; don't observe until after render settles; unobserve sentinel during load.
**Warning signs:** API called repeatedly; dropdown fills with duplicate data; browser freezes.

### Pitfall 5: Skeleton Count Mismatch

**What goes wrong:** Skeleton shows 5 items, actual data has 2; jarring visual jump.
**Why it happens:** Fixed skeleton count doesn't match expected data.
**How to avoid:** For initial load, estimate based on viewport height. For load-more, match page size.
**Warning signs:** Content jumps significantly when loading completes.

## Code Examples

Verified patterns from official sources:

### @lit/task with AbortController

```typescript
// Source: https://lit.dev/docs/data/task/
import { Task } from '@lit/task';

private _fetchTask = new Task(this, {
  task: async ([query], { signal }) => {
    const response = await fetch(`/api/options?q=${query}`, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
  args: () => [this.filterQuery] as const,
});
```

### VirtualizerController Setup

```typescript
// Source: https://www.npmjs.com/package/@tanstack/lit-virtual
import { VirtualizerController } from '@tanstack/lit-virtual';
import { Ref, createRef, ref } from 'lit/directives/ref.js';

class VirtualList extends LitElement {
  private scrollElementRef: Ref<HTMLDivElement> = createRef();
  private virtualizer = new VirtualizerController(this, {
    getScrollElement: () => this.scrollElementRef.value,
    count: 10000,
    estimateSize: () => 36,
    overscan: 5,
  });

  render() {
    const virtualItems = this.virtualizer.getVirtualizer().getVirtualItems();
    return html`
      <div ${ref(this.scrollElementRef)} style="height: 300px; overflow: auto;">
        <div style="height: ${this.virtualizer.getVirtualizer().getTotalSize()}px; position: relative;">
          ${virtualItems.map(item => html`
            <div style="position: absolute; top: 0; transform: translateY(${item.start}px);">
              Row ${item.index}
            </div>
          `)}
        </div>
      </div>
    `;
  }
}
```

### IntersectionObserver for Infinite Scroll

```typescript
// Source: MDN IntersectionObserver documentation + infinite scroll patterns
private setupObserver(): void {
  this._observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !this._loading && this._hasMore) {
        this.loadNextPage();
      }
    },
    {
      root: this.scrollContainer,
      rootMargin: '0px 0px 20% 0px', // Trigger before reaching bottom
      threshold: 0
    }
  );

  if (this.sentinel) {
    this._observer.observe(this.sentinel);
  }
}

override disconnectedCallback(): void {
  super.disconnectedCallback();
  this._observer?.disconnect();
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @lit-labs/task | @lit/task | 2023 (promoted to stable) | Use stable package, not labs |
| Scroll event + manual calc | IntersectionObserver | 2020+ | Better performance, simpler code |
| Fixed-size virtual scroll | Dynamic measurement | TanStack Virtual 3.x | Support variable height options |
| Loading spinners | Skeleton placeholders | 2020+ UX trend | Better perceived performance |

**Deprecated/outdated:**
- @lit-labs/virtualizer: Still pre-1.0, @tanstack/lit-virtual is more mature and framework-agnostic

## Open Questions

Things that couldn't be fully resolved:

1. **Select disabled vs openable during initial load**
   - What we know: Both patterns exist in production UIs
   - What's unclear: User didn't specify preference; marked as Claude's discretion
   - Recommendation: Default to openable (shows loading state immediately)

2. **Page Up/Down behavior in virtualized list**
   - What we know: Standard Page Up/Down moves by ~10 items
   - What's unclear: Exact behavior when items have variable heights
   - Recommendation: Move by viewport height worth of estimated items

3. **Retry action styling**
   - What we know: Error slot allows full customization; default needed
   - What's unclear: Text link vs button preference
   - Recommendation: Use underlined text link to minimize visual weight

## Sources

### Primary (HIGH confidence)
- [@lit/task npm](https://www.npmjs.com/package/@lit/task) - Package details, version ^1.0.3
- [Lit Async Tasks Documentation](https://lit.dev/docs/data/task/) - Complete Task API and patterns
- [@tanstack/lit-virtual npm](https://www.npmjs.com/package/@tanstack/lit-virtual) - VirtualizerController API
- [TanStack Virtual Docs](https://tanstack.com/virtual/latest) - Virtual scrolling concepts

### Secondary (MEDIUM confidence)
- [High Performance HTML Tables with Lit and Virtual Scrolling](https://coryrylan.com/blog/high-performance-html-tables-with-lit-and-virtual-scrolling) - Lit-specific virtualization patterns
- [Using AbortController for Debounce](https://gist.github.com/bennadel/9b2714e50a8d9f0a1b62a8cbe7c8503c) - Debounce + AbortController pattern
- [Skeleton Screen Best Practices](https://www.freecodecamp.org/news/how-to-build-skeleton-screens-using-css-for-better-user-experience/) - CSS skeleton patterns

### Tertiary (LOW confidence)
- Web search results for infinite scroll patterns - Framework-agnostic concepts apply to Lit

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Lit docs and TanStack docs verified
- Architecture patterns: HIGH - Derived from official documentation and Context7 where available
- Pitfalls: MEDIUM - Based on general async/virtual scroll knowledge, some Lit-specific gaps

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - stable domain)
