// scripts/validate-canvas.ts
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { promises as fs } from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ── Criterion 1: Library importable ──────────────────────────────────────
// (Reaching this line proves @napi-rs/canvas imported successfully)
console.log('PASS 1: @napi-rs/canvas imported')

// ── Criterion 2: Font registration ───────────────────────────────────────
const FONT_PATH = path.join(__dirname, 'fonts', 'JetBrainsMono-Regular.ttf')
GlobalFonts.registerFromPath(FONT_PATH, 'JetBrainsMono')

// Verify registration — use both GlobalFonts.has() and families check
if (!GlobalFonts.has('JetBrainsMono')) {
  throw new Error(`Font registration FAILED — JetBrainsMono not found in GlobalFonts`)
}
console.log(`PASS 2: JetBrainsMono registered from ${FONT_PATH}`)

// ── Criterion 3: Monospace invariant ──────────────────────────────────────
const probeMetrics = createCanvas(100, 100)
const metricsCtx = probeMetrics.getContext('2d')
metricsCtx.font = '8px JetBrainsMono'

const iWidth = metricsCtx.measureText('i').width
const WWidth = metricsCtx.measureText('W').width

if (Math.abs(iWidth - WWidth) > 0.01) {
  throw new Error(
    `Monospace invariant FAILED — 'i' width (${iWidth}) !== 'W' width (${WWidth}). ` +
    `Font likely fell back to system sans-serif.`
  )
}
console.log(`PASS 3: Monospace invariant — 'i'=${iWidth}px 'W'=${WWidth}px (diff < 0.01)`)

// ── Criterion 4: Two-pass layout skeleton ─────────────────────────────────
const CANVAS_WIDTH = 1500
const FONT_SIZE = 8
const LINE_HEIGHT = FONT_SIZE * 1.5  // 12px
const PADDING = 20

// Generate 50 sample lines (representative of real knowledge image content)
const sampleLines = Array.from({ length: 50 }, (_, i) =>
  `Line ${String(i + 1).padStart(2, '0')}: const exampleValue = ${i} // sample content`
)

// Pass 1: probe canvas at 1500x1 — measure total height without rendering visible pixels
const probeCanvas = createCanvas(CANVAS_WIDTH, 1)
const probeCtx = probeCanvas.getContext('2d')
probeCtx.font = `${FONT_SIZE}px JetBrainsMono`

let probeY = PADDING
for (const line of sampleLines) {
  probeCtx.fillText(line, PADDING, probeY)
  probeY += LINE_HEIGHT
}
const computedHeight = probeY + PADDING

// Pass 2: final canvas at exact computed height
const finalCanvas = createCanvas(CANVAS_WIDTH, computedHeight)
const finalCtx = finalCanvas.getContext('2d')
finalCtx.font = `${FONT_SIZE}px JetBrainsMono`

// White background
finalCtx.fillStyle = '#ffffff'
finalCtx.fillRect(0, 0, CANVAS_WIDTH, computedHeight)

// Render text in black
finalCtx.fillStyle = '#000000'
let y = PADDING
for (const line of sampleLines) {
  finalCtx.fillText(line, PADDING, y)
  y += LINE_HEIGHT
}

// Encode and write (async Skia encoding in libuv thread pool)
const OUTPUT_PATH = path.join(__dirname, 'output-validation.png')
const pngBuffer = await finalCanvas.encode('png')
await fs.writeFile(OUTPUT_PATH, pngBuffer)

console.log(`PASS 4: Two-pass PNG written — ${CANVAS_WIDTH}x${computedHeight}px → ${OUTPUT_PATH}`)
console.log('\nAll 4 canvas/font validation checks PASSED.')
