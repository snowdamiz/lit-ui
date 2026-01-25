# Project Research Summary

**Project:** LitUI v3.0 Theme Customization
**Domain:** Lit.js Web Components + Tailwind v4 + Visual Theme Configurator
**Researched:** 2026-01-25
**Confidence:** HIGH

## Executive Summary

LitUI v3.0 adds a visual theme configurator to an existing Lit.js component library with Tailwind v4 integration. The system enables users to customize design tokens (colors, spacing, shadows, typography) through a visual interface on the docs site, encode their configuration into a URL-safe parameter, pass it to the CLI, and generate a `lit-ui-tokens.css` file. The architecture leverages the existing CSS custom property foundation in `@lit-ui/core`, requiring no component changes.

The recommended approach uses a "configure once, generate artifacts" model: users visually configure tokens in the React-based docs site, the configuration is base64url-encoded into a CLI command, the CLI decodes and generates CSS that overrides `:root` values, and components consume tokens via CSS cascade into Shadow DOM. This maintains the existing dual-distribution model (copy-source via CLI + NPM packages) while adding professional theming infrastructure.

Critical risks center on **Tailwind v4's `@theme` directive scope** (only works in the main entry file, not imported files), **token naming as permanent API** (renaming breaks user configs), and **URL encoding limitations** (configs can exceed browser URL length limits). Mitigation requires careful token architecture from the start, URL-safe base64url encoding with compression, and storing only diffs from defaults rather than full configurations.

## Key Findings

### Recommended Stack

LitUI already has a solid technical foundation: Lit 3.x for web components, Tailwind v4 with `@tailwindcss/vite`, TypeScript 5.x, and a CLI built with Commander.js and Inquirer.js. The v3.0 milestone adds theme customization infrastructure without changing the core stack.

**Core technologies for v3.0:**
- **React** (docs site): Visual configurator UI with live preview — already in use for docs site, mature color picker ecosystem
- **Base64URL encoding**: URL-safe configuration encoding — RFC 4648 standard, works in both browser and Node.js
- **lz-string or similar**: Compression before encoding — reduces config size by ~60-80% to stay within URL limits
- **Tailwind v4 `@theme` directive**: Token definition and utility generation — CSS-first configuration, replaces JavaScript config
- **CSS custom properties**: Cross-boundary theming — cascades from `:root` into Shadow DOM automatically
- **Existing CLI (citty framework)**: Extends with `--theme` parameter — reuses established CLI patterns

**Critical patterns from existing codebase:**
- `@theme` directive in main `tailwind.css` entry file for primitive tokens
- `:root` block for semantic and component-level tokens
- `.dark` class-based dark mode overrides
- TailwindElement base class with constructable stylesheets
- `@property` extraction pattern for Shadow DOM compatibility

### Expected Features

LitUI v3.0 focuses on build-time theme customization. Runtime theme switching is explicitly out of scope.

**Must have (table stakes):**
- **Live preview** — every comparable tool (shadcn themes, tweakcn, Radix) shows instant updates
- **Color customization** (primary, secondary, destructive, background, foreground) — core use case for theming
- **Light/dark mode dual editing** — industry standard, users expect both modes configured together
- **Border radius control** — universal customization point, small change with large visual impact
- **Copy-paste CSS output** — shadcn pattern, zero friction adoption
- **CLI accepts token configuration** — users shouldn't re-copy CSS each time components are added
- **Generated `lit-ui-tokens.css` file** — the deliverable artifact consumed by components

**Should have (competitive advantage):**
- **Shareable theme URL** — encode entire theme in URL for collaboration and showcasing
- **WCAG contrast validation** — real-time accessibility feedback, competitors rarely include this
- **JSON export** — enables design tool workflows beyond CSS
- **3-4 preset themes** — curated starting points reduce decision fatigue

**Defer (v3.1+ or never):**
- Typography customization (font family, scale) — adds complexity, limited ROI for MVP
- Animation tokens — smaller visual impact than colors/spacing
- Component-specific token previews — beyond "see a demo page"
- Undo/redo history — nice UX but not essential
- Runtime theme switching — conflicts with build-time approach, adds JS overhead

### Architecture Approach

The theme customization system integrates with LitUI's existing dual-mode architecture (copy-source vs NPM) by adding four new components: (1) visual configurator page in the React-based docs site, (2) token encoding/decoding utilities shared between docs and CLI, (3) CSS generator in the CLI that transforms token configs to CSS custom properties, and (4) CLI command extension to accept `--theme` parameter. The architecture maintains clean separation: docs site handles UI and generates encoded config, CLI handles decoding and artifact generation, components consume via CSS cascade without modification.

**Major components:**
1. **Theme Configurator Page** (`apps/docs/src/pages/ThemeConfigurator.tsx`) — visual UI for adjusting design tokens, live preview of components, generates shareable URL and CLI command
2. **Token Encoder/Decoder** (`packages/cli/src/utils/tokens.ts` + docs equivalent) — defines token schema, encodes to base64url, decodes and validates
3. **CSS Generator** (`packages/cli/src/utils/generate-tokens.ts`) — transforms token config into CSS custom properties, generates `:root` and `.dark` blocks, writes `lit-ui-tokens.css` file
4. **CLI Extension** (`packages/cli/src/commands/add.ts` modification) — parses `--theme` parameter, integrates decoder and generator, updates project config

**Data flow:**
```
Docs Configurator (React UI)
  -> Encoded Token Config (base64url string)
  -> User's CLI Command (--theme parameter)
  -> Token Decoder (base64url -> JSON)
  -> CSS Generator (JSON -> CSS custom properties)
  -> lit-ui-tokens.css (written to user project)
  -> Components (consume via CSS cascade)
```

**Integration points:**
- Existing token system in `@lit-ui/core/src/styles/tailwind.css` defines all tokens (primitives, semantics, component-level)
- Generated `lit-ui-tokens.css` overrides `:root` values, cascades into Shadow DOM
- No component changes required — they already reference tokens via `var(--color-primary)` pattern
- Works with both copy-source and NPM distribution modes

### Critical Pitfalls

Theme customization introduces architectural and UX pitfalls beyond the existing Lit/Tailwind Shadow DOM challenges.

1. **`@theme` directive scope** — Tailwind v4's `@theme` only works in the main entry file, not imported files. User-generated token files must use `:root` with CSS custom properties, not `@theme`. Prevention: structure tokens with `@theme` primitives in entry file, `:root` overrides in generated file.

2. **Token naming becomes permanent API** — changing token names like `--color-primary` or `--ui-button-radius` breaks user customizations and encoded configs. Prevention: treat token names as permanent from day one, use semantic naming that won't need to change, include version field in encoded configs for future migration.

3. **URL encoding limits** — full design token config can exceed browser URL limits (2,000-8,000 characters depending on browser/server). Prevention: use URL-safe base64url encoding, compress with lz-string, store only DIFF from defaults (not full config), warn users when generated URL approaches safe limit.

4. **Generated token file must reach Shadow DOM** — `lit-ui-tokens.css` must be imported at document level, not inside components, for CSS variables to cascade into Shadow DOM. Prevention: CLI documentation must be explicit, consider CLI modifying user's main CSS import automatically, test in real projects not just isolated components.

5. **Exposing too many customizable tokens** — making every value customizable leads to overwhelming UI, accessibility violations (users pick bad contrast), inconsistent results, and bloated configs. Prevention: layer tokens (primitive -> semantic -> component), only expose semantic layer to configurator, document "safe" vs "internal" tokens.

**Additional v3.0-specific pitfalls:**
- **Color space mismatches** — existing system uses OKLCH, standard color pickers use sRGB/HSL, conversions can produce visible differences
- **Dark mode token parity** — every customizable token must have dark mode variant, configurator must show both modes simultaneously
- **Config size and corruption** — decode/parse operations need robust error handling, validation, user-friendly error messages
- **FOUC in live preview** — CSS custom property updates may not apply instantly, need debouncing and smooth transitions

## Implications for Roadmap

Based on research, suggested phase structure for v3.0:

### Phase 1: Token Infrastructure
**Rationale:** Foundation must be correct before building UI. Token schema, encoding format, and CSS generation patterns are architectural decisions that affect everything downstream.

**Delivers:**
- Token schema TypeScript interface defining customizable tokens
- Base64url encoder/decoder utilities (Node.js + browser)
- CSS generator that transforms token config to CSS custom properties
- Compression strategy (store diffs only, use lz-string)
- Version field in config for future migration

**Addresses:**
- Token naming as permanent API (PITFALL: finalize naming convention)
- URL encoding limitations (PITFALL: compression + diff storage)
- `@theme` vs `:root` distinction (PITFALL: architecture decision)

**Avoids:**
- Architectural rework after UI is built
- Breaking changes to token names later
- Config size exceeding URL limits

**Research flags:** Low complexity, well-established patterns. RFC 4648 for base64url, standard JSON schema validation. Skip deep research.

---

### Phase 2: CLI Integration
**Rationale:** CLI must accept and process token configuration before docs can generate CLI commands. Enables end-to-end testing of encoding -> CLI -> CSS generation flow.

**Delivers:**
- `--theme` parameter parsing in `add` command
- Token decoder integration
- CSS generator integration
- `lit-ui-tokens.css` file writing
- Config file tracking in `lit-ui.config.json`
- Error handling for corrupt/invalid configs

**Uses:**
- Encoder/decoder from Phase 1
- CSS generator from Phase 1
- Existing CLI framework (citty)

**Implements:**
- CLI extension architecture component
- Token file generation workflow

**Avoids:**
- CLI config decoding crashes (PITFALL: robust error handling)
- Missing file extensions causing import failures (PITFALL: validate generated imports)

**Research flags:** Low complexity, extends existing CLI patterns. Skip deep research.

---

### Phase 3: Visual Configurator UI
**Rationale:** With infrastructure and CLI working, build user-facing UI. Requires most time/effort but depends on stable foundation.

**Delivers:**
- Theme configurator page in docs site
- Color pickers for semantic tokens (primary, secondary, destructive, backgrounds)
- Border radius slider
- Light/dark mode simultaneous editing
- Live preview with debounced updates
- CSS output display with copy button
- CLI command display with copy button
- 3-4 preset themes (one-click apply)

**Addresses:**
- Live preview (FEATURE: must-have, table stakes)
- Color customization (FEATURE: core use case)
- Light/dark mode support (FEATURE: industry standard)
- Border radius control (FEATURE: high visual impact)
- Copy-paste CSS output (FEATURE: shadcn pattern)
- Preset themes (FEATURE: reduce decision fatigue)

**Avoids:**
- FOUC in preview (PITFALL: debounce rapid changes, batch token updates)
- Color space mismatches (PITFALL: OKLCH-aware color picker or accurate conversion)
- Overwhelming UI (PITFALL: limit to semantic tokens only, ~15-20 total)

**Research flags:** Medium complexity for OKLCH color picker integration. May need color space conversion library research. Otherwise standard React patterns.

---

### Phase 4: Enhanced Features
**Rationale:** Competitive differentiators after core functionality works. These are nice-to-have features that increase value but aren't essential for launch.

**Delivers:**
- Shareable theme URL (encode config in query params, hydrate on load)
- WCAG contrast validation (real-time warnings, AA/AAA indicators)
- JSON export format (design tool workflows)
- Component-specific token preview (show how tokens affect each component)

**Addresses:**
- Shareable theme URL (FEATURE: competitive advantage)
- WCAG contrast validation (FEATURE: accessibility credibility)
- JSON export (FEATURE: design tool integration)

**Avoids:**
- Accessibility of generated themes (PITFALL: contrast warnings prevent violations)
- URL encoding limits (already addressed in Phase 1, but validate with full feature set)

**Research flags:** Medium complexity for WCAG contrast calculation (OKLCH contrast math). Otherwise straightforward.

---

### Phase 5: Documentation and Testing
**Rationale:** Complete user experience requires clear documentation, especially for file path requirements and Shadow DOM constraints.

**Delivers:**
- Installation guide updates with theme customization workflow
- Theming guide (token concepts, customization patterns)
- Troubleshooting section (common issues like token file not loading)
- Framework-specific examples (how to import token file in React/Vue/Svelte)
- SSR considerations (token file must be in build output)
- Testing across distribution modes (copy-source vs NPM)

**Addresses:**
- Generated token file must reach Shadow DOM (PITFALL: document import requirements)
- Token file not included in build (PITFALL: bundler configuration notes)
- Generated CSS not available during SSR (PITFALL: file path documentation)

**Avoids:**
- User confusion about where to import token file
- Production build failures due to missing token CSS
- SSR rendering without custom theme

**Research flags:** Low complexity, documentation patterns. Skip deep research.

---

### Phase Ordering Rationale

**Why this order:**
1. **Infrastructure first** (Phase 1) — token schema, encoding, CSS generation are architectural foundations. Getting these wrong requires rebuilding everything.
2. **CLI before UI** (Phase 2) — enables testing the full workflow (encode -> CLI -> CSS) before building visual interface. Docs can't generate working CLI commands without working CLI.
3. **Core UI before enhancements** (Phase 3) — must-have features (live preview, color pickers, copy-paste) before nice-to-have features (shareability, contrast validation).
4. **Enhancements independently** (Phase 4) — competitive differentiators can be developed in parallel or deferred without blocking core functionality.
5. **Documentation last** (Phase 5) — requires complete feature set to document accurately.

**Why this grouping:**
- **Phase 1+2 together** address encoding/CLI concerns, can be developed by same engineer
- **Phase 3+4 together** are UI-focused, different skillset from backend/CLI work
- **Phase 5** is cross-cutting, requires feature freeze

**How this avoids pitfalls:**
- Token naming finalized in Phase 1 before any UI references it
- URL encoding strategy proven in Phase 2 before UI generates URLs
- Shadow DOM token cascade tested in Phase 2 before UI claims success
- Accessibility validation in Phase 4 prevents shipping inaccessible configurator

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 3 (Visual Configurator):** OKLCH color picker library options, color space conversion accuracy, React color picker component evaluation
- **Phase 4 (WCAG Validation):** OKLCH contrast ratio calculation algorithms, perceptual vs mathematical contrast

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Token Infrastructure):** Base64 encoding is RFC standard, JSON schema validation is well-documented
- **Phase 2 (CLI Integration):** Extends existing citty patterns, file writing is straightforward
- **Phase 5 (Documentation):** Standard documentation patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Existing Lit 3.x + Tailwind v4 foundation is proven. React for docs site already in use. Base64url encoding is standard. |
| Features | HIGH | Feature requirements verified against shadcn/ui themes, tweakcn, Radix themes. Table stakes vs differentiators clearly defined based on competitive analysis. |
| Architecture | HIGH | Leverages existing CSS custom property system in `@lit-ui/core`. Separation of concerns (docs UI, CLI generation, component consumption) is clean. Token cascade into Shadow DOM already working. |
| Pitfalls | HIGH | Critical pitfalls identified from Tailwind v4 GitHub issues, existing codebase analysis, and community reports. Prevention strategies validated against official docs. |

**Overall confidence:** HIGH

All research areas have authoritative sources. Stack choices build on existing working foundation. Feature prioritization informed by direct competitive analysis. Architecture integrates cleanly with proven patterns. Pitfalls are known issues with documented solutions.

### Gaps to Address

While confidence is high, a few areas need validation during implementation:

- **OKLCH color picker options:** Research identified the need but didn't evaluate specific libraries. During Phase 3 planning, evaluate Culori-based pickers vs conversion layers. Test color accuracy with wide gamut displays.

- **Compression algorithm performance:** Research suggests lz-string but didn't benchmark compression ratios or performance. During Phase 1, validate compression achieves 60-80% reduction and decompression is fast enough for CLI usage (<100ms).

- **Config size limits in practice:** Theoretical URL limits are known (2KB-8KB) but actual safe limit depends on server configurations users deploy to. During Phase 4 testing, validate with various hosting providers (Vercel, Netlify, AWS).

- **OKLCH contrast calculation:** Research identified need for perceptual contrast but didn't specify exact algorithm. During Phase 4 planning, choose between WCAG 2.x (mathematical) vs APCA (perceptual). OKLCH makes this more complex than sRGB.

- **Token count vs URL length:** Research recommends storing diffs only, but actual token count determines maximum customization before hitting limits. During Phase 1, model worst-case scenario (user customizes all exposed tokens + all dark mode variants).

## Sources

### Primary (HIGH confidence)

**Official Documentation:**
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/theme) — `@theme` directive usage, CSS-first configuration, variable scoping
- [Tailwind CSS v4 Announcement](https://tailwindcss.com/blog/tailwindcss-v4) — v4 features, performance improvements, Vite plugin
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming) — CSS variable architecture for component theming, OKLCH color format
- [Lit SSR Overview](https://lit.dev/docs/ssr/overview/) — SSR considerations for token file loading

**Web Standards:**
- [RFC 4648 Base64URL](https://datatracker.ietf.org/doc/html/rfc4648) — URL-safe encoding specification

**Existing Codebase:**
- `/packages/core/src/styles/tailwind.css` — current token definitions, `@theme` and `:root` patterns
- `/packages/cli/src/commands/add.ts` — CLI command patterns, citty framework usage
- `/apps/docs/src/pages/components/ButtonPage.tsx` — docs page patterns, live preview implementation

### Secondary (MEDIUM confidence)

**Third-Party Tools (Competitive Reference):**
- [tweakcn](https://tweakcn.com/) — live theme editor for shadcn/ui, demonstrates live preview UX
- [Radix Themes Overview](https://www.radix-ui.com/themes/docs/theme/overview) — theme component props, token access patterns

**Community Resources:**
- [Tailwind @theme in imported files - Issue #18966](https://github.com/tailwindlabs/tailwindcss/issues/18966) — `@theme` scope limitation
- [Nucleus Design System - CSS Custom Properties Gotchas](https://blog.nucleus.design/be-aware-of-css-custom-properties/) — token exposure anti-patterns
- [Component-level Design Tokens - Nate Baldwin](https://medium.com/@NateBaldwin/component-level-design-tokens-are-they-worth-it-d1ae4c6b19d4) — token naming as API
- [Base64URL Encoding Guide](https://thetexttool.com/blog/base64-vs-base58-vs-base64url) — encoding best practices
- [json-url GitHub](https://github.com/masotime/json-url) — compact JSON encoding with compression

**Design Best Practices:**
- [Tailwind CSS Best Practices 2025](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns) — token organization patterns
- [Design Tokens Problems - Andre Torgal](https://andretorgal.com/posts/2025-01/the-problem-with-design-tokens) — anti-patterns, complexity issues

### Tertiary (LOW confidence)

**Accessibility:**
- [WCAG Color Contrast Accessibility Guide 2025](https://www.allaccessible.org/blog/color-contrast-accessibility-wcag-guide-2025) — contrast ratios, WCAG 2.2 vs APCA
- [Design.dev Contrast Checker](https://design.dev/tools/color-contrast-checker/) — example tool for validation patterns

Note: Contrast calculation in OKLCH color space may require additional research during Phase 4 implementation.

---
*Research completed: 2026-01-25*
*Ready for roadmap: yes*
