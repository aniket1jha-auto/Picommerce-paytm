export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
}

export interface ToolCategory {
  id: string;
  label: string;
  items: ToolDefinition[];
}

export interface ToolInstance {
  id: string;
  toolType: string;
  name: string;
  description: string;
  config: Record<string, unknown>;
  knowledgeBases: KnowledgeBase[];
  messages: ToolMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  type: 'file' | 'url' | 'text';
  source: string;
  status: 'active' | 'indexing' | 'error';
}

export interface ToolMessage {
  id: string;
  stage: 'before' | 'during' | 'after' | 'error';
  content: string;
}
