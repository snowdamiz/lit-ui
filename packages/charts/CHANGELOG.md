# @lit-ui/charts

## 1.0.2

### Patch Changes

- [`ce25a16`](https://github.com/snowdamiz/lit-ui/commit/ce25a163555535c42d084bceb1db593726f645e4) Thanks [@snowdamiz](https://github.com/snowdamiz)! - fix(candlestick): match ChartGPU canvas background to page background

  ChartGPU's WebGPU canvas uses `alphaMode:"opaque"` (hardcoded), making true
  transparency impossible. The built-in dark theme uses `#1a1a2e` which does not
  match the docs palette. Now reads `document.body` computed background color and
  passes a full custom ThemeConfig so the canvas clears to the page background in
  both light and dark mode.

## 1.0.1

### Patch Changes

- Add README to npm package page
