export interface SearchEntry {
  title: string
  section: string
  href: string
  keywords: string
  headings: string[]
}

export const searchIndex: SearchEntry[] = [
  // ── Overview ──────────────────────────────────────────────────────────
  {
    title: 'Getting Started',
    section: 'Overview',
    href: '/getting-started',
    keywords:
      'getting started quick start installation init setup npx lit-ui add button project structure ' +
      'tailwind-element tailwind css theme config lit-ui.json components web components framework ' +
      'react vue svelte html import register custom elements shadow dom',
    headings: ['Installation', 'Add Your First Component', 'Project Structure', "What's Next"],
  },
  {
    title: 'Installation',
    section: 'Overview',
    href: '/installation',
    keywords:
      'installation install npm pnpm yarn bun package manager cli npx lit-ui init add ' +
      'dependencies peer dependencies lit tailwindcss configuration setup prerequisites ' +
      'node version registry packages workspace monorepo',
    headings: ['CLI Installation', 'Package Manager', 'Manual Setup', 'Configuration'],
  },

  // ── Guides ────────────────────────────────────────────────────────────
  {
    title: 'Accessibility',
    section: 'Guides',
    href: '/guides/accessibility',
    keywords:
      'accessibility a11y ARIA roles keyboard navigation screen reader focus management ' +
      'tab order focus trap focus visible aria-label aria-describedby aria-disabled ' +
      'WCAG contrast color blindness semantic HTML landmarks live regions announce ' +
      'assistive technology voiceover nvda jaws reduced motion prefers-reduced-motion',
    headings: ['Keyboard Navigation', 'ARIA Attributes', 'Focus Management', 'Screen Reader Support', 'Testing Accessibility'],
  },
  {
    title: 'Agent Skills',
    section: 'Guides',
    href: '/guides/agent-skills',
    keywords:
      'agent skills AI LLM claude copilot cursor code generation component creation ' +
      'web component lit element prompt engineering custom element define tag name ' +
      'attribute property event shadow dom template slot CSS parts',
    headings: ['Component Anatomy', 'Prompting Tips', 'Custom Component Creation', 'Extending Components'],
  },
  {
    title: 'Form Integration',
    section: 'Guides',
    href: '/guides/form-integration',
    keywords:
      'form integration submit validation FormData ElementInternals setFormValue ' +
      'required constraint validation custom validity checkValidity reportValidity ' +
      'form associated custom element formdata event reset restore input checkbox ' +
      'radio select textarea switch native form participation',
    headings: ['Form Association', 'Validation', 'FormData Integration', 'Custom Validity', 'Examples'],
  },
  {
    title: 'Internationalization',
    section: 'Guides',
    href: '/guides/i18n',
    keywords:
      'internationalization i18n localization l10n translation locale language direction ' +
      'RTL right-to-left LTR dir attribute lang attribute date format number format ' +
      'calendar locale time picker locale plural rules ICU message format',
    headings: ['Setting Locale', 'RTL Support', 'Date & Time Localization', 'Custom Translations'],
  },
  {
    title: 'Migration',
    section: 'Guides',
    href: '/guides/migration',
    keywords:
      'migration upgrade breaking changes version changelog v1 v2 v3 v4 v5 ' +
      'CSS variables rename lui prefix ui prefix deprecation removal API changes ' +
      'property rename attribute rename event rename slot rename',
    headings: ['Migration Steps', 'Breaking Changes', 'Deprecations', 'Codemods'],
  },
  {
    title: 'SSR Setup',
    section: 'Guides',
    href: '/guides/ssr',
    keywords:
      'SSR server side rendering hydration declarative shadow DOM DSD lit-ssr ' +
      'next.js nuxt sveltekit astro node server client hydrate custom element ' +
      'define shimming polyfill flash of unstyled content FOUC streaming',
    headings: ['Server Configuration', 'Framework Integration', 'Hydration', 'Troubleshooting'],
  },
  {
    title: 'Styling',
    section: 'Guides',
    href: '/guides/styling',
    keywords:
      'styling CSS custom properties Tailwind theme dark mode light mode design tokens ' +
      'color palette spacing typography border radius shadow CSS variables override ' +
      'CSS parts ::part pseudo element class passthrough btn-class input-class ' +
      'shadow DOM encapsulation theming customization brand colors',
    headings: ['CSS Custom Properties', 'Class Passthrough', 'CSS Parts', 'Dark Mode', 'Theme Tokens', 'Design System'],
  },

  // ── Components ────────────────────────────────────────────────────────
  {
    title: 'Accordion',
    section: 'Components',
    href: '/components/accordion',
    keywords:
      'accordion expand collapse toggle panel section disclosure summary details ' +
      'open close animated chevron icon heading level custom collapsible multi single ' +
      'lazy content slot CSS parts lui-accordion lui-accordion-item',
    headings: ['Examples', 'Basic Accordion', 'Multi-expand', 'Collapsible', 'Disabled', 'Custom Heading Level', 'Lazy Content', 'Accessibility', 'Custom Styling', 'API Reference', 'lui-accordion Props', 'lui-accordion-item Props', 'lui-accordion Slots', 'lui-accordion-item Slots', 'CSS Custom Properties', 'Events'],
  },
  {
    title: 'Button',
    section: 'Components',
    href: '/components/button',
    keywords:
      'button click submit loading spinner icon variant primary secondary outline ghost destructive ' +
      'size sm md lg disabled aria-disabled btn-class slot icon-start icon-end CSS parts ' +
      'CSS custom properties lui-button-radius lui-button-shadow lui-button-font-weight ' +
      'form type reset pill rounded full gradient uppercase',
    headings: ['Examples', 'Variants', 'Sizes', 'Loading State', 'With Icons', 'Disabled State', 'Custom Styling', 'CSS Custom Properties', 'Class Passthrough', 'CSS Parts', 'API Reference', 'Props', 'Slots', 'Events'],
  },
  {
    title: 'Calendar',
    section: 'Components',
    href: '/components/calendar',
    keywords:
      'calendar date picker month year navigation grid day week locale ' +
      'min max disabled dates range selection single multi keyboard arrow keys ' +
      'today highlight locale format intl date-selected event',
    headings: ['Examples', 'Basic Usage', 'Min/Max Dates', 'Disabled Dates', 'Locale', 'API Reference', 'Props', 'Events'],
  },
  {
    title: 'Checkbox',
    section: 'Components',
    href: '/components/checkbox',
    keywords:
      'checkbox check checked unchecked indeterminate toggle boolean form input ' +
      'label description required validation disabled group aria-checked ' +
      'change event checkmark tick box square',
    headings: ['Examples', 'Basic Usage', 'With Label', 'Indeterminate', 'Disabled', 'Group', 'API Reference', 'Props', 'Events'],
  },
  {
    title: 'Data Table',
    section: 'Components',
    href: '/components/data-table',
    keywords:
      'data table grid rows columns sort filter pagination selection checkbox expand ' +
      'inline edit row actions CSV export server-side virtual scroll sticky header ' +
      'column resize reorder responsive lui-data-table ARIA grid keyboard navigation ' +
      'screen reader W3C APG compliance accessibility expandable rows',
    headings: ['Examples', 'Basic Table', 'Sorting', 'Row Selection', 'Filtering', 'Pagination', 'Advanced Features', 'Column Customization', 'Inline Editing', 'Row Actions', 'Expandable Rows', 'Server-Side Data', 'CSV Export', 'API Reference', 'Properties', 'Events', 'Slots', 'CSS Custom Properties', 'Accessibility', 'ARIA Roles', 'Keyboard Navigation', 'Screen Reader Support', 'W3C APG Compliance'],
  },
  {
    title: 'Date Picker',
    section: 'Components',
    href: '/components/date-picker',
    keywords:
      'date picker calendar input popover format parse locale min max ' +
      'disabled dates placeholder value date-change event trigger open close ' +
      'keyboard navigation month year selection single date form',
    headings: ['Examples', 'Basic Usage', 'With Placeholder', 'Min/Max', 'Custom Format', 'API Reference', 'Props', 'Events'],
  },
  {
    title: 'Date Range Picker',
    section: 'Components',
    href: '/components/date-range-picker',
    keywords:
      'date range picker calendar start end from to period duration selection ' +
      'two months side by side popover input format locale min max disabled dates ' +
      'range-change event preset ranges last 7 days 30 days booking reservation',
    headings: ['Examples', 'Basic Usage', 'Preset Ranges', 'Min/Max', 'Custom Format', 'API Reference', 'Props', 'Events'],
  },
  {
    title: 'Dialog',
    section: 'Components',
    href: '/components/dialog',
    keywords:
      'dialog modal overlay close backdrop escape focus trap portal alert confirm ' +
      'prompt sheet drawer open close trigger content title description actions ' +
      'aria-modal role dialog aria-labelledby aria-describedby animation scale fade ' +
      'slot header footer body scrollable nested stacked',
    headings: ['Examples', 'Basic Usage', 'With Form', 'Alert Dialog', 'Scrollable Content', 'Custom Styling', 'API Reference', 'Props', 'Slots', 'Events'],
  },
  {
    title: 'Input',
    section: 'Components',
    href: '/components/input',
    keywords:
      'input text field type email password number tel url search placeholder ' +
      'value label description error validation required disabled readonly pattern ' +
      'min max minlength maxlength autocomplete form prefix suffix icon clear ' +
      'input-class focus ring border',
    headings: ['Examples', 'Types', 'With Label', 'Validation', 'Prefix & Suffix', 'Disabled', 'API Reference', 'Props', 'Slots', 'Events'],
  },
  {
    title: 'Popover',
    section: 'Components',
    href: '/components/popover',
    keywords:
      'popover popup floating overlay tooltip dropdown menu placement position ' +
      'top bottom left right start end arrow offset trigger click hover focus ' +
      'open close dismiss outside click escape portal z-index flip shift',
    headings: ['Examples', 'Basic Usage', 'Placement', 'With Arrow', 'Trigger Modes', 'API Reference', 'Props', 'Slots', 'Events'],
  },
  {
    title: 'Radio',
    section: 'Components',
    href: '/components/radio',
    keywords:
      'radio button option group single selection circle dot checked value ' +
      'name label description required disabled form change event ' +
      'radio-group orientation horizontal vertical keyboard arrow keys',
    headings: ['Examples', 'Basic Usage', 'Radio Group', 'Horizontal', 'With Description', 'Disabled', 'API Reference', 'Props', 'Events'],
  },
  {
    title: 'Select',
    section: 'Components',
    href: '/components/select',
    keywords:
      'select dropdown option choose pick listbox combobox value placeholder ' +
      'label description required disabled multiple search filter open close ' +
      'trigger content item group separator variant outline ghost ' +
      'form change event keyboard navigation typeahead',
    headings: ['Examples', 'Basic Usage', 'With Placeholder', 'Groups', 'Disabled Options', 'Custom Trigger', 'API Reference', 'Props', 'Slots', 'Events'],
  },
  {
    title: 'Switch',
    section: 'Components',
    href: '/components/switch',
    keywords:
      'switch toggle on off boolean true false check label description ' +
      'disabled required form change event aria-checked role switch ' +
      'thumb track sliding animation transition',
    headings: ['Examples', 'Basic Usage', 'With Label', 'Disabled', 'Sizes', 'API Reference', 'Props', 'Events'],
  },
  {
    title: 'Tabs',
    section: 'Components',
    href: '/components/tabs',
    keywords:
      'tabs tab panel tablist tabpanel navigation horizontal vertical orientation ' +
      'active selected disabled lazy panel overflow scroll animated indicator ' +
      'keyboard arrow keys manual automatic activation lui-tabs lui-tab-panel ' +
      'change event ARIA roles accessibility',
    headings: ['Examples', 'Basic Tabs', 'Vertical Orientation', 'Manual Activation', 'Disabled Tabs', 'Lazy Panels', 'Overflow Scroll', 'Animated Indicator', 'Accessibility', 'Custom Styling', 'API Reference', 'lui-tabs Props', 'lui-tab-panel Props', 'lui-tabs Slots', 'lui-tab-panel Slots', 'CSS Custom Properties', 'Events'],
  },
  {
    title: 'Textarea',
    section: 'Components',
    href: '/components/textarea',
    keywords:
      'textarea multiline text area input long form content description ' +
      'placeholder value label error validation required disabled readonly ' +
      'rows cols resize auto-resize min-height max-height character count ' +
      'form textarea-class focus ring border',
    headings: ['Examples', 'Basic Usage', 'With Label', 'Auto Resize', 'Character Count', 'Validation', 'Disabled', 'API Reference', 'Props', 'Events'],
  },
  {
    title: 'Time Picker',
    section: 'Components',
    href: '/components/time-picker',
    keywords:
      'time picker hour minute second period AM PM 12 24 format clock ' +
      'input scroll wheel increment decrement step interval locale ' +
      'time-change event form min max disabled placeholder',
    headings: ['Examples', 'Basic Usage', '12/24 Hour', 'With Seconds', 'Min/Max Time', 'Step Interval', 'API Reference', 'Props', 'Events'],
  },
  {
    title: 'Toast',
    section: 'Components',
    href: '/components/toast',
    keywords:
      'toast notification alert message snackbar success error warning info ' +
      'duration timeout auto dismiss close action undo position top bottom ' +
      'left right center stack queue promise loading rich content icon ' +
      'toaster container provider API programmatic',
    headings: ['Examples', 'Basic Usage', 'Variants', 'With Action', 'Promise Toast', 'Custom Duration', 'Position', 'API Reference', 'Toast API', 'Props'],
  },
  {
    title: 'Tooltip',
    section: 'Components',
    href: '/components/tooltip',
    keywords:
      'tooltip hint hover info help popup floating text placement position ' +
      'top bottom left right delay show hide duration offset arrow trigger ' +
      'focus accessible aria-describedby delay-group',
    headings: ['Examples', 'Basic Usage', 'Placement', 'With Arrow', 'Delay Group', 'Custom Content', 'API Reference', 'Props'],
  },

  // ── Charts ────────────────────────────────────────────────────────────
  {
    title: 'Line Chart',
    section: 'Charts',
    href: '/charts/line-chart',
    keywords:
      'line chart time series data visualization smooth curve interpolation zoom pan ' +
      'DataZoom multi-series mark line threshold streaming real-time ECharts ' +
      'lui-line-chart CSS custom properties series color',
    headings: ['Examples', 'Basic Line Chart', 'API Reference', 'Props', 'CSS Custom Properties'],
  },
  {
    title: 'Area Chart',
    section: 'Charts',
    href: '/charts/area-chart',
    keywords:
      'area chart filled area stacked smooth zoom pan streaming real-time ECharts ' +
      'multi-series opacity gradient areaStyle lui-area-chart CSS custom properties ' +
      'time series data visualization label position',
    headings: ['Examples', 'Stacked Area Chart', 'API Reference', 'Props', 'CSS Custom Properties'],
  },
  {
    title: 'Bar Chart',
    section: 'Charts',
    href: '/charts/bar-chart',
    keywords:
      'bar chart column chart grouped stacked horizontal vertical show labels value labels ' +
      'color by data categories ECharts lui-bar-chart CSS custom properties ' +
      'data visualization comparison per-bar color label position',
    headings: ['Examples', 'Grouped Bar Chart with Labels', 'API Reference', 'Props', 'CSS Custom Properties'],
  },
  {
    title: 'Pie Chart',
    section: 'Charts',
    href: '/charts/pie-chart',
    keywords:
      'pie chart donut chart inner radius center label slice merge min percent ' +
      'proportion percentage ECharts lui-pie-chart CSS custom properties ' +
      'data visualization label position inside outside',
    headings: ['Examples', 'Donut Chart with Center Label', 'API Reference', 'Props', 'CSS Custom Properties'],
  },
  {
    title: 'Scatter Chart',
    section: 'Charts',
    href: '/charts/scatter-chart',
    keywords:
      'scatter chart plot points XY correlation distribution bubble WebGL enable-gl ' +
      'ECharts lui-scatter-chart CSS custom properties data visualization bundle size',
    headings: ['Examples', 'Basic Scatter Chart', 'API Reference', 'Props', 'CSS Custom Properties', 'Bundle Size'],
  },
  {
    title: 'Heatmap Chart',
    section: 'Charts',
    href: '/charts/heatmap-chart',
    keywords:
      'heatmap chart matrix grid calendar activity intensity color scale visualCalendar ' +
      'ECharts lui-heatmap-chart CSS custom properties data visualization weekly monthly',
    headings: ['Examples', 'Weekly Activity Heatmap', 'API Reference', 'Props', 'CSS Custom Properties'],
  },
  {
    title: 'Candlestick Chart',
    section: 'Charts',
    href: '/charts/candlestick-chart',
    keywords:
      'candlestick chart OHLC open high low close financial stock trading price ' +
      'ECharts lui-candlestick-chart CSS custom properties data visualization candle',
    headings: ['Examples', '5-Day OHLC Candlestick', 'API Reference', 'Props', 'CSS Custom Properties'],
  },
  {
    title: 'Treemap Chart',
    section: 'Charts',
    href: '/charts/treemap-chart',
    keywords:
      'treemap chart hierarchical nested rectangles proportional area category drilldown ' +
      'ECharts lui-treemap-chart CSS custom properties data visualization product category',
    headings: ['Examples', 'Product Category Treemap', 'API Reference', 'Props', 'CSS Custom Properties'],
  },

  // ── Tools ─────────────────────────────────────────────────────────────
  {
    title: 'Theme Configurator',
    section: 'Tools',
    href: '/configurator',
    keywords:
      'theme configurator visual editor design system colors palette primary secondary ' +
      'destructive accent background foreground muted border ring radius spacing ' +
      'typography font size weight line height dark mode light mode preview export ' +
      'CSS variables tokens custom brand tailwind config live interactive',
    headings: ['Color Palette', 'Typography', 'Spacing & Radius', 'Preview', 'Export'],
  },
]
