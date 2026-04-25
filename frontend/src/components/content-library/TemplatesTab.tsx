import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MoreVertical,
  Clock,
  Check,
  X,
  Pause,
  LayoutTemplate,
  MessageCircle,
  Smartphone,
} from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Toast } from '@/components/common/Toast';
import { formatCount } from '@/utils/format';
import { formatTimeAgoShort } from '@/utils/formatRelative';
import type { ContentTemplateRow, TemplateChannel, TemplateStatus } from '@/types/contentLibrary';

const CHANNEL_TABS: { id: 'all' | TemplateChannel; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'sms', label: 'SMS' },
  { id: 'rcs', label: 'RCS' },
];

const STATUS_OPTIONS: { value: 'all' | TemplateStatus; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'paused', label: 'Paused' },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All categories' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'utility', label: 'Utility' },
  { value: 'authentication', label: 'Authentication' },
] as const;

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return `${s.slice(0, n)}…`;
}

function channelLabel(ch: TemplateChannel): string {
  if (ch === 'whatsapp') return 'WhatsApp';
  if (ch === 'sms') return 'SMS';
  return 'RCS';
}

function StatusBadge({ status }: { status: TemplateStatus }) {
  const map: Record<
    TemplateStatus,
    { label: string; className: string; icon: typeof Check | null }
  > = {
    draft: {
      label: 'Draft',
      className: 'bg-[#F3F4F6] text-[#4B5563]',
      icon: null,
    },
    pending_approval: {
      label: 'Pending Approval',
      className: 'bg-[#FFFBEB] text-[#B45309]',
      icon: Clock,
    },
    approved: {
      label: 'Approved',
      className: 'bg-[#ECFDF5] text-[#047857]',
      icon: Check,
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-[#FEF2F2] text-[#B91C1C]',
      icon: X,
    },
    paused: {
      label: 'Paused',
      className: 'bg-[#FFF7ED] text-[#C2410C]',
      icon: Pause,
    },
  };
  const m = map[status];
  const Icon = m.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${m.className}`}
    >
      {Icon && <Icon size={11} strokeWidth={2.5} />}
      {m.label}
    </span>
  );
}

function CategoryPill({ cat }: { cat: NonNullable<ContentTemplateRow['category']> }) {
  const labels: Record<NonNullable<ContentTemplateRow['category']>, string> = {
    marketing: 'Marketing',
    utility: 'Utility',
    authentication: 'Authentication',
  };
  return (
    <span className="inline-flex rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-medium text-[#1D4ED8]">
      {labels[cat]}
    </span>
  );
}

function QualityCell({ row }: { row: ContentTemplateRow }) {
  if (row.channel !== 'whatsapp' || row.status !== 'approved' || !row.quality) {
    return <span className="text-text-secondary">—</span>;
  }
  const dot =
    row.quality === 'high' ? '🟢' : row.quality === 'medium' ? '🟡' : '🔴';
  const label = row.quality === 'high' ? 'High' : row.quality === 'medium' ? 'Medium' : 'Low';
  return (
    <span className="text-sm text-text-primary">
      {dot} {label}
    </span>
  );
}

export function TemplatesTab({
  templates,
  setTemplates,
}: {
  templates: ContentTemplateRow[];
  setTemplates: React.Dispatch<React.SetStateAction<ContentTemplateRow[]>>;
}) {
  const [search, setSearch] = useState('');
  const [channelTab, setChannelTab] = useState<'all' | TemplateChannel>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TemplateStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const el = e.target as HTMLElement;
      if (!el.closest('[data-template-menu]')) setMenuOpenId(null);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const stats = useMemo(() => {
    const total = templates.length;
    const approved = templates.filter((t) => t.status === 'approved').length;
    const pending = templates.filter((t) => t.status === 'pending_approval').length;
    const bad = templates.filter((t) => t.status === 'rejected' || t.status === 'paused').length;
    return { total, approved, pending, bad };
  }, [templates]);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (channelTab !== 'all' && t.channel !== channelTab) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (categoryFilter !== 'all') {
        if (t.channel !== 'whatsapp') return false;
        if ((t.category ?? '') !== categoryFilter) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!t.name.toLowerCase().includes(q) && !t.bodyPreview.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [templates, channelTab, statusFilter, categoryFilter, search]);

  const duplicateRow = (row: ContentTemplateRow) => {
    const copy: ContentTemplateRow = {
      ...row,
      id: `tpl_${Date.now()}`,
      name: `${row.name}_copy`,
      status: 'draft',
      quality: null,
      usedIn: [],
      lastUpdated: new Date().toISOString(),
      rejectionReason: undefined,
    };
    setTemplates((prev) => [copy, ...prev]);
    setMenuOpenId(null);
    setToast('Template duplicated');
  };

  const deleteRow = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setMenuOpenId(null);
    setToast('Template deleted');
  };

  const submitForApproval = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: 'pending_approval' as const, lastUpdated: new Date().toISOString() } : t,
      ),
    );
    setMenuOpenId(null);
    setToast('Submitted for approval');
  };

  const showEmptyLibrary = templates.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {!showEmptyLibrary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
            <p className="text-xs font-medium text-text-secondary">Total Templates</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{formatCount(stats.total)}</p>
          </div>
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
            <p className="text-xs font-medium text-text-secondary">Approved</p>
            <p className="mt-2 text-2xl font-semibold text-[#047857]">{formatCount(stats.approved)}</p>
          </div>
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
            <p className="text-xs font-medium text-text-secondary">Pending Review</p>
            <p className="mt-2 text-2xl font-semibold text-[#B45309]">{formatCount(stats.pending)}</p>
          </div>
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,41,112,0.08)] ring-1 ring-amber-200/80">
            <p className="text-xs font-medium text-text-secondary">Rejected / Paused</p>
            <p className="mt-2 text-2xl font-semibold text-[#C2410C]">{formatCount(stats.bad)}</p>
            <p className="mt-1 text-[11px] text-text-secondary">Needs attention</p>
          </div>
        </div>
      )}

      {!showEmptyLibrary && (
        <div className="flex flex-col gap-4 rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="relative max-w-md flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full rounded-lg border border-[#E5E7EB] py-2 pl-9 pr-3 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
              />
            </div>
            <div className="flex flex-wrap gap-1 rounded-lg bg-[#F9FAFB] p-1">
              {CHANNEL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setChannelTab(tab.id)}
                  className={[
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    channelTab === tab.id
                      ? 'bg-white text-text-primary shadow-sm ring-1 ring-[#E5E7EB]'
                      : 'text-text-secondary hover:text-text-primary',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | TemplateStatus)}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-text-primary focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-text-primary focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              to="/content-library/templates/new"
              className="inline-flex items-center gap-2 rounded-md bg-cyan px-4 py-2 text-sm font-medium text-white hover:bg-cyan/90"
            >
              + Create Template
            </Link>
          </div>
        </div>
      )}

      {showEmptyLibrary ? (
        <div className="rounded-lg bg-white py-12 ring-1 ring-[#E5E7EB]">
          <EmptyState
            icon={LayoutTemplate}
            title="No templates yet"
            description="Create your first template or generate one with AI to start reaching your customers."
          />
          <div className="flex justify-center gap-3 px-4">
            <Link
              to="/content-library/templates/new"
              className="inline-flex items-center rounded-md bg-cyan px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan/90"
            >
              Create Template
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg bg-white py-10 text-center ring-1 ring-[#E5E7EB]">
          <p className="text-sm font-medium text-text-primary">No templates match your filters</p>
          <p className="mt-1 text-sm text-text-secondary">Try adjusting search or filters.</p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setChannelTab('all');
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
            className="mt-4 text-sm font-medium text-cyan hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-[#E5E7EB]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F7F9FC]">
                  {[
                    'Template Name',
                    'Channel',
                    'Category',
                    'Language',
                    'Status',
                    'Quality',
                    'Last Updated',
                    'Used In',
                    'Actions',
                  ].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#F3F4F6] last:border-0 transition-colors hover:bg-[#F7F9FC]"
                  >
                    <td className="max-w-[220px] px-4 py-3 align-top">
                      <p className="font-semibold text-text-primary">{row.name}</p>
                      <p className="mt-0.5 text-xs text-text-secondary">{truncate(row.bodyPreview, 60)}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top">
                      <div className="flex items-center gap-2">
                        {row.channel === 'whatsapp' ? (
                          <MessageCircle size={16} className="text-[#25D366]" />
                        ) : (
                          <Smartphone size={16} className="text-cyan" />
                        )}
                        <span className="text-text-primary">{channelLabel(row.channel)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {row.category ? <CategoryPill cat={row.category} /> : (
                        <span className="text-text-secondary">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-text-primary">{row.languages.join(' · ')}</td>
                    <td className="px-4 py-3 align-top">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <QualityCell row={row} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-text-secondary">
                      {formatTimeAgoShort(row.lastUpdated)}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 align-top">
                      {row.usedIn.length === 0 ? (
                        <span className="text-xs text-text-secondary">Not used</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {row.usedIn.slice(0, 2).map((c) => (
                            <span
                              key={c}
                              className="inline-block max-w-[140px] truncate rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 text-[10px] font-medium text-text-secondary"
                            >
                              {c}
                            </span>
                          ))}
                          {row.usedIn.length > 2 && (
                            <span className="text-[10px] font-medium text-text-secondary">
                              +{row.usedIn.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="relative px-4 py-3 align-top">
                      <button
                        type="button"
                        data-template-menu="trigger"
                        onClick={() => setMenuOpenId((id) => (id === row.id ? null : row.id))}
                        className="rounded-md p-1.5 text-text-secondary hover:bg-[#F3F4F6] hover:text-text-primary"
                        aria-label="Actions"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {menuOpenId === row.id && (
                        <div
                          data-template-menu="dropdown"
                          className="absolute right-2 top-10 z-30 w-52 rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg ring-1 ring-black/5"
                        >
                          <button
                            type="button"
                            className="block w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-[#F9FAFB]"
                            onClick={() => {
                              setMenuOpenId(null);
                              setToast('Template details (preview)');
                            }}
                          >
                            View details
                          </button>
                          <button
                            type="button"
                            className="block w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-[#F9FAFB]"
                            onClick={() => duplicateRow(row)}
                          >
                            Duplicate
                          </button>
                          {row.status === 'draft' && (
                            <button
                              type="button"
                              className="block w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-[#F9FAFB]"
                              onClick={() => submitForApproval(row.id)}
                            >
                              Submit for approval
                            </button>
                          )}
                          {(row.status === 'draft' || row.status === 'rejected') && (
                            <button
                              type="button"
                              className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                              onClick={() => deleteRow(row.id)}
                            >
                              Delete
                            </button>
                          )}
                          {row.status === 'rejected' && row.rejectionReason && (
                            <button
                              type="button"
                              className="block w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-[#F9FAFB]"
                              onClick={() => {
                                setMenuOpenId(null);
                                window.alert(row.rejectionReason);
                              }}
                            >
                              View rejection reason
                            </button>
                          )}
                          {(row.status === 'approved' || row.status === 'pending_approval') && (
                            <div
                              className="border-t border-[#F3F4F6] px-3 py-2 text-[11px] leading-snug text-text-secondary"
                              title="Approved templates cannot be edited. Duplicate and create a new version instead."
                            >
                              <span className="cursor-help border-b border-dotted border-text-secondary">
                                No edit (Meta policy)
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Toast
        message={toast ?? ''}
        type="info"
        visible={toast !== null}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
