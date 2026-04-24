import { useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plug2, Search, Link2, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { IntegrationsDrawer } from '@/components/integrations/IntegrationsDrawer';
import {
  INTEGRATIONS,
  INTEGRATION_FILTER_TABS,
  INTEGRATION_SECTION_ORDER,
  integrationsInSection,
  type IntegrationDefinition,
  type IntegrationFilterTab,
  type IntegrationConnectionStatus,
} from '@/data/integrationsCatalog';

function IntegrationCard({
  item,
  status,
  onConnect,
  onManage,
}: {
  item: IntegrationDefinition;
  status: IntegrationConnectionStatus;
  onConnect: () => void;
  onManage: () => void;
}) {
  const connected = status === 'connected';
  const err = status === 'error';

  return (
    <div
      className={[
        'flex h-full flex-col rounded-lg border bg-white p-4 transition-shadow',
        connected
          ? 'border-cyan/30 shadow-[0_4px_12px_rgba(0,41,112,0.12)]'
          : 'border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,41,112,0.08)] hover:shadow-[0_4px_12px_rgba(0,41,112,0.1)]',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-inner"
          style={{ backgroundColor: item.brandColor }}
        >
          {item.initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug text-text-primary">{item.name}</h3>
          <p className="mt-1 line-clamp-1 text-xs text-text-secondary">{item.shortDescription}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-semibold text-[#6366F1]">
              {item.categoryLabel}
            </span>
            {connected && (
              <span className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-semibold text-[#059669]">
                Connected
              </span>
            )}
            {!connected && !err && (
              <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                Not connected
              </span>
            )}
            {err && (
              <span className="rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-semibold text-[#DC2626]">
                Error
              </span>
            )}
          </div>
        </div>
      </div>

      {err && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-[#B45309]">
          <AlertTriangle size={12} className="shrink-0" />
          Re-authentication required
        </p>
      )}

      <div className="mt-4 flex gap-2">
        {!connected ? (
          <button
            type="button"
            onClick={onConnect}
            className="flex-1 rounded-md bg-cyan px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-cyan/90"
          >
            {err ? 'Reconnect' : 'Connect'}
          </button>
        ) : (
          <button
            type="button"
            onClick={onManage}
            className="flex-1 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-[#F9FAFB]"
          >
            Manage
          </button>
        )}
      </div>
    </div>
  );
}

export function Integrations() {
  const catalogRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<IntegrationFilterTab>('all');
  const [statusById, setStatusById] = useState<Record<string, IntegrationConnectionStatus>>({});
  const [selected, setSelected] = useState<IntegrationDefinition | null>(null);

  const connectedCount = useMemo(
    () => Object.values(statusById).filter((s) => s === 'connected').length,
    [statusById],
  );
  const needsAttention = useMemo(
    () => Object.values(statusById).filter((s) => s === 'error').length,
    [statusById],
  );
  const catalogTotal = INTEGRATIONS.length;

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return INTEGRATIONS.filter((i) => {
      if (tab !== 'all' && i.filterTab !== tab) return false;
      if (!qq) return true;
      return (
        i.name.toLowerCase().includes(qq) ||
        i.shortDescription.toLowerCase().includes(qq) ||
        i.categoryLabel.toLowerCase().includes(qq)
      );
    });
  }, [q, tab]);

  const hasNoFilterResults = filtered.length === 0;

  function statusFor(id: string): IntegrationConnectionStatus {
    return statusById[id] ?? 'disconnected';
  }

  function scrollToCatalog() {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Integrations"
        subtitle="Connect your data sources, tools, and services to Commerce"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#ECFDF5]">
              <Link2 size={16} className="text-[#059669]" />
            </div>
            <p className="text-xs font-medium text-text-secondary">Connected</p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-text-primary">{connectedCount}</p>
          <p className="mt-0.5 text-xs text-text-secondary">Active integrations</p>
        </div>
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EFF6FF]">
              <Plug2 size={16} className="text-[#6366F1]" />
            </div>
            <p className="text-xs font-medium text-text-secondary">Available</p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-text-primary">{catalogTotal}</p>
          <p className="mt-0.5 text-xs text-text-secondary">In the catalog</p>
        </div>
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#FFF7ED]">
              <AlertTriangle size={16} className="text-[#D97706]" />
            </div>
            <p className="text-xs font-medium text-text-secondary">Needs attention</p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-text-primary">{needsAttention}</p>
          <p className="mt-0.5 text-xs text-text-secondary">Auth errors or expired credentials</p>
        </div>
      </div>

      {/* Search + tabs */}
      <div className="flex flex-col gap-3">
        <div className="relative max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search integrations..."
            className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
          />
        </div>
        <div className="flex flex-wrap gap-1 border-b border-[#E5E7EB] pb-px">
          {INTEGRATION_FILTER_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={[
                'rounded-t-md px-3 py-2 text-xs font-semibold transition-colors',
                tab === t.id
                  ? 'border border-b-0 border-[#E5E7EB] bg-white text-text-primary'
                  : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {connectedCount === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] bg-[#FAFAFA] py-14 text-center">
          <Plug2 size={48} className="text-text-secondary" strokeWidth={1.5} />
          <h3 className="mt-4 text-lg font-semibold text-text-primary">No integrations connected yet</h3>
          <p className="mt-2 max-w-md text-sm text-text-secondary">
            Connect a data source to start syncing contacts, or link a messaging provider to enable outreach
            channels.
          </p>
          <button
            type="button"
            onClick={scrollToCatalog}
            className="mt-6 inline-flex items-center rounded-md bg-cyan px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan/90"
          >
            Browse integrations
          </button>
        </div>
      )}

      <div ref={catalogRef} id="integration-catalog" className="scroll-mt-4">
        {hasNoFilterResults ? (
          <div className="rounded-lg border border-[#E5E7EB] bg-white py-12 text-center text-sm text-text-secondary shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
            {q.trim()
              ? 'No matches for your search'
              : 'No integrations in this category yet'}
          </div>
        ) : (
          INTEGRATION_SECTION_ORDER.map((section) => {
            const inSection = integrationsInSection(section, filtered);
            if (inSection.length === 0) return null;
            return (
              <div key={section} className="mb-8 last:mb-0">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
                  {section}
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {inSection.map((item) => (
                    <IntegrationCard
                      key={item.id}
                      item={item}
                      status={statusFor(item.id)}
                      onConnect={() => setSelected(item)}
                      onManage={() => setSelected(item)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <IntegrationsDrawer
            key={selected.id}
            integration={selected}
            status={statusFor(selected.id)}
            onClose={() => setSelected(null)}
            onSave={() => {
              setStatusById((prev) => ({ ...prev, [selected.id]: 'connected' }));
              setSelected(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
