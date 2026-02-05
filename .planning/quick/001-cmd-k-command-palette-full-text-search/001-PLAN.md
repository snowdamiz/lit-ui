---
phase: quick
plan: 001
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/docs/src/search/search-index.ts
  - apps/docs/src/search/search-engine.ts
  - apps/docs/src/components/CommandPalette.tsx
  - apps/docs/src/components/Header.tsx
  - apps/docs/src/App.tsx
autonomous: true

must_haves:
  truths:
    - "Cmd+K (Mac) / Ctrl+K (Windows) opens the command palette from anywhere"
    - "Typing in the palette filters results across all 27 pages in real-time"
    - "Results are grouped by section: Overview, Guides, Components, Tools"
    - "Arrow keys navigate results, Enter navigates to page, Escape closes"
    - "Search matches page titles, headings, descriptions, prop names, and code snippets"
    - "Selecting a result navigates via React Router (no full page reload)"
  artifacts:
    - path: "apps/docs/src/search/search-index.ts"
      provides: "Static search index with all page content entries"
    - path: "apps/docs/src/search/search-engine.ts"
      provides: "Fuzzy/substring search over the index"
    - path: "apps/docs/src/components/CommandPalette.tsx"
      provides: "Modal UI with input, grouped results, keyboard nav"
  key_links:
    - from: "apps/docs/src/components/CommandPalette.tsx"
      to: "apps/docs/src/search/search-engine.ts"
      via: "import and call search(query)"
      pattern: "search\\("
    - from: "apps/docs/src/components/CommandPalette.tsx"
      to: "react-router"
      via: "useNavigate() on result selection"
      pattern: "useNavigate|navigate\\("
    - from: "apps/docs/src/components/Header.tsx"
      to: "apps/docs/src/components/CommandPalette.tsx"
      via: "renders CommandPalette, manages open state"
      pattern: "CommandPalette"
---

<objective>
Add a Cmd+K command palette with full-text search across all docs content.

Purpose: Let users quickly find any page, component prop, guide section, or code example without manually browsing the sidebar. Standard docs UX pattern.
Output: A working command palette accessible from anywhere in the docs site via keyboard shortcut.
</objective>

<execution_context>
@/Users/sn0w/.claude/get-shit-done/workflows/execute-plan.md
@/Users/sn0w/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/docs/src/nav.ts — Navigation structure with all 27 pages, sections, hrefs
@apps/docs/src/App.tsx — React Router setup, DocsLayout wrapper
@apps/docs/src/components/Header.tsx — Top header bar where search trigger goes
@apps/docs/src/pages/components/ButtonPage.tsx — Example page structure (props arrays, JSX content, headings)
@apps/docs/src/pages/GettingStarted.tsx — Example guide page structure
@apps/docs/package.json — Already has @radix-ui/react-dialog, lucide-react, framer-motion
</context>

<tasks>

<task type="auto">
  <name>Task 1: Build search index and engine</name>
  <files>
    apps/docs/src/search/search-index.ts
    apps/docs/src/search/search-engine.ts
  </files>
  <action>
Create `apps/docs/src/search/search-index.ts`:

Define a `SearchEntry` type:
```ts
interface SearchEntry {
  title: string        // Page title (e.g., "Button")
  section: string      // Nav section (e.g., "Components", "Guides", "Overview", "Tools")
  href: string         // Route path (e.g., "/components/button")
  keywords: string     // Concatenated searchable text: title + headings + descriptions + prop names + code snippets
  headings: string[]   // Section headings within the page for subtitle display
}
```

Build a `searchIndex: SearchEntry[]` array with an entry for every page in the docs. For each page, manually curate the keywords string by pulling key content from the page files:

- **Page titles** from `nav.ts` items
- **Section headings** found in each page (h2/h3 text like "Installation", "Props", "Slots", "Events", "Variants", "Sizes", "Usage", "Examples", "Keyboard Navigation", etc.)
- **Prop names and descriptions** from the PropDef arrays (e.g., "variant primary secondary outline ghost destructive", "disabled loading btn-class")
- **Key terms and phrases** from guide content (e.g., for Accessibility: "ARIA roles keyboard navigation screen reader focus management", for Styling: "CSS custom properties Tailwind theme dark mode")
- **Component-specific terms** (e.g., Button: "click submit loading spinner icon", Dialog: "modal overlay close backdrop", Toast: "notification success error warning")

Group entries by section matching the navigation structure. Export as `searchIndex`.

IMPORTANT: Do NOT try to dynamically parse page files at build time. This is a hand-curated static index. For 27 pages this is manageable and gives better search quality than trying to strip JSX. Each entry should have rich keywords (aim for 50-150 words per entry covering all the important terms a user might search for).

Create `apps/docs/src/search/search-engine.ts`:

Implement a simple but effective search function:
```ts
export function search(query: string, index: SearchEntry[]): SearchResult[]
```

Search algorithm:
1. Normalize query to lowercase, split into terms
2. For each entry, score based on:
   - Title exact match: highest weight (100)
   - Title starts-with match: high weight (80)
   - Title contains term: medium-high (60)
   - Heading contains term: medium (40)
   - Keywords contains term: base (20)
3. All query terms must match somewhere (AND logic) for an entry to appear
4. Sort results by score descending
5. Return top 20 results max

Return type:
```ts
interface SearchResult {
  entry: SearchEntry
  score: number
  matchedHeading?: string  // First heading that matched, for subtitle display
}
```

Export both types and the search function. No external dependencies -- pure TypeScript string matching.
  </action>
  <verify>
Run `cd /Users/sn0w/Documents/dev/lit-components && npx tsc --noEmit -p apps/docs/tsconfig.json` to verify types compile.
Verify the index has entries for all 27 pages by checking the array length.
  </verify>
  <done>
search-index.ts exports a searchIndex array with 27 entries covering all pages.
search-engine.ts exports a search() function that scores and ranks results.
Both files compile without type errors.
  </done>
</task>

<task type="auto">
  <name>Task 2: Build CommandPalette component</name>
  <files>
    apps/docs/src/components/CommandPalette.tsx
  </files>
  <action>
Create `apps/docs/src/components/CommandPalette.tsx` using @radix-ui/react-dialog (already installed) for the modal overlay.

**Component structure:**
```
CommandPalette({ open, onOpenChange })
  -> Dialog.Root (controlled by open/onOpenChange)
    -> Dialog.Portal
      -> Dialog.Overlay (backdrop blur, fade in)
      -> Dialog.Content (centered, max-w-lg, rounded-xl, shadow-2xl)
        -> Search input (autofocus, with Search icon from lucide-react)
        -> Results list (scrollable, max-h-80)
          -> Grouped by section with section headers
          -> Each result: title + optional matched heading subtitle
        -> Footer hint ("Navigate with arrow keys, Enter to select, Esc to close")
```

**State management:**
- `query` string state, updated on input change
- `results` computed via `useMemo` calling `search(query, searchIndex)` from search-engine
- `activeIndex` number for keyboard-highlighted result (0-based across all results)
- `useNavigate()` from react-router for navigation

**Keyboard handling (onKeyDown on the Dialog.Content):**
- ArrowDown: increment activeIndex (wrap to 0 at end)
- ArrowUp: decrement activeIndex (wrap to last at beginning)
- Enter: navigate to activeIndex result's href, close palette
- Escape: handled by Radix Dialog automatically

**Active item scrolling:** Use a ref + `scrollIntoView({ block: 'nearest' })` on the active item when activeIndex changes.

**Grouping logic:**
- Group results by `entry.section`
- Render section headers (small, uppercase, muted text) between groups
- Section headers are NOT selectable / not counted in activeIndex

**Styling (Tailwind classes, match existing dark mode pattern):**
- Overlay: `fixed inset-0 bg-black/50 backdrop-blur-sm` with fade-in animation
- Content: `fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800`
- Input: `w-full px-4 py-3 bg-transparent border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none text-base` with a Search icon (lucide) on the left
- Section header: `px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider`
- Result item: `px-3 py-2 cursor-pointer rounded-lg mx-1` -- default: transparent, active/hover: `bg-gray-100 dark:bg-gray-800`
- Result title: `text-sm font-medium text-gray-900 dark:text-gray-100`
- Result subtitle (matchedHeading): `text-xs text-gray-500 dark:text-gray-400`
- Footer: `px-4 py-2 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500`
- Empty state when query has no results: "No results found" centered, muted

**Animations:** Use simple CSS transitions or framer-motion (already installed) for:
- Overlay fade in/out
- Content scale + fade in (from 0.95/0 to 1/1)

**Reset state on close:** Clear query and activeIndex when dialog closes (in onOpenChange handler).
  </action>
  <verify>
Run `cd /Users/sn0w/Documents/dev/lit-components && npx tsc --noEmit -p apps/docs/tsconfig.json` to verify compilation.
  </verify>
  <done>
CommandPalette.tsx renders a modal with search input, grouped results, keyboard navigation, and React Router navigation on selection. Compiles without errors.
  </done>
</task>

<task type="auto">
  <name>Task 3: Wire CommandPalette into app shell</name>
  <files>
    apps/docs/src/components/Header.tsx
    apps/docs/src/App.tsx
  </files>
  <action>
**Modify Header.tsx:**

1. Add state: `const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)`
2. Add global keyboard listener via useEffect:
   ```ts
   useEffect(() => {
     const handler = (e: KeyboardEvent) => {
       if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
         e.preventDefault()
         setCommandPaletteOpen(true)
       }
     }
     document.addEventListener('keydown', handler)
     return () => document.removeEventListener('keydown', handler)
   }, [])
   ```
3. Add a search trigger button in the header between the GitHub link and ThemeToggle:
   - Style: `hidden sm:flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer`
   - Content: Search icon (from lucide-react, size 14) + "Search..." text + kbd badge showing platform shortcut
   - The kbd badge: `ml-auto text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5` showing "Cmd K" on Mac / "Ctrl K" otherwise (detect via navigator.platform or userAgent)
   - onClick: `setCommandPaletteOpen(true)`
4. Render `<CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />` at the end of the header

**No changes needed to App.tsx** -- the Header is already rendered inside DocsLayout, which wraps all routes. The CommandPalette uses useNavigate() which works because it's inside BrowserRouter.

Import the necessary modules: `useState`, `useEffect` from react, `Search` from lucide-react, `CommandPalette` from './CommandPalette'.
  </action>
  <verify>
Run `cd /Users/sn0w/Documents/dev/lit-components && npx tsc --noEmit -p apps/docs/tsconfig.json` to verify compilation.
Run `cd /Users/sn0w/Documents/dev/lit-components && pnpm --filter lit-ui-docs build` to verify the full build succeeds.
  </verify>
  <done>
Cmd+K / Ctrl+K opens the command palette from anywhere in the docs site.
Header shows a clickable search bar trigger with keyboard shortcut hint.
Full build compiles and succeeds.
  </done>
</task>

</tasks>

<verification>
1. `pnpm --filter lit-ui-docs build` succeeds with no errors
2. Run dev server (`pnpm --filter lit-ui-docs dev`) and manually verify:
   - Cmd+K opens the palette
   - Typing "button" shows Button component as top result
   - Typing "variant" matches Button, Select, and other components with variant props
   - Typing "accessibility" shows the Accessibility guide
   - Arrow keys navigate, Enter goes to page, Escape closes
   - Results grouped under section headers (Overview, Guides, Components, Tools)
   - Clicking the search bar in the header also opens the palette
   - Dark mode styling looks correct
</verification>

<success_criteria>
- Command palette opens via Cmd+K/Ctrl+K and via header search button
- Search returns relevant results for page titles, headings, props, and key terms
- Results are grouped by nav section
- Full keyboard navigation works (arrows, enter, escape)
- Navigation uses React Router (no page reload)
- Styling matches existing dark mode patterns
- Build passes with no type errors
</success_criteria>

<output>
After completion, create `.planning/quick/001-cmd-k-command-palette-full-text-search/001-SUMMARY.md`
</output>
