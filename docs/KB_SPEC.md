# KB_SPEC — Knowledge Bases / Agentic RAG (v1)

**Date:** 2026-04-28
**Companion docs:** [decisions/0003-kb-placement.md](decisions/0003-kb-placement.md), [DEMO_FLOW.md](DEMO_FLOW.md), [IA.md](IA.md)

> v1 is a **rock-solid configuration foundation**, not a retrieval engine. The buyer must look at this and understand within 30 seconds how knowledge plugs into agents and how it shows up at runtime — without us building real retrieval.

---

## 1. Why a dedicated section

The brief (§9) is unambiguous: KB is a first-class build artifact. Without it, the agent-platform repositioning is incomplete. CleverTap doesn't have this. Vapi has it inside the assistant config, not as its own section — we go further by surfacing it at IA-top-level so it's visible in the first 30 seconds.

KB lives under `BUILD` in the new sidebar IA, second item, right after Agents. ADR: [0003-kb-placement.md](decisions/0003-kb-placement.md).

---

## 2. Surfaces

Three surfaces. v1 ships all three with mock retrieval; v2 wires a real backend.

| Surface | Path | Phase |
|---|---|---|
| KB list | `/knowledge-bases` | 2 |
| KB detail | `/knowledge-bases/:id` | 2 |
| KB attachment panel — inline in agent builder Instructions step | `/agents/new` (step 4) | 2 |
| Transcript-with-retrieved-chunks (in observability) | `/monitoring/calls/:id`, `/agents/:id/transcripts/:callId` | 4 |

---

## 3. KB List — `/knowledge-bases`

### Layout

Page header: title, search, "Create knowledge base" primary button.

Below: a **table** (per [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — tables for dense list data, not cards).

Columns:

| Column | Content |
|---|---|
| Name | KB name + small icon for source type (file / url / data source) |
| Source | "Uploaded files" / "URL crawl" / "Data source: <name>" |
| Documents | count |
| Chunks | count (mocked) |
| Tokens | count (mocked, with K/M abbreviation) |
| Status | pill: `ready` / `indexing` / `error` / `empty` |
| Used by | count of agents — clickable, shows a popover list |
| Last updated | relative time |
| Actions | row-level menu: Edit / Test retrieval / Delete |

Empty state ([DESIGN_SYSTEM.md §4.10](DESIGN_SYSTEM.md)):
> *"No knowledge bases yet. Create one to give your agents searchable knowledge — product catalogs, policies, FAQs, anything text-based."*
> Primary CTA: **Create knowledge base**

### Wireframe (low-fi)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Knowledge Bases                                  [+ Create KB]       │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │  🔎 Search                                                        │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ NAME                       SOURCE          DOCS  CHUNKS  TOK  STATUS │ USED BY │ UPDATED  │ │
│ ────────────────────────── ─────────────── ───── ─────── ──── ───────│─────────│──────────│ │
│ 📄 Paytm Product Catalog v3 Files          82    1,420   1.2M  ●Ready│  4 agts │ 2h ago   │ │
│ 📄 Paytm Wallet & UPI Policy Files          5     86      72K   ●Ready│  3 agts │ 1d ago  │ │
│ 📄 Paytm KYC FAQ            Files          12    124     104K  ●Ready│  2 agts │ 3d ago  │ │
│ 🌐 Paytm Help Center URLs   URL crawl      —     —       —     ●Empty│  0 agts │ —        │ │
│ 🔌 Order DB                 Data source    —     —       —     ●Disabled│ 0 agts │ —     │ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Create KB — `/knowledge-bases/new`

### v1 scope

- **Source type tabs:** Uploaded files (functional) / URL crawl (visible, disabled with "Coming Q3" hint) / Connected data source (visible, disabled)
- **Uploaded files form:**
  - Name (required)
  - Description (optional)
  - File upload (drag-drop multi-file; .pdf, .docx, .txt, .md, .csv; mocked accept-all)
  - Chunking config (collapsible, with sensible defaults):
    - Chunk size (tokens) — slider, default 512
    - Chunk overlap — slider, default 64
    - Embedding model — select (mocked: `text-embedding-3-large`, `text-embedding-3-small`, `azure-ada-002`); default `3-large`
    - Splitter strategy — select (`Recursive character`, `Markdown-aware`, `Semantic boundaries`); default Recursive
- **Create button** kicks off mock indexing — KB appears in the list at status `indexing`, transitions to `ready` after 2–4 seconds (mock).

Once created, the user lands on KB detail.

---

## 5. KB Detail — `/knowledge-bases/:id`

### Layout

Header: KB name, status pill, "Edit" / "Delete" overflow.

Below the header, three tabs: **Documents** / **Configuration** / **Test retrieval**.

### Tab 1 — Documents

Table:

| Column | Content |
|---|---|
| Name | document filename |
| Type | extension badge |
| Size | human-readable |
| Chunks | count (mocked) |
| Status | pill (`indexed` / `indexing` / `failed`) |
| Updated | relative time |
| Actions | row menu: Re-index / Remove |

Top-right: **+ Add document** button → file picker.

Empty state if KB just created: "No documents yet — drop files here to get started" with a drop zone.

### Tab 2 — Configuration

Read-only (mostly) view of the chunking config + a **Re-index entire KB** button (mock: shows progress bar, takes 4–6 seconds).

Editable fields gated to "advanced" affordance:
- Chunk size, overlap, embedding model — show, with a warning "Changing these requires re-indexing all documents."
- Description (always editable).

### Tab 3 — Test retrieval

The key surface for buyer confidence in v1.

Layout:
```
┌──────────────────────────────────────────────────────────────┐
│ Test retrieval                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Query                                                     │ │
│ │ [ how do I complete KYC with Aadhaar OTP?           ] 🔎│ │
│ └──────────────────────────────────────────────────────────┘ │
│ Top K: [ 4 ]   Score threshold: [ 0.65 ]                     │
│                                                               │
│ Results (4)                                                   │
│ ┌─────────────────────────────────────────────────── 0.92 ─┐ │
│ │ Paytm KYC FAQ.pdf · p. 3                                  │ │
│ │ "Min KYC can be completed using Aadhaar OTP. Provide     │ │
│ │  your Aadhaar number, receive a 6-digit OTP on your      │ │
│ │  registered mobile, and verify within 10 minutes…"       │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────── 0.85 ─┐ │
│ │ Paytm KYC FAQ.pdf · p. 5                                  │ │
│ │ "If the OTP doesn't arrive, retry after 30 seconds…"      │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────── 0.78 ─┐ │
│ │ Paytm Wallet & UPI Policy.pdf · §2                        │ │
│ │ "Min KYC users have monthly wallet limit of ₹10,000…"     │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────── 0.66 ─┐ │
│ │ Paytm Product Catalog v3.pdf · §1.2                       │ │
│ │ "Paytm Wallet · features · KYC tiers…"                    │ │
│ └───────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

Each result chip shows source document, page/section, score, snippet (3 lines max with expand). Click a result to open the source document with the chunk highlighted.

**Mock behavior:** Query string is matched against a small set of canned query→chunks mappings; falls back to top-3 random chunks if no match. The user gets *immediate* visual feedback.

---

## 6. KB attachment in Agent builder — inline, not a wizard step

**Updated 2026-04-29 per user direction.** KB is **not** a separate wizard step. The voice agent builder stays at 6 steps. KB attachment is a **panel embedded inside the Instructions step**, sibling to the existing Global Tool Access section. Both express the same primitive — "things this agent can call on" — so they live next to each other.

**Why inline, not a step:**
- KB attachment is rarely the gating decision in agent design — most agents will reuse a small number of KBs across multiple agents.
- A wizard step forces the user to think about KB before they're ready; an inline panel lets them attach when natural.
- Keeps the wizard at 6 steps. The Phase 1 audit flagged orphaned 7th-step imports (FlowStep, ToolsStep) as smell — adding a KB step would compound the pattern.

**Position inside Instructions step:**
A new collapsible panel **"Connect knowledge sources"** sits above the Global Tool Access checkbox grid. Both share the same visual treatment (label + helper text + content area).

**Layout:**

```
┌────────────────────────────────────────────────────────────────┐
│ Step 4 of 6 — Instructions                                      │
│ ...                                                             │
│ (existing instruction-steps editor)                             │
│ ...                                                             │
│                                                                 │
│ ┌─ Connect knowledge sources ─────────────────────────────────┐│
│ │ Knowledge bases this agent can search during conversations. ││
│ │                                                              ││
│ │ Attached (2)                                                 ││
│ │  ┌──────────────────────────────────────────── ✕ Detach ──┐ ││
│ │  │ 📄 Paytm Product Catalog v3                             │ ││
│ │  │  82 docs · 1,420 chunks · ready                         │ ││
│ │  │  Retrieval mode: [Always retrieve ▾]                    │ ││
│ │  │  Top-K: [4]   Score threshold: [0.65]                   │ ││
│ │  │  Citation style: [Inline ▾]                             │ ││
│ │  └─────────────────────────────────────────────────────────┘ ││
│ │  ┌──────────────────────────────────────────── ✕ Detach ──┐ ││
│ │  │ 📄 Paytm KYC FAQ                                        │ ││
│ │  │  Retrieval mode: [Retrieve when uncertain ▾]            │ ││
│ │  │  Top-K: [3]   Score threshold: [0.7]                    │ ││
│ │  │  Citation style: [Footnote ▾]                           │ ││
│ │  └─────────────────────────────────────────────────────────┘ ││
│ │                                                              ││
│ │  + Connect a knowledge base                                  ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ Global Tool Access ────────────────────────────────────────┐│
│ │ (existing tools checkbox grid)                              ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ▼ Preview: how retrieved chunks land in the agent's context    │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │  System prompt                                               ││
│ │   "You are an Paytm customer-care voice agent…"              ││
│ │                                                              ││
│ │  ── Retrieved knowledge (when retrieval fires) ──            ││
│ │   📄 Paytm KYC FAQ.pdf · p.3                                 ││
│ │      "Min KYC can be completed using Aadhaar OTP…"           ││
│ │   📄 Paytm Wallet & UPI Policy.pdf · §2                      ││
│ │      "Min KYC users have monthly wallet limit of ₹10,000…"   ││
│ │  ── End retrieved knowledge ──                               ││
│ │                                                              ││
│ │  Conversation:                                               ││
│ │   user: …                                                    ││
│ │   assistant: …                                               ││
│ └─────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────┘
```

### Per-attachment fields

| Field | Type | Default | Notes |
|---|---|---|---|
| `retrievalMode` | enum | `retrieve_when_asked` | One of `always` / `when_asked` / `when_uncertain` |
| `topK` | int 1–8 | 4 | |
| `scoreThreshold` | float 0–1 | 0.65 | |
| `citationStyle` | enum | `inline` | `inline` / `footnote` / `off` |

### Validations

- KB must be `ready` to be attached. `indexing` / `error` KBs show a warning.
- Total attached chunks-budget warning if expected context exceeds 8 K tokens at top-K × max-chunk-size.

---

## 7. KB usage in observability (Phase 4)

The single best demo moment for the RAG story: when the user drills into a call, **every retrieval that fired during the call is shown inline with the transcript turn that triggered it**.

### Layout in transcript drill-down

Each agent turn that fired a retrieval gets a small `📚 Retrieved` chip beneath the turn. Click to expand:

```
agent (08:32:14)
  "Aap Min KYC easily Aadhaar OTP se complete kar
   sakte ho — bas 6-digit OTP register mobile par
   aayega aur 10 minute mein verify ho jaayega.
   Kya main aapko link bhej doon?"

  📚 Retrieved 2 chunks · 380 ms
  ▼ Expand
   ┌─────────────────────────────────────── 0.92 ───┐
   │ Paytm KYC FAQ.pdf · p.3                         │
   │ "Min KYC can be completed using Aadhaar OTP…"   │
   └─────────────────────────────────────────────────┘
   ┌─────────────────────────────────────── 0.85 ───┐
   │ Paytm KYC FAQ.pdf · p.5                         │
   │ "If the OTP doesn't arrive, retry after 30s…"   │
   └─────────────────────────────────────────────────┘
```

Cited chunks are highlighted (green border). Non-cited but retrieved chunks are dimmed.

This is the moment a buyer goes "ah — I can audit what knowledge the agent saw, on every call, forever."

---

## 8. Mock data shape

Lives in `frontend/src/data/mock/knowledgeBases.ts` (new in Phase 2).

### KnowledgeBase

```ts
type KnowledgeBaseStatus = 'ready' | 'indexing' | 'error' | 'empty';
type KnowledgeBaseSource = 'files' | 'url' | 'data_source';

interface KnowledgeBase {
  id: string;                              // 'kb-001'
  name: string;
  description?: string;
  source: KnowledgeBaseSource;
  status: KnowledgeBaseStatus;
  documentCount: number;
  chunkCount: number;
  tokenCount: number;
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
  splitter: 'recursive' | 'markdown' | 'semantic';
  usedByAgentIds: string[];                // reverse linkage
  createdAt: string;
  updatedAt: string;
}
```

### KBDocument

```ts
type KBDocumentStatus = 'indexed' | 'indexing' | 'failed';

interface KBDocument {
  id: string;                              // 'kbdoc-001'
  knowledgeBaseId: string;
  name: string;
  type: string;                            // 'pdf' | 'docx' | 'csv' | 'txt' | 'md'
  sizeBytes: number;
  chunkCount: number;
  status: KBDocumentStatus;
  uploadedAt: string;
}
```

### KBChunk (used by retrieval test + transcript drill-down)

```ts
interface KBChunk {
  id: string;                              // 'kbchunk-0001'
  knowledgeBaseId: string;
  documentId: string;
  documentName: string;                    // denormalized for display
  pageOrSection?: string;                  // 'p. 4' | '§3' | 'row 1822'
  text: string;
  tokenCount: number;
}

interface KBRetrievalResult extends KBChunk {
  score: number;                           // 0-1
}
```

### Per-attachment config (lives in agent config)

```ts
interface AgentKBAttachment {
  knowledgeBaseId: string;
  retrievalMode: 'always' | 'when_asked' | 'when_uncertain';
  topK: number;                            // 1-8
  scoreThreshold: number;                  // 0-1
  citationStyle: 'inline' | 'footnote' | 'off';
}
```

`AgentConfiguration` ([types/agent.ts](../frontend/src/types/agent.ts)) gains:
```ts
knowledgeBases?: AgentKBAttachment[];
```

### Per-call retrieval entry (lives in transcript)

```ts
interface CallRetrievalEvent {
  id: string;
  turnIndex: number;                       // which transcript turn triggered it
  knowledgeBaseId: string;
  query: string;
  topK: number;
  results: KBRetrievalResult[];
  citedResultIds: string[];                // subset of results that the agent cited
  latencyMs: number;
  timestamp: string;
}
```

`CallTranscript` gains:
```ts
retrievalEvents?: CallRetrievalEvent[];
```

### Seed data (Paytm-themed, single tenant per [ADR 0007](decisions/0007-stay-paytm-themed.md))

5 KBs, distributed across statuses:

| ID | Name | Source | Status | Docs | Chunks | Used by |
|---|---|---|---|---|---|---|
| `kb-001` | Paytm Product Catalog v3 | files | ready | 82 | 1,420 | 4 agents |
| `kb-002` | Paytm Wallet & UPI Policy | files | ready | 5 | 86 | 3 agents |
| `kb-003` | Paytm KYC FAQ | files | ready | 12 | 124 | 2 agents |
| `kb-004` | Paytm Loan Recovery Playbook | files | ready | 18 | 230 | 1 agent |
| `kb-005` | Paytm Help Center | url | empty | 0 | 0 | 0 agents |

One additional optional KB at `error` status (e.g., a flaky data-source connection) to demonstrate the error pill in the list view.

---

## 9. Out of scope for v1

- Real embedding generation, real vector storage, real retrieval. All mock.
- Re-ranking or hybrid search.
- Per-document access control inside a KB.
- Versioning of documents (snapshots).
- URL crawl ingestion (UI surfaced as disabled).
- Connected data source ingestion (UI surfaced as disabled).
- Citation rendering inside agent's TTS output (citations are visible to operators in transcripts; no synthesized "according to page 4" speech).
- Knowledge base sharing across workspaces.

---

## 10. Acceptance criteria for v1

A reviewer can, without us narrating:
1. Land on `/knowledge-bases`, see the list with statuses, and understand what each KB is for.
2. Click into a KB and run a test query that returns chunks with scores from realistic-looking documents.
3. Open the agent builder, scroll to the **Connect knowledge sources** panel inside the Instructions step, attach a KB, change retrieval mode and top-K, and see a preview of how chunks would inject into context.
4. Open a call drill-down (Phase 4), see retrieval events inline with the transcript, expand a chip, and see which chunks the agent cited.
5. Walk away saying "I understand how knowledge plugs into the agent and how it shows up at runtime."

If any of those five doesn't land in 30 seconds without explanation, the spec failed.
