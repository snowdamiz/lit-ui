---
phase: quick-5
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/charts/package.json
  - packages/charts/README.md
autonomous: false
requirements: []

must_haves:
  truths:
    - "@lit-ui/charts@1.0.1 is published on npm"
    - "The npm package page at npmjs.com/package/@lit-ui/charts shows the README"
  artifacts:
    - path: "packages/charts/README.md"
      provides: "Package documentation visible on npm"
    - path: "packages/charts/package.json"
      provides: "Version bumped to 1.0.1"
  key_links:
    - from: "packages/charts/README.md"
      to: "npm registry"
      via: "npm publish (npm auto-includes README.md regardless of files field)"
      pattern: "npm.*publish"
---

<objective>
Bump @lit-ui/charts from 1.0.0 to 1.0.1 via the changeset workflow and republish to npm so the README.md appears on the package page.

Purpose: The README was added at packages/charts/README.md after the initial 1.0.0 publish. npm does not retroactively update package pages — a new version must be published for the README to appear. npm automatically includes README.md in every publish regardless of the `files` array in package.json.
Output: @lit-ui/charts@1.0.1 on npm with README visible at https://www.npmjs.com/package/@lit-ui/charts
</objective>

<execution_context>
@/Users/sn0w/.claude/get-shit-done/workflows/execute-plan.md
@/Users/sn0w/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

## Changeset workflow

The monorepo uses changesets. The correct flow to bump and publish is:

1. `pnpm changeset` — interactive CLI to create a changeset file (selects package, bump type, summary)
2. `pnpm changeset version` — consumes the changeset file, bumps package.json version(s), updates CHANGELOG
3. `pnpm build:packages` — rebuild dist to match the new version
4. `pnpm changeset publish` — publishes packages whose local version is not yet on npm

The changeset config (`.changeset/config.json`) has `"access": "public"` so no `--access public` flag is needed.

@lit-ui/charts is NOT in the `fixed` group (only core/button/dialog/ssr are fixed), so it bumps independently.

## npm auto-includes README

npm always bundles `README.md`, `package.json`, `LICENSE`, and `CHANGELOG.md` from the package root during `npm publish`, regardless of what is listed in the `files` field. The `"files": ["dist"]` in package.json does NOT prevent the README from being published.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create patch changeset for @lit-ui/charts</name>
  <files>.changeset/*.md</files>
  <action>
    Create a changeset file manually (non-interactively) to avoid the interactive CLI prompt. Changeset files live in `.changeset/` and follow a specific format.

    Create a file named `.changeset/charts-readme-patch.md` with this exact content:

    ```markdown
    ---
    "@lit-ui/charts": patch
    ---

    Add README to npm package page
    ```

    The `---` delimiters and the package name with bump type are required. The summary line describes the change.

    Verify the file was created correctly:
    ```
    cat .changeset/charts-readme-patch.md
    ```
  </action>
  <verify>File `.changeset/charts-readme-patch.md` exists and contains the `@lit-ui/charts: patch` declaration and a summary line.</verify>
  <done>Changeset file created. `pnpm changeset status` shows @lit-ui/charts has a pending patch bump.</done>
</task>

<task type="auto">
  <name>Task 2: Version, build, and publish</name>
  <files>packages/charts/package.json</files>
  <action>
    Run the changeset version → build → publish sequence:

    Step 1 — Apply the changeset (bumps package.json from 1.0.0 to 1.0.1, writes CHANGELOG):
    ```
    pnpm changeset version
    ```

    Step 2 — Rebuild the dist so the publish contains fresh output:
    ```
    pnpm build:packages
    ```

    Step 3 — Publish the newly versioned package:
    ```
    pnpm changeset publish
    ```

    Changeset publish compares local package.json versions against the registry and publishes any that are not yet at that version. Only @lit-ui/charts should be published (all others are already on npm at their local version).

    After publish, commit the version bump files:
    ```
    git add packages/charts/package.json packages/charts/CHANGELOG.md
    git commit -m "release: @lit-ui/charts@1.0.1"
    ```
  </action>
  <verify>
    ```
    npm view @lit-ui/charts version
    ```
    Must return `1.0.1`.
  </verify>
  <done>@lit-ui/charts@1.0.1 is live on npm. `npm view @lit-ui/charts version` returns `1.0.1`. Version bump committed to git.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Published @lit-ui/charts@1.0.1 with README to npm</what-built>
  <how-to-verify>
    1. Visit https://www.npmjs.com/package/@lit-ui/charts
    2. Confirm version shows 1.0.1 in the header
    3. Confirm the README content is visible on the page (not a blank package page)
    4. Confirm the description still reads "High-performance chart components with WebGL rendering, real-time streaming, and CSS token theming built with Lit and ECharts"
  </how-to-verify>
  <resume-signal>Type "approved" if the README is visible on npm, or describe any issues</resume-signal>
</task>

</tasks>

<verification>
- `npm view @lit-ui/charts version` returns `1.0.1`
- https://www.npmjs.com/package/@lit-ui/charts shows README content
- `packages/charts/package.json` version field is `"1.0.1"`
- Git has a commit `release: @lit-ui/charts@1.0.1`
</verification>

<success_criteria>
@lit-ui/charts@1.0.1 is published to npm with the README visible on the package page. No other @lit-ui/* package versions were changed.
</success_criteria>

<output>
After completion, create `.planning/quick/5-publish-lit-ui-charts-with-readme-to-npm/5-SUMMARY.md` with the published version, npm URL, and confirmation the README is visible.
</output>
