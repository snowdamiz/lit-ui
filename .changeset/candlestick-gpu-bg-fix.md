---
"@lit-ui/charts": patch
---

fix(candlestick): match ChartGPU canvas background to page background

ChartGPU's WebGPU canvas uses `alphaMode:"opaque"` (hardcoded), making true
transparency impossible. The built-in dark theme uses `#1a1a2e` which does not
match the docs palette. Now reads `document.body` computed background color and
passes a full custom ThemeConfig so the canvas clears to the page background in
both light and dark mode.
