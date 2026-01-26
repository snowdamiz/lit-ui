# Features Research: Select/Combobox Component

**Domain:** Select/Combobox UI Components
**Researched:** 2026-01-26
**Libraries Analyzed:** shadcn/ui, Radix UI, Headless UI, MUI, Chakra UI, Ariakit
**Confidence:** HIGH (verified across multiple authoritative sources)

## Table Stakes (Must Have)

Features users expect in any Select/Combobox component. Missing any of these makes the component feel incomplete or broken.

### Core Selection

| Feature | Description | Complexity | Dependencies |
|---------|-------------|------------|--------------|
| **Single-select dropdown** | Pick one option from a list | LOW | Popover positioning |
| **Controlled/uncontrolled modes** | Both `value`/`onChange` and `defaultValue` patterns | LOW | None |
| **Placeholder text** | Display hint when no selection | LOW | None |
| **Option disabled state** | Prevent selection of specific options | LOW | None |
| **Component disabled state** | Disable entire select | LOW | Existing disabled pattern |
| **Clear selection** | Reset to no selection (clearable prop) | LOW | None |
| **Form participation** | Works with native forms, `name` attribute | MEDIUM | ElementInternals (existing) |
| **Required validation** | Form validation support | LOW | Existing validation pattern |

### Keyboard Navigation

| Feature | Description | Complexity | Dependencies |
|---------|-------------|------------|--------------|
| **Arrow key navigation** | Up/Down to move through options | MEDIUM | Focus management |
| **Enter to select** | Confirm selection and close dropdown | LOW | None |
| **Escape to close** | Dismiss dropdown without selection | LOW | None |
| **Space to open/select** | Toggle dropdown or confirm selection | LOW | None |
| **Home/End keys** | Jump to first/last option | LOW | None |
| **Typeahead (A-Z)** | Type characters to jump to matching option | MEDIUM | Character matching |

### Accessibility (ARIA)

| Feature | Description | Complexity | Dependencies |
|---------|-------------|------------|--------------|
| **`role="combobox"`** | Proper ARIA role on trigger element | LOW | None |
| **`role="listbox"`** | Proper ARIA role on options container | LOW | None |
| **`role="option"`** | Proper ARIA role on each option | LOW | None |
| **`aria-expanded`** | Indicate open/closed state | LOW | None |
| **`aria-activedescendant`** | Track focused option without moving DOM focus | MEDIUM | Focus management |
| **`aria-selected`** | Indicate currently selected option | LOW | None |
| **`aria-labelledby`** | Connect trigger to label element | LOW | None |
| **`aria-disabled`** | Indicate disabled state (keep focusable) | LOW | None |
| **`aria-invalid`** | Indicate validation error state | LOW | Existing pattern |
| **`aria-controls`** | Connect trigger to listbox | LOW | None |

### Visual/UX

| Feature | Description | Complexity | Dependencies |
|---------|-------------|------------|--------------|
| **Dropdown positioning** | Open above/below based on viewport space | MEDIUM | Floating UI or similar |
| **Selected option indicator** | Checkmark or similar visual marker | LOW | Icon/SVG |
| **Highlighted/focused option styling** | Visual distinction for keyboard navigation | LOW | CSS `data-active-item` |
| **Loading state** | Spinner when loading options | LOW | Existing loading pattern |
| **Size variants (sm/md/lg)** | Match existing component sizes | LOW | Existing size tokens |
| **Error state styling** | Red border, error message display | LOW | Existing error pattern |
| **Dark mode support** | Proper colors in dark mode | LOW | Existing `:host-context(.dark)` |

---

## Differentiators (Competitive Advantage)

Features that set LitUI's Select apart from competitors. Not expected, but add significant value.

### Search/Filter (Combobox Mode)

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Text input filtering** | Type to filter options list | MEDIUM | Input integration |
| **Fuzzy matching** | Match partial/misspelled input | MEDIUM | Matching algorithm |
| **Highlight matched text** | Show which part of option matched | MEDIUM | Text rendering |
| **Custom filter function** | Let developers control matching logic | LOW | Callback prop |
| **Empty state message** | "No results found" display | LOW | None |
| **Auto-complete modes** | `aria-autocomplete`: none, list, both | LOW | ARIA config |

### Multi-Select

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Multiple selection** | Select more than one option | MEDIUM | Array value handling |
| **Tag/chip display** | Show selected items as removable tags | MEDIUM | Tag rendering |
| **Tag removal** | Click X or backspace to deselect | LOW | Event handling |
| **"Select all" option** | Quick select all visible options | LOW | None |
| **Max selection limit** | Limit number of selections | LOW | Validation |
| **Overflow collapse** | "+N more" when too many tags to display | MEDIUM | Layout calculation |

### Async Loading

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Async options loading** | Fetch options from API on open/search | MEDIUM | Promise handling |
| **Loading indicator** | Show spinner during fetch | LOW | Existing spinner |
| **Error handling** | Display fetch errors gracefully | LOW | Error state |
| **Debounced search** | Throttle API calls while typing | LOW | Debounce utility |
| **Infinite scroll** | Load more options on scroll | HIGH | Scroll detection, pagination |

### Option Groups

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Grouped options** | Organize options under headers | MEDIUM | Group rendering |
| **Group labels** | Non-selectable header text | LOW | None |
| **Collapsible groups** | Expand/collapse option groups | MEDIUM | State management |
| **Group separators** | Visual dividers between groups | LOW | CSS |

### Advanced UX

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Creatable options** | Add new option from text input | MEDIUM | Option creation logic |
| **Option descriptions** | Secondary text per option | LOW | Layout |
| **Option icons/avatars** | Visual element per option | LOW | Slot or prop |
| **Recent selections** | Show recently picked options first | MEDIUM | Storage, sorting |
| **Virtual scrolling** | Handle 10K+ options without lag | HIGH | Virtual list implementation |

### Web Component Advantages

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Framework agnostic** | Works in React, Vue, Svelte, vanilla JS | LOW | Web component standard |
| **SSR compatible** | `isServer` guards for server rendering | MEDIUM | Existing SSR approach |
| **Custom element slots** | Trigger slot, option template slot | LOW | Slot pattern |
| **Part-based styling** | `::part()` CSS customization | LOW | Part attributes |
| **CSS custom properties** | Theme via `--ui-select-*` tokens | LOW | Existing token system |

---

## Anti-Features (Do NOT Build)

Features to explicitly exclude, either because they add complexity without value, cause UX problems, or conflict with LitUI philosophy.

### Over-Engineering

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Complex nested dropdowns** | Confusing UX, hard to navigate with keyboard | Keep options flat or use simple groups |
| **Inline editing of options** | Scope creep, fundamentally different component | Keep select read-only; build separate EditableList if needed |
| **Drag-and-drop reordering** | Complex, rarely needed for selection | Omit entirely; users can sort their data externally |
| **Color picker integration** | Different component entirely | Build separate ColorPicker component |
| **Date/time picker integration** | Different component entirely | Build separate DatePicker component |
| **Rich content in options** | HTML in options creates XSS risk, accessibility issues | Support text + optional icon only |

### Accessibility Anti-Patterns

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Custom scrollbar styling** | Screen reader issues, cross-browser inconsistency | Use native scrollbar |
| **Animated option transitions** | Motion sickness, distraction, slower UX | Instant display or minimal fade (50ms max) |
| **Auto-opening on focus** | Unexpected behavior, frustrating for keyboard users | Open on click, Enter, Space, or ArrowDown only |
| **Removing from tab order when disabled** | Breaks discoverability for screen reader users | Use `aria-disabled`, keep in tab order |
| **Pre-selecting first option** | Frustrates users (Baymard research), accidental submissions | Start with placeholder or empty |
| **Enter key submitting form when closed** | Confusing when user expects to open dropdown | Enter opens dropdown when closed, selects when open |
| **Comma-separated multi-select display** | Confusing without visual cues (a11y research) | Use tag/chip display with clear removal |

### Mobile UX Mistakes

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Replacing native mobile select** | Native is more usable on iOS/Android | Consider `nativeMobile` prop to use native `<select>` |
| **Tiny touch targets** | Hard to tap, accessibility issue | Minimum 44x44px options (WCAG) |
| **Hover-only interactions** | No hover on touch devices | Ensure all interactions work with tap |
| **Small dropdown max-height** | Too much scrolling on mobile | Adaptive max-height based on viewport |

### Performance Traps

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Rendering all options always** | DOM bloat, slow initial render with 1000+ options | Virtual scrolling for large lists |
| **No debounce on search** | API hammering, lag, unnecessary network requests | Built-in 150ms debounce by default |
| **Eager async loading** | Unnecessary network requests before user needs data | Load on demand (first open or first keystroke) |
| **Heavy dependencies** | Bundle size, complexity | Minimal dependencies; inline Floating UI logic if small enough |
| **Keyframe animations for every option** | CPU-intensive, janky scrolling | CSS transitions only, minimal animation |

### Scope Creep

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Built-in data fetching** | Not a component responsibility, couples to implementation | Accept `options` prop; let consumer fetch and pass data |
| **State management integration** | Framework-specific, maintenance burden | Simple controlled/uncontrolled pattern; works with any framework |
| **Complex validation rules** | Opinionated, conflicts with form libraries | Basic required/invalid only; let form library handle complex validation |
| **Internationalization built-in** | Consumer responsibility, bundle size | Accept translated strings via props (placeholder, emptyText, etc.) |
| **Built-in option caching** | Opinionated, may conflict with app's caching strategy | Document caching patterns; let consumer cache |

---

## Feature Matrix

Comparison of features across analyzed libraries.

| Feature | shadcn/ui | Radix UI | Headless UI | MUI | Chakra UI | Ariakit | LitUI Target |
|---------|-----------|----------|-------------|-----|-----------|---------|--------------|
| **Single Select** | Yes | Yes | Yes (Listbox) | Yes | Yes | Yes | P0 |
| **Multi Select** | Community | No | Yes | Yes | Partial* | Yes | P1 |
| **Combobox/Search** | Yes | No** | Yes | Yes | No*** | Yes | P1 |
| **Async Loading** | Yes | No | Manual | Yes | Manual | Manual | P2 |
| **Virtual Scroll** | No | No | Yes | Yes | No | No | P3 (optional) |
| **Creatable** | Yes | No | Yes | Yes | No | Yes | P2 |
| **Groups** | Yes | Yes | No | Yes | Yes | Yes | P1 |
| **Typeahead** | Yes | Yes | Yes | Yes | N/A | Yes | P0 |
| **ARIA Compliant** | Yes | Yes | Yes | Yes | Partial | Yes | P0 |
| **Keyboard Nav** | Yes | Yes | Yes | Yes | Yes | Yes | P0 |
| **SSR Support** | Yes | Yes | Yes | Partial | Yes | Yes | P0 |
| **Framework Agnostic** | No (React) | No (React) | No (React/Vue) | No (React) | No (React) | No (React) | **YES** |

\* Chakra uses third-party `chakra-react-select` for multi-select
\** Radix has open issue #1342 for Combobox; workaround uses Ariakit
\*** Chakra recommends `chakra-react-select` for search functionality

---

## Feature Dependencies on Existing LitUI Code

| New Feature | Depends On | Already Exists? | Notes |
|-------------|------------|-----------------|-------|
| ElementInternals pattern | Button/Input implementation | YES | Copy `attachInternals()` pattern with `isServer` guard |
| Size variants (sm/md/lg) | Core design tokens | YES | Use existing `--ui-*-padding-*` pattern |
| Focus ring styling | Button/Input focus style | YES | Copy `box-shadow: inset 0 0 0 2px` pattern |
| Dark mode | `:host-context(.dark)` pattern | YES | Copy from existing components |
| Error state colors | Theme system | YES | Use existing `--ui-color-destructive` |
| Loading spinner | Button spinner | YES | Copy `.spinner` CSS from Button |
| Tailwind integration | TailwindElement base class | YES | Extend `TailwindElement` from @lit-ui/core |
| SSR support | `isServer` guard pattern | YES | Same pattern as Input's `attachInternals()` |
| CSS custom properties | Theme system | YES | Follow `--ui-select-*` naming convention |
| Popover positioning | NEW | NO | Need Floating UI or similar |
| Chip/tag display | NEW | NO | Need for multi-select display |

---

## Summary

### v4.1 Feature Recommendations

Based on research and the stated scope (single-select, multi-select, combobox, async loading), here is the prioritized feature set:

**Phase 1: Single Select (Table Stakes)**
- Single-select dropdown with controlled/uncontrolled modes
- Full keyboard navigation (arrows, Enter, Escape, Home/End, typeahead)
- Complete ARIA implementation (combobox pattern per WAI-ARIA APG)
- Dropdown positioning with collision detection (Floating UI)
- Option disabled states
- Form participation (ElementInternals)
- Size variants (sm/md/lg) matching existing components
- Error state and validation
- SSR compatibility

**Phase 2: Multi-Select**
- Multiple selection mode with array values
- Tag/chip display of selected items
- Tag removal (X button and backspace)
- Optional max selection limit
- Overflow collapse ("+N more")
- Option groups with labels

**Phase 3: Combobox (Search/Filter)**
- Text input for filtering options
- Default case-insensitive string matching
- Custom filter function support
- Empty state ("No results found")
- Highlight matched text (differentiator)
- `aria-autocomplete` support

**Phase 4: Async Loading**
- Async options loading with Promise support
- Loading state indicator
- Error state display
- Debounced search (automatic 150ms)
- Optional creatable mode
- Consider virtual scrolling if >100 options

### Key Technical Decisions

1. **Use Floating UI** for dropdown positioning - industry standard, lightweight, well-tested
2. **Follow WAI-ARIA Combobox Pattern** exactly - [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
3. **Use `aria-activedescendant`** for focus management (DOM focus stays on combobox, not options)
4. **ElementInternals for form participation** - consistent with existing Input/Textarea
5. **CSS custom properties for theming** - consistent with existing token system (`--ui-select-*`)
6. **Virtual scrolling only for >100 options** - complexity vs. value tradeoff; defer to Phase 4
7. **Native mobile option** - consider `nativeMobile` prop to use native `<select>` on touch devices

### Complexity Estimates by Phase

| Phase | Estimated Complexity | Dependencies |
|-------|---------------------|--------------|
| Phase 1: Single Select | HIGH | Floating UI, ARIA implementation |
| Phase 2: Multi-Select | MEDIUM | Phase 1, Tag/chip rendering |
| Phase 3: Combobox | MEDIUM | Phase 1, Input integration |
| Phase 4: Async Loading | MEDIUM | Phase 3, Promise handling |

---

## Sources

### Official Documentation (HIGH confidence)

- [shadcn/ui Select](https://ui.shadcn.com/docs/components/select)
- [shadcn/ui Combobox](https://ui.shadcn.com/docs/components/combobox)
- [Radix UI Select Primitive](https://www.radix-ui.com/primitives/docs/components/select)
- [Headless UI Listbox](https://headlessui.com/react/listbox)
- [Headless UI Combobox](https://headlessui.com/react/combobox)
- [MUI Autocomplete](https://mui.com/material-ui/react-autocomplete/)
- [Chakra UI Select](https://chakra-ui.com/docs/components/select)
- [Ariakit Select](https://ariakit.org/components/select)
- [Ariakit Combobox](https://ariakit.org/reference/combobox)

### Accessibility Standards (HIGH confidence)

- [W3C ARIA Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [W3C Select-Only Combobox Example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/)
- [MDN ARIA combobox role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/combobox_role)
- [Radix UI Accessibility Overview](https://www.radix-ui.com/primitives/docs/overview/accessibility)

### UX Research (MEDIUM confidence)

- [Baymard Drop-Down Usability](https://baymard.com/blog/drop-down-usability)
- [NN/g Dropdown Design Guidelines](https://www.nngroup.com/articles/drop-down-menus/)
- [24 Accessibility - Select Testing Research](https://www.24a11y.com/2019/select-your-poison-part-2/)
- [Carbon Design System Dropdown](https://carbondesignsystem.com/components/dropdown/usage/)
- [Balsamiq Dropdown Menu Guidelines](https://balsamiq.com/learn/dropdown-menus/)

### Library Comparisons (MEDIUM confidence)

- [npm-compare: react-select vs downshift](https://npm-compare.com/downshift,react-autocomplete,react-select)
- [Retool: React Autocomplete Libraries](https://retool.com/blog/react-autocomplete-libraries)
- [LogRocket: Best React Select Libraries](https://blog.logrocket.com/best-react-select-component-libraries/)
- [Downshift Documentation](https://www.downshift-js.com/)

### Virtual Scrolling / Large Datasets (MEDIUM confidence)

- [Syncfusion Blazor ComboBox Virtualization](https://blazor.syncfusion.com/documentation/combobox/virtualization)
- [Telerik Blazor ComboBox Virtualization](https://www.telerik.com/blazor-ui/documentation/components/combobox/virtualization)
- [Headless UI Combobox Async Discussion](https://github.com/tailwindlabs/headlessui/discussions/2788)
