import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import type { MediaFile, MediaKind, MediaPickerRole } from '@/types/mediaLibrary';
import { fileMatchesPickerRole, formatBytes } from '@/utils/mediaChannelFit';
import { channelPillsForFile } from '@/utils/mediaChannelFit';
import { useMediaLibrary } from '@/context/MediaLibraryContext';

type FilterTab = 'all' | MediaKind;

export function MediaPickerModal({
  open,
  onClose,
  role,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  role: MediaPickerRole;
  onSelect: (file: MediaFile) => void;
}) {
  const { files } = useMediaLibrary();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<FilterTab>('all');

  const rows = useMemo(() => {
    return files.map((f) => ({ f, ...fileMatchesPickerRole(f, role) }));
  }, [files, role]);

  const filtered = useMemo(() => {
    return rows.filter(({ f }) => {
      if (tab !== 'all' && f.kind !== tab) return false;
      if (q.trim()) {
        const n = `${f.name} ${f.tags.join(' ')}`.toLowerCase();
        if (!n.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, tab, q]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
              <h2 className="text-lg font-semibold text-text-primary">Select from Media Library</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-text-secondary hover:bg-[#F3F4F6]"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="border-b border-[#F3F4F6] px-5 py-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="e.g. 'Hindi recovery image' or 'blue banner'"
                  className="w-full rounded-lg border border-[#E5E7EB] py-2 pl-9 pr-3 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {(['all', 'image', 'video', 'document', 'audio'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={[
                      'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                      tab === t
                        ? 'bg-cyan text-white'
                        : 'bg-[#F3F4F6] text-text-secondary hover:text-text-primary',
                    ].join(' ')}
                  >
                    {t === 'all'
                      ? 'All compatible'
                      : t === 'audio'
                        ? 'Audio'
                        : t === 'document'
                          ? 'Documents'
                          : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {filtered.map(({ f, compatible: ok, reason }) => {
                  const reasonText = reason;
                  return (
                    <button
                    key={f.id}
                    type="button"
                    disabled={!ok}
                    title={!ok ? reasonText : undefined}
                    onClick={() => {
                      onSelect(f);
                      onClose();
                    }}
                    className={[
                      'group relative overflow-hidden rounded-lg bg-white text-left ring-1 ring-[#E5E7EB] transition-all',
                      ok
                        ? 'hover:ring-2 hover:ring-cyan hover:shadow-md'
                        : 'cursor-not-allowed opacity-45 grayscale',
                    ].join(' ')}
                  >
                    <div className="aspect-square bg-[#F3F4F6]">
                      {f.kind === 'image' && (
                        <img src={f.previewUrl} alt="" className="h-full w-full object-cover" />
                      )}
                      {f.kind === 'video' && (
                        <div className="relative h-full w-full">
                          <img src={f.previewUrl} alt="" className="h-full w-full object-cover" />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-2xl text-white">
                            ▶
                          </span>
                          {f.durationSec != null && (
                            <span className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                              {Math.floor(f.durationSec / 60)}:{String(f.durationSec % 60).padStart(2, '0')}
                            </span>
                          )}
                        </div>
                      )}
                      {f.kind === 'document' && (
                        <div className="flex h-full flex-col items-center justify-center gap-1 p-2">
                          <span className="text-3xl">📄</span>
                          <span className="text-[10px] text-text-secondary">
                            {f.pageCount ?? 1} pg
                          </span>
                        </div>
                      )}
                      {f.kind === 'audio' && (
                        <div className="flex h-full items-center justify-center text-3xl">🎵</div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="truncate text-xs font-medium text-text-primary">{f.name}</p>
                      <p className="text-[10px] text-text-secondary">
                        {formatBytes(f.sizeBytes)}
                        {f.width && f.height ? ` · ${f.width}×${f.height}` : ''}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-0.5">
                        {channelPillsForFile(f).map((p) => (
                          <span
                            key={p}
                            className="rounded bg-cyan/10 px-1 py-px text-[9px] font-medium text-cyan"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                      {!ok && reasonText && (
                        <p className="mt-1 line-clamp-2 text-[9px] text-amber-800">{reasonText}</p>
                      )}
                    </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
