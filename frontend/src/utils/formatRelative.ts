/** Relative time for lists, e.g. "2 days ago" (no "Updated" prefix) */
export function formatTimeAgoShort(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

/** Human-readable "Updated N days ago" from ISO date string */
export function formatUpdatedAgo(iso: string | undefined): string {
  if (!iso) return 'Updated recently';
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days <= 0) return 'Updated today';
  if (days === 1) return 'Updated 1 day ago';
  return `Updated ${days} days ago`;
}
