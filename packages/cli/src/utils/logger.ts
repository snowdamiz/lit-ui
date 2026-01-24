import { consola, createConsola } from 'consola';
import pc from 'picocolors';
import ora, { type Ora } from 'ora';

/**
 * Configured consola instance for CLI logging.
 */
export const logger = createConsola({
  formatOptions: {
    date: false,
    colors: true,
  },
});

/**
 * Log a success message with a green checkmark.
 */
export function success(msg: string): void {
  console.log(`${pc.green('\u2714')} ${msg}`);
}

/**
 * Log an error message with a red X.
 */
export function error(msg: string): void {
  console.log(`${pc.red('\u2718')} ${msg}`);
}

/**
 * Log a warning message with a yellow warning symbol.
 */
export function warn(msg: string): void {
  console.log(`${pc.yellow('\u26A0')} ${msg}`);
}

/**
 * Log an info message with a blue info symbol.
 */
export function info(msg: string): void {
  console.log(`${pc.blue('\u2139')} ${msg}`);
}

/**
 * Create a spinner with the given message.
 * Returns an ora spinner instance that can be controlled.
 *
 * @example
 * const spin = spinner('Installing dependencies...');
 * await install();
 * spin.succeed('Dependencies installed');
 */
export function spinner(msg: string): Ora {
  return ora({
    text: msg,
    color: 'cyan',
  }).start();
}

/**
 * Format a command for display (dim color).
 */
export function command(cmd: string): string {
  return pc.dim(cmd);
}

/**
 * Format a file path for display (cyan color).
 */
export function file(path: string): string {
  return pc.cyan(path);
}

/**
 * Format a highlighted value (bold).
 */
export function highlight(text: string): string {
  return pc.bold(text);
}

// Re-export consola for advanced usage
export { consola };
