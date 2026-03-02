---
phase: quick-4
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: false
requirements: []

must_haves:
  truths:
    - "@lit-ui/charts@1.0.0 is published and visible on npm"
    - "All packages at their current local versions are on npm"
  artifacts:
    - path: "packages/charts/dist/index.js"
      provides: "Built charts package ready for publish"
  key_links:
    - from: "packages/charts/dist"
      to: "npm registry"
      via: "changeset publish"
      pattern: "changeset publish"
---

<objective>
Build all packages and publish @lit-ui/charts to npm for the first time. All other packages are already on npm at their current versions. The ci:publish script handles build + publish in one step.

Purpose: @lit-ui/charts (the v10.0 WebGPU charts package) has never been published to npm despite being at version 1.0.0 locally. This ships the charts work.
Output: @lit-ui/charts@1.0.0 available on npm.
</objective>

<execution_context>
@/Users/sn0w/.claude/get-shit-done/workflows/execute-plan.md
@/Users/sn0w/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

## Current npm state

All packages are already published at their local versions EXCEPT:
- @lit-ui/charts — local: 1.0.0, npm: NOT PUBLISHED (first publish)

The monorepo uses changesets. `changeset publish` skips packages that are already on npm at the current version, so running ci:publish will only publish @lit-ui/charts.

The publish script: `pnpm build:packages && changeset publish --access public`
</context>

<tasks>

<task type="auto">
  <name>Task 1: Build all packages</name>
  <files>packages/*/dist/</files>
  <action>
    Run the full package build to ensure all dist outputs are fresh before publishing:

    ```
    pnpm build:packages
    ```

    This runs `vite build` in all packages under `packages/`. The charts package already has a dist, but rebuild ensures it matches the latest source. Expected output: each package emits its dist files with no TypeScript errors.
  </action>
  <verify>
    ```
    ls packages/charts/dist/index.js packages/charts/dist/index.d.ts
    ```
    Both files must exist. Build command must exit 0.
  </verify>
  <done>All packages under packages/ have a fresh dist/ directory. Build exits 0 with no errors.</done>
</task>

<task type="auto">
  <name>Task 2: Publish unpublished packages via changeset</name>
  <files></files>
  <action>
    Run changeset publish to push any packages not yet on npm at their current version:

    ```
    pnpm changeset publish --access public
    ```

    Changeset compares each non-private package's local version against the registry. Only @lit-ui/charts@1.0.0 is not yet on npm, so it will be the only one published. The `--access public` flag is required for scoped packages under a personal npm account (they default to restricted).

    If the command reports "No unpublished packages to publish" despite @lit-ui/charts not being on npm, it may be because changeset tracks published versions in `.changeset`. In that case, publish directly:

    ```
    cd packages/charts && npm publish --access public
    ```
  </action>
  <verify>
    ```
    npm view @lit-ui/charts version
    ```
    Must return `1.0.0`.
  </verify>
  <done>@lit-ui/charts@1.0.0 is visible on the npm registry. `npm view @lit-ui/charts version` returns `1.0.0`.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Published @lit-ui/charts@1.0.0 to npm</what-built>
  <how-to-verify>
    1. Visit https://www.npmjs.com/package/@lit-ui/charts to confirm the package page is live
    2. Check it shows version 1.0.0 and the correct description: "High-performance chart components with WebGL rendering..."
    3. Optionally verify installable: `npm install @lit-ui/charts@1.0.0 --dry-run` in a temp dir
  </how-to-verify>
  <resume-signal>Type "approved" if the package is live, or describe any issues</resume-signal>
</task>

</tasks>

<verification>
- `npm view @lit-ui/charts version` returns `1.0.0`
- https://www.npmjs.com/package/@lit-ui/charts shows the package publicly
- No other package versions were accidentally bumped or double-published
</verification>

<success_criteria>
@lit-ui/charts@1.0.0 is published to npm and installable by users. All other @lit-ui/* packages remain at their current published versions unchanged.
</success_criteria>

<output>
After completion, create `.planning/quick/4-deploy-latest-changes-to-npm/4-SUMMARY.md` with what was published and the npm URL.
</output>
