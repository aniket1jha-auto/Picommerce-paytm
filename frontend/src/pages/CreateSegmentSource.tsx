import { Link } from 'react-router-dom';
import { Filter, Upload, Check, Info } from 'lucide-react';
import { usePhaseData } from '@/hooks/usePhaseData';

function sourceInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || '—';
}

export function CreateSegmentSource() {
  const { dataSources } = usePhaseData();
  const connected = dataSources.filter((d) => d.status === 'connected' || d.recordCount != null);
  const showSources = connected.length > 0 ? connected : dataSources;
  const top3 = showSources.slice(0, 3);
  const more = Math.max(0, showSources.length - 3);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <Link
        to="/audiences"
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-cyan hover:underline"
      >
        ← Audiences
      </Link>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-text-primary">How do you want to build this segment?</h1>
          <p className="mt-2 text-sm text-text-secondary">Choose your data source to get started</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Card A */}
          <div className="flex flex-col rounded-xl border border-[#E5E7EB] bg-white p-8 shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EFF6FF]">
              <Filter size={26} className="text-[#3B82F6]" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-text-primary">Filter synced contacts</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Build a segment by filtering contacts already synced from your connected data sources. Supports dynamic
              refresh and advanced conditions.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-text-secondary">
              {[
                'AND / OR condition builder',
                'Auto-refreshing dynamic segments',
                'Channel reachability preview',
                'Works with all connected sources',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-[#059669]" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 border-t border-[#F3F4F6] pt-6">
              <p className="text-xs text-text-secondary">Works with connected data sources</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {top3.map((ds) => (
                  <div
                    key={ds.id}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF2FF] text-[10px] font-bold text-[#6366F1]"
                    title={ds.name}
                  >
                    {sourceInitials(ds.name)}
                  </div>
                ))}
                {more > 0 && (
                  <span className="text-xs font-medium text-text-secondary">+ {more} more sources</span>
                )}
                {showSources.length === 0 && (
                  <span className="text-xs text-text-secondary">Connect sources in Integrations</span>
                )}
              </div>
            </div>
            <Link
              to="/audiences/segments/new/filters"
              className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-cyan py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan/90"
            >
              Build with filters →
            </Link>
          </div>

          {/* Card B */}
          <div className="flex flex-col rounded-xl border border-[#E5E7EB] bg-white p-8 shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F0FDF4]">
              <Upload size={26} className="text-[#059669]" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-text-primary">Import a fixed list</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Upload a CSV file to create a static segment from a specific list of contacts. No data source required.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <Check size={16} className="mt-0.5 shrink-0 text-[#059669]" />
                Quick one-time imports
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="mt-0.5 shrink-0 text-[#059669]" />
                PII field mapping with encryption
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="mt-0.5 shrink-0 text-[#059669]" />
                Download sample template
              </li>
              <li className="flex items-start gap-2 text-text-secondary/80">
                <span className="mt-0.5 inline-flex w-4 justify-center text-red-500">✗</span>
                Does not auto-refresh (static only)
              </li>
              <li className="flex items-start gap-2 text-text-secondary/80">
                <span className="mt-0.5 inline-flex w-4 justify-center text-red-500">✗</span>
                Rule builder not available
              </li>
            </ul>
            <div className="mt-8 border-t border-[#F3F4F6] pt-6">
              <p className="text-xs text-text-secondary">Accepted: .csv · Max 10MB</p>
            </div>
            <Link
              to="/audiences/segments/new/csv"
              className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-cyan py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan/90"
            >
              Upload a file →
            </Link>
          </div>
        </div>

        <p className="mx-auto mt-10 flex max-w-xl items-start justify-center gap-2 text-center text-xs text-text-secondary">
          <Info size={14} className="mt-0.5 shrink-0 text-text-secondary" />
          <span>
            Not sure which to use? If your contacts are already synced via Integrations, use filters. If you have a
            one-off list from a spreadsheet, upload a CSV.
          </span>
        </p>
      </div>
    </div>
  );
}
