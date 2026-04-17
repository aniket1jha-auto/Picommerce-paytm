import type { DataSource } from '@/types';

export const baseDataSources: DataSource[] = [
  {
    id: 'ds-001',
    name: 'User Database',
    type: 'database',
    status: 'connected',
    lastSynced: '2026-03-29T06:00:00Z',
    recordCount: 2400000,
    dataQuality: {
      completeness: 94.2,
      freshness: 'fresh',
      issues: ['3,200 users missing phone number', '1,800 invalid phone formats'],
    },
  },
  {
    id: 'ds-002',
    name: 'Transaction History',
    type: 'database',
    status: 'connected',
    lastSynced: '2026-03-29T05:30:00Z',
    recordCount: 18500000,
    dataQuality: {
      completeness: 98.7,
      freshness: 'fresh',
      issues: [],
    },
  },
  {
    id: 'ds-003',
    name: 'CRM Profiles',
    type: 'crm',
    status: 'connected',
    lastSynced: '2026-03-28T22:00:00Z',
    recordCount: 1800000,
    dataQuality: {
      completeness: 87.5,
      freshness: 'fresh',
      issues: ['5% missing LTV score', '12% missing email'],
    },
  },
  {
    id: 'ds-004',
    name: 'KYC Verification',
    type: 'api',
    status: 'connected',
    lastSynced: '2026-03-29T08:00:00Z',
    recordCount: 2100000,
    dataQuality: {
      completeness: 96.1,
      freshness: 'fresh',
      issues: [],
    },
  },
  {
    id: 'ds-005',
    name: 'Merchant Data Export',
    type: 'csv',
    status: 'disconnected',
    lastSynced: '2026-03-15T10:00:00Z',
    recordCount: 45000,
    dataQuality: {
      completeness: 72.3,
      freshness: 'stale',
      issues: ['Last sync 14 days ago', '28% missing location data'],
    },
  },
];
