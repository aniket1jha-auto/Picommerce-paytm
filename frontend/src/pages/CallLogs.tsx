import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PhoneCall,
  Search,
  Flag as FlagIcon,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PhoneOff,
} from 'lucide-react';
import { mockCalls } from '@/data/mock/calls';
import { useAgentStore } from '@/store/agentStore';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Input,
  StatusPill,
  Tabs,
  Table,
  THead,
  TBody,
  Tr,
  Th,
  Td,
  EmptyState,
  cn,
} from '@/components/ui';
import { formatTimeAgoShort } from '@/utils/formatRelative';
import type { Call, CallStatus } from '@/types/call';

/**
 * Call Logs — Phase 4.3
 *
 * Filterable inventory of every call. Click a row → drill-down at
 * /monitoring/calls/:id. The ?status= param honored from the anomaly card
 * deep-link in /monitoring.
 */

type StatusFilter = 'all' | 'completed' | 'failed' | 'abandoned' | 'flagged';

const TABS = [
  { id: 'all' as const, label: 'All' },
  { id: 'completed' as const, label: 'Completed' },
  { id: 'failed' as const, label: 'Failed' },
  { id: 'abandoned' as const, label: 'Abandoned' },
  { id: 'flagged' as const, label: 'Flagged' },
];

export function CallLogs() {
  const agents = useAgentStore((s) => s.agents);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');

  const statusParam = searchParams.get('status') as StatusFilter | null;
  const initialFilter: StatusFilter =
    statusParam && ['all', 'completed', 'failed', 'abandoned', 'flagged'].includes(statusParam)
      ? statusParam
      : 'all';
  const [filter, setFilter] = useState<StatusFilter>(initialFilter);

  // Reflect filter in the URL so deep-links stay accurate.
  function handleFilterChange(next: StatusFilter) {
    setFilter(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'all') params.delete('status');
    else params.set('status', next);
    setSearchParams(params, { replace: true });
  }

  const filtered = useMemo(() => {
    let calls = mockCalls;

    if (filter === 'completed') {
      calls = calls.filter((c) => c.status === 'completed');
    } else if (filter === 'failed') {
      calls = calls.filter((c) => c.status === 'failed');
    } else if (filter === 'abandoned') {
      calls = calls.filter((c) => c.status === 'abandoned' || c.status === 'no_answer');
    } else if (filter === 'flagged') {
      calls = calls.filter((c) => c.flags.length > 0);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      calls = calls.filter(
        (c) =>
          c.agentName.toLowerCase().includes(q) ||
          c.contactPhoneMasked.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.scriptId.toLowerCase().includes(q),
      );
    }

    return calls;
  }, [filter, query]);

  const counts = useMemo(
    () => ({
      all: mockCalls.length,
      completed: mockCalls.filter((c) => c.status === 'completed').length,
      failed: mockCalls.filter((c) => c.status === 'failed').length,
      abandoned: mockCalls.filter((c) => c.status === 'abandoned' || c.status === 'no_answer').length,
      flagged: mockCalls.filter((c) => c.flags.length > 0).length,
    }),
    [],
  );

  const tabsWithCounts = TABS.map((t) => ({ ...t, count: counts[t.id] }));

  // Voice agents map for displaying useCase / icons (not used heavily; reserved)
  void agents;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Call Logs"
        subtitle="Every call across deployed agents. Filterable, searchable. Click any row for the drill-down."
      />

      <div className="flex flex-col gap-3">
        <Tabs items={tabsWithCounts} active={filter} onChange={handleFilterChange} variant="pill" />
        <div className="relative max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
          <Input
            placeholder="Search by agent, contact, ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={PhoneCall}
          title="No calls match the filter"
          body="Try a different status tab or clear the search."
        />
      ) : (
        <Table>
          <THead>
            <Tr hover={false}>
              <Th>Agent</Th>
              <Th>Contact</Th>
              <Th>Status</Th>
              <Th>Outcome</Th>
              <Th className="text-right">Duration</Th>
              <Th className="text-right">p95 latency</Th>
              <Th>Flags</Th>
              <Th>When</Th>
            </Tr>
          </THead>
          <TBody>
            {filtered.map((call) => (
              <CallRow key={call.id} call={call} />
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}

/* ─── Sub-components ───────────────────────────────────────────────────── */

function CallRow({ call }: { call: Call }) {
  return (
    <Tr>
      <Td>
        <Link
          to={`/monitoring/calls/${call.id}`}
          className="inline-flex items-center gap-1.5 font-medium text-text-primary hover:text-accent"
        >
          <span>{call.agentName}</span>
          {call.promotedToEvalCaseId && (
            <Sparkles size={11} className="text-accent" />
          )}
        </Link>
      </Td>
      <Td className="text-[12px] text-text-secondary">{call.contactPhoneMasked}</Td>
      <Td>
        <CallStatusPill status={call.status} />
      </Td>
      <Td>
        <OutcomePill outcome={call.outcome} />
      </Td>
      <Td numeric className="text-[12px]">
        {call.durationMs ? formatDuration(call.durationMs) : '—'}
      </Td>
      <Td numeric className={cn('text-[12px] tabular-nums', call.latencyP95Ms > 1000 && 'text-error')}>
        {call.latencyP95Ms}ms
      </Td>
      <Td>
        {call.flags.length > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 h-5 text-[11px] text-warning">
            <FlagIcon size={10} />
            {call.flags.length}
          </span>
        ) : (
          <span className="text-text-tertiary text-[12px]">—</span>
        )}
      </Td>
      <Td className="text-[12px] text-text-secondary">
        {formatTimeAgoShort(call.startedAt)}
      </Td>
    </Tr>
  );
}

function CallStatusPill({ status }: { status: CallStatus }) {
  const map: Record<CallStatus, {
    kind: 'success' | 'error' | 'warning' | 'neutral' | 'info' | 'accent';
    label: string;
    Icon: typeof CheckCircle2;
  }> = {
    in_progress: { kind: 'accent', label: 'In progress', Icon: CheckCircle2 },
    completed: { kind: 'success', label: 'Completed', Icon: CheckCircle2 },
    failed: { kind: 'error', label: 'Failed', Icon: XCircle },
    abandoned: { kind: 'warning', label: 'Abandoned', Icon: AlertTriangle },
    no_answer: { kind: 'neutral', label: 'No answer', Icon: PhoneOff },
    busy: { kind: 'neutral', label: 'Busy', Icon: PhoneOff },
  };
  const s = map[status];
  return (
    <StatusPill status={s.kind} size="sm">
      {s.label}
    </StatusPill>
  );
}

function OutcomePill({ outcome }: { outcome: Call['outcome'] }) {
  if (outcome === 'unknown') return <span className="text-text-tertiary text-[12px]">—</span>;
  return (
    <StatusPill status={outcome === 'converted' ? 'success' : 'neutral'} size="sm" showDot={false}>
      {outcome === 'converted' ? 'Converted' : 'Not converted'}
    </StatusPill>
  );
}

function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}
