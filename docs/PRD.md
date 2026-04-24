# Product Requirements Document (PRD)

**Product:** Commerce (Pi-commerce) — Multi-channel outreach & campaign management  
**Repository:** Picommerce-paytm  
**Document purpose:** Describe what exists in the codebase today (as-built product scope), for stakeholders and future development.  
**Last updated:** April 2026  

---

## 1. Executive summary

Commerce is a **frontend-first web application** for designing, running, and analyzing **multi-channel customer campaigns** (SMS, WhatsApp, RCS, AI voice, push, in-app, field executive, and paid social). The app presents a full **product UI** with **mocked phase-based data** (Day 0 / Day 1 / Day 30) to simulate onboarding maturity, plus flows for **agents** (voice AI configuration), **audiences & segments**, **content ideation**, **integrations**, and **settings**.

**There is no live backend integration in the shipped UI:** campaign persistence, auth, and external systems are simulated via in-memory/mock data and client state unless separately wired.

---

## 2. Goals (as reflected in the product)

- Unify **campaign lifecycle** visibility: create → configure → monitor → analyze.
- Support **many channels** with consistent metrics and UI patterns.
- Enable **AI-assisted** positioning via insights companion and content ideas (UX-level, not production ML).
- Provide **audience segmentation** (rule-based and AI-assisted UX) and **channel reachability** views.
- Centralize **configuration** (data sources, channels, billing, team, integrations catalog).

---

## 3. Technical stack

| Layer | Technology |
|--------|------------|
| UI | React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| State | Zustand (global UI + agents) |
| Charts | Recharts |
| Flow / graphs | `@xyflow/react` (React Flow) where used |
| Motion | Framer Motion |
| Build | Vite 8 |
| Icons | Lucide React |

**Backend:** A Python virtual environment may exist under `backend/` (e.g. FastAPI-style stack from dependencies); **the primary app delivered in-repo is the Vite React SPA under `frontend/`**. No API contract is required for the current UI to run.

---

## 4. Application architecture

### 4.1 Shell

- **Sidebar navigation** (collapsible): brand “π” + **Commerce**, section groupings (Build, Performance, Engagement, Settings).
- **Main content:** scrollable region with routed pages.
- **Min-width guard:** blocks ultra-narrow viewports with a message (responsive floor).
- **AI companion panel** (optional right rail, collapsible): surfaces **insights** on supported pages (e.g. dashboard) via `useInsights`.

### 4.2 Data model (client)

- **Phase simulation:** `phaseStore` holds `phase: 'day0' | 'day1' | 'day30'` (default in code may be `day30` for demos).
- **`usePhaseData`:** returns campaigns, segments, insights, analytics summary, KPIs, data sources — all from `frontend/src/data/mock` factories.
- **Agents:** `agentStore` + mock agent definitions for list/detail/builder.
- **Segments (user-created):** local React state on Audiences merges **custom saved segments** with mock segments.

### 4.3 Routing (implemented)

| Path | Page / feature |
|------|----------------|
| `/` | Dashboard |
| `/campaigns` | Campaign list |
| `/campaigns/new` | Create campaign wizard |
| `/campaigns/:id` | Campaign detail |
| `/campaigns/:id/flow` | Campaign flow / journey view |
| `/campaigns/:id/edit` | Edit campaign |
| `/audiences` | Audiences & segments |
| `/channels` | Channel configuration |
| `/content-ideas` | Content & ideas |
| `/agents` | Agents list |
| `/agents/new` | Agent builder (multi-step) |
| `/agents/:id` | Agent detail |
| `/tools` | Tools |
| `/reports` | Reports |
| `/templates` | Templates |
| `/analytics` | Analytics |
| `/settings/integrations` | Integrations catalog & drawers |
| `/settings` | Settings (tabs) |

**Note:** `frontend/src/pages/Logs.tsx` exists as a **standalone page component** but is **not registered** in `routes.tsx` (unused route).

---

## 5. Feature inventory (by area)

### 5.1 Dashboard (`/`)

- Phase-aware **KPI bar** (metrics and labels change by Day 0 / 1 / 30).
- **Campaign list** with status ordering and links to detail.
- **Channel performance** sneak peek with conversion bars and link to Analytics.

### 5.2 Campaigns

- **List:** campaigns from mock data; cards link to detail and actions.
- **Create campaign:** multi-step wizard (goal, audience, channels, plan, etc. — see `components/campaign/*`).
- **Campaign detail:** metrics, trends, anomalies, channel breakdowns (mock).
- **Edit campaign:** edit flow for draft/scheduling scenarios.
- **Campaign flow (`/campaigns/:id/flow`):** rich **journey / waterfall** presentation: sub-segments, steps, channel-specific content previews (SMS, WhatsApp, push, voice, field exec, in-app, RCS), timing, and performance-style blocks — demo content driven by mock structures.

### 5.3 Analytics (`/analytics`)

- Aggregate analytics views: spend, reach, conversion, channel charts (Recharts and custom components).
- Tied to `AnalyticsSummary` and phase data.

### 5.4 Reports (`/reports`)

- Reporting UI (exports / summaries as implemented in page and components).

### 5.5 Audiences (`/audiences`)

- **Day 0:** empty state pointing users to connect data; **data source connectors** exploration UI (catalog-style).
- **Day 1+:** summary stats (users synced, reachability, saved segments), **data sources** section, **saved segments grid** with reachability pills and optional performance badges at Day 30.
- **Create Segment:** modal entry — **Rule-based** vs **AI-suggested** paths:
  - Rule flow: name/description → **condition builder** (grouped attributes, operators, AND/OR, nested groups) → exclusions (DND, suppression) → static/dynamic segment type → **live preview** (estimate, channel reachability, sample contacts table).
  - AI flow: goal prompt → generated segment card + rationale + editable underlying rules → segment type → save.
- Saved segments support **Rule-based** / **AI** badges when `segmentSource` is set.

### 5.6 Channels (`/channels`)

- Channel configuration page (`ChannelConfig`) aligned with product channel types.

### 5.7 Content & Ideas (`/content-ideas`)

- Prompt/search for ideas, **idea grid**, **drawer** with sample message / campaign setup / CTAs (e.g. start campaign, open analytics) using `ContentIdeasDrawer` and shared campaign draft utilities.

### 5.8 Agents (`/agents`, `/agents/new`, `/agents/:id`)

- **List** and **detail** for configured agents (mock + store).
- **Agent builder** (`/agents/new`): six steps — Basic info → Model & voice → System prompt → **Instructions** (reorderable steps, tools, Content & Ideas link) → Advanced (audio, LLM, compliance) → Review & deploy.
- Agent configuration types in `frontend/src/types/agent.ts` (flow graph, tools, conversation settings, etc.).

### 5.9 Tools (`/tools`)

- Tool definitions and configuration UI for agent/campaign tooling (mock).

### 5.10 Templates (`/templates`)

- Template management page (campaign/message templates as implemented).

### 5.11 Settings (`/settings`)

- **Tabs:** Data Sources, Channels, Billing, Team.
- Data sources: connect/manage UX with toasts (placeholders for real connections).
- Channels: deep channel configuration section.
- Billing & Team: UI with mock data and actions.

### 5.12 Integrations (`/settings/integrations`)

- **Catalog** of 21 integrations across sections (Data sources, Telephony, Messaging, Payments, Productivity, Developer).
- **Search** and **category filter tabs**.
- **Stats:** connected count, catalog size, needs attention (errors).
- **Empty state** when nothing connected + scroll to catalog.
- **Drawer** for Connect/Manage: About, configuration by integration type (OAuth stub, API keys, SFTP, webhooks, REST), CRM sync settings where applicable, status/logs when connected, Test connection, Save.

### 5.13 Insights & AI companion

- **Insights** model: typed insights with evidence, confidence, CTA, phase gating (`minPhase`).
- **Companion panel:** dismissible insight cards on supported routes.

### 5.14 Design system (implicit requirements met in UI)

- Navy sidebar, cyan primary actions, card shadows and borders consistent across Dashboard, Audiences, Settings, Integrations.
- Shared primitives: `PageHeader`, `EmptyState`, `Toast`, `Modal`, `StatusBadge`, `ChannelIcon`, etc.

---

## 6. Domain entities (summary)

Defined in `frontend/src/types/index.ts` and related modules:

- **Campaign:** status, channels, audience, budget, metrics, channel metrics, trends, optional anomaly, timestamps.
- **Segment:** size, description, optional filters JSON, reachability by channel, optional attributes & performance.
- **Insight:** type, tag, confidence, evidence, CTA, context.
- **DataSource:** type, status, sync metadata, quality.
- **AnalyticsSummary / KPI:** aggregates for dashboard and analytics.
- **WaterfallConfig / nodes / edges:** used in flow visualizations.
- **Agent (extended):** configuration object for builder (voice, LLM, instructions, tools, compliance, etc.).

---

## 7. Non-goals & limitations (current codebase)

- **No production authentication** or role-based access control in the described routes.
- **No persistent server-side storage** for campaigns/agents/segments in the default path; refresh loses local-only state except what’s rehydrated from mocks.
- **External integrations** (Salesforce, Twilio, etc.) are **UI and copy**; OAuth and API calls are not executed against real providers in the catalog drawer.
- **ML/AI** for segments and content is **simulated** (timeouts, static copy), not model-backed.
- **Logs** page is **not routed** in the main app router.

---

## 8. Future product opportunities (not committed)

- Wire FastAPI or other backend for persistence, webhooks, and auth.
- Connect Integrations drawer to real OAuth/API flows and secret storage.
- Replace segment estimation with query engine against real data warehouse.
- Enable Logs as a first-class route and ingest pipeline.
- E2E tests and design tokens documentation.

---

## 9. Document maintenance

When adding routes, stores, or major flows, update **Section 4–5** and the routing table. When backend APIs land, add a **“API & contracts”** section and adjust **Section 7**.
