import { diffLines, type Change } from 'diff';
import pc from 'picocolors';

/**
 * Detect if a file has been modified from its original content
 */
export function detectModifications(
  originalContent: string,
  currentContent: string
): { modified: boolean; changes: Change[] } {
  const changes = diffLines(originalContent, currentContent, {
    newlineIsToken: true,
  });

  // Check if any changes exist (added or removed lines)
  const modified = changes.some((c) => c.added || c.removed);

  return { modified, changes };
}

/**
 * Format diff output for terminal display
 * Shows added lines in green with +, removed in red with -
 */
export function formatDiff(changes: Change[]): string {
  const lines: string[] = [];

  for (const change of changes) {
    const text = change.value.replace(/\n$/, ''); // Remove trailing newline
    const changeLines = text.split('\n');

    for (const line of changeLines) {
      if (change.added) {
        lines.push(pc.green(`+ ${line}`));
      } else if (change.removed) {
        lines.push(pc.red(`- ${line}`));
      }
      // Skip unchanged lines for brevity
    }
  }

  return lines.join('\n');
}

/**
 * Get a summary of changes (counts of added/removed lines)
 */
export function getChangeSummary(changes: Change[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;

  for (const change of changes) {
    const lineCount = change.value.split('\n').length - 1;
    if (change.added) {
      added += lineCount;
    } else if (change.removed) {
      removed += lineCount;
    }
  }

  return { added, removed };
}
