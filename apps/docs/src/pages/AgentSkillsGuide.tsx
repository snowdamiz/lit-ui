/**
 * Agent Skills documentation page
 * Explains how lit-ui integrates with AI coding assistants via the agentskills.io spec
 */

import { CodeBlock } from '../components/CodeBlock';
import { PrevNextNav } from '../components/PrevNextNav';

const initExample = `# During project initialization
npx lit-ui init

# Detected AI tools: Claude Code. Inject Agent Skills for lit-ui? (Y/n)`;

const addExample = `# Adding a component also injects its skill
npx lit-ui add button

# ✔ Injected button skill for AI tools`;

const directoryLayout = `.claude/skills/
├── lit-ui/              # Overview skill (injected during init)
│   └── SKILL.md
├── lit-ui-button/       # Component skill (injected during add)
│   └── SKILL.md
├── lit-ui-dialog/
│   └── SKILL.md
└── lit-ui-input/
    └── SKILL.md`;

export function AgentSkillsGuide() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
        <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

        <div className="relative">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
            Agent Skills
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
            Give your AI coding assistant full knowledge of the lit-ui API. Skills are injected
            automatically during CLI operations following the{' '}
            <a
              href="https://agentskills.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 dark:text-gray-300 underline underline-offset-2 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              agentskills.io
            </a>{' '}
            open standard.
          </p>
        </div>
      </header>

      {/* Section 1: What Are Agent Skills */}
      <section id="what-are-skills" className="scroll-mt-20 mb-16 animate-fade-in-up opacity-0 stagger-2">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">What Are Agent Skills?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Structured API knowledge for AI assistants</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Agent Skills are markdown files placed in your project that teach AI coding assistants about your tools and APIs. When your AI reads these files, it understands how to use lit-ui components correctly — properties, slots, events, CSS custom properties, and accessibility patterns.
        </p>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          lit-ui provides two types of skills:
        </p>

        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overview skill</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Injected during <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">lit-ui init</code>. Covers installation, theming, dark mode, SSR, form participation, and the full component catalog.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Component skills</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Injected during <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">lit-ui add</code>. Each component gets a dedicated skill with its complete API reference — properties, slots, CSS parts, CSS custom properties, examples, and accessibility notes.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Open standard:</span>{' '}
            Skills follow the <a href="https://agentskills.io" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">agentskills.io</a> specification — YAML frontmatter with a name and description, followed by a markdown body. This format is supported across all major AI coding tools.
          </p>
        </div>
      </section>

      {/* Section 2: Supported Platforms */}
      <section id="platforms" className="scroll-mt-20 mb-16 animate-fade-in-up opacity-0 stagger-3">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Supported Platforms</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Automatic detection for 7 AI coding tools</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The CLI automatically detects which AI tools are configured in your project and injects skills into the correct directory:
        </p>

        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Platform</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Skills Directory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {[
                { name: 'Claude Code', dir: '.claude/skills' },
                { name: 'Cursor', dir: '.cursor/skills' },
                { name: 'GitHub Copilot', dir: '.github/skills' },
                { name: 'Windsurf', dir: '.windsurf/skills' },
                { name: 'Codex', dir: '.codex/skills' },
                { name: 'OpenCode', dir: '.opencode/skills' },
                { name: 'Google Antigravity', dir: '.agent/skills' },
              ].map((p) => (
                <tr key={p.name} className="bg-white dark:bg-gray-900">
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.name}</td>
                  <td className="px-4 py-3">
                    <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-600 dark:text-gray-400">{p.dir}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Detection:</span>{' '}
            The CLI checks for platform-specific directories (e.g. <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">.claude/</code>, <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">.cursor/</code>) in your project root. If none are found, you're prompted to select a platform manually.
          </p>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section id="how-it-works" className="scroll-mt-20 mb-14 animate-fade-in-up opacity-0 stagger-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">How It Works</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Automatic injection during CLI commands</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Skills are injected automatically — no extra setup needed:
        </p>

        <div className="space-y-6 mb-6">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              During <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">init</code> — overview skill:
            </p>
            <CodeBlock code={initExample} language="bash" />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              During <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">add</code> — component skill:
            </p>
            <CodeBlock code={addExample} language="bash" />
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          After running these commands, your skills directory looks like:
        </p>
        <CodeBlock code={directoryLayout} language="text" />

        <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Non-destructive:</span>{' '}
            Existing skill files are never overwritten. If you've customized a skill, it stays as-is.
          </p>
        </div>
      </section>

      {/* Navigation */}
      <div className="divider-fade mb-8" />
      <PrevNextNav
        prev={{ title: 'Migration', href: '/guides/migration' }}
        next={{ title: 'Button', href: '/components/button' }}
      />
    </div>
  );
}
