import { PageHeader } from '@/components/layout/PageHeader';
import { CampaignWizard } from '@/components/campaign/CampaignWizard';

export function CreateCampaign() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Create Campaign" subtitle="Campaigns / New" />
      <CampaignWizard />
    </div>
  );
}
