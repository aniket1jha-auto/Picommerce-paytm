import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { MOCK_CAMPAIGNS, SUGGESTED_MEDIA_TAGS } from '@/data/mockMediaLibrary';
import { channelPillsForFile } from '@/utils/mediaChannelFit';
import type { MediaFile, MediaKind } from '@/types/mediaLibrary';
import { useMediaLibrary } from '@/context/MediaLibraryContext';

type OnUploaded = (created: MediaFile[]) => void;

const MAX_FILES = 10;
const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_VIDEO = 15 * 1024 * 1024;
const MAX_DOC = 15 * 1024 * 1024;

function guessKind(file: File): MediaKind {
  const t = file.type;
  if (t.startsWith('image/')) return 'image';
  if (t.startsWith('video/')) return 'video';
  if (t.startsWith('audio/')) return 'audio';
  return 'document';
}

function tempMediaFromFile(f: File): MediaFile {
  const kind = guessKind(f);
  return {
    id: 'temp',
    name: f.name,
    kind,
    mime: f.type || 'application/octet-stream',
    sizeBytes: f.size,
    width: kind === 'image' ? 1080 : kind === 'video' ? 1920 : undefined,
    height: kind === 'image' ? 1080 : kind === 'video' ? 1080 : undefined,
    previewUrl: '',
    cdnUrl: '',
    uploadedAt: '',
    uploadedBy: '',
    tags: [],
    usedInTemplates: [],
    usedInCampaigns: [],
    durationSec: kind === 'video' ? 12 : kind === 'audio' ? 30 : undefined,
    pageCount: kind === 'document' ? 1 : undefined,
  };
}

interface Row {
  file: File;
  id: string;
  previewUrl: string;
  progress: number;
  warn?: string;
}

function validateFile(f: File): string | undefined {
  const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
  const t = f.type;
  if (t.startsWith('audio/') || ['mp3', 'wav', 'aac', 'm4a', 'ogg', 'flac'].includes(ext)) {
    return 'Audio uploads are not supported';
  }
  if (t.startsWith('image/')) {
    if (f.size > MAX_IMAGE) return '⚠ File may not meet WhatsApp size requirements (images max 5MB)';
  } else if (t.startsWith('video/')) {
    if (f.size > MAX_VIDEO) return '⚠ File may not meet WhatsApp size requirements (videos max 15MB)';
  } else if (t === 'application/pdf' || ext === 'pdf') {
    if (f.size > MAX_DOC) return '⚠ Document exceeds 15MB batch limit';
  } else {
    return 'Unsupported file type for this upload';
  }
  return undefined;
}

function syntheticFileRow(f: File): Row {
  return {
    file: f,
    id: `${f.name}-${f.size}-${f.lastModified}`,
    previewUrl: URL.createObjectURL(f),
    progress: 100,
  };
}

export function MediaUploadDrawer({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  /** Called with new library rows after a successful batch upload */
  onUploaded?: OnUploaded;
}) {
  const { addUploadedFiles, showToast } = useMediaLibrary();
  const [rows, setRows] = useState<Row[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');
  const [campaignId, setCampaignId] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setRows((prev) => {
      prev.forEach((r) => {
        if (r.previewUrl.startsWith('blob:')) URL.revokeObjectURL(r.previewUrl);
      });
      return [];
    });
    setTags([]);
    setTagDraft('');
    setCampaignId('');
  }, []);

  const onFiles = useCallback((list: FileList | null) => {
    if (!list?.length) return;
    const arr = Array.from(list).slice(0, MAX_FILES);
    setRows((prev) => {
      const next = [...prev];
      for (const f of arr) {
        if (next.length >= MAX_FILES) break;
        const w = validateFile(f);
        next.push({ ...syntheticFileRow(f), warn: w });
      }
      return next;
    });
  }, []);

  const removeRow = (id: string) =>
    setRows((r) => {
      const row = r.find((x) => x.id === id);
      if (row?.previewUrl.startsWith('blob:')) URL.revokeObjectURL(row.previewUrl);
      return r.filter((x) => x.id !== id);
    });

  const runUpload = () => {
    if (!rows.length) return;
    const files = rows.map((r) => r.file);
    const created = addUploadedFiles(files, { tags, campaignId: campaignId || null });
    showToast(`${files.length} file(s) added to Media Library`);
    onUploaded?.(created);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" aria-modal>
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close"
          />
          <motion.aside
            className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
              <h2 className="text-lg font-semibold text-text-primary">Upload to Media Library</h2>
              <button
                type="button"
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="rounded-md p-2 text-text-secondary hover:bg-[#F3F4F6]"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-10 text-center transition-colors hover:border-cyan/50">
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.mov,.pdf,image/*,video/*"
                  className="sr-only"
                  onChange={(e) => onFiles(e.target.files)}
                />
                <Upload className="text-text-secondary" size={32} />
                <span className="mt-2 text-sm font-medium text-text-primary">
                  Drop files here or click to browse
                </span>
                <span className="mt-2 max-w-sm text-xs text-text-secondary">
                  JPG, PNG, WebP, GIF, MP4, MOV, PDF · Images max 5MB · Videos &amp; documents max 15MB ·
                  Up to {MAX_FILES} files
                </span>
              </label>

              {rows.length > 0 && (
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Files to upload
                  </p>
                  {rows.map((r) => {
                    const temp = tempMediaFromFile(r.file);
                    const pills = channelPillsForFile(temp);
                    return (
                      <div
                        key={r.id}
                        className="flex gap-3 rounded-lg border border-[#E5E7EB] bg-white p-3"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[#F3F4F6]">
                          {r.file.type.startsWith('image/') ? (
                            <img src={r.previewUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-text-secondary">
                              {r.file.name.slice(0, 4)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-text-primary">{r.file.name}</p>
                          <p className="text-xs text-text-secondary">
                            {(r.file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {pills.map((p) => (
                              <span
                                key={p}
                                className="rounded-full bg-cyan/10 px-1.5 py-0.5 text-[10px] font-medium text-cyan"
                              >
                                ✓ {p === 'WA' ? 'WhatsApp' : p === 'RCS' ? 'RCS' : p}
                              </span>
                            ))}
                          </div>
                          {r.warn && <p className="mt-1 text-[11px] text-amber-800">{r.warn}</p>}
                          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                            <div
                              className="h-full rounded-full bg-cyan transition-all"
                              style={{ width: `${r.progress}%` }}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRow(r.id)}
                          className="shrink-0 text-text-secondary hover:text-red-600"
                          aria-label="Remove"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-8 space-y-4 border-t border-[#F3F4F6] pt-6">
                <div>
                  <label className="mb-2 block text-xs font-medium text-text-secondary">Tags</label>
                  <div className="mb-2 flex flex-wrap gap-1">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs"
                      >
                        {t}
                        <button
                          type="button"
                          className="text-text-secondary hover:text-red-600"
                          onClick={() => setTags((x) => x.filter((y) => y !== t))}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tagDraft.trim()) {
                        e.preventDefault();
                        const v = tagDraft.trim().toLowerCase();
                        if (!tags.includes(v)) setTags([...tags, v]);
                        setTagDraft('');
                      }
                    }}
                    placeholder="e.g. hindi, recovery, november"
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                  />
                  <div className="mt-2 flex flex-wrap gap-1">
                    {SUGGESTED_MEDIA_TAGS.filter((s) => !tags.includes(s)).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setTags((x) => [...x, s])}
                        className="rounded-full border border-[#E5E7EB] px-2 py-0.5 text-[11px] text-text-secondary hover:border-cyan"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-text-secondary">
                    Associate with campaign (optional)
                  </label>
                  <select
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                  >
                    <option value="">None</option>
                    {MOCK_CAMPAIGNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="border-t border-[#E5E7EB] p-4">
              <button
                type="button"
                disabled={!rows.length}
                onClick={runUpload}
                className="w-full rounded-md bg-cyan py-2.5 text-sm font-medium text-white hover:bg-cyan/90 disabled:opacity-40"
              >
                Upload {rows.length || ''} {rows.length === 1 ? 'file' : 'files'}
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
