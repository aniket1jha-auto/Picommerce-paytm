import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  MoreHorizontal,
  Pencil,
  Copy,
  Pause,
  Play,
  Archive,
  ExternalLink,
} from 'lucide-react';
import type { Campaign } from '@/types';
import type { CampaignData } from './CampaignWizard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ChannelIcon } from '@/components/common/ChannelIcon';
import { Waveform, useToast, cn } from '@/components/ui';
import { useAgentStore } from '@/store/agentStore';
import { useCampaignStore } from '@/store/campaignStore';
import { usePhaseData } from '@/hooks/usePhaseData';
import {
  formatINR,
  formatCount,
  formatPercent,
} from '@/utils/format';

/**
 * Campaign list card — Phase 4 D.1.7 (Campaigns home revamp).
 *
 * Replaces the row layout (CampaignCard.tsx, still used on Dashboard) with
 * a 2-column grid card. Built per the spec on the Campaigns page only.
 *
 * - Hover: 4px lift, accent border, soft accent glow + drop shadow.
 * - Reserved vertical slot below metrics for a goal-progress bar (built later).
 * - ⋯ menu actions: Edit, Duplicate, Pause/Resume (status-aware), Archive.
 */

interface Props {
  campaign: Campaign;
}

export function CampaignGridCard({ campaign }: Props) {
  const {
    id,
    name,
    status,
    channels,
    audience,
    metrics,
    anomaly,
    aiVoiceConfig,
  } = campaign;

  const hasMetrics = metrics.sent > 0;
  const convRate = hasMetrics ? (metrics.converted / metrics.sent) * 100 : 0;
  const agent = useAgentStore((s) =>
    aiVoiceConfig ? s.getAgentById(aiVoiceConfig.agentId) : undefined,
  );
  const { segments } = usePhaseData();
  const segment = segments.find((s) => s.id === audience.segmentId);

  return (
    <Link
      to={`/campaigns/${id}`}
      className={cn(
        'group relative block rounded-md border border-border-subtle bg-surface p-4',
        'cursor-pointer transition-all duration-150 ease-out',
        'hover:-translate-y-1 hover:border-accent',
        'hover:shadow-[0_0_24px_-4px_var(--color-accent),0_8px_16px_-4px_rgba(0,0,0,0.08)]',
      )}
    >
      {/* Top: name + status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-[15px] font-semibold text-text-primary">
              {name}
            </h3>
            {anomaly && (
              <span
                title={anomaly.message}
                className={cn(
                  anomaly.severity === 'high' ? 'text-error' : 'text-warning',
                  'shrink-0',
                )}
                aria-label="Campaign anomaly"
              >
                <AlertTriangle size={13} strokeWidth={2} />
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Sub: channels + audience name · size */}
      <div className="mt-2 flex items-center gap-2 text-[12px] text-text-secondary min-w-0">
        <div className="inline-flex items-center gap-1 shrink-0">
          {channels.map((ch) => (
            <ChannelIcon key={ch} channel={ch} size={12} />
          ))}
        </div>
        <span className="truncate">
          {(segment?.name ?? audience.segmentName) || 'Audience'}
          <span className="text-text-tertiary">
            {' · '}
            {formatCount(audience.size)}
          </span>
        </span>
      </div>

      {/* Metrics row: Reach · Converted · Conv Rate · Spend */}
      <div className="mt-4 grid grid-cols-4 gap-2 pt-3 border-t border-border-subtle">
        <Metric label="Reach" value={hasMetrics ? formatCount(metrics.sent) : '—'} />
        <Metric label="Converted" value={hasMetrics ? formatCount(metrics.converted) : '—'} />
        <Metric label="Conv Rate" value={hasMetrics ? formatPercent(convRate) : '—'} />
        <Metric label="Spend" value={hasMetrics ? formatINR(metrics.cost) : '—'} />
      </div>

      {/* Reserved slot for goal-progress bar — phase X. Don't remove. */}
      <div
        className="mt-3 h-2 rounded-full bg-surface-sunken/0"
        aria-hidden
        data-slot="goal-progress-reserved"
      />

      {/* Footer: agent badge · time-relative · ⋯ menu */}
      <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1 flex items-center gap-2">
          {agent && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/agents/${agent.id}`;
              }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-raised',
                'px-2 h-6 text-[11px] text-text-primary hover:border-accent hover:text-accent transition-colors shrink-0',
              )}
              title="Open agent"
              aria-label={`Open ${agent.config.name}`}
            >
              <Waveform seed={agent.id} bars={3} height={9} />
              <span className="truncate max-w-[120px]">{agent.config.name}</span>
              <ExternalLink size={9} className="text-text-tertiary" />
            </button>
          )}
          <span className="text-[11px] text-text-tertiary truncate">
            {timeRelativeLabel(campaign)}
          </span>
        </div>
        <CardMenu campaign={campaign} />
      </div>
    </Link>
  );
}

/* ─── Metric cell ─────────────────────────────────────────────────────── */

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-tertiary truncate">
        {label}
      </div>
      <div className="mt-0.5 text-[14px] font-semibold text-text-primary tabular-nums truncate">
        {value}
      </div>
    </div>
  );
}

/* ─── Time-relative label ─────────────────────────────────────────────── */

function timeRelativeLabel(c: Campaign): string {
  const now = Date.now();
  if (c.status === 'active') {
    if (c.startedAt) {
      return `running · started ${ago(now - new Date(c.startedAt).getTime())} ago`;
    }
    return 'running';
  }
  if (c.status === 'scheduled') {
    if (c.scheduledAt) {
      const dt = new Date(c.scheduledAt).getTime();
      const diff = dt - now;
      if (diff > 0) return `starts in ${ago(diff)}`;
      return `started ${ago(-diff)} ago`;
    }
    return 'scheduled';
  }
  if (c.status === 'completed') {
    const t = c.completedAt ?? c.startedAt ?? c.createdAt;
    return `completed ${ago(now - new Date(t).getTime())} ago`;
  }
  if (c.status === 'paused') {
    const t = c.startedAt ?? c.createdAt;
    return `paused · last active ${ago(now - new Date(t).getTime())} ago`;
  }
  // draft
  return `draft · edited ${ago(now - new Date(c.createdAt).getTime())} ago`;
}

/** Format a duration in ms as the largest sensible unit. */
function ago(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000));
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `${d}d`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.floor(mo / 12)}y`;
}

/* ─── ⋯ menu ──────────────────────────────────────────────────────────── */

function CardMenu({ campaign }: { campaign: Campaign }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const updateStatus = useCampaignStore((s) => s.updateStatus);
  const isPaused = campaign.status === 'paused';
  const canPauseResume =
    campaign.status === 'active' || campaign.status === 'paused' || campaign.status === 'scheduled';

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function stop(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleEdit(e: React.MouseEvent) {
    stop(e);
    navigate(`/campaigns/${campaign.id}/edit`);
    setOpen(false);
  }

  function handleDuplicate(e: React.MouseEvent) {
    stop(e);
    const draft: Partial<CampaignData> = {
      campaignType: 'simple_send',
      name: `${campaign.name} (copy)`,
      segmentId: campaign.audience.segmentId,
      channels: [...campaign.channels],
      goal: {
        description: '',
        goals: [],
        goalsOperator: 'or',
        tentativeBudget:
          campaign.budget.allocated > 0
            ? (campaign.budget.allocated / 100_000).toFixed(1)
            : '',
      },
      ...(campaign.aiVoiceConfig
        ? {
            senderConfig: {
              ai_voice: {
                ai_voice: {
                  account: '',
                  callerNumber: '',
                  agentId: campaign.aiVoiceConfig.agentId,
                  retry: campaign.aiVoiceConfig.retry,
                },
              },
            },
          }
        : {}),
    };
    setOpen(false);
    toast({
      kind: 'info',
      title: 'Duplicated',
      body: `Drafted a new campaign from "${campaign.name}".`,
    });
    navigate('/campaigns/new', { state: { campaignDraft: draft } });
  }

  function handlePauseResume(e: React.MouseEvent) {
    stop(e);
    setOpen(false);
    if (isPaused) {
      updateStatus(campaign.id, 'active');
      toast({ kind: 'success', title: 'Resumed', body: `${campaign.name} is sending again.` });
    } else if (campaign.status === 'active') {
      updateStatus(campaign.id, 'paused');
      toast({ kind: 'info', title: 'Paused', body: `${campaign.name} is paused.` });
    } else if (campaign.status === 'scheduled') {
      updateStatus(campaign.id, 'paused');
      toast({ kind: 'info', title: 'Paused', body: `${campaign.name} won't run until resumed.` });
    }
  }

  function handleArchive(e: React.MouseEvent) {
    stop(e);
    setOpen(false);
    toast({
      kind: 'info',
      title: 'Archive lands later',
      body: 'Campaign archive isn\'t in the data model yet — coming Phase 5.',
    });
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          setOpen((v) => !v);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Campaign actions"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-surface-raised hover:text-text-primary"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 bottom-full mb-1 z-30 min-w-[160px] rounded-md border border-border-subtle bg-surface-raised shadow-[var(--shadow-popover)] p-1"
        >
          <MenuItem onClick={handleEdit} icon={Pencil} label="Edit" />
          <MenuItem onClick={handleDuplicate} icon={Copy} label="Duplicate" />
          {canPauseResume && (
            <MenuItem
              onClick={handlePauseResume}
              icon={isPaused ? Play : Pause}
              label={isPaused ? 'Resume' : 'Pause'}
            />
          )}
          <MenuItem onClick={handleArchive} icon={Archive} label="Archive" />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  onClick,
  icon: Icon,
  label,
}: {
  onClick: (e: React.MouseEvent) => void;
  icon: typeof Pencil;
  label: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[12px] text-text-primary hover:bg-surface-sunken transition-colors"
    >
      <Icon size={12} className="text-text-secondary" />
      {label}
    </button>
  );
}
