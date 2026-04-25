import type { MediaFile, MediaKind, MediaPickerRole } from '@/types/mediaLibrary';

export type ChannelPill = 'WA' | 'RCS' | 'SMS';

export interface ChannelFitRow {
  id: string;
  channel: string;
  requirement: string;
  status: 'ok' | 'warn' | 'na';
  detail?: string;
}

function extOf(f: MediaFile): string {
  return f.name.split('.').pop()?.toLowerCase() ?? '';
}

export function channelPillsForFile(f: MediaFile): ChannelPill[] {
  const pills: ChannelPill[] = [];
  if (f.kind === 'image') {
    if (f.sizeBytes <= 5 * 1024 * 1024) pills.push('WA');
    if (f.sizeBytes <= 1 * 1024 * 1024 && ['jpg', 'jpeg', 'png', 'webp'].includes(extOf(f))) {
      pills.push('RCS');
    }
  }
  if (f.kind === 'video' && f.sizeBytes <= 15 * 1024 * 1024 && ['mp4', 'mov'].includes(extOf(f))) {
    pills.push('WA');
    pills.push('RCS');
  }
  if (f.kind === 'document' && extOf(f) === 'pdf') pills.push('WA');
  if (f.kind === 'audio' && ['mp3', 'm4a'].includes(extOf(f))) pills.push('WA');
  // SMS: no rich media in our model
  return [...new Set(pills)];
}

export function channelFitTable(f: MediaFile): ChannelFitRow[] {
  const ext = extOf(f);
  const rows: ChannelFitRow[] = [];

  const waImgOk =
    f.kind === 'image' &&
    ['jpg', 'jpeg', 'png'].includes(ext) &&
    f.sizeBytes <= 5 * 1024 * 1024;
  rows.push({
    id: 'wa-h-img',
    channel: 'WhatsApp Header Image',
    requirement: 'JPG/PNG, max 5MB, recommended 800×418px',
    status: waImgOk ? 'ok' : f.kind === 'image' ? 'warn' : 'na',
    detail: waImgOk ? undefined : f.kind !== 'image' ? 'Not an image' : 'Check size / format',
  });

  const waVidOk =
    f.kind === 'video' && ['mp4', 'mov'].includes(ext) && f.sizeBytes <= 15 * 1024 * 1024;
  rows.push({
    id: 'wa-h-vid',
    channel: 'WhatsApp Header Video',
    requirement: 'MP4/MOV, max 15MB, max 30s',
    status: waVidOk ? 'ok' : f.kind === 'video' ? 'warn' : 'na',
    detail: waVidOk ? undefined : f.kind !== 'video' ? 'Not a video' : 'Check size / format',
  });

  const waDocOk = f.kind === 'document' && ext === 'pdf';
  rows.push({
    id: 'wa-h-doc',
    channel: 'WhatsApp Header Document',
    requirement: 'PDF · max 100MB',
    status: waDocOk ? 'ok' : f.kind === 'document' ? 'warn' : 'na',
    detail: waDocOk ? undefined : 'Not a PDF',
  });

  const rcsImgOk =
    f.kind === 'image' &&
    ['jpg', 'jpeg', 'png', 'webp'].includes(ext) &&
    f.sizeBytes <= 1 * 1024 * 1024;
  rows.push({
    id: 'rcs-card',
    channel: 'RCS Rich Card Image',
    requirement: 'JPG/PNG, max 1MB',
    status: rcsImgOk ? 'ok' : f.kind === 'image' ? 'warn' : 'na',
    detail: rcsImgOk ? undefined : f.kind !== 'image' ? 'Not an image' : 'File too large for RCS card (max 1MB)',
  });

  rows.push({
    id: 'sms',
    channel: 'SMS',
    requirement: 'No media support',
    status: 'na',
  });

  return rows;
}

export interface PickerFilterResult {
  compatible: boolean;
  reason?: string;
}

export function fileMatchesPickerRole(f: MediaFile, role: MediaPickerRole): PickerFilterResult {
  const ext = extOf(f);
  switch (role) {
    case 'whatsapp_header_image':
      if (f.kind !== 'image') return { compatible: false, reason: 'Not an image file' };
      if (!['jpg', 'jpeg', 'png'].includes(ext))
        return { compatible: false, reason: 'WhatsApp headers need JPG or PNG' };
      if (f.sizeBytes > 5 * 1024 * 1024)
        return { compatible: false, reason: 'Too large for WhatsApp headers (max 5MB)' };
      return { compatible: true };
    case 'whatsapp_header_video':
      if (f.kind !== 'video') return { compatible: false, reason: 'Not a video file' };
      if (!['mp4', 'mov'].includes(ext)) return { compatible: false, reason: 'Use MP4 or MOV' };
      if (f.sizeBytes > 15 * 1024 * 1024)
        return { compatible: false, reason: 'Exceeds 15MB WhatsApp video limit' };
      if ((f.durationSec ?? 0) > 30) return { compatible: false, reason: 'Video longer than 30s' };
      return { compatible: true };
    case 'whatsapp_header_document':
      if (f.kind !== 'document' || ext !== 'pdf')
        return { compatible: false, reason: 'WhatsApp header documents must be PDF' };
      if (f.sizeBytes > 100 * 1024 * 1024)
        return { compatible: false, reason: 'PDF exceeds 100MB limit' };
      return { compatible: true };
    case 'rcs_rich_card_image':
      if (f.kind !== 'image') return { compatible: false, reason: 'Not an image file' };
      if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext))
        return { compatible: false, reason: 'Unsupported image format for RCS' };
      if (f.sizeBytes > 1 * 1024 * 1024)
        return { compatible: false, reason: 'RCS rich card images max 1MB' };
      return { compatible: true };
    default:
      return { compatible: false };
  }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function kindLabel(k: MediaKind): string {
  switch (k) {
    case 'image':
      return 'Image';
    case 'video':
      return 'Video';
    case 'document':
      return 'Document';
    case 'audio':
      return 'Audio';
  }
}
