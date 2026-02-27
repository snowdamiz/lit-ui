#!/usr/bin/env node
// Run: node scripts/install-skill.mjs
// Or:  node scripts/install-skill.mjs --all --yes
// Or:  node scripts/install-skill.mjs --tools agents,claude --yes
//
// @description
//   lit-ui Skill Installer — copies the skill/ directory tree into AI tool skill directories.
//   Supported tools: Codex, Agents, Claude, Gemini, Copilot, GitHub Copilot, Windsurf, OpenCode.
//
//   Integration note: This script can be called from the lit-ui CLI init flow in the future
//   by spawning it as a child process or extracting copySkillContents() into a shared utility
//   that injectOverviewSkills() delegates to for global installs.

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { stdin as input, stdout as output } from "node:process";

const SKILL_NAME = "lit-ui";
const SKILL_VERSION = "0.1.0";
const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SCRIPT_DIR = path.dirname(SCRIPT_PATH);
const INSTALL_VERSION_MARKER = ".lit-ui-version";

const TOOL_TARGETS = [
  { key: "codex", label: "Codex", relPath: [".codex", "skills", SKILL_NAME] },
  { key: "agents", label: "Agents", relPath: [".agents", "skills", SKILL_NAME] },
  { key: "claude", label: "Claude", relPath: [".claude", "skills", SKILL_NAME] },
  { key: "gemini", label: "Gemini", relPath: [".gemini", "skills", SKILL_NAME] },
  { key: "copilot", label: "Copilot", relPath: [".copilot", "skills", SKILL_NAME] },
  {
    key: "github-copilot",
    label: "GitHub Copilot",
    relPath: [".config", "github-copilot", "skills", SKILL_NAME]
  },
  {
    key: "windsurf",
    label: "Windsurf",
    relPath: [".codeium", "windsurf", "skills", SKILL_NAME]
  },
  {
    key: "opencode",
    label: "OpenCode",
    relPath: [".config", "opencode", "skills", SKILL_NAME]
  }
];

const SKIP_NAMES = new Set([".DS_Store", "__pycache__"]);

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  brightCyan: "\x1b[96m",
  brightBlue: "\x1b[94m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  white: "\x1b[97m",
  periwinkle: "\x1b[38;5;153m"
};

function supportsColor() {
  return output.isTTY && process.env.NO_COLOR === undefined;
}

function style(text, ...codes) {
  if (!supportsColor() || codes.length === 0) return text;
  return `${codes.join("")}${text}${ANSI.reset}`;
}

function printHelp(binName, installerVersion) {
  const validTools = TOOL_TARGETS.map((t) => t.key).join(",");
  output.write(
    [
      `lit-ui Skill Installer v${installerVersion}`,
      "",
      `Usage: ${binName} [options]`,
      "",
      "Options:",
      "  --tools <comma-list>  Install to specific tools (skips interactive selection).",
      "                         Valid keys:",
      `                         ${validTools}`,
      "  --all                  Install to all supported tools.",
      "  --yes                  Skip confirmation prompt.",
      "  --home <path>          Override home directory for destination paths.",
      "  --help                 Show this message.",
      ""
    ].join("\n") + "\n"
  );
}

function parseArgs(argv) {
  const parsed = { all: false, yes: false, tools: null, home: null, help: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--all") { parsed.all = true; continue; }
    if (arg === "--yes") { parsed.yes = true; continue; }
    if (arg === "--help" || arg === "-h") { parsed.help = true; continue; }
    if (arg === "--tools") {
      parsed.tools = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (arg === "--home") {
      parsed.home = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (parsed.all && parsed.tools) {
    throw new Error("Use either --all or --tools, not both.");
  }

  return parsed;
}

async function readInstallerVersion() {
  // Try root package.json first
  const rootPkg = path.resolve(SCRIPT_DIR, "..", "package.json");
  try {
    const raw = await fs.readFile(rootPkg, "utf8");
    const pkg = JSON.parse(raw);
    if (typeof pkg.version === "string" && pkg.version.trim() && !pkg.private) {
      return pkg.version.trim();
    }
  } catch {
    // fall through
  }

  // Try CLI package.json as fallback (monorepo: packages/cli/package.json)
  const cliPkg = path.resolve(SCRIPT_DIR, "..", "packages", "cli", "package.json");
  try {
    const raw = await fs.readFile(cliPkg, "utf8");
    const pkg = JSON.parse(raw);
    if (typeof pkg.version === "string" && pkg.version.trim()) {
      return pkg.version.trim();
    }
  } catch {
    // fall through
  }

  // Hardcoded fallback
  return SKILL_VERSION;
}

function resolveSourceDir() {
  return path.resolve(SCRIPT_DIR, "..", "skill");
}

async function ensureSourceDir(sourceDir) {
  let stat;
  try {
    stat = await fs.stat(sourceDir);
  } catch {
    throw new Error(`Missing skill directory: ${sourceDir}`);
  }
  if (!stat.isDirectory()) {
    throw new Error(`Expected a directory at: ${sourceDir}`);
  }
}

function buildTargets(homeDir) {
  return TOOL_TARGETS.map((tool) => ({
    ...tool,
    targetDir: path.join(homeDir, ...tool.relPath)
  }));
}

async function readInstalledVersion(targetDir) {
  const markerPath = path.join(targetDir, INSTALL_VERSION_MARKER);
  try {
    const raw = await fs.readFile(markerPath, "utf8");
    return raw.trim() || null;
  } catch {
    return null;
  }
}

async function writeInstalledVersion(targetDir, installerVersion) {
  const markerPath = path.join(targetDir, INSTALL_VERSION_MARKER);
  await fs.writeFile(markerPath, `${installerVersion}\n`, "utf8");
}

async function detectInstallState(targetDir) {
  let targetStat;
  try {
    targetStat = await fs.stat(targetDir);
  } catch {
    return { exists: false, skillInstalled: false };
  }

  if (!targetStat.isDirectory()) {
    return { exists: true, skillInstalled: false };
  }

  const markerPath = path.join(targetDir, "SKILL.md");
  try {
    const markerStat = await fs.stat(markerPath);
    const installedVersion = markerStat.isFile() ? await readInstalledVersion(targetDir) : null;
    return { exists: true, skillInstalled: markerStat.isFile(), installedVersion };
  } catch {
    return { exists: true, skillInstalled: false, installedVersion: null };
  }
}

async function addInstallState(targets) {
  return Promise.all(
    targets.map(async (target) => ({
      ...target,
      installState: await detectInstallState(target.targetDir)
    }))
  );
}

function formatVersionTransition(installState, installerVersion) {
  if (!installState?.skillInstalled) {
    return `not-installed > ${installerVersion}`;
  }
  const currentVersion = installState.installedVersion || "unknown";
  return `${currentVersion} > ${installerVersion}`;
}

function parseToolKeyList(toolList) {
  const keys = String(toolList)
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

  if (keys.length === 0) {
    throw new Error("No tool keys provided after --tools.");
  }

  const deduped = [...new Set(keys)];
  const unknown = deduped.filter((key) => !TOOL_TARGETS.some((t) => t.key === key));
  if (unknown.length > 0) {
    throw new Error(`Unknown tool keys: ${unknown.join(", ")}`);
  }

  return deduped;
}

function parseInteractiveSelection(selection, targets) {
  const raw = selection.trim().toLowerCase();
  if (!raw) throw new Error("No selection received.");
  if (raw === "all") return targets;

  const values = raw.split(",").map((p) => p.trim()).filter(Boolean);
  if (values.length === 0) throw new Error("No valid selection received.");

  const selectedIndexes = [];
  for (const value of values) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > targets.length) {
      throw new Error(`Invalid selection: ${value}`);
    }
    selectedIndexes.push(parsed - 1);
  }

  const uniqueIndexes = [...new Set(selectedIndexes)];
  return uniqueIndexes.map((idx) => targets[idx]);
}

function renderMultiSelectTui(targets, cursorIndex, selectedIndexes, notice, installerVersion) {
  output.write("\x1b[2J\x1b[H");
  output.write(style(`lit-ui Skill Installer v${installerVersion}\n`, ANSI.bold, ANSI.brightBlue));
  output.write("\n");
  output.write(style("Select tools to install the lit-ui skill into (multi-select).\n", ANSI.bold, ANSI.white));
  output.write(
    style(
      "Use arrow keys (or j/k) to move, space to toggle, a to toggle all, enter to confirm, q to cancel.\n\n",
      ANSI.dim,
      ANSI.periwinkle
    )
  );

  targets.forEach((target, idx) => {
    const isCurrent = idx === cursorIndex;
    const isSelected = selectedIndexes.has(idx);
    const pointer = isCurrent ? style(">", ANSI.bold, ANSI.brightYellow) : " ";
    const checked = isSelected ? style("x", ANSI.bold, ANSI.brightGreen) : " ";
    const labelText = isCurrent
      ? style(target.label, ANSI.bold, ANSI.brightYellow)
      : isSelected
        ? style(target.label, ANSI.brightGreen)
        : target.label;
    const versionText = style(
      `[${formatVersionTransition(target.installState, installerVersion)}]`,
      isCurrent ? ANSI.brightCyan : ANSI.dim
    );
    const targetPathText = isCurrent
      ? style(target.targetDir, ANSI.brightCyan)
      : style(target.targetDir, ANSI.dim);
    output.write(`${pointer} [${checked}] ${labelText} ${versionText} (${targetPathText})\n`);
  });

  output.write(`\n${style("Selected:", ANSI.bold, ANSI.brightBlue)} ${style(String(selectedIndexes.size), ANSI.bold, ANSI.white)}\n`);
  if (notice) {
    output.write(`${style(notice, ANSI.bold, ANSI.brightYellow)}\n`);
  }
}

function chooseTargetsWithTui(targets, installerVersion) {
  return new Promise((resolve, reject) => {
    if (!input.isTTY || !output.isTTY) {
      reject(new Error("Interactive TUI requires a TTY."));
      return;
    }

    let cursorIndex = 0;
    let notice = "";
    const selectedIndexes = new Set();

    const cleanup = () => {
      input.off("data", onData);
      if (input.isTTY) input.setRawMode(false);
      output.write("\x1b[?25h");
      output.write("\n");
    };

    const moveCursor = (delta) => {
      const length = targets.length;
      cursorIndex = (cursorIndex + delta + length) % length;
    };

    const toggleCurrent = () => {
      if (selectedIndexes.has(cursorIndex)) {
        selectedIndexes.delete(cursorIndex);
      } else {
        selectedIndexes.add(cursorIndex);
      }
    };

    const toggleAll = () => {
      if (selectedIndexes.size === targets.length) {
        selectedIndexes.clear();
        return;
      }
      for (let idx = 0; idx < targets.length; idx += 1) {
        selectedIndexes.add(idx);
      }
    };

    const finishSelection = () => {
      if (selectedIndexes.size === 0) {
        notice = "Select at least one tool before continuing.";
        renderMultiSelectTui(targets, cursorIndex, selectedIndexes, notice, installerVersion);
        return;
      }
      const orderedIndexes = [...selectedIndexes].sort((a, b) => a - b);
      const selectedTargets = orderedIndexes.map((idx) => targets[idx]);
      cleanup();
      resolve(selectedTargets);
    };

    const onData = (chunk) => {
      const key = chunk.toString("utf8");

      if (key === "\u0003") { cleanup(); reject(new Error("Cancelled by user.")); return; }
      if (key === "\r" || key === "\n") { finishSelection(); return; }
      if (key === " " || key === "\u001b[3~") {
        toggleCurrent();
        notice = "";
        renderMultiSelectTui(targets, cursorIndex, selectedIndexes, notice, installerVersion);
        return;
      }
      if (key === "a" || key === "A") {
        toggleAll();
        notice = "";
        renderMultiSelectTui(targets, cursorIndex, selectedIndexes, notice, installerVersion);
        return;
      }
      if (key === "q" || key === "Q") { cleanup(); reject(new Error("Cancelled by user.")); return; }
      if (key === "\u001b[A" || key === "k" || key === "K") {
        moveCursor(-1);
        notice = "";
        renderMultiSelectTui(targets, cursorIndex, selectedIndexes, notice, installerVersion);
        return;
      }
      if (key === "\u001b[B" || key === "j" || key === "J") {
        moveCursor(1);
        notice = "";
        renderMultiSelectTui(targets, cursorIndex, selectedIndexes, notice, installerVersion);
      }
    };

    output.write("\x1b[?25l");
    input.setRawMode(true);
    input.resume();
    input.on("data", onData);
    renderMultiSelectTui(targets, cursorIndex, selectedIndexes, notice, installerVersion);
  });
}

async function chooseTargetsWithTextPrompt(targets, installerVersion) {
  const rl = readline.createInterface({ input, output });
  try {
    output.write(`Version: ${installerVersion}\n`);
    output.write("Select tools to install lit-ui skill into (multi-select).\n");
    output.write("Enter numbers separated by commas, or type 'all'.\n\n");
    targets.forEach((target, idx) => {
      output.write(
        `${idx + 1}. ${target.label} [${formatVersionTransition(target.installState, installerVersion)}] (${target.targetDir})\n`
      );
    });
    const answer = await rl.question("\nSelection: ");
    return parseInteractiveSelection(answer, targets);
  } finally {
    rl.close();
  }
}

async function chooseTargets(parsed, targets, installerVersion) {
  if (parsed.all) return targets;
  if (parsed.tools) {
    const selectedKeys = parseToolKeyList(parsed.tools);
    return targets.filter((t) => selectedKeys.includes(t.key));
  }
  if (input.isTTY && output.isTTY) {
    return chooseTargetsWithTui(targets, installerVersion);
  }
  return chooseTargetsWithTextPrompt(targets, installerVersion);
}

async function copySkillContents(sourceDir, targetDir) {
  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(sourceDir);
  await Promise.all(
    entries
      .filter((entry) => !SKIP_NAMES.has(entry))
      .map((entry) =>
        fs.cp(path.join(sourceDir, entry), path.join(targetDir, entry), {
          recursive: true,
          force: true,
          errorOnExist: false,
          filter: (sourcePath) => !SKIP_NAMES.has(path.basename(sourcePath))
        })
      )
  );
}

function printUpdateNotice(selectedTargets, installerVersion) {
  const skillInstalled = selectedTargets.filter((t) => t.installState?.skillInstalled);
  const existingPaths = selectedTargets.filter(
    (t) => t.installState?.exists && !t.installState?.skillInstalled
  );

  if (skillInstalled.length === 0 && existingPaths.length === 0) return;

  output.write("\nUpdate notice:\n");
  skillInstalled.forEach((t) => {
    output.write(
      `- ${t.label}: existing lit-ui skill at ${t.targetDir} (${formatVersionTransition(t.installState, installerVersion)}). Files will be overwritten.\n`
    );
  });
  existingPaths.forEach((t) => {
    output.write(
      `- ${t.label}: existing path at ${t.targetDir}. Conflicting files may be overwritten.\n`
    );
  });
}

async function confirmInstall(parsed, selectedTargets, installerVersion) {
  if (parsed.yes) return true;

  const rl = readline.createInterface({ input, output });
  try {
    output.write(style("\nInstall lit-ui skill into:\n", ANSI.bold, ANSI.white));
    selectedTargets.forEach((t) => {
      const suffix = t.installState?.skillInstalled
        ? style(" [update: existing files will be overwritten]", ANSI.dim)
        : t.installState?.exists
          ? style(" [existing path: conflicting files may be overwritten]", ANSI.dim)
          : "";
      output.write(
        `${style("-", ANSI.dim)} ${style(t.targetDir, ANSI.periwinkle)} ${style(`[${formatVersionTransition(t.installState, installerVersion)}]`, ANSI.dim)}${suffix}\n`
      );
    });
    const answer = await rl.question(style("Continue? [y/N]: ", ANSI.bold, ANSI.white));
    return answer.trim().toLowerCase() === "y" || answer.trim().toLowerCase() === "yes";
  } finally {
    rl.close();
  }
}

async function main() {
  const binName = path.basename(process.argv[1] || "install-skill");
  const installerVersion = await readInstallerVersion();
  let parsed;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (error) {
    output.write(`Error: ${error.message}\n\n`);
    printHelp(binName, installerVersion);
    process.exitCode = 1;
    return;
  }

  if (parsed.help) {
    printHelp(binName, installerVersion);
    return;
  }

  const homeDir = parsed.home || os.homedir();
  const sourceDir = resolveSourceDir();
  await ensureSourceDir(sourceDir);
  const targets = await addInstallState(buildTargets(homeDir));

  let selectedTargets;
  try {
    selectedTargets = await chooseTargets(parsed, targets, installerVersion);
  } catch (error) {
    output.write(`Error: ${error.message}\n`);
    process.exitCode = 1;
    return;
  }

  if (selectedTargets.length === 0) {
    output.write("No tools selected. Nothing to install.\n");
    return;
  }

  printUpdateNotice(selectedTargets, installerVersion);

  const confirmed = await confirmInstall(parsed, selectedTargets, installerVersion);
  if (!confirmed) {
    output.write("Installation cancelled.\n");
    return;
  }

  output.write(
    style(`\nInstalling lit-ui skill v${installerVersion}...\n`, ANSI.bold, ANSI.brightCyan)
  );

  for (const target of selectedTargets) {
    await copySkillContents(sourceDir, target.targetDir);
    await writeInstalledVersion(target.targetDir, installerVersion);
    const action = target.installState?.exists ? "Updated" : "Installed";
    output.write(
      `${style(action, ANSI.bold, ANSI.brightGreen)} ${style(target.label, ANSI.bold, ANSI.white)}: ${style(target.targetDir, ANSI.periwinkle)} ${style(`[${formatVersionTransition(target.installState, installerVersion)}]`, ANSI.dim)}\n`
    );
  }

  output.write(
    style("\nlit-ui skill installation complete.\n", ANSI.bold, ANSI.brightGreen)
  );
}

main().catch((error) => {
  output.write(`Installation failed: ${error.message}\n`);
  process.exitCode = 1;
});
