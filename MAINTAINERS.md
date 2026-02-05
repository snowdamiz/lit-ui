# Maintainer Guide

This document outlines the manual configurations required to bring this repository up to production standards on GitHub.

## 1. Repository Settings

Go to `Settings` > `General`:

- **Features**:
  - [x] **Wikis**: Uncheck if not using. (Recommended: Off, use `docs/` instead)
  - [x] **Issues**: Check.
  - [x] **Sponsorships**: Check.
  - [x] **Discussions**: Check. This is critical for community building to separate "support" from "bugs".
- **Pull Requests**:
  - [x] **Allow squash merging**: Recommended (keeps history clean).
  - [ ] **Allow merge commits**: Optional (often disabled in monorepos to prefer linear history).
  - [ ] **Allow rebase merging**: Optional.
  - [x] **Automatically delete head branches**: Check.

## 2. Branch Protection Rules

Go to `Settings` > `Branches` > `Add rule`:

- **Branch name pattern**: `main`
- **Protect matching branches**:
  - [x] **Require a pull request before merging**:
    - [x] **Require approvals**: Set to at least `1`.
    - [x] **Dismiss stale pull request approvals when new commits are pushed**: Check.
  - [x] **Require status checks to pass before merging**:
    - Search for your CI jobs (e.g., `build`, `test`, `lint`). *Note: You must have run CI at least once for these to appear.*
  - [x] **Require conversation resolution before merging**: Check.
  - [x] **Do not allow bypassing the above settings**: Check (even for admins).
  - [x] **Restrict who can push to matching branches**:
    - Check this option.
    - Add people, teams, or apps who are allowed to push to this branch (e.g., only repository admins).
    - *Note: This effectively prevents direct pushes from anyone else, forcing them to use Pull Requests.*

## 3. Community Standards

Go to `Settings` > `Community` (in the sidebar):

- GitHub will present a checklist.
- Verify that `Description`, `README`, `Code of Conduct`, `Contributing`, `License`, and `Issue templates` are all marked as completed (Green checks).
- If any are missing, ensure the files exist in the root or `.github/` folder.

## 4. Actions Permissions

Go to `Settings` > `Actions` > `General`:

- **Workflow permissions**:
  - Select **Read and write permissions**.
  - Check **Allow GitHub Actions to create and approve pull requests**.
  - *Why?* This is required for `changesets` to automatically create "Version Packages" PRs.

## 5. Security & Analysis

Go to `Settings` > `Code security and analysis`:

- **Dependabot alerts**: Enable.
- **Dependabot security updates**: Enable.
- **Secret scanning**: Enable (if public).
- **Secret scanning - push protection**: Enable.

## 6. Recommended Labels

Go to `Issues` > `Labels`. Consider creating:

- `area: documentation`
- `area: infrastructure` (for CI/CD)
- `scope: package-name` (e.g., `scope: button`, `scope: core`)
- `status: needs-repro`
- `status: help-wanted`
- `kind: bug`
- `kind: feature`

## 7. Automated Tools (Already Configured)

The following files have been added to automate maintenance:

- **`.github/dependabot.yml`**: Configured to check for `npm` and `github-actions` updates weekly.
  - *Action*: Go to `Settings` > `Code security and analysis` and ensure "Dependabot security updates" is enabled.
- **`.github/CODEOWNERS`**: Defines who is automatically requested for review.
  - *Action*: Update `@your-username` to your actual GitHub username.

