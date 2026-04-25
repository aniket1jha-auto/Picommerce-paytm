import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { TemplatesTab } from '@/components/content-library/TemplatesTab';
import { MediaLibraryTab } from '@/components/content-library/MediaLibraryTab';
import { MOCK_CONTENT_TEMPLATES } from '@/data/mock/contentLibraryTemplates';
import type { ContentTemplateRow } from '@/types/contentLibrary';

type TabId = 'templates' | 'media';

export function ContentLibrary() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('templates');
  const [templates, setTemplates] = useState<ContentTemplateRow[]>(MOCK_CONTENT_TEMPLATES);

  useEffect(() => {
    const st = location.state as { newTemplate?: ContentTemplateRow } | null;
    const created = st?.newTemplate;
    if (created) {
      setTemplates((prev) => [created, ...prev]);
      setTab('templates');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Content Library"
        subtitle="Manage and create message templates across channels"
      />
      <div className="inline-flex rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-1">
        <button
          type="button"
          onClick={() => setTab('templates')}
          className={[
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            tab === 'templates'
              ? 'bg-white text-text-primary shadow-sm ring-1 ring-[#E5E7EB]'
              : 'text-text-secondary hover:text-text-primary',
          ].join(' ')}
        >
          Templates
        </button>
        <button
          type="button"
          onClick={() => setTab('media')}
          className={[
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            tab === 'media'
              ? 'bg-white text-text-primary shadow-sm ring-1 ring-[#E5E7EB]'
              : 'text-text-secondary hover:text-text-primary',
          ].join(' ')}
        >
          Media Library
        </button>
      </div>

      {tab === 'templates' ? (
        <TemplatesTab templates={templates} setTemplates={setTemplates} />
      ) : (
        <MediaLibraryTab />
      )}
    </div>
  );
}
