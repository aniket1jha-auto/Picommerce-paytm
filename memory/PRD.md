# Outreach Manager - Agents Section PRD

## Original Problem Statement
Build on top of existing Outreach Manager repo (PiCommerceEnterprise) - add two new sections:
1. **Build**: End-to-end agent building with voice agent focus, Azure GPT Realtime stack
2. **Evaluate**: Agent evaluation with prompt enhancement, demo runs, failure analysis, performance monitoring

## Architecture
- **Frontend**: React 19 + TypeScript + Vite 8 + Tailwind CSS v4
- **State Management**: Zustand
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Flow Builder**: XYFlow React (available, placeholder for now)

## What's Been Implemented (Jan 2026)

### New Pages
| Route | Page | Description |
|-------|------|-------------|
| `/agents` | Agents List | Dashboard with stats cards and agent list |
| `/agents/new` | Agent Builder | 7-step wizard for creating agents |
| `/agents/:id` | Agent Detail | Evaluation dashboard with 4 tabs |

### Build Section - 7-Step Wizard
1. **Basic Info** - Name, description, type (Voice/Chat), use case (9 options)
2. **Model & Voice** - 4 Azure GPT Realtime models, 10 voice options with descriptions
3. **System Prompt** - Template library, personality traits, tone, role, objectives, guidelines
4. **Conversation Flow** - Placeholder for XYFlow-based visual builder
5. **Tools & Functions** - 5 built-in tools + custom function support
6. **Advanced Settings** - LLM config (temperature, tokens), audio settings, conversation settings, compliance
7. **Review & Deploy** - Config summary, test call simulation, environment selection

### Evaluate Section - 4 Tabs
1. **Performance Metrics** - Call volume charts, KPIs, intent recognition analysis
2. **Call Transcripts** - Searchable transcript list, detail view with sentiment & intent tags
3. **Prompt Enhancement** - AI-powered suggestions prioritized by severity
4. **Failure Analysis** - Failure patterns with examples and suggested fixes

### Additional Features
- Live Test Console on agent detail page
- Sidebar navigation with Agents item
- Mock data: 3 agents, 3 transcripts, 2 A/B tests, 7 days metrics

## Prioritized Backlog

### P0 (Critical)
- [ ] Campaign integration: Select agent when creating campaign with AI Voice channel
- [ ] Visual Flow Builder (Step 4) using XYFlow

### P1 (Important)
- [ ] Agent editing from detail page
- [ ] A/B testing UI tab in evaluation
- [ ] Agent versioning and rollback
- [ ] Real Azure GPT Realtime API integration

### P2 (Nice to have)
- [ ] Agent cloning/duplication
- [ ] Bulk agent management
- [ ] Export agent configuration
- [ ] Agent marketplace/template sharing
- [ ] Real-time monitoring dashboard
- [ ] Webhook configuration for callbacks

## Next Tasks
1. Implement campaign-agent integration
2. Build visual conversation flow designer with XYFlow
3. Add A/B testing tab to evaluation section
4. Real API integration with Azure OpenAI Realtime
