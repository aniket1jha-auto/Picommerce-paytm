export type TemplateChannel = 'whatsapp' | 'sms' | 'rcs';

export type TemplateStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'paused';

export type TemplateCategory = 'marketing' | 'utility' | 'authentication';

export type TemplateQuality = 'high' | 'medium' | 'low';

export interface ContentTemplateRow {
  id: string;
  name: string;
  bodyPreview: string;
  channel: TemplateChannel;
  /** WhatsApp only; null for SMS/RCS */
  category: TemplateCategory | null;
  languages: string[];
  status: TemplateStatus;
  /** WhatsApp + approved */
  quality: TemplateQuality | null;
  lastUpdated: string;
  usedIn: string[];
  rejectionReason?: string;
}
