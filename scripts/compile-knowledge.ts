// scripts/compile-knowledge.ts
// Run: node --experimental-strip-types scripts/compile-knowledge.ts

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SKILL_DIR = path.join(__dirname, '..', 'skill')
const SKILLS_DIR = path.join(SKILL_DIR, 'skills')
const OUTPUT_PATH = path.join(SKILL_DIR, 'lit-ui-knowledge.xml')

// ── Helpers ────────────────────────────────────────────────────────────────

function stripFrontmatter(content: string): string {
  // The trailing \n is required — omitting it causes frontmatter bleed into first section
  return content.replace(/^---[\s\S]*?---\n/, '')
}

function xmlEscape(text: string): string {
  return text
    .replace(/&/g, '&amp;')   // MUST be first — prevents double-encoding
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')  // for attribute values
}

function extractSkillName(markdown: string): string {
  const match = markdown.match(/^# (.+)$/m)
  return match ? match[1].trim() : 'unknown'
}

interface SkillSection {
  title: string
  content: string
}

function extractSections(markdown: string): SkillSection[] {
  // Split on lines that START a ## heading (lookahead keeps delimiter in the next part)
  // CRITICAL: use lookahead or the '## ' prefix gets consumed and title extraction fails
  const parts = markdown.split(/^(?=## )/m)
  const sections: SkillSection[] = []
  for (const part of parts) {
    const match = part.match(/^## (.+)\n([\s\S]*)/)
    if (match) {
      sections.push({
        title: match[1].trim(),
        content: match[2].trim()
      })
    }
    // Parts before the first ## (H1 title + preamble) are skipped — H1 used for skill name
  }
  return sections
}

function buildSkillXml(name: string, sections: SkillSection[]): string {
  const sectionParts = sections.map(s => {
    const escapedTitle = xmlEscape(s.title)
    const escapedContent = xmlEscape(s.content)
    return `  <section title="${escapedTitle}">\n${escapedContent}\n  </section>`
  })
  return `<skill name="${xmlEscape(name)}">\n${sectionParts.join('\n')}\n</skill>`
}

// ── Main ───────────────────────────────────────────────────────────────────

async function compileKnowledge(): Promise<void> {
  // 1. Router skill first (skill/SKILL.md)
  const routerRaw = await fs.readFile(path.join(SKILL_DIR, 'SKILL.md'), 'utf8')
  const routerMd = stripFrontmatter(routerRaw)
  const routerName = extractSkillName(routerMd)
  const routerSections = extractSections(routerMd)

  // 2. Sub-skills sorted alphabetically by directory name (deterministic)
  const subDirs = (await fs.readdir(SKILLS_DIR)).sort()
  const subSkills: Array<{ name: string; sections: SkillSection[] }> = []
  for (const dir of subDirs) {
    const raw = await fs.readFile(path.join(SKILLS_DIR, dir, 'SKILL.md'), 'utf8')
    const md = stripFrontmatter(raw)
    subSkills.push({
      name: extractSkillName(md),
      sections: extractSections(md)
    })
  }

  // 3. Build skill XML elements
  const skillElements = [
    buildSkillXml(routerName, routerSections),
    ...subSkills.map(s => buildSkillXml(s.name, s.sections))
  ]

  // 4. Assemble final XML document (each skill element indented 2 spaces)
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<skills>',
    ...skillElements.map(el =>
      el.split('\n').map((l: string) => '  ' + l).join('\n')
    ),
    '</skills>',
    '' // trailing newline
  ].join('\n')

  // 5. Write output
  await fs.writeFile(OUTPUT_PATH, xml, 'utf8')
  console.log(`Compiled ${1 + subDirs.length} skills → ${OUTPUT_PATH}`)
}

await compileKnowledge()
