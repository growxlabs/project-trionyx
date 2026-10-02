/**
 * Converts canonical enum values (e.g. IN_PROGRESS) into readable labels
 * (e.g. "In Progress"). Used to avoid ALL-CAPS text in the workspace.
 */
export function humanize(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
