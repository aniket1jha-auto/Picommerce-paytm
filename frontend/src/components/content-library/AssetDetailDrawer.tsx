import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download, Trash2, RefreshCw } from 'lucide-react';
import type { MediaFile } from '@/types/mediaLibrary';
import { channelFitTable, formatBytes, kindLabel } from '@/utils/mediaChannelFit';
import { useMediaLibrary } from '@/context/MediaLibraryContext';
import { MOCK_CAMPAIGNS } from '@/data/mockMediaLibrary';

function StatusCell({ status }: { status: 'ok' | 'warn' | 'na' }) {
  if (status === 'ok') return <span className="text-emerald-600">✓ Compatible</span>;
  if (status === 'warn') return <span className="text-amber-700">⚠ Check</span>;
  return <span className="text-text-secondary">— Not applicable</span>;
}

export function AssetDetailDrawer({
  file,
  open,
  onClose,
}: {
  file: MediaFile | null;
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { updateFile, deleteFile, replaceFile, copyUrl, showToast } = useMediaLibrary();
  const [name, setName] = useState(file?.name ?? '');
  const [tags, setTags] = useState<string[]>(file?.tags ?? []);
  const [tagDraft, setTagDraft] = useState('');
  const [campaignId, setCampaignId] = useState(file?.campaignId ?? '');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);

  useEffect(() => {
    if (file) {
      setName(file.name);
      setTags(file.tags);
      setCampaignId(file.campaignId ?? '');
      setDeleteOpen(false);
      setReplaceOpen(false);
    }
  }, [file]);

  const usedCount =
    (file?.usedInTemplates.length ?? 0) + (file?.usedInCampaigns.length ?? 0);

  const handleReplace = (input: HTMLInputElement | null) => {
    const f = input?.files?.[0];
    if (!f || !file) return;
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (f.type.startsWith('audio/') || ['mp3', 'wav', 'aac', 'm4a', 'ogg', 'flac'].includes(ext)) {
      showToast('Audio files are not supported');
      return;
    }
    replaceFile(file.id, f);
    setName(f.name);
    setReplaceOpen(false);
    showToast('Asset replaced across all references');
  };

  return (
    <AnimatePresence>
      {open && file && (
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
            className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#E5E7EB] px-5 py-4">
              <div className="min-w-0 flex-1">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => name.trim() && updateFile(file.id, { name: name.trim() })}
                  className="w-full border-0 bg-transparent text-lg font-semibold text-text-primary focus:ring-0"
                />
                <span className="mt-1 inline-block rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs font-medium text-text-secondary">
                  {kindLabel(file.kind)}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-text-secondary hover:bg-[#F3F4F6]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              <div className="overflow-hidden rounded-lg bg-[#0F172A] ring-1 ring-[#E5E7EB]">
                {file.kind === 'image' && (
                  <img
                    src={file.previewUrl}
                    alt=""
                    className="max-h-64 w-full object-contain transition-transform hover:scale-[1.02]"
                  />
                )}
                {file.kind === 'video' && (
                  <div className="relative">
                    <img
                      src={file.previewUrl}
                      alt=""
                      className="max-h-64 w-full object-cover opacity-95"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45">
                      <span className="text-4xl text-white">▶</span>
                      <p className="mt-2 px-4 text-center text-[11px] text-white/80">
                        Thumbnail preview — full player in production
                      </p>
                    </div>
                  </div>
                )}
                {file.kind === 'document' && (
                  <div className="flex flex-col items-center gap-2 py-10 text-white/80">
                    <span className="text-4xl">📄</span>
                    <p className="text-sm">{file.pageCount ?? 1} pages</p>
                    <a
                      href={file.cdnUrl}
                      className="text-xs text-cyan underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open full document
                    </a>
                  </div>
                )}
                {file.kind === 'audio' && (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <div className="flex h-12 items-end gap-0.5">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 rounded-sm bg-cyan/80"
                          style={{ height: `${12 + ((i * 17) % 36)}px` }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      className="rounded-full border border-white/30 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/10"
                    >
                      Play (simulation)
                    </button>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                  Metadata
                </p>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-text-secondary">Size</dt>
                  <dd className="font-medium text-text-primary">{formatBytes(file.sizeBytes)}</dd>
                  <dt className="text-text-secondary">Format</dt>
                  <dd className="font-medium text-text-primary">{file.mime}</dd>
                  {(file.width || file.height) && (
                    <>
                      <dt className="text-text-secondary">Dimensions</dt>
                      <dd className="font-medium text-text-primary">
                        {file.width}×{file.height}
                      </dd>
                    </>
                  )}
                  {file.durationSec != null && (
                    <>
                      <dt className="text-text-secondary">Duration</dt>
                      <dd className="font-medium text-text-primary">{file.durationSec}s</dd>
                    </>
                  )}
                  <dt className="text-text-secondary">Uploaded</dt>
                  <dd className="font-medium text-text-primary">
                    {file.uploadedBy} · {new Date(file.uploadedAt).toLocaleDateString()}
                  </dd>
                </dl>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                  Tags
                </p>
                <div className="mb-2 flex flex-wrap gap-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => {
                          const next = tags.filter((x) => x !== t);
                          setTags(next);
                          updateFile(file.id, { tags: next });
                        }}
                        className="text-text-secondary hover:text-red-600"
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
                      const v = tagDraft.trim();
                      if (!tags.includes(v)) {
                        const next = [...tags, v];
                        setTags(next);
                        updateFile(file.id, { tags: next });
                      }
                      setTagDraft('');
                    }
                  }}
                  placeholder="Add tag, Enter"
                  className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                />
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                  Campaign association
                </p>
                <select
                  value={campaignId ?? ''}
                  onChange={(e) => {
                    const v = e.target.value || null;
                    setCampaignId(v ?? '');
                    updateFile(file.id, { campaignId: v });
                  }}
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

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                  Channel fit
                </p>
                <div className="overflow-hidden rounded-lg ring-1 ring-[#E5E7EB]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F9FAFB] text-text-secondary">
                      <tr>
                        <th className="px-3 py-2 font-medium">Channel</th>
                        <th className="px-3 py-2 font-medium">Requirement</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB] bg-white">
                      {channelFitTable(file).map((row) => (
                        <tr key={row.id}>
                          <td className="px-3 py-2 font-medium text-text-primary">{row.channel}</td>
                          <td className="px-3 py-2 text-text-secondary">{row.requirement}</td>
                          <td className="px-3 py-2">
                            <StatusCell status={row.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                  Used in
                </p>
                {usedCount === 0 ? (
                  <p className="text-sm text-text-secondary">
                    This file hasn&apos;t been used yet.{' '}
                    <Link
                      to="/content-library/templates/new"
                      state={{ prefillAssetId: file.id }}
                      className="font-medium text-cyan hover:underline"
                    >
                      Use in a template →
                    </Link>
                  </p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {file.usedInTemplates.map((t) => (
                      <li key={t.id}>
                        <Link
                          to="/content-library"
                          className="font-medium text-cyan hover:underline"
                        >
                          Template: {t.name}
                        </Link>
                      </li>
                    ))}
                    {file.usedInCampaigns.map((c) => (
                      <li key={c.id}>
                        <Link to="/campaigns" className="font-medium text-cyan hover:underline">
                          Campaign: {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-2 border-t border-[#E5E7EB] p-4">
              <button
                type="button"
                onClick={() => copyUrl(file.cdnUrl)}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-[#E5E7EB] py-2 text-sm font-medium text-text-primary hover:bg-[#F9FAFB]"
              >
                <Copy size={16} />
                Copy file URL
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate('/content-library/templates/new', {
                    state: { prefillAssetId: file.id },
                  })
                }
                className="w-full rounded-md bg-cyan py-2 text-sm font-medium text-white hover:bg-cyan/90"
              >
                Use in template
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1 rounded-md border border-[#E5E7EB] py-2 text-sm hover:bg-[#F9FAFB]"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setReplaceOpen(true)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-md border border-[#E5E7EB] py-2 text-sm hover:bg-[#F9FAFB]"
                >
                  <RefreshCw size={16} />
                  Replace
                </button>
              </div>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-red-200 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>

            {replaceOpen && (
              <div className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                <p className="mb-2 font-medium">Replace file</p>
                <p className="mb-2">
                  Replacing will update this asset in all templates and campaigns using it. Old
                  version cannot be recovered.
                </p>
                <input
                  type="file"
                  className="text-xs"
                  onChange={(e) => handleReplace(e.currentTarget)}
                />
                <button
                  type="button"
                  className="mt-2 text-cyan underline"
                  onClick={() => setReplaceOpen(false)}
                >
                  Cancel
                </button>
              </div>
            )}

            {deleteOpen && (
              <div className="border-t border-red-200 bg-red-50 px-4 py-3 text-xs text-red-900">
                <p className="mb-2 font-medium">Delete this file?</p>
                {usedCount > 0 && (
                  <p className="mb-2">This file is used in {usedCount} place(s). Active templates may break.</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-md bg-red-600 px-3 py-1.5 text-white"
                    onClick={() => {
                      deleteFile(file.id);
                      onClose();
                    }}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-red-200 px-3 py-1.5"
                    onClick={() => setDeleteOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
