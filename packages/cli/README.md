# lit-ui

CLI for adding lit-ui components to your project. Supports copy-source (full ownership) and npm package distribution modes, with theme customization and AI skill injection.

## Installation

```bash
npx lit-ui init
```

## Commands

### `lit-ui init`

Initialize lit-ui in your project.

```bash
npx lit-ui init
npx lit-ui init --yes              # Skip prompts, use defaults
npx lit-ui init --theme <encoded>  # Apply theme from configurator
```

**What it does:**
1. Detects your build tool (Vite, Webpack, esbuild)
2. Detects your package manager (npm, pnpm, yarn)
3. Prompts for distribution mode (copy-source or npm)
4. Creates `lit-ui.config.json` configuration file
5. Copies base files (copy-source mode) or notes npm dependencies
6. Detects AI coding tools and injects Agent Skills (optional)
7. Applies theme if `--theme` flag provided

**Options:**

| Option | Description |
|--------|-------------|
| `-y, --yes` | Skip prompts, use defaults |
| `--cwd <path>` | Working directory (default: `.`) |
| `--theme <config>` | Encoded theme config from visual configurator |

### `lit-ui add <component>`

Add a component to your project.

```bash
npx lit-ui add button
npx lit-ui add dialog
npx lit-ui add input
npx lit-ui add textarea
npx lit-ui add select
```

**Options:**

| Option | Description |
|--------|-------------|
| `-y, --yes` | Skip confirmation prompts |
| `-o, --overwrite` | Overwrite existing files |
| `--cwd <path>` | Working directory |
| `--npm` | Force npm install mode |
| `--copy` | Force copy-source mode |

**Behavior:**
- Resolves component dependencies automatically
- In copy-source mode: copies source files to your project
- In npm mode: installs `@lit-ui/<component>` package
- Injects component-specific AI skill (if AI tool detected)

### `lit-ui list`

List all available components.

```bash
npx lit-ui list
```

**Output:**
```
Form:     input, textarea, select
Feedback: dialog
Actions:  button
```

### `lit-ui migrate`

Convert from copy-source to npm package mode.

```bash
npx lit-ui migrate
```

### `lit-ui theme <encoded-config>`

Apply a theme configuration from the visual configurator.

```bash
npx lit-ui theme <encoded-config>
npx lit-ui theme <encoded-config> --yes  # Skip confirmation
```

Get theme configs from the [visual configurator](https://lit-ui.dev/configurator).

## Configuration

`lit-ui.config.json` (created by `init`):

```json
{
  "$schema": "https://lit-ui.dev/schema.json",
  "mode": "copy-source",
  "componentsPath": "src/components/ui",
  "tailwind": {
    "css": "src/styles/tailwind.css"
  },
  "aliases": {
    "components": "@/components/ui",
    "base": "@/lib/lit-ui"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `mode` | `'copy-source' \| 'npm'` | Distribution mode |
| `componentsPath` | `string` | Where components are installed |
| `tailwind.css` | `string` | Path to Tailwind CSS file |
| `aliases.components` | `string` | Import alias for components |
| `aliases.base` | `string` | Import alias for base/lib |

## Distribution Modes

### Copy-Source (default)

Components are copied as TypeScript source files into your project. You own the code and can modify it freely. No automatic updates.

### NPM

Components installed as `@lit-ui/*` npm packages. Receive updates via npm. Less customization but simpler dependency management.

## Available Components

| Component | Tag Name(s) | Description |
|-----------|-------------|-------------|
| `button` | `<lui-button>` | Accessible button with variants, sizes, loading, form participation |
| `dialog` | `<lui-dialog>` | Modal dialog with focus trap, ARIA, animations |
| `input` | `<lui-input>` | Text input with validation, password toggle, character counter |
| `textarea` | `<lui-textarea>` | Textarea with auto-resize, character counter |
| `select` | `<lui-select>`, `<lui-option>`, `<lui-option-group>` | Dropdown with multi-select, combobox, async loading |

## AI Skills Integration

The CLI detects AI coding tools in your project and injects [Agent Skills](https://agentskills.io) so your AI assistant understands the lit-ui component API.

**Supported platforms:**
- Claude Code (`.claude/skills/`)
- Cursor (`.cursor/skills/`)
- GitHub Copilot / VS Code (`.github/skills/`)
- Windsurf (`.windsurf/skills/`)
- Codex (`.codex/skills/`)

Skills are injected during `init` and `add` commands. Each component skill contains the full API reference (properties, events, slots, CSS parts, CSS custom properties) so your AI can generate correct code.

## License

MIT
