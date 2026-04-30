import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui';
import type { TabItem } from '@/components/ui';
import { TemplatesTab } from '@/components/content-library/TemplatesTab';
import { MediaLibraryTab } from '@/components/content-library/MediaLibraryTab';
import { IdeasTab } from '@/components/content-library/IdeasTab';
import type { ContentTemplateRow } from '@/types/contentLibrary';
import { loadContentTemplates, saveContentTemplates } from '@/utils/contentTemplatesStore';

/**
 * Content Library — Phase 3.6
 *
 * Three tabs: Templates / Media Library / Ideas.
 * The Ideas tab folds in the content from the old standalone /content-ideas
 * page. `/content-ideas` redirects here with `?tab=ideas`.
 *
 * Active tab is reflected in the `?tab=` query param so deep links and
 * sidebar redirects land on the right tab.
 */

type TabId = 'templates' | 'media' | 'ideas';

const TAB_ITEMS: ReadonlyArray<TabItem<TabId>> = [
  { id: 'templates', label: 'Templates' },
  { id: 'media', label: 'Media Library' },
  { id: 'ideas', label: 'Ideas' },
];

const VALID_TABS = new Set<TabId>(['templates', 'media', 'ideas']);

function isValidTab(s: string | null): s is TabId {
  return s !== null && VALID_TABS.has(s as TabId);
}

export function ContentLibrary() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab: TabId = isValidTab(searchParams.get('tab'))
    ? (searchParams.get('tab') as TabId)
    : 'templates';

  const [tab, setTab] = useState<TabId>(initialTab);
  const [templates, setTemplates] = useState<ContentTemplateRow[]>(() => loadContentTemplates());

  // Honor newTemplate from CreateContentTemplate redirect
  useEffect(() => {
    const st = location.state as { newTemplate?: ContentTemplateRow } | null;
    const created = st?.newTemplate;
    if (created) {
      setTemplates((prev) => [created, ...prev]);
      setTab('templates');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Sync URL ?tab= when user clicks a tab
  const handleTabChange = useCallback(
    (next: TabId) => {
      setTab(next);
      const params = new URLSearchParams(searchParams);
      if (next === 'templates') {
        params.delete('tab');
      } else {
        params.set('tab', next);
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  // React to back/forward / external ?tab= changes
  useEffect(() => {
    const param = searchParams.get('tab');
    if (isValidTab(param) && param !== tab) {
      setTab(param as TabId);
    } else if (!param && tab !== 'templates') {
      setTab('templates');
    }
  }, [searchParams, tab]);

  useEffect(() => {
    saveContentTemplates(templates);
  }, [templates]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Content Library"
        subtitle="Templates, media assets, and ideas — across SMS, WhatsApp, RCS, and Voice."
      />
      <Tabs items={TAB_ITEMS} active={tab} onChange={handleTabChange} variant="pill" />

      {tab === 'templates' && <TemplatesTab templates={templates} setTemplates={setTemplates} />}
      {tab === 'media' && <MediaLibraryTab />}
      {tab === 'ideas' && <IdeasTab />}
    </div>
  );
}
