// Day 1 data sources — all connected with sync timestamps and record counts

import type { DataSource } from '@/types';

export const day1DataSources: DataSource[] = [
  {
    id: 'ds-snowflake',
    name: 'Snowflake Data Warehouse',
    type: 'warehouse',
    status: 'connected',
    lastSynced: '2026-04-02T09:15:00+05:30',
    recordCount: 240000,
  },
  {
    id: 'ds-salesforce',
    name: 'Salesforce CRM',
    type: 'crm',
    status: 'connected',
    lastSynced: '2026-04-02T07:45:00+05:30',
    recordCount: 186000,
  },
  {
    id: 'ds-feature-store',
    name: 'Internal Feature Store',
    type: 'feature_store',
    status: 'connected',
    lastSynced: '2026-04-02T09:30:00+05:30',
    recordCount: 240000,
  },
];
