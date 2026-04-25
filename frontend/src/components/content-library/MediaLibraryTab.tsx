import { useMemo, useState } from 'react';
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  Image as ImageIcon,
  Video,
  FileText,
  Eye,
  Pencil,
  Trash2,
  Copy,
} from 'lucide-react';
import type { MediaFile, MediaKind } from '@/types/mediaLibrary';
import { useMediaLibrary } from '@/context/MediaLibraryContext';
import { STORAGE_QUOTA_BYTES, STORAGE_USED_BYTES } from '@/data/mockMediaLibrary';
import { channelPillsForFile, formatBytes, kindLabel } from '@/utils/mediaChannelFit';
import { MediaUploadDrawer } from '@/components/content-library/MediaUploadDrawer';
import { AssetDetailDrawer } from '@/components/content-library/AssetDetailDrawer';

type TypeTab = 'all' | MediaKind;
type UsedFilter = 'all' | 'templates' | 'campaigns' | 'unused';
type SortKey = 'newest' | 'oldest' | 'az' | 'largest' | 'used';

function usageScore(f: MediaFile): number {
  return f.usedInTemplates.length + f.usedInCampaigns.length;
}

export function MediaLibraryTab() {
  const { files, deleteFile, copyUrl, updateFile } = useMediaLibrary();
  const [q, setQ] = useState('');
  const [typeTab, setTypeTab] = useState<TypeTab>('all');
  const [usedFilter, setUsedFilter] = useState<UsedFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailFile, setDetailFile] = useState<MediaFile | null>(null);

  const stats = useMemo(() => {
    const images = files.filter((f) => f.kind === 'image').length;
    const videos = files.filter((f) => f.kind === 'video').length;
    const documents = files.filter((f) => f.kind === 'document').length;
    return { total: files.length, images, videos, documents };
  }, [files]);

  const usedBytes = STORAGE_USED_BYTES;
  const pct = Math.round((usedBytes / STORAGE_QUOTA_BYTES) * 100);

  const filtered = useMemo(() => {
    let list = [...files];
    if (typeTab !== 'all') list = list.filter((f) => f.kind === typeTab);
    if (usedFilter === 'templates') list = list.filter((f) => f.usedInTemplates.length > 0);
    if (usedFilter === 'campaigns') list = list.filter((f) => f.usedInCampaigns.length > 0);
    if (usedFilter === 'unused') list = list.filter((f) => usageScore(f) === 0);
    if (q.trim()) {
      const n = q.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(n) ||
          f.tags.some((t) => t.toLowerCase().includes(n)),
      );
    }
    list.sort((a, b) => {
      if (sortKey === 'newest')
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      if (sortKey === 'oldest')
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      if (sortKey === 'az') return a.name.localeCompare(b.name);
      if (sortKey === 'largest') return b.sizeBytes - a.sizeBytes;
      if (sortKey === 'used') return usageScore(b) - usageScore(a);
      return 0;
    });
    return list;
  }, [files, typeTab, usedFilter, q, sortKey]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Media Library</h2>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">
          All images, videos, and documents used across your templates and campaigns — in one place
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total files', value: stats.total, icon: FileText, color: '#06B6D4' },
          { label: 'Images', value: stats.images, icon: ImageIcon, color: '#8B5CF6' },
          { label: 'Videos', value: stats.videos, icon: Video, color: '#F59E0B' },
          { label: 'Documents', value: stats.documents, icon: FileText, color: '#10B981' },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]"
          >
            <div className="mb-2 flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${c.color}18` }}
              >
                <c.icon size={16} style={{ color: c.color }} />
              </div>
              <span className="text-xs text-text-secondary">{c.label}</span>
            </div>
            <div className="text-2xl font-bold text-text-primary">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white px-4 py-3 ring-1 ring-[#E5E7EB]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-text-secondary">
            {(usedBytes / (1024 * 1024 * 1024)).toFixed(1)} GB used of{' '}
            {(STORAGE_QUOTA_BYTES / (1024 * 1024 * 1024)).toFixed(0)} GB
          </span>
          <span className="text-xs font-medium text-text-secondary">{pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
          <div className="h-full rounded-full bg-cyan transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-white p-4 ring-1 ring-[#E5E7EB] lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. 'Hindi recovery image' or 'blue banner'"
              className="w-full rounded-lg border border-[#E5E7EB] py-2 pl-9 pr-3 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            />
          </div>
          <p className="text-[11px] text-text-secondary">
            Search matches file names and tags (natural-language style queries work best when tags
            align).
          </p>
          <div className="flex flex-wrap gap-2">
            {(['all', 'image', 'video', 'document', 'audio'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeTab(t)}
                className={[
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  typeTab === t
                    ? 'bg-cyan text-white'
                    : 'bg-[#F3F4F6] text-text-secondary hover:text-text-primary',
                ].join(' ')}
              >
                {t === 'all'
                  ? 'All'
                  : t === 'audio'
                    ? 'Audio'
                    : t === 'document'
                      ? 'Documents'
                      : `${t.charAt(0).toUpperCase() + t.slice(1)}s`}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={usedFilter}
              onChange={(e) => setUsedFilter(e.target.value as UsedFilter)}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-medium text-text-primary"
            >
              <option value="all">All files</option>
              <option value="templates">Used in templates</option>
              <option value="campaigns">Used in campaigns</option>
              <option value="unused">Unused (never referenced)</option>
            </select>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-medium text-text-primary"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="az">A–Z</option>
              <option value="largest">Largest</option>
              <option value="used">Most used</option>
            </select>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex rounded-lg border border-[#E5E7EB] p-0.5">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={[
                'rounded-md p-2',
                view === 'grid' ? 'bg-cyan/10 text-cyan' : 'text-text-secondary hover:bg-gray-50',
              ].join(' ')}
              aria-label="Grid view"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={[
                'rounded-md p-2',
                view === 'list' ? 'bg-cyan/10 text-cyan' : 'text-text-secondary hover:bg-gray-50',
              ].join(' ')}
              aria-label="List view"
            >
              <List size={18} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-cyan px-4 py-2 text-sm font-medium text-white hover:bg-cyan/90"
          >
            <Plus size={18} strokeWidth={2.5} />
            Upload Files
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((f) => (
            <div
              key={f.id}
              className="group relative overflow-hidden rounded-lg bg-white text-left ring-1 ring-[#E5E7EB] transition-all duration-200 hover:ring-2 hover:ring-cyan hover:shadow-md"
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setDetailFile(f)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setDetailFile(f);
                  }
                }}
                className="block w-full cursor-pointer text-left"
              >
                <div className="aspect-[4/3] bg-[#F3F4F6]">
                  {f.kind === 'image' && (
                    <img src={f.previewUrl} alt="" className="h-full w-full object-cover" />
                  )}
                  {f.kind === 'video' && (
                    <div className="relative h-full w-full">
                      <img src={f.previewUrl} alt="" className="h-full w-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-3xl text-white">
                        ▶
                      </span>
                      {f.durationSec != null && (
                        <span className="absolute right-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
                          {Math.floor(f.durationSec / 60)}:{String(f.durationSec % 60).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  )}
                  {f.kind === 'document' && (
                    <div className="flex h-full flex-col items-center justify-center gap-1">
                      <span className="text-4xl">📄</span>
                      <span className="text-[11px] text-text-secondary">{f.pageCount ?? 1} pages</span>
                    </div>
                  )}
                  {f.kind === 'audio' && (
                    <div className="flex h-full items-center justify-center text-4xl">🎵</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-text-primary">{f.name}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {formatBytes(f.sizeBytes)}
                    {f.width && f.height ? ` · ${f.width}×${f.height}` : ''}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {channelPillsForFile(f).map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-cyan/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan"
                      >
                        {p === 'WA' ? 'WA' : p === 'RCS' ? 'RCS' : p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-black/0 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:bg-black/40 group-hover:opacity-100">
                <div />
                <div className="flex justify-center gap-2 pb-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailFile(f);
                    }}
                    className="rounded-full bg-white/95 p-2 text-text-primary shadow hover:bg-white"
                    title="Preview"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = window.prompt('Rename file', f.name);
                      if (next?.trim()) updateFile(f.id, { name: next.trim() });
                    }}
                    className="rounded-full bg-white/95 p-2 text-text-primary shadow hover:bg-white"
                    title="Rename"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete ${f.name}?`)) deleteFile(f.id);
                    }}
                    className="rounded-full bg-white/95 p-2 text-red-600 shadow hover:bg-white"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="px-3 pb-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyUrl(f.cdnUrl);
                    }}
                    className="w-full rounded-md bg-white py-1.5 text-xs font-medium text-text-primary shadow"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white ring-1 ring-[#E5E7EB]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-xs font-medium text-text-secondary">
              <tr>
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Dimensions</th>
                <th className="px-4 py-3">Used in</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-[#F9FAFB]">
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => setDetailFile(f)}
                      className="block h-12 w-12 overflow-hidden rounded-md bg-[#F3F4F6] ring-1 ring-[#E5E7EB]"
                    >
                      {f.kind === 'image' ? (
                        <img src={f.previewUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-lg">
                          {f.kind === 'video' ? '🎬' : f.kind === 'document' ? '📄' : '🎵'}
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="max-w-[140px] truncate px-4 py-2 font-medium text-text-primary">
                    {f.name}
                  </td>
                  <td className="px-4 py-2 text-text-secondary">{kindLabel(f.kind)}</td>
                  <td className="px-4 py-2 text-text-secondary">{formatBytes(f.sizeBytes)}</td>
                  <td className="px-4 py-2 text-text-secondary">
                    {f.width && f.height ? `${f.width}×${f.height}` : '—'}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {[
                        ...f.usedInTemplates.map((t) => ({ id: `t-${t.id}`, label: t.name })),
                        ...f.usedInCampaigns.map((c) => ({ id: `c-${c.id}`, label: c.name })),
                      ]
                        .slice(0, 2)
                        .map((t) => (
                          <span
                            key={t.id}
                            className="rounded-full bg-cyan/10 px-2 py-0.5 text-[10px] font-medium text-cyan"
                          >
                            {t.label}
                          </span>
                        ))}
                      {usageScore(f) > 2 && (
                        <span className="text-[10px] text-text-secondary">+{usageScore(f) - 2} more</span>
                      )}
                      {usageScore(f) === 0 && (
                        <span className="text-[10px] text-text-secondary">—</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-xs text-text-secondary">
                    {new Date(f.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => copyUrl(f.cdnUrl)}
                      className="text-cyan hover:underline"
                    >
                      <Copy size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MediaUploadDrawer open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <AssetDetailDrawer file={detailFile} open={!!detailFile} onClose={() => setDetailFile(null)} />
    </div>
  );
}
