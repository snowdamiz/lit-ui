# lit-ui

CLI for adding lit-ui components to your project.

## Installation

```bash
npx lit-ui init
```

## Commands

### Initialize Project

```bash
npx lit-ui init
```

Sets up lit-ui in your project with choice of:
- **copy-source**: Copy component source files (full ownership)
- **npm**: Install packages from npm (dependency management)

### Add Components

```bash
npx lit-ui add button
npx lit-ui add dialog
```

### List Components

```bash
npx lit-ui list
```

### Migrate to NPM Mode

```bash
npx lit-ui migrate
```

Convert from copy-source to npm package mode.

## Modes

### Copy-Source Mode (default)
Components are copied to your project. You own the code and can modify freely.

### NPM Mode
Components installed as npm packages. Receive updates via npm.

## Documentation

Full documentation: [https://lit-ui.dev](https://lit-ui.dev)

## License

MIT
