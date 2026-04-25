export type MediaKind = 'image' | 'video' | 'document' | 'audio';

export type MediaUsedInKind = 'template' | 'campaign';

export interface MediaUsedInRef {
  id: string;
  name: string;
  kind: MediaUsedInKind;
}

export interface MediaFile {
  id: string;
  name: string;
  kind: MediaKind;
  sizeBytes: number;
  mime: string;
  width?: number;
  height?: number;
  durationSec?: number;
  pageCount?: number;
  previewUrl: string;
  cdnUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
  campaignId?: string | null;
  usedInTemplates: { id: string; name: string }[];
  usedInCampaigns: { id: string; name: string }[];
}

/** Picker / template builder constraint */
export type MediaPickerRole =
  | 'whatsapp_header_image'
  | 'whatsapp_header_video'
  | 'whatsapp_header_document'
  | 'rcs_rich_card_image';
