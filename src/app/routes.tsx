import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { CreateCampaign } from '@/pages/CreateCampaign';
import { Campaigns } from '@/pages/Campaigns';
import { CampaignDetail } from '@/pages/CampaignDetail';
import { CampaignFlow } from '@/pages/CampaignFlow';
import { EditCampaign } from '@/pages/EditCampaign';
import { Analytics } from '@/pages/Analytics';
import { Audiences } from '@/pages/Audiences';
import { Templates } from '@/pages/Templates';
import { Settings } from '@/pages/Settings';
import { ChannelConfig } from '@/pages/ChannelConfig';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/campaigns" element={<Campaigns />} />
      <Route path="/campaigns/new" element={<CreateCampaign />} />
      <Route path="/campaigns/:id" element={<CampaignDetail />} />
      <Route path="/campaigns/:id/flow" element={<CampaignFlow />} />
      <Route path="/campaigns/:id/edit" element={<EditCampaign />} />
      <Route path="/audiences" element={<Audiences />} />
      <Route path="/channels" element={<ChannelConfig />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
