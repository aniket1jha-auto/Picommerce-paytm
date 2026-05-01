import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plug2, Search, Link2, AlertTriangle, Plus, ListChecks } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { IntegrationsDrawer } from '@/components/integrations/IntegrationsDrawer';
import {
  INTEGRATIONS,
  INTEGRATION_SECTION_ORDER,
  integrationsInSection,
  type IntegrationDefinition,
  type IntegrationConnectionStatus,
} from '@/data/integrationsCatalog';

type View = 'add' | 'existing';

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
  const [view, setView] = useState<View>('add');
  const [q, setQ] = useState('');
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

  function statusFor(id: string): IntegrationConnectionStatus {
    return statusById[id] ?? 'disconnected';
  }

  // Searchable list — used by both tabs
  const matchingQuery = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return INTEGRATIONS;
    return INTEGRATIONS.filter(
      (i) =>
        i.name.toLowerCase().includes(qq) ||
        i.shortDescription.toLowerCase().includes(qq) ||
        i.categoryLabel.toLowerCase().includes(qq),
    );
  }, [q]);

  const existingItems = useMemo(
    () =>
      matchingQuery.filter((i) => {
        const s = statusFor(i.id);
        return s === 'connected' || s === 'error';
      }),
    // statusById drives the filter; matchingQuery already covers q
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [matchingQuery, statusById],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Integrations"
        subtitle="Connect your data sources, tools, and services to Commerce"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Link2 size={16} className="text-[#059669]" />}
          iconBg="bg-[#ECFDF5]"
          label="Connected"
          value={connectedCount}
          hint="Active integrations"
        />
        <StatCard
          icon={<Plug2 size={16} className="text-[#6366F1]" />}
          iconBg="bg-[#EFF6FF]"
          label="Available"
          value={catalogTotal}
          hint="In the catalog"
        />
        <StatCard
          icon={<AlertTriangle size={16} className="text-[#D97706]" />}
          iconBg="bg-[#FFF7ED]"
          label="Needs attention"
          value={needsAttention}
          hint="Auth errors or expired credentials"
        />
      </div>

      {/* Top-level tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        <TabButton
          active={view === 'add'}
          onClick={() => setView('add')}
          icon={<Plus size={14} />}
          label="Add new integration"
        />
        <TabButton
          active={view === 'existing'}
          onClick={() => setView('existing')}
          icon={<ListChecks size={14} />}
          label={`View existing (${connectedCount + needsAttention})`}
        />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={
            view === 'add'
              ? 'Search the catalog…'
              : 'Search your connected integrations…'
          }
          className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
        />
      </div>

      {view === 'add' ? (
        <AddNewView
          items={matchingQuery}
          query={q}
          statusFor={statusFor}
          onSelect={setSelected}
        />
      ) : (
        <ExistingView
          items={existingItems}
          query={q}
          statusFor={statusFor}
          onSelect={setSelected}
          onSwitchToAdd={() => setView('add')}
        />
      )}

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

/* ─── Sub-components ────────────────────────────────────────────────────── */

function StatCard({
  icon,
  iconBg,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-md ${iconBg}`}>
          {icon}
        </div>
        <p className="text-xs font-medium text-text-secondary">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p>
      <p className="mt-0.5 text-xs text-text-secondary">{hint}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-white text-text-primary shadow-sm'
          : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function AddNewView({
  items,
  query,
  statusFor,
  onSelect,
}: {
  items: IntegrationDefinition[];
  query: string;
  statusFor: (id: string) => IntegrationConnectionStatus;
  onSelect: (i: IntegrationDefinition) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-[#E5E7EB] bg-white py-12 text-center text-sm text-text-secondary shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
        {query.trim()
          ? `No integrations match "${query}"`
          : 'No integrations in the catalog yet'}
      </div>
    );
  }

  return (
    <div>
      {INTEGRATION_SECTION_ORDER.map((section) => {
        const inSection = integrationsInSection(section, items);
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
                  onConnect={() => onSelect(item)}
                  onManage={() => onSelect(item)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExistingView({
  items,
  query,
  statusFor,
  onSelect,
  onSwitchToAdd,
}: {
  items: IntegrationDefinition[];
  query: string;
  statusFor: (id: string) => IntegrationConnectionStatus;
  onSelect: (i: IntegrationDefinition) => void;
  onSwitchToAdd: () => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] bg-[#FAFAFA] py-14 text-center">
        <Plug2 size={48} className="text-text-secondary" strokeWidth={1.5} />
        <h3 className="mt-4 text-lg font-semibold text-text-primary">
          {query.trim() ? 'No matches in your existing integrations' : 'Nothing connected yet'}
        </h3>
        <p className="mt-2 max-w-md text-sm text-text-secondary">
          {query.trim()
            ? `Try a different search, or browse the catalog to add a new integration.`
            : 'Connect a data source to start syncing contacts, or link a messaging provider to enable outreach channels.'}
        </p>
        <button
          type="button"
          onClick={onSwitchToAdd}
          className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-cyan px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan/90"
        >
          <Plus size={14} />
          Add new integration
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <IntegrationCard
          key={item.id}
          item={item}
          status={statusFor(item.id)}
          onConnect={() => onSelect(item)}
          onManage={() => onSelect(item)}
        />
      ))}
    </div>
  );
}
