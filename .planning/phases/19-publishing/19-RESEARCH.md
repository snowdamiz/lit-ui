# Phase 19: Publishing - Research

**Researched:** 2026-01-24
**Domain:** npm publishing, changesets automation, GitHub Actions CI/CD
**Confidence:** HIGH

## Summary

This research covers everything needed to publish the @lit-ui packages to npm with automated CI/CD. The standard approach uses changesets/action with GitHub Actions to automate versioning PRs and npm publishing. Key infrastructure already exists (changesets configured, pnpm workspaces, lockstep versioning), but several gaps need addressing.

Critical findings:
1. **Scope ownership issue**: The `@lit-ui` scope must be registered on npm before publishing. The user mentioned publishing under their personal account, but scoped packages require matching username or organization ownership. If the user's npm username isn't `lit-ui`, they must create an npm organization named `lit-ui` (free for public packages).
2. **Missing infrastructure**: No README files in packages, no `repository` field in package.json files, `@lit-ui/ssr` not in changeset fixed array, no GitHub Actions workflow.
3. **Trusted publishing**: npm now supports OIDC authentication (GA as of 2025-07-31), eliminating NPM_TOKEN management, but requires npm CLI 11.5.1+.

**Primary recommendation:** Use the traditional NPM_TOKEN approach for initial setup (simpler), with the changesets/action workflow. Create the `lit-ui` npm organization before first publish.

## Standard Stack

The established tools for npm monorepo publishing:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| [@changesets/cli](https://github.com/changesets/changesets) | ^2.28.1 | Version management & changelogs | Already installed; designed for monorepos |
| [changesets/action](https://github.com/changesets/action) | v1 | GitHub Actions automation | Official action; handles version PRs + publish |
| [@changesets/changelog-github](https://www.npmjs.com/package/@changesets/changelog-github) | ^0.5.1 | GitHub-linked changelogs | Already configured; links to PRs/commits/users |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| actions/checkout | v4 | Repository checkout | All workflows |
| actions/setup-node | v4 | Node.js setup | All workflows |
| pnpm/action-setup | v4 | pnpm installation | pnpm-based workflows |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| NPM_TOKEN auth | OIDC trusted publishing | More secure but requires npm CLI 11.5.1+, more complex setup |
| changesets/action | Manual publish script | Less automation, more control |
| @changesets/changelog-github | Custom changelog generator | More customization, more maintenance |

**Installation:**
No new packages needed. Stack already installed via Phase 13.

## Architecture Patterns

### Recommended Workflow Structure

```
.github/
└── workflows/
    └── release.yml        # Main publish workflow
```

### Pattern 1: Changesets Release Workflow
**What:** Automated version PR creation and npm publishing
**When to use:** All releases (this is the standard pattern)
**Example:**
```yaml
# Source: https://github.com/changesets/action
name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Required for changelog generation

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Create Release PR or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm ci:publish
          title: 'chore: version packages'
          commit: 'chore: version packages'
          createGithubReleases: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Pattern 2: Prerelease Workflow (Alpha/Beta)
**What:** Publishing prereleases for testing before stable
**When to use:** Initial 0.0.1-alpha.N releases for testing
**Example:**
```bash
# Enter prerelease mode (run once, commits pre.json)
pnpm changeset pre enter alpha

# Version and publish prereleases
pnpm changeset version
pnpm install
git add . && git commit -m "chore: version packages (alpha)"
pnpm ci:publish
git push --follow-tags

# When ready for stable release
pnpm changeset pre exit
pnpm changeset version
# ... publish as normal
```

### Pattern 3: Package README Structure
**What:** Quick-start format for npm package pages
**When to use:** All published packages
**Example:**
```markdown
# @lit-ui/button

Web component button built with Lit and styled with Tailwind CSS.

## Installation

\`\`\`bash
npm install @lit-ui/button
\`\`\`

## Quick Start

\`\`\`html
<script type="module">
  import '@lit-ui/button';
</script>

<lit-button variant="primary">Click me</lit-button>
\`\`\`

## Documentation

Full documentation: [https://lit-ui.dev](https://lit-ui.dev)

## License

MIT
```

### Anti-Patterns to Avoid
- **Publishing without fetch-depth: 0:** Causes incorrect changelogs (missing commit history)
- **Using `changeset publish` directly with pnpm:** May leave `workspace:*` protocol in published packages. Use `pnpm -r publish` or the configured `pnpm ci:publish` script
- **Forgetting `--access public` for scoped packages:** First publish of scoped packages defaults to private, causing 402 errors

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Version bumping | Manual version updates | changesets CLI | Handles monorepo dependencies, changelogs |
| Changelog generation | Manual CHANGELOG.md | @changesets/changelog-github | Links PRs, commits, contributors |
| Release automation | Custom bash scripts | changesets/action | Handles version PRs, publishing flow |
| npm authentication | Long-lived tokens in .npmrc | GitHub secrets + action | Secure, no token exposure in repo |
| GitHub Releases | Manual release creation | createGithubReleases: true | Automated with publish |

**Key insight:** Changesets handles the complex monorepo versioning logic (interdependencies, lockstep releases, changelog aggregation). Custom solutions would need to replicate this.

## Common Pitfalls

### Pitfall 1: Scope Ownership Mismatch
**What goes wrong:** `npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/@lit-ui%2fcore - You do not have permission to publish "@lit-ui/core"`
**Why it happens:** npm scopes must match a registered username or organization name
**How to avoid:** Create `lit-ui` organization on npmjs.com before first publish (free for public packages)
**Warning signs:** First publish fails with 403

### Pitfall 2: Missing SSR Package in Changeset Config
**What goes wrong:** @lit-ui/ssr versions independently, breaking lockstep releases
**Why it happens:** Current `.changeset/config.json` `fixed` array only includes core, button, dialog
**How to avoid:** Add @lit-ui/ssr to the fixed array
**Warning signs:** Changeset version shows different version numbers for SSR

### Pitfall 3: workspace:* Protocol in Published Packages
**What goes wrong:** `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND` when consumers install
**Why it happens:** Some publish commands don't convert workspace protocol
**How to avoid:** Use `pnpm -r publish` or the `pnpm ci:publish` script which handles conversion
**Warning signs:** Published package.json contains `workspace:*` instead of version numbers

### Pitfall 4: Shallow Clone Breaks Changelogs
**What goes wrong:** Changelogs missing commit references, incorrect version bumps
**Why it happens:** GitHub Actions checkout defaults to depth=1
**How to avoid:** Set `fetch-depth: 0` in actions/checkout
**Warning signs:** CHANGELOG.md has no commit links or wrong commits

### Pitfall 5: Missing Repository Field
**What goes wrong:** Provenance statements fail, npm package page missing links
**Why it happens:** No `repository` field in package.json files
**How to avoid:** Add repository field to all publishable packages
**Warning signs:** npm package page shows "No repository" in sidebar

### Pitfall 6: First Publish Access Error
**What goes wrong:** `npm ERR! 402 Payment Required` on first publish of scoped package
**Why it happens:** Scoped packages default to private, requiring paid account
**How to avoid:** Use `--access public` on first publish (configured in ci:publish script)
**Warning signs:** 402 error only on initial publish

## Code Examples

Verified patterns from official sources:

### Package.json Repository Field
```json
// Source: https://docs.npmjs.com/cli/v7/configuring-npm/package-json/
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/OWNER/lit-ui.git",
    "directory": "packages/core"
  }
}
```

### Updated Changeset Config
```json
// .changeset/config.json - add @lit-ui/ssr to fixed array
{
  "fixed": [["@lit-ui/core", "@lit-ui/button", "@lit-ui/dialog", "@lit-ui/ssr"]]
}
```

### CI Publish Script
```json
// package.json - already configured correctly
{
  "scripts": {
    "ci:publish": "pnpm build && changeset publish --access public"
  }
}
```

### Creating NPM Token
```bash
# Source: https://docs.npmjs.com/creating-and-viewing-access-tokens
# On npmjs.com: Profile > Access Tokens > Generate New Token
# Choose: Automation (for CI/CD)
# Add to GitHub: Settings > Secrets > Actions > NPM_TOKEN
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Long-lived NPM_TOKEN | OIDC trusted publishing | 2025-07-31 (GA) | More secure, no token management |
| Manual changelogs | Automated via changesets | 2019+ | Consistent, linked changelogs |
| Individual package versions | Lockstep/fixed versioning | Changesets feature | Simpler for component libraries |

**Current/Recent:**
- npm trusted publishing via OIDC is generally available (requires npm CLI 11.5.1+)
- Provenance statements generated automatically with trusted publishing
- changesets/action v1 is stable, widely used

**Deprecated/outdated:**
- `npm token create` for access tokens (use web UI for automation tokens)
- Publishing without provenance (now recommended default)

## Open Questions

Things that couldn't be fully resolved:

1. **Repository URL**
   - What we know: Package.json needs `repository` field
   - What's unclear: Actual GitHub repository URL/owner
   - Recommendation: User provides the correct GitHub URL during planning

2. **npm Organization Creation**
   - What we know: `@lit-ui` scope requires matching org/username
   - What's unclear: Whether user's npm username is `lit-ui` or they need to create org
   - Recommendation: Clarify during execution; if username isn't lit-ui, create org first

3. **CLI Package Inclusion**
   - What we know: `lit-ui` CLI package exists in packages/cli
   - What's unclear: Should it be in the fixed versioning array? Different release cadence?
   - Recommendation: Include in fixed array for consistency unless user specifies otherwise

4. **Trusted Publishing vs NPM_TOKEN**
   - What we know: OIDC is more secure, NPM_TOKEN is simpler
   - What's unclear: User's preference, npm CLI version in workflow
   - Recommendation: Start with NPM_TOKEN (simpler), document upgrade path to OIDC

## Sources

### Primary (HIGH confidence)
- [changesets/action GitHub](https://github.com/changesets/action) - Workflow configuration, inputs, outputs
- [pnpm using-changesets docs](https://pnpm.io/using-changesets) - pnpm + changesets integration
- [npm scope docs](https://docs.npmjs.com/about-scopes/) - Scope ownership requirements

### Secondary (MEDIUM confidence)
- [npm trusted publishing announcement](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/) - OIDC GA, requirements
- [changesets prereleases docs](https://github.com/changesets/changesets/blob/main/docs/prereleases.md) - Alpha/beta workflow
- [changesets changelog-github](https://www.npmjs.com/package/@changesets/changelog-github) - Changelog format

### Tertiary (LOW confidence)
- Community blog posts on changesets workflows (patterns verified against official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Already using changesets, well-documented patterns
- Architecture: HIGH - changesets/action is the standard workflow, official examples
- Pitfalls: HIGH - Verified against official docs and common issues
- Prereleases: MEDIUM - Less common workflow, verified against official docs
- OIDC trusted publishing: MEDIUM - GA but newer, may have edge cases

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days - stable domain)
