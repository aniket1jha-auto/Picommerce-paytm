import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Globe, Database, Lock } from 'lucide-react';
import { useKnowledgeBaseStore } from '@/store/knowledgeBaseStore';
import { Modal, Button, Input, Textarea, Select, useToast, cn } from '@/components/ui';
import type { KBSource } from '@/types/knowledgeBase';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateKnowledgeBaseDialog({ open, onClose }: Props) {
  const createKB = useKnowledgeBaseStore((s) => s.createKB);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [source, setSource] = useState<KBSource>('files');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [embeddingModel, setEmbeddingModel] = useState('text-embedding-3-large');
  const [chunkSize, setChunkSize] = useState(512);
  const [chunkOverlap, setChunkOverlap] = useState(64);
  const [splitter, setSplitter] = useState<'recursive' | 'markdown' | 'semantic'>('recursive');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const canCreate = source === 'files' && name.trim().length > 1;

  function handleCreate() {
    if (!canCreate) return;
    const kb = createKB({
      name: name.trim(),
      description: description.trim() || undefined,
      source,
      embeddingModel,
      chunkSize,
      chunkOverlap,
      splitter,
    });
    toast({
      kind: 'info',
      title: `${kb.name} is indexing`,
      body: 'Mock indexing — KB will be ready in a few seconds.',
    });
    onClose();
    setName('');
    setDescription('');
    setAdvancedOpen(false);
    navigate(`/knowledge-bases/${kb.id}`);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create knowledge base"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={!canCreate}>
            Create knowledge base
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Source picker */}
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-medium text-text-secondary">Source</span>
          <div className="grid grid-cols-3 gap-2">
            <SourceCard
              icon={Upload}
              label="Uploaded files"
              hint="PDF, DOCX, MD, TXT, CSV"
              active={source === 'files'}
              onClick={() => setSource('files')}
            />
            <SourceCard
              icon={Globe}
              label="URL crawl"
              hint="Coming Q3"
              active={false}
              disabled
              onClick={() => undefined}
            />
            <SourceCard
              icon={Database}
              label="Data source"
              hint="Coming Q3"
              active={false}
              disabled
              onClick={() => undefined}
            />
          </div>
        </div>

        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Paytm Loan Recovery Playbook"
          helper="Shown to anyone attaching this KB to an agent."
        />

        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's in here, who should attach it…"
        />

        {/* File upload (mocked) */}
        {source === 'files' && (
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium text-text-secondary">Files</span>
            <div className="rounded-md border border-dashed border-border-default bg-surface-sunken p-6 text-center">
              <Upload size={20} className="mx-auto mb-2 text-text-tertiary" />
              <p className="text-sm text-text-primary">
                Drop files here, or click to upload
              </p>
              <p className="mt-1 text-[12px] text-text-tertiary">
                Mock upload — files won't be indexed in v1, but the KB will appear ready
                with sample chunks.
              </p>
            </div>
          </div>
        )}

        {/* Advanced */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className="self-start text-[12px] font-medium text-text-secondary hover:text-text-primary"
          >
            {advancedOpen ? '− ' : '+ '}Chunking & embedding (advanced)
          </button>
          {advancedOpen && (
            <div className="grid grid-cols-2 gap-3 rounded-md border border-border-subtle bg-surface-sunken p-3">
              <Select
                label="Embedding model"
                value={embeddingModel}
                onChange={(e) => setEmbeddingModel(e.target.value)}
              >
                <option value="text-embedding-3-large">text-embedding-3-large</option>
                <option value="text-embedding-3-small">text-embedding-3-small</option>
                <option value="azure-ada-002">azure-ada-002</option>
              </Select>
              <Select
                label="Splitter"
                value={splitter}
                onChange={(e) =>
                  setSplitter(e.target.value as 'recursive' | 'markdown' | 'semantic')
                }
              >
                <option value="recursive">Recursive character</option>
                <option value="markdown">Markdown-aware</option>
                <option value="semantic">Semantic boundaries</option>
              </Select>
              <Input
                label="Chunk size (tokens)"
                type="number"
                min={128}
                max={2048}
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
              />
              <Input
                label="Overlap (tokens)"
                type="number"
                min={0}
                max={512}
                value={chunkOverlap}
                onChange={(e) => setChunkOverlap(Number(e.target.value))}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

interface SourceCardProps {
  icon: typeof Upload;
  label: string;
  hint: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function SourceCard({ icon: Icon, label, hint, active, disabled, onClick }: SourceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex flex-col items-start gap-1 rounded-md border p-3 text-left transition-colors',
        active
          ? 'border-accent bg-accent-soft'
          : 'border-border-subtle bg-surface hover:border-border-default',
        disabled && 'opacity-60 cursor-not-allowed',
      )}
    >
      {disabled && <Lock size={12} className="absolute right-2 top-2 text-text-tertiary" />}
      <Icon size={16} className={active ? 'text-accent' : 'text-text-secondary'} />
      <span className="text-[13px] font-medium text-text-primary">{label}</span>
      <span className="text-[11px] text-text-tertiary">{hint}</span>
    </button>
  );
}
