import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { MediaFile, MediaKind } from '@/types/mediaLibrary';
import { MOCK_MEDIA_FILES } from '@/data/mockMediaLibrary';

let idCounter = 9000;

function guessKind(file: File): MediaKind {
  const t = file.type;
  if (t.startsWith('image/')) return 'image';
  if (t.startsWith('video/')) return 'video';
  if (t.startsWith('audio/')) return 'audio';
  return 'document';
}

function fileFromUpload(
  file: File,
  opts: { tags: string[]; campaignId: string | null },
  objectUrl: string,
): MediaFile {
  const kind = guessKind(file);
  const id = `med_${Date.now()}_${idCounter++}`;
  return {
    id,
    name: file.name,
    kind,
    mime: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    previewUrl: objectUrl,
    cdnUrl: `https://cdn.example.com/med/${encodeURIComponent(file.name)}`,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'You',
    tags: opts.tags,
    campaignId: opts.campaignId,
    usedInTemplates: [],
    usedInCampaigns: [],
    durationSec: kind === 'video' ? 12 : kind === 'audio' ? 30 : undefined,
    width: kind === 'image' ? 1080 : kind === 'video' ? 1280 : undefined,
    height: kind === 'image' ? 1080 : kind === 'video' ? 720 : undefined,
    pageCount: kind === 'document' ? 1 : undefined,
  };
}

interface MediaLibraryContextValue {
  files: MediaFile[];
  addUploadedFiles: (
    files: File[],
    meta: { tags: string[]; campaignId: string | null },
  ) => MediaFile[];
  updateFile: (id: string, patch: Partial<MediaFile>) => void;
  deleteFile: (id: string) => void;
  replaceFile: (id: string, file: File) => void;
  attachAssetToTemplate: (assetId: string, templateName: string) => void;
  toast: string | null;
  showToast: (msg: string, ms?: number) => void;
  copyUrl: (url: string) => void;
}

const MediaLibraryContext = createContext<MediaLibraryContextValue | null>(null);

export function MediaLibraryProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<MediaFile[]>(() => [...MOCK_MEDIA_FILES]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string, ms = 2200) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), ms);
  }, []);

  const copyUrl = useCallback(
    (url: string) => {
      void navigator.clipboard.writeText(url).then(() => showToast('Copied!', 2000));
    },
    [showToast],
  );

  const addUploadedFiles = useCallback(
    (uploaded: File[], meta: { tags: string[]; campaignId: string | null }): MediaFile[] => {
      const created: MediaFile[] = [];
      setFiles((prev) => {
        const next = [...prev];
        for (const f of uploaded) {
          const url = URL.createObjectURL(f);
          const row = fileFromUpload(f, meta, url);
          created.push(row);
          next.unshift(row);
        }
        return next;
      });
      return created;
    },
    [],
  );

  const updateFile = useCallback((id: string, patch: Partial<MediaFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const replaceFile = useCallback((id: string, file: File) => {
    const url = URL.createObjectURL(file);
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        try {
          if (f.previewUrl.startsWith('blob:')) URL.revokeObjectURL(f.previewUrl);
        } catch {
          /* ignore */
        }
        return {
          ...f,
          name: file.name,
          kind: guessKind(file),
          mime: file.type || f.mime,
          sizeBytes: file.size,
          previewUrl: url,
          cdnUrl: `https://cdn.example.com/med/${encodeURIComponent(file.name)}`,
          uploadedAt: new Date().toISOString(),
        };
      }),
    );
  }, []);

  const attachAssetToTemplate = useCallback((assetId: string, templateName: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== assetId) return f;
        const exists = f.usedInTemplates.some((t) => t.name === templateName);
        if (exists) return f;
        return {
          ...f,
          usedInTemplates: [
            ...f.usedInTemplates,
            { id: `tpl_${templateName}`, name: templateName },
          ],
        };
      }),
    );
  }, []);

  const value = useMemo(
    () => ({
      files,
      addUploadedFiles,
      updateFile,
      deleteFile,
      replaceFile,
      attachAssetToTemplate,
      toast,
      showToast,
      copyUrl,
    }),
    [files, addUploadedFiles, updateFile, deleteFile, replaceFile, attachAssetToTemplate, toast, showToast, copyUrl],
  );

  return (
    <MediaLibraryContext.Provider value={value}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </MediaLibraryContext.Provider>
  );
}

export function useMediaLibrary() {
  const ctx = useContext(MediaLibraryContext);
  if (!ctx) throw new Error('useMediaLibrary must be used within MediaLibraryProvider');
  return ctx;
}

export function useMediaLibraryOptional() {
  return useContext(MediaLibraryContext);
}
