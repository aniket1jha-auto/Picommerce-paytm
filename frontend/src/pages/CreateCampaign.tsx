import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { CampaignWizard, type CampaignData } from '@/components/campaign/CampaignWizard';

export interface CreateCampaignLocationState {
  campaignDraft?: Partial<CampaignData>;
}

export function CreateCampaign() {
  const location = useLocation();
  const initialData = useMemo(() => {
    const st = location.state as CreateCampaignLocationState | null;
    return st?.campaignDraft;
  }, [location.state]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Create Campaign" subtitle="Campaigns / New" />
      <CampaignWizard initialData={initialData} />
    </div>
  );
}
