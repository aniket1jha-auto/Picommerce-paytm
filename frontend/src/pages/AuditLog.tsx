import { ScrollText } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';

/**
 * Audit Log — Phase 1 stub.
 * Filterable list of cross-cutting actions lands in Phase 5 (scope point 10).
 */
export function AuditLog() {
  return (
    <>
      <PageHeader
        title="Audit Log"
        subtitle="Every meaningful action taken in this workspace, with who and when."
      />
      <EmptyState
        icon={ScrollText}
        title="Audit log lands in Phase 5"
        body="Track agent deployments, campaign launches, integration changes, role changes, and prompt-variant accepts. Filterable by entity, actor, and severity."
      />
    </>
  );
}
