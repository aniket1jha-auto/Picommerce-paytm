/** Attribute definitions for rule-based segment builder */

import type { ChannelType } from '@/types';

export type SegmentValueType = 'text' | 'number' | 'date' | 'list';

export interface SegmentAttributeDef {
  id: string;
  label: string;
  valueType: SegmentValueType;
  /** For list type — option values */
  listOptions?: string[];
}

export const ATTRIBUTE_GROUPS: { group: string; attributes: SegmentAttributeDef[] }[] = [
  {
    group: 'LOAN / PRODUCT',
    attributes: [
      {
        id: 'dpd_bucket',
        label: 'DPD Bucket',
        valueType: 'list',
        listOptions: ['0-30', '30-60', '60-90', '90+'],
      },
      { id: 'outstanding_amount', label: 'Outstanding Amount', valueType: 'number' },
      { id: 'product_type', label: 'Product Type', valueType: 'text' },
      {
        id: 'loan_stage',
        label: 'Loan Stage',
        valueType: 'list',
        listOptions: ['Application', 'Underwriting', 'Approved', 'Disbursed', 'Closed', 'NPA'],
      },
      { id: 'emi_amount', label: 'EMI Amount', valueType: 'number' },
      { id: 'due_date', label: 'Due Date', valueType: 'date' },
    ],
  },
  {
    group: 'DEMOGRAPHICS',
    attributes: [
      {
        id: 'state',
        label: 'State',
        valueType: 'list',
        listOptions: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Gujarat'],
      },
      {
        id: 'city',
        label: 'City',
        valueType: 'list',
        listOptions: ['Mumbai', 'Delhi NCR', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad'],
      },
      { id: 'age', label: 'Age', valueType: 'number' },
      { id: 'gender', label: 'Gender', valueType: 'list', listOptions: ['Male', 'Female', 'Other'] },
    ],
  },
  {
    group: 'ENGAGEMENT',
    attributes: [
      {
        id: 'channel_optin',
        label: 'Channel Opt-in',
        valueType: 'list',
        listOptions: ['Voice', 'WhatsApp', 'SMS', 'Email', 'RCS'],
      },
      { id: 'last_contacted', label: 'Last Contacted Date', valueType: 'date' },
      { id: 'prior_contacts', label: 'Number of Prior Contacts', valueType: 'number' },
      {
        id: 'last_campaign_response',
        label: 'Last Campaign Response',
        valueType: 'list',
        listOptions: ['Responded', 'No Response', 'Clicked'],
      },
      { id: 'days_since_txn', label: 'Days Since Last Transaction', valueType: 'number' },
    ],
  },
  {
    group: 'CUSTOM',
    attributes: [{ id: 'custom_field', label: 'Custom field (connected sources)', valueType: 'text' }],
  },
];

export const ALL_ATTRIBUTES: SegmentAttributeDef[] = ATTRIBUTE_GROUPS.flatMap((g) => g.attributes);

export function getAttributeById(id: string): SegmentAttributeDef | undefined {
  return ALL_ATTRIBUTES.find((a) => a.id === id);
}

export const OPERATORS: Record<SegmentValueType, string[]> = {
  text: ['equals', 'not equals', 'contains', 'starts with', 'in list', 'not in list', 'is empty'],
  number: ['equals', 'greater than', 'less than', 'between', 'is empty'],
  date: ['is before', 'is after', 'is between', 'in last N days'],
  list: ['equals', 'in list', 'not in list'],
};

/** Channel dots — match Audiences segment cards */
export const SEGMENT_CHANNEL_META: { key: ChannelType; label: string; color: string }[] = [
  { key: 'sms', label: 'SMS', color: '#6366F1' },
  { key: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
  { key: 'rcs', label: 'RCS', color: '#00BAF2' },
  { key: 'ai_voice', label: 'AI Voice', color: '#F59E0B' },
  { key: 'field_executive', label: 'Field Exec', color: '#8B5CF6' },
  { key: 'push_notification', label: 'Push', color: '#EF4444' },
  { key: 'in_app_banner', label: 'In-App', color: '#0EA5E9' },
];
