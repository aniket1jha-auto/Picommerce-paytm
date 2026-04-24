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
import { Integrations } from '@/pages/Integrations';
import { ChannelConfig } from '@/pages/ChannelConfig';
import { Agents } from '@/pages/Agents';
import { AgentBuilder } from '@/pages/AgentBuilder';
import { AgentDetail } from '@/pages/AgentDetail';
import { Tools } from '@/pages/Tools';
import { Reports } from '@/pages/Reports';
import { ContentIdeas } from '@/pages/ContentIdeas';

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
      <Route path="/content-ideas" element={<ContentIdeas />} />
      <Route path="/agents" element={<Agents />} />
      <Route path="/agents/new" element={<AgentBuilder />} />
      <Route path="/agents/:id" element={<AgentDetail />} />
      <Route path="/tools" element={<Tools />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings/integrations" element={<Integrations />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
