// scripts/render-knowledge-image.ts
// Run: node --experimental-strip-types scripts/render-knowledge-image.ts
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ── Path constants ────────────────────────────────────────────────────────────
const FONT_PATH = path.join(__dirname, 'fonts', 'JetBrainsMono-Regular.ttf')
const XML_PATH = path.join(__dirname, '..', 'skill', 'lit-ui-knowledge.xml')
const PNG_PATH = path.join(__dirname, '..', 'skill', 'lit-ui-knowledge.png')

// ── Layout constants (validated in Phase 105) ─────────────────────────────────
const CANVAS_WIDTH = 1500
const FONT_SIZE = 10
const LINE_HEIGHT = FONT_SIZE * 1.5  // 12px — validated in Phase 105
const PADDING = 20
const SEPARATOR_HEIGHT = LINE_HEIGHT * 2  // rule line + label line

// ── Font registration (LOCKED — registerFromPath only, never register(buffer)) ─
GlobalFonts.registerFromPath(FONT_PATH, 'JetBrainsMono')
if (!GlobalFonts.has('JetBrainsMono')) {
  throw new Error('Font registration FAILED')
}

// ── Entity decoder — reverse xmlEscape exactly ───────────────────────────────
// xmlEscape encodes in order: & → &amp;, < → &lt;, > → &gt;, " → &quot;
// decodeEntities reverses in opposite order (&amp; LAST — prevents double-decode)
function decodeEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')  // MUST be last
}

// ── Data types ────────────────────────────────────────────────────────────────
interface SkillData {
  name: string
  content: string[]
}

// ── XML parser ────────────────────────────────────────────────────────────────
function parseSkills(xml: string): SkillData[] {
  const skills: SkillData[] = []
  const skillRegex = /<skill name="([^"]*)">([\s\S]*?)<\/skill>/g
  const sectionRegex = /<section title="([^"]*)">([\s\S]*?)<\/section>/g

  let skillMatch: RegExpExecArray | null
  while ((skillMatch = skillRegex.exec(xml)) !== null) {
    const skillName = decodeEntities(skillMatch[1] ?? '')
    const skillBody = skillMatch[2] ?? ''
    const content: string[] = []

    let sectionMatch: RegExpExecArray | null
    sectionRegex.lastIndex = 0
    while ((sectionMatch = sectionRegex.exec(skillBody)) !== null) {
      const sectionTitle = decodeEntities(sectionMatch[1] ?? '')
      const sectionContent = decodeEntities(sectionMatch[2] ?? '')

      content.push(`### ${sectionTitle}`)
      const lines = sectionContent.split('\n').filter(l => l.trim() !== '')
      for (const line of lines) {
        content.push(line)
      }
    }

    skills.push({ name: skillName, content })
  }

  return skills
}

// ── Two-pass render function ──────────────────────────────────────────────────
// measureAndRender is shared between probe pass (render=false) and final pass (render=true).
// y accumulation MUST be bit-for-bit identical between modes.
function measureAndRender(
  ctx: ReturnType<ReturnType<typeof createCanvas>['getContext']>,
  skills: SkillData[],
  render: boolean
): number {
  ctx.font = `${FONT_SIZE}px JetBrainsMono`

  let y = PADDING

  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i]

    if (i > 0) {
      // Draw horizontal rule separator between skills
      if (render) {
        ctx.save()
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(PADDING, y + LINE_HEIGHT / 2)
        ctx.lineTo(CANVAS_WIDTH - PADDING, y + LINE_HEIGHT / 2)
        ctx.stroke()
        ctx.restore()
      }
      y += LINE_HEIGHT  // rule line

      // Draw skill name label after the rule
      if (render) {
        ctx.fillStyle = '#000000'
        ctx.fillText(`── ${skill.name} ──`, PADDING, y)
      }
      y += LINE_HEIGHT  // label line
    } else {
      // First skill: draw skill label only (no rule)
      if (render) {
        ctx.fillStyle = '#000000'
        ctx.fillText(`── ${skill.name} ──`, PADDING, y)
      }
      y += LINE_HEIGHT
    }

    // Draw all content lines for this skill
    for (const line of skill.content) {
      if (render) {
        ctx.fillStyle = '#000000'
        ctx.fillText(line ?? '', PADDING, y)
      }
      y += LINE_HEIGHT
    }
  }

  return y + PADDING
}

// ── Main render function ──────────────────────────────────────────────────────
async function renderKnowledge(): Promise<void> {
  // 1. Read XML
  const xml = await fs.readFile(XML_PATH, 'utf8')

  // 2. Parse all skills
  const skills = parseSkills(xml)
  if (skills.length === 0) {
    throw new Error('parseSkills returned 0 skills — check XML_PATH and regex patterns')
  }
  console.log(`Parsed ${skills.length} skills`)

  // 3. Pass 1: probe canvas — measure total height only
  const probeCanvas = createCanvas(CANVAS_WIDTH, 1)
  const probeCtx = probeCanvas.getContext('2d')
  const computedHeight = measureAndRender(probeCtx, skills, false)
  console.log(`Computed height: ${computedHeight}px`)

  // 4. Pass 2: final canvas at exact computed height
  const finalCanvas = createCanvas(CANVAS_WIDTH, computedHeight)
  const finalCtx = finalCanvas.getContext('2d')

  // White background
  finalCtx.fillStyle = '#ffffff'
  finalCtx.fillRect(0, 0, CANVAS_WIDTH, computedHeight)

  // Render all content + separators
  measureAndRender(finalCtx, skills, true)

  // 5. Encode and write PNG
  const pngBuffer = await finalCanvas.encode('png')
  await fs.writeFile(PNG_PATH, pngBuffer)
  console.log(`PNG written: ${CANVAS_WIDTH}x${computedHeight}px → ${PNG_PATH}`)
}

await renderKnowledge()
