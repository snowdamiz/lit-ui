# Phase 106: XML Compiler - Research

**Researched:** 2026-03-02
**Domain:** Node.js file system, XML generation, Markdown YAML frontmatter parsing
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| XMLC-01 | Developer can run `pnpm knowledge:compile` to produce `skill/lit-ui-knowledge.xml` from all skill files | Script invocation pattern confirmed: `node --experimental-strip-types scripts/compile-knowledge.ts`; pnpm script wiring is Phase 108 (WIRE-01) |
| XMLC-02 | XML output includes all skill files with YAML frontmatter stripped and each file wrapped in `<skill name="...">` element | Frontmatter structure is `---\nname: ...\ndescription: ...\n---`; strip with regex `^---[\s\S]*?---\n`; skill name from directory name; router skill from `skill/SKILL.md` |
| XMLC-03 | XML content is properly escaped — TypeScript generics, element names, comparison operators (`<`, `>`, `&`) are entity-encoded | Simple string replace: `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`; order of replacement matters (`&` first) |
| XMLC-04 | XML uses section-level `<section title="...">` sub-elements for structured AI querying | Markdown `##` headings demarcate sections; split content by `## ` regex; H1 title used for skill element name |
| XMLC-05 | XML ordering is deterministic — router skill first, sub-skills sorted alphabetically | Router = `skill/SKILL.md`; sub-skills = `skill/skills/*/SKILL.md` sorted by directory name; `Array.sort()` on string names |
</phase_requirements>

---

## Summary

Phase 106 is a pure Node.js file processing script: read all skill SKILL.md files, strip YAML frontmatter, parse markdown heading structure into `<section>` elements, XML-escape all content, and write a single well-formed `skill/lit-ui-knowledge.xml`. No external libraries are needed beyond Node.js built-ins.

The skill directory structure is well-defined: one root file (`skill/SKILL.md`, the router/overview skill) and 32 sub-skills under `skill/skills/*/SKILL.md`. All files use the same frontmatter pattern (`---\nname:\ndescription:\n---`). Section structure is uniform: `##` headings demarcate logical sections within each skill. The H1 title (`# Button`) provides the human-readable name for the `<skill name="...">` attribute.

The script runs via `node --experimental-strip-types scripts/compile-knowledge.ts` — already the established pattern in this project (Phase 105's `validate-canvas.ts` uses the same invocation). No TypeScript compilation step is needed. Node.js 25.3.0 is the runtime; `--experimental-strip-types` is confirmed working. No new npm packages need to be installed.

**Primary recommendation:** Implement `scripts/compile-knowledge.ts` using only Node.js built-ins (`node:fs/promises`, `node:path`, `node:url`). Frontmatter stripping and heading parsing are simple string operations — no parser libraries needed.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `node:fs/promises` | built-in (Node 25) | Read all SKILL.md files asynchronously | Already used in validate-canvas.ts; zero dependency |
| `node:path` | built-in (Node 25) | Resolve skill file paths from `import.meta.url` | ESM-compatible path resolution pattern established in Phase 105 |
| `node:url` | built-in (Node 25) | `fileURLToPath(import.meta.url)` for ESM `__dirname` equivalent | Same pattern as validate-canvas.ts |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `node:fs/promises readdir` | built-in | List `skill/skills/` directories for sub-skill discovery | Discover all 32 sub-skill directories |
| `Array.prototype.sort()` | built-in | Deterministic alphabetical ordering | Sort sub-skill names after discovery |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled frontmatter strip | `gray-matter` npm package | gray-matter not in project deps; frontmatter is always `---\n...\n---\n` block — regex strip is sufficient and has zero dependencies |
| Hand-rolled XML builder | `xmlbuilder2` npm package | No npm packages needed; the XML structure is simple enough that template-literal construction is reliable |
| `fs.readdirSync` | `fs.promises.readdir` | Async is consistent with the existing pattern in the project; script is top-level `await` capable |

**Installation:** No new packages required. Pure Node.js built-ins.

---

## Architecture Patterns

### Recommended Project Structure
```
scripts/
├── compile-knowledge.ts     # Phase 106 — XML compiler (new)
├── render-knowledge-image.ts # Phase 107 — PNG renderer (future)
├── validate-canvas.ts       # Phase 105 — already exists
└── fonts/                   # JetBrains Mono TTF (already exists)

skill/
├── SKILL.md                 # Router skill (input, first in XML)
├── skills/
│   ├── accordion/SKILL.md   # Sub-skills (inputs, sorted alphabetically)
│   ├── ...
│   └── treemap-chart/SKILL.md
└── lit-ui-knowledge.xml     # Output artifact (created by this script)
```

### Pattern 1: ESM File Path Resolution
**What:** Replicate Node.js `__dirname` in ESM context using `fileURLToPath(import.meta.url)`
**When to use:** Any script that resolves paths relative to the script file itself
**Example:**
```typescript
// Source: scripts/validate-canvas.ts (Phase 105, confirmed working)
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// From scripts/ directory, go up one level to project root
const SKILL_DIR = path.join(__dirname, '..', 'skill')
const SKILLS_DIR = path.join(SKILL_DIR, 'skills')
const OUTPUT_PATH = path.join(SKILL_DIR, 'lit-ui-knowledge.xml')
```

### Pattern 2: YAML Frontmatter Strip
**What:** Remove the `---...---` frontmatter block at the start of each SKILL.md file
**When to use:** Before parsing markdown content and before XML-escaping
**Example:**
```typescript
function stripFrontmatter(content: string): string {
  // All SKILL.md files start with ---\n...\n---\n
  // Greedy match of the fenced block at start of file
  return content.replace(/^---[\s\S]*?---\n/, '')
}
```

### Pattern 3: XML Entity Encoding
**What:** Escape `&`, `<`, `>` characters in content so the XML file is well-formed
**When to use:** On the raw markdown content AFTER frontmatter has been stripped
**Critical order:** `&` MUST be replaced first, or already-escaped sequences get double-escaped
**Example:**
```typescript
function xmlEscape(text: string): string {
  return text
    .replace(/&/g, '&amp;')   // MUST be first
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
```

### Pattern 4: Section Extraction from Markdown Headings
**What:** Split markdown content into named sections based on `##` headings
**When to use:** After frontmatter strip, before XML-escaping content
**Example:**
```typescript
interface Section {
  title: string
  content: string
}

function extractSections(markdown: string): Section[] {
  // Split on ## headings (not ### or deeper)
  const parts = markdown.split(/^(?=## )/m)
  const sections: Section[] = []

  for (const part of parts) {
    const match = part.match(/^## (.+)\n([\s\S]*)/)
    if (match) {
      sections.push({
        title: match[1].trim(),
        content: match[2].trim()
      })
    }
    // Preamble before first ## heading (the H1 title line etc.) is discarded
    // or treated as a preamble section — the H1 title is used for skill name
  }
  return sections
}
```

### Pattern 5: Skill Name from H1 Heading
**What:** Extract the H1 title from the markdown to use as the `<skill name="...">` attribute
**When to use:** After frontmatter strip; the H1 is always the first content line
**Example:**
```typescript
function extractSkillName(markdown: string): string {
  const match = markdown.match(/^# (.+)$/m)
  return match ? match[1].trim() : 'unknown'
}
```

### Pattern 6: Deterministic File Ordering
**What:** Router skill first, then sub-skills sorted alphabetically by directory name
**When to use:** Before building the XML document
**Example:**
```typescript
const { promises: fs } = await import('node:fs')

// Router skill: skill/SKILL.md — always first
const routerPath = path.join(SKILL_DIR, 'SKILL.md')

// Sub-skills: skill/skills/*/SKILL.md — sorted alphabetically
const subSkillDirs = await fs.readdir(SKILLS_DIR)
subSkillDirs.sort()  // locale-independent string sort — deterministic

const subSkillPaths = subSkillDirs.map(
  dir => path.join(SKILLS_DIR, dir, 'SKILL.md')
)

const allSkillPaths = [routerPath, ...subSkillPaths]
```

### Pattern 7: XML Document Structure
**What:** The required output XML structure with `<skills>`, `<skill>`, and `<section>` elements
**When to use:** Final step — build and write the XML file
**Example:**
```typescript
function buildSkillElement(name: string, sections: Section[]): string {
  const sectionXml = sections.map(s =>
    `  <section title="${xmlEscape(s.title)}">\n${xmlEscape(s.content)}\n  </section>`
  ).join('\n')
  return `<skill name="${xmlEscape(name)}">\n${sectionXml}\n</skill>`
}

const xmlDoc = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<skills>',
  ...skillElements.map(el => el.split('\n').map(l => '  ' + l).join('\n')),
  '</skills>',
  ''  // trailing newline
].join('\n')

await fs.writeFile(OUTPUT_PATH, xmlDoc, 'utf8')
```

### Anti-Patterns to Avoid
- **Double-escaping:** If you XML-escape content and then also escape section titles in `<section title="...">`, ensure the title attribute value is escaped using the same function. The title itself may contain backticks or special characters (e.g., `## Props — \`lui-select\``).
- **Wrong replacement order:** Replace `&` before `<` and `>`. Replacing `<` first then `&` can produce `&amp;lt;` from literal `&lt;` text in skill files (e.g., description frontmatter that already contains `<lui-button>`).
- **Greedy heading split:** Using `split(/## /)` without the lookahead `(?=## )` loses the `## ` prefix needed to extract the title. Use `split(/^(?=## )/m)` to keep the delimiter in the following part.
- **Including H1 as a section:** The H1 heading (`# Button`) is the skill name, not a `<section>`. Only `##` headings become sections.
- **Non-deterministic glob ordering:** `fs.readdir` returns entries in OS-specific order. Always call `.sort()` on the result.
- **Frontmatter leak:** Some frontmatter `description` fields contain `<lui-button>` HTML angle brackets. These get included in the `---` block that is stripped entirely — but verify the regex strips the WHOLE frontmatter block including multi-line description fields using the `[\s\S]*?` (non-greedy dotall) pattern.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| XML well-formedness validation | Custom parser | Trust entity encoding correctness + visual inspection | The XML output is consumed by Phase 107 (renderer), not an external XML validator; structural soundness via correct template |
| YAML frontmatter parsing | yaml/js-yaml library | Simple regex strip `^---[\s\S]*?---\n` | All skill files have identical 2-field frontmatter (`name`, `description`); full YAML parse adds dependency for zero benefit |
| Async file traversal | Custom recursive walker | `fs.readdir` + known depth-1 structure | Skill directory is exactly 2 levels deep: `skill/SKILL.md` and `skill/skills/*/SKILL.md`; no recursion needed |

**Key insight:** The XML structure is so simple (3 element types, 2 attributes) that template-literal construction is more readable and reliable than any XML builder library. The real challenge is correct entity encoding order and deterministic ordering.

---

## Common Pitfalls

### Pitfall 1: `&` Replacement Order
**What goes wrong:** XML output contains double-encoded sequences like `&amp;amp;` for text that already contained a literal `&amp;` (which does appear in skill files, e.g., `Installation & Usage` heading).
**Why it happens:** Replacing `<` or `>` first, then replacing `&`, will also re-encode the `&` in already-written `&lt;` and `&gt;`, producing `&amp;lt;`.
**How to avoid:** Always execute replacements in order: `&` → `&amp;`, then `<` → `&lt;`, then `>` → `&gt;`.
**Warning signs:** Running the output through an XML parser shows `&amp;lt;` entities, or the XML renderer in Phase 107 displays double-encoded text.

### Pitfall 2: Section Title Attribute Escaping
**What goes wrong:** Section titles that include backticks or angle brackets (e.g., `## Props — \`lui-select\``) break the XML attribute syntax.
**Why it happens:** The `title` attribute value is placed inside `"..."` — any unescaped `<`, `>`, `&`, or `"` inside a quoted attribute value is invalid XML.
**How to avoid:** Run `xmlEscape()` on section title text when building `<section title="...">`. Also escape `"` → `&quot;` in attribute values.
**Warning signs:** XML parsers fail to parse the output; specific section titles have angle brackets (e.g., `## Props — \`lui-select\`\`\``) or the `>-` YAML indicator.

### Pitfall 3: Non-Deterministic Output
**What goes wrong:** Running the compiler twice produces different XML (different skill ordering) causing unnecessary git diffs.
**Why it happens:** `fs.readdir` returns entries in filesystem-dependent order (inode order on macOS HFS+, may differ on Linux ext4).
**How to avoid:** Call `.sort()` on the array from `fs.readdir(SKILLS_DIR)` before constructing paths.
**Warning signs:** `git diff skill/lit-ui-knowledge.xml` shows ordering changes between runs on CI vs. local.

### Pitfall 4: Frontmatter Containing Angle Brackets
**What goes wrong:** Frontmatter description fields like `How to use <lui-button> — props` are NOT stripped before XML escaping.
**Why it happens:** The frontmatter regex `^---[\s\S]*?---\n` must include the trailing `\n` to consume the blank line after the closing `---`. If the regex omits the `\n`, frontmatter content can bleed into the first section.
**How to avoid:** Test the stripping regex against the actual SKILL.md files. The correct regex is `/^---[\s\S]*?---\n/` (note the `\n` at end).
**Warning signs:** First `<section>` in the XML contains `name: lit-ui` or `description:` lines.

### Pitfall 5: H1 Heading vs Section Headings
**What goes wrong:** The H1 heading (`# lit-ui`) is included as a `<section title="lit-ui">`, giving each skill an extra empty-content section.
**Why it happens:** Splitting by all heading patterns (`#`, `##`) without distinguishing H1 from H2.
**How to avoid:** Extract H1 separately for the `<skill name="...">` attribute; split sections only on `##` (two hashes). The H1 line itself should be consumed/skipped, not turned into a section.
**Warning signs:** Each skill in the XML has a first `<section>` whose title matches the `<skill name="...">` attribute exactly.

### Pitfall 6: Trailing Whitespace in Section Content
**What goes wrong:** Section content has leading/trailing whitespace, making the XML diff noisy and the Phase 107 renderer insert extra blank lines.
**Why it happens:** `.split()` on heading regex leaves leading/trailing newlines on the content string.
**How to avoid:** `.trim()` each section's content after splitting.
**Warning signs:** XML output has `\n\n\n` between sections or extra blank space at the start of rendered text.

---

## Code Examples

### Complete compile-knowledge.ts skeleton
```typescript
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
  return content.replace(/^---[\s\S]*?---\n/, '')
}

function xmlEscape(text: string): string {
  return text
    .replace(/&/g, '&amp;')    // MUST be first
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')   // for attribute values
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
  // Split on lines that START a ## heading (lookahead keeps delimiter in next part)
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
    // Parts before the first ## (H1 + preamble) are skipped here
  }
  return sections
}

function buildSkillXml(name: string, sections: SkillSection[]): string {
  const sectionParts = sections.map(s => {
    const escapedContent = xmlEscape(s.content)
    const escapedTitle = xmlEscape(s.title)
    return `  <section title="${escapedTitle}">\n${escapedContent}\n  </section>`
  })
  return `<skill name="${xmlEscape(name)}">\n${sectionParts.join('\n')}\n</skill>`
}

// ── Main ───────────────────────────────────────────────────────────────────

async function compileKnowledge(): Promise<void> {
  // 1. Router skill first
  const routerRaw = await fs.readFile(path.join(SKILL_DIR, 'SKILL.md'), 'utf8')
  const routerMd = stripFrontmatter(routerRaw)
  const routerName = extractSkillName(routerMd)
  const routerSections = extractSections(routerMd)

  // 2. Sub-skills sorted alphabetically by directory name
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

  // 3. Build XML
  const skillElements = [
    buildSkillXml(routerName, routerSections),
    ...subSkills.map(s => buildSkillXml(s.name, s.sections))
  ]

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<skills>',
    ...skillElements.map(el =>
      el.split('\n').map((l: string) => '  ' + l).join('\n')
    ),
    '</skills>',
    ''
  ].join('\n')

  await fs.writeFile(OUTPUT_PATH, xml, 'utf8')
  console.log(`Compiled ${1 + subDirs.length} skills → ${OUTPUT_PATH}`)
}

await compileKnowledge()
```

### Verifying well-formed XML output
```bash
# Quick well-formedness check (Node.js built-in DOMParser is NOT available in Node.js)
# Use xmllint if available on the system, otherwise verify via Phase 107 renderer
node --input-type=module <<'EOF'
import { readFileSync } from 'node:fs'
const xml = readFileSync('skill/lit-ui-knowledge.xml', 'utf8')
// Check for unescaped < or > outside tags (naive but catches most issues)
const noTags = xml.replace(/<[^>]+>/g, '')
if (noTags.includes('<') || noTags.includes('>')) {
  console.error('FAIL: unescaped angle brackets found in content')
  process.exit(1)
}
console.log('PASS: no unescaped angle brackets in content')
EOF
```

### Running the compiler
```bash
# Direct invocation (development)
node --experimental-strip-types scripts/compile-knowledge.ts

# After Phase 108 wiring
pnpm knowledge:compile
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `node-ts` / `ts-node` for TypeScript scripts | `node --experimental-strip-types` | Node.js 22.6+ (2024) | Zero-dependency TypeScript execution; no tsconfig needed for scripts |
| Full YAML parser for frontmatter | Simple regex `/^---[\s\S]*?---\n/` | Project decision | Removes yaml/gray-matter dependency; frontmatter is uniform 2-field structure |

**Deprecated/outdated:**
- `ts-node`: Was common before Node.js native strip-types; still works but adds a dependency. This project uses native strip-types.
- `node-canvas` (Cairo-backed): Explicitly out of scope per REQUIREMENTS.md — requires system libraries, has font registration bugs on Linux.

---

## Open Questions

1. **Section content indentation in XML**
   - What we know: XML spec is indifferent to whitespace in text nodes for non-schema-validated documents
   - What's unclear: Whether the Phase 107 renderer expects flat content or indented content within `<section>` elements
   - Recommendation: Keep section content unindented (raw markdown content), only indent the `<section>` element tags themselves for readability. The renderer will read content as a string either way.

2. **Attribute quoting for section titles with special characters**
   - What we know: Section titles like `## Props — \`lui-select\`` contain backtick characters
   - What's unclear: Whether backticks need escaping in XML attribute values
   - Recommendation: Backticks are valid in XML attribute values — no escaping needed. Only `&`, `<`, `>`, and `"` (for `""`-delimited attributes) need escaping.

3. **pnpm knowledge:compile script placement**
   - What we know: XMLC-01 mentions `pnpm knowledge:compile`; Phase 108 (WIRE-01) is responsible for adding this to root package.json
   - What's unclear: Whether Phase 106 should also add the pnpm script or leave that entirely to Phase 108
   - Recommendation: Phase 106 adds only `node --experimental-strip-types scripts/compile-knowledge.ts` as the invocation pattern. The `pnpm knowledge:compile` wiring is Phase 108's responsibility. XMLC-01 can be satisfied by demonstrating the script runs — the pnpm alias is a WIRE-01 concern.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection: `skill/SKILL.md`, `skill/skills/*/SKILL.md` — 33 files examined, frontmatter and heading patterns confirmed
- `scripts/validate-canvas.ts` — ESM path resolution pattern (`fileURLToPath`, `__dirname`) confirmed working in this project
- `.planning/REQUIREMENTS.md` — XMLC-01 through XMLC-05 requirements read directly
- `.planning/ROADMAP.md` Phase 106 section — success criteria read directly
- Node.js 25.3.0 `--help` output — `--experimental-strip-types` confirmed as valid flag
- Live test: `node --experimental-strip-types /tmp/test-strip-esm.ts` — ESM TypeScript execution confirmed

### Secondary (MEDIUM confidence)
- Node.js 22.6+ release notes (training knowledge): `--experimental-strip-types` introduced in Node 22.6; this project runs Node 25.3 where it is stable
- XML 1.0 specification (training knowledge): entity encoding rules for `&`, `<`, `>`, `"` in text nodes and attribute values

### Tertiary (LOW confidence)
- None — all critical claims verified via direct codebase inspection or live execution

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified by direct inspection; zero new dependencies
- Architecture: HIGH — skill file structure fully mapped (33 files, consistent patterns)
- Pitfalls: HIGH — identified from actual file contents (frontmatter angle brackets in descriptions, heading patterns confirmed)

**Research date:** 2026-03-02
**Valid until:** 2026-04-02 (stable — Node.js built-ins, no external libraries)
