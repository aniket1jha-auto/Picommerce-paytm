import { UserCog } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';

/**
 * Team & Roles — Phase 1 stub.
 * Real invite flow + permission matrix land in Phase 5 (scope point 10).
 */
export function TeamRoles() {
  return (
    <>
      <PageHeader
        title="Team & Roles"
        subtitle="Manage who can access this workspace and what they can do."
      />
      <EmptyState
        icon={UserCog}
        title="Team & roles management lands in Phase 5"
        body="Today, team management lives in Workspace settings as a flat list. Phase 5 brings real invites, role permissions, and SSO integration."
      />
    </>
  );
}
