/**
 * /tokens-reference — Phase 1.5 (colour-system correction).
 *
 * Demonstrates every token in tokens.css. Anchor switched from violet
 * to deep navy + Paytm bright blue. Cool slate neutrals replace warm
 * stone. Chart palette added.
 */

import { useState } from 'react';

export function TokensReference() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-text-primary">
      <div className="mx-auto max-w-[1100px] px-8 py-12">
        <Header />
        <ColorNeutrals />
        <ColorBrand />
        <ColorBlue />
        <ColorSemantic />
        <LogoGradient />
        <ChartPalette />
        <Typography />
        <Spacing />
        <Radius />
        <Shadows />
        <Motion />
        <Footer />
      </div>
    </div>
  );
}

/* ─── Page header ──────────────────────────────────────────────────── */

function Header() {
  return (
    <header className="mb-16">
      <div className="text-[11px] font-medium uppercase tracking-[0.10em] text-text-tertiary">
        Phase 1.5 · Colour-system correction
      </div>
      <h1 className="mt-2 font-display text-4xl text-text-primary">
        Token reference
      </h1>
      <p className="mt-3 max-w-[60ch] text-base text-text-secondary">
        Single source of truth. Light mode only. Deep navy as the brand
        anchor, Paytm bright blue as the secondary energy colour, cool slate
        neutrals. Two colours with distinct roles — primary CTAs in navy,
        focus rings + links + live indicators in bright blue.
      </p>
    </header>
  );
}

/* ─── Section primitive ────────────────────────────────────────────── */

function Section({
  index,
  title,
  description,
  children,
}: {
  index: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <div className="mb-6 flex items-baseline gap-3">
        <span className="font-mono text-[11px] tabular-nums text-text-tertiary">
          {index}
        </span>
        <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      </div>
      {description && (
        <p className="mb-6 max-w-[60ch] text-sm text-text-secondary">
          {description}
        </p>
      )}
      {children}
    </section>
  );
}

/* ─── 3.1 Neutrals ─────────────────────────────────────────────────── */

const NEUTRALS = [
  { name: '--bg-canvas',       value: '#F8FAFC', utility: 'bg-canvas' },
  { name: '--bg-surface',      value: '#FFFFFF', utility: 'bg-surface' },
  { name: '--bg-subtle',       value: '#F1F5F9', utility: 'bg-subtle' },
  { name: '--bg-muted',        value: '#E2E8F0', utility: 'bg-muted' },
  { name: '--border-subtle',   value: '#E2E8F0', utility: 'border-border-subtle' },
  { name: '--border-default',  value: '#CBD5E1', utility: 'border-border-default' },
  { name: '--border-strong',   value: '#94A3B8', utility: 'border-border-strong' },
  { name: '--text-primary',    value: '#0F172A', utility: 'text-text-primary' },
  { name: '--text-secondary',  value: '#334155', utility: 'text-text-secondary' },
  { name: '--text-tertiary',   value: '#64748B', utility: 'text-text-tertiary' },
  { name: '--text-disabled',   value: '#94A3B8', utility: 'text-text-disabled' },
] as const;

function ColorNeutrals() {
  return (
    <Section
      index="3.1"
      title="Color · neutrals (cool slate)"
      description="Cool, crisp, financial-app. Replaces the warm stone family from Phase 1 — Paytm's UI is cool, not warm."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {NEUTRALS.map((t) => (
          <Swatch key={t.name} {...t} />
        ))}
      </div>
    </Section>
  );
}

function Swatch({
  name,
  value,
  utility,
}: {
  name: string;
  value: string;
  utility: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface p-3">
      <div
        className="h-10 w-10 shrink-0 rounded-md border border-border-subtle"
        style={{ background: value }}
      />
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[11px] text-text-primary tabular-nums">
          {name}
        </div>
        <div className="font-mono text-[11px] text-text-tertiary tabular-nums">
          {value}
        </div>
        <div className="mt-0.5 font-mono text-[10px] text-text-tertiary">
          {utility}
        </div>
      </div>
    </div>
  );
}

/* ─── 3.2 Brand · navy ─────────────────────────────────────────────── */

const BRAND_SCALE = [
  { step: 50,  value: '#EBF1FB' },
  { step: 100, value: '#D1DEF5' },
  { step: 200, value: '#A3BCEB' },
  { step: 300, value: '#6E94DC' },
  { step: 400, value: '#4570CC' },
  { step: 500, value: '#1F4FBF' },
  { step: 600, value: '#173FA0' },
  { step: 700, value: '#102E80' },
  { step: 800, value: '#0A2160' },
  { step: 900, value: '#061645' },
] as const;

function ColorBrand() {
  return (
    <Section
      index="3.2"
      title="Color · brand (deep navy)"
      description="The brand anchor. Primary CTAs, page headers, active sidebar item, completed-status backgrounds, the π logo navy stop. Reads as financial-grade, calm, enterprise."
    >
      <ScaleStrip
        tokens={BRAND_SCALE}
        primary={500}
        utility="brand"
      />
      <p className="mt-3 text-xs text-text-tertiary">
        500 (highlighted) is the primary; 600 hover/pressed; 50 selected-state
        backgrounds; 700 active-nav text on brand-50 background.
      </p>
    </Section>
  );
}

/* ─── 3.3 Blue · Paytm ─────────────────────────────────────────────── */

const BLUE_SCALE = [
  { step: 50,  value: '#E5F8FE' },
  { step: 100, value: '#BFEEFD' },
  { step: 200, value: '#80DDFB' },
  { step: 300, value: '#40CCF8' },
  { step: 400, value: '#1AC1F4' },
  { step: 500, value: '#00BAF2' },
  { step: 600, value: '#0095C2' },
  { step: 700, value: '#007293' },
  { step: 800, value: '#004F66' },
  { step: 900, value: '#002C3A' },
] as const;

function ColorBlue() {
  return (
    <Section
      index="3.3"
      title="Color · secondary (Paytm bright blue)"
      description="Coexists with brand navy with a different role. Focus rings, links, live indicators, info badges, AI-touched surfaces, the π logo bright stop. Energetic, supportive, never dominant."
    >
      <ScaleStrip
        tokens={BLUE_SCALE}
        primary={500}
        utility="blue"
      />
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RoleCard
          title="Two-colour discipline"
          rules={[
            'Primary CTAs → brand-500 (navy)',
            'Focus rings → blue, 25% alpha',
            'Links → blue-600',
            'Live / voice indicators → blue-500',
            'Active sidebar → brand-50 bg + brand-700 text',
            'Selected table row → brand-50',
            'AI-touched surface tint → blue at 5–10%',
            'Info badges → blue family (bg/border/text)',
            'Status: completed → brand-100 bg, brand-700 text',
          ]}
          tone="ok"
        />
        <RoleCard
          title="Forbidden"
          rules={[
            'Bright blue on primary CTAs',
            'Deep navy as body text colour',
            'Both colours as fills on the same component (logo excepted)',
            'Any violet token (chart-7 only)',
          ]}
          tone="warn"
        />
      </div>
    </Section>
  );
}

function ScaleStrip({
  tokens,
  primary,
  utility,
}: {
  tokens: ReadonlyArray<{ step: number; value: string }>;
  primary: number;
  utility: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
      {tokens.map((t) => {
        const isPrimary = t.step === primary;
        return (
          <div key={t.step} className="flex flex-col gap-1.5">
            <div
              className={
                'h-16 rounded-md ' +
                (isPrimary ? 'ring-2 ring-offset-2 ring-text-primary' : '')
              }
              style={{ background: t.value }}
              aria-label={`${utility}-${t.step}`}
            />
            <div className="font-mono text-[10px] text-text-secondary tabular-nums">
              {t.step}
            </div>
            <div className="font-mono text-[10px] text-text-tertiary tabular-nums">
              {t.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RoleCard({
  title,
  rules,
  tone,
}: {
  title: string;
  rules: string[];
  tone: 'ok' | 'warn';
}) {
  const dot = tone === 'ok' ? '#10B981' : '#EF4444';
  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
        <span className="text-[13px] font-semibold text-text-primary">{title}</span>
      </div>
      <ul className="mt-2 space-y-1">
        {rules.map((r) => (
          <li key={r} className="text-[12px] leading-5 text-text-secondary">
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── 3.4 Semantic status ──────────────────────────────────────────── */

const SEMANTIC = [
  { key: 'success', label: 'Success', bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', solid: '#10B981' },
  { key: 'warning', label: 'Warning', bg: '#FFFBEB', border: '#FDE68A', text: '#854D0E', solid: '#F59E0B' },
  { key: 'danger',  label: 'Danger',  bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', solid: '#EF4444' },
  { key: 'info',    label: 'Info',    bg: '#E5F8FE', border: '#BFEEFD', text: '#007293', solid: '#00BAF2' },
] as const;

function ColorSemantic() {
  return (
    <Section
      index="3.4"
      title="Color · semantic status"
      description="Success / warning / danger keep their meaning. Info shifts to the bright Paytm-blue family — info badges, scheduled states, and informational toasts now read as Paytm blue, stitching the secondary colour into the system."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SEMANTIC.map((s) => (
          <div key={s.key} className="rounded-lg border border-border-subtle bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-text-primary">
                {s.label}
              </span>
              <span className="font-mono text-[10px] text-text-tertiary">
                --{s.key}-*
              </span>
            </div>
            <div
              className="mt-3 flex items-center gap-2 rounded-md border px-3 py-2"
              style={{ background: s.bg, borderColor: s.border, color: s.text }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: s.solid }} />
              <span className="text-[12px] font-medium">
                {s.label} state — bg + border + text
              </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-[10px] font-mono text-text-tertiary tabular-nums">
              {(['bg', 'border', 'text', 'solid'] as const).map((k) => (
                <div key={k} className="flex flex-col gap-1">
                  <div
                    className="h-6 rounded border border-border-subtle"
                    style={{ background: s[k] }}
                  />
                  <div>{k}</div>
                  <div className="text-text-disabled">{s[k]}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── 3.5 Logo gradient ────────────────────────────────────────────── */

function LogoGradient() {
  return (
    <Section
      index="3.5"
      title="Color · logo gradient (one place only)"
      description="Sweeps from deep navy to bright Paytm blue. Used on the π mark and nowhere else in the product. The single 'wow' use of colour in the system."
    >
      <div className="flex flex-wrap items-center gap-4">
        <div
          className="relative inline-flex h-20 w-20 items-center justify-center rounded-2xl shadow-[var(--shadow-md)]"
          style={{ background: 'var(--logo-gradient)' }}
        >
          <span className="font-display text-4xl text-white" aria-hidden>
            π
          </span>
        </div>
        <div className="flex flex-col gap-2 font-mono text-[11px] text-text-secondary">
          <div>
            <span className="text-text-tertiary">--logo-gradient</span>{' '}
            linear-gradient(135°, #1F4FBF → #00BAF2)
          </div>
          <div>
            <span className="text-text-tertiary">--logo-glow</span>{' '}
            radial-gradient(rgba(0, 186, 242, 0.30) → transparent 70%)
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-text-tertiary">
        Phase 2 builds the refined SVG π mark + glow + intro animation.
      </p>
    </Section>
  );
}

/* ─── 3.6 Chart palette ────────────────────────────────────────────── */

const CHART_PALETTE = [
  { name: '--chart-1', value: '#1F4FBF', label: 'navy · primary series' },
  { name: '--chart-2', value: '#00BAF2', label: 'bright blue · secondary' },
  { name: '--chart-3', value: '#10B981', label: 'green' },
  { name: '--chart-4', value: '#F59E0B', label: 'amber' },
  { name: '--chart-5', value: '#EF4444', label: 'red' },
  { name: '--chart-6', value: '#14B8A6', label: 'teal' },
  { name: '--chart-7', value: '#8B5CF6', label: 'violet · contained' },
  { name: '--chart-8', value: '#F97316', label: 'orange' },
] as const;

function ChartPalette() {
  return (
    <Section
      index="3.6"
      title="Color · chart palette"
      description="8-colour sequence used in order for multi-series charts. Starts with the two anchors (navy → bright blue), then semantic, then richer fills. Violet appears here only — contained, never as a system anchor."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CHART_PALETTE.map((c, i) => (
          <div
            key={c.name}
            className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface p-3"
          >
            <div
              className="h-10 w-10 shrink-0 rounded-md"
              style={{ background: c.value }}
            />
            <div className="min-w-0">
              <div className="font-mono text-[11px] tabular-nums text-text-primary">
                chart-{i + 1}
              </div>
              <div className="font-mono text-[10px] tabular-nums text-text-tertiary">
                {c.value}
              </div>
              <div className="text-[10px] text-text-tertiary">{c.label}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── 3.7 Typography ───────────────────────────────────────────────── */

function Typography() {
  return (
    <Section
      index="3.7"
      title="Typography"
      description="Inter for UI, Instrument Serif (display) on greetings + object names + empty-state headlines, JetBrains Mono on data and IDs. Weights restricted to 400 / 500 / 600. Numerics always tabular."
    >
      <div className="rounded-lg border border-border-subtle bg-surface p-6">
        <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
          Display · Instrument Serif · 400
        </div>
        <p className="mt-3 font-display text-4xl text-text-primary">
          Good morning, Aniket
        </p>
        <p className="mt-1 font-display text-3xl text-text-primary">
          High-LTV Re-engagement
        </p>
        <p className="mt-1 font-display text-2xl italic text-text-secondary">
          The agent that knows your knowledge.
        </p>
      </div>

      <div className="mt-3 rounded-lg border border-border-subtle bg-surface p-6">
        <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
          UI · Inter · 400 / 500 / 600
        </div>
        <div className="mt-4 space-y-3">
          <ScaleRow size="text-4xl"  label="4xl · 3rem"  weight="font-medium" />
          <ScaleRow size="text-3xl"  label="3xl · 2.25rem" weight="font-medium" />
          <ScaleRow size="text-2xl"  label="2xl · 1.875rem" weight="font-semibold" />
          <ScaleRow size="text-xl"   label="xl · 1.5rem" weight="font-semibold" />
          <ScaleRow size="text-lg"   label="lg · 1.25rem" weight="font-semibold" />
          <ScaleRow size="text-md"   label="md · 1.125rem" weight="font-medium" />
          <ScaleRow size="text-base" label="base · 1rem · body" weight="font-normal" />
          <ScaleRow size="text-sm"   label="sm · 0.875rem · table cells" weight="font-medium" />
          <ScaleRow size="text-xs"   label="xs · 0.75rem · labels & badges" weight="font-medium" />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border-subtle bg-surface p-6">
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Tabular numerals · ON
          </div>
          <table className="mt-4 w-full tabular-nums text-sm text-text-primary">
            <tbody>
              <tr className="border-b border-border-subtle">
                <td className="py-2">Reach</td>
                <td className="py-2 text-right">1,24,000</td>
              </tr>
              <tr className="border-b border-border-subtle">
                <td className="py-2">Converted</td>
                <td className="py-2 text-right">14,672</td>
              </tr>
              <tr>
                <td className="py-2">Conv rate</td>
                <td className="py-2 text-right">11.8%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface p-6">
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            JetBrains Mono · IDs & payloads
          </div>
          <pre className="mt-4 overflow-x-auto rounded-md bg-subtle p-3 font-mono text-[12px] leading-5 text-text-primary">
{`{
  "agent_id": "agent_1",
  "call_id":  "call-7f3a9",
  "p95":      920
}`}
          </pre>
        </div>
      </div>
    </Section>
  );
}

function ScaleRow({
  size,
  label,
  weight,
}: {
  size: string;
  label: string;
  weight: string;
}) {
  return (
    <div className="flex items-baseline gap-4">
      <div className="w-[180px] shrink-0 font-mono text-[11px] text-text-tertiary tabular-nums">
        {label}
      </div>
      <div className={`${size} ${weight} text-text-primary truncate`}>
        Trusted, financial-grade
      </div>
    </div>
  );
}

/* ─── 3.8 Spacing ──────────────────────────────────────────────────── */

const SPACING_TOKENS = [
  { name: '1', px: 4 },
  { name: '2', px: 8 },
  { name: '3', px: 12 },
  { name: '4', px: 16 },
  { name: '5', px: 20 },
  { name: '6', px: 24 },
  { name: '8', px: 32 },
  { name: '10', px: 40 },
  { name: '12', px: 48 },
  { name: '16', px: 64 },
  { name: '20', px: 80 },
];

function Spacing() {
  return (
    <Section
      index="3.8"
      title="Spacing"
      description="4px base. Comfortable, not compact. Cards p-6 (24px) min. Section breaks space-y-12 (48px)."
    >
      <div className="rounded-lg border border-border-subtle bg-surface p-6 space-y-2">
        {SPACING_TOKENS.map((t) => (
          <div key={t.name} className="flex items-center gap-4">
            <div className="w-16 shrink-0 font-mono text-[11px] text-text-tertiary tabular-nums">
              --space-{t.name}
            </div>
            <div className="w-12 shrink-0 font-mono text-[11px] text-text-secondary tabular-nums">
              {t.px}px
            </div>
            <div
              className="h-3 rounded-sm bg-brand-200"
              style={{ width: `${t.px}px` }}
            />
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── 3.9 Radius ───────────────────────────────────────────────────── */

function Radius() {
  const items = [
    { name: 'xs', value: 4 },
    { name: 'sm', value: 6 },
    { name: 'md', value: 8 },
    { name: 'lg', value: 12 },
    { name: 'xl', value: 16 },
    { name: '2xl', value: 24 },
    { name: 'full', value: 9999 },
  ];
  return (
    <Section
      index="3.9"
      title="Radius"
      description="Notion uses 6–8px commonly; Stripe uses 8–12px. We sit there. Buttons md (8), cards lg (12), modals xl (16)."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {items.map((it) => (
          <div
            key={it.name}
            className="flex flex-col items-center gap-2 rounded-md border border-border-subtle bg-surface p-3"
          >
            <div
              className="h-16 w-16 bg-brand-100 border border-brand-200"
              style={{ borderRadius: it.value }}
            />
            <div className="font-mono text-[11px] text-text-secondary tabular-nums">
              {it.name}
            </div>
            <div className="font-mono text-[10px] text-text-tertiary tabular-nums">
              {it.name === 'full' ? '∞' : `${it.value}px`}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── 3.10 Shadows ─────────────────────────────────────────────────── */

function Shadows() {
  const items = [
    { name: 'xs', token: 'var(--shadow-xs)', use: 'cards (default)' },
    { name: 'sm', token: 'var(--shadow-sm)', use: 'small interactive' },
    { name: 'md', token: 'var(--shadow-md)', use: 'card hover' },
    { name: 'lg', token: 'var(--shadow-lg)', use: 'dropdowns / popovers' },
    { name: 'xl', token: 'var(--shadow-xl)', use: 'modals / drawers' },
  ];
  return (
    <Section
      index="3.10"
      title="Shadow"
      description="Soft, layered. Slate-shifted alpha to harmonise with the cooler neutrals. Discipline: shadow OR border, never both. Cards on canvas use shadow-xs alone."
    >
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((it) => (
          <div key={it.name} className="flex flex-col items-center gap-3 p-4">
            <div
              className="h-20 w-full rounded-lg bg-surface"
              style={{ boxShadow: it.token }}
            />
            <div className="text-center">
              <div className="font-mono text-[11px] text-text-secondary tabular-nums">
                shadow-{it.name}
              </div>
              <div className="text-[10px] text-text-tertiary">{it.use}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-text-tertiary">
        Focus ring uses{' '}
        <span className="font-mono">--shadow-focus</span> (3px Paytm-blue ring at
        25% opacity). Try tabbing to the inputs in §3.7 above.
      </p>
    </Section>
  );
}

/* ─── 3.11 Motion ──────────────────────────────────────────────────── */

function Motion() {
  return (
    <Section
      index="3.11"
      title="Motion"
      description="Default: ease-out + duration-fast (160ms). 90% of motion is this. Spring easing only on logo intro, primary CTA tap, and 'promote winner' celebration."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MotionCard label="Fast · 160ms" easing="var(--ease-out)" duration="160ms" />
        <MotionCard label="Base · 240ms" easing="var(--ease-out)" duration="240ms" />
        <MotionCard label="Slow · 360ms" easing="var(--ease-in-out)" duration="360ms" />
      </div>
      <SpringDemo />
    </Section>
  );
}

function MotionCard({
  label,
  easing,
  duration,
}: {
  label: string;
  easing: string;
  duration: string;
}) {
  return (
    <button
      type="button"
      className="group rounded-lg border border-border-subtle bg-surface p-5 text-left"
      style={{ transition: `transform ${duration} ${easing}, box-shadow ${duration} ${easing}` }}
    >
      <div className="font-mono text-[11px] text-text-tertiary tabular-nums">
        {label}
      </div>
      <div
        className="mt-3 h-10 w-10 rounded-md bg-brand-500 transition-transform"
        style={{
          transform: 'translateY(0)',
          transition: `transform ${duration} ${easing}, box-shadow ${duration} ${easing}`,
        }}
      />
      <p className="mt-3 text-[12px] text-text-secondary">
        Hover the card to see the easing.
      </p>
      <style>{`
        .group:hover > div:nth-of-type(2) {
          transform: translateY(-6px);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </button>
  );
}

function SpringDemo() {
  const [count, setCount] = useState(0);
  return (
    <div className="mt-3 rounded-lg border border-border-subtle bg-surface p-5">
      <div className="font-mono text-[11px] text-text-tertiary tabular-nums">
        Spring · ease-spring · only for delight
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-xs)] hover:bg-brand-600 hover:shadow-[var(--shadow-sm)] active:bg-brand-700"
          style={{ transition: 'all 240ms var(--ease-spring)' }}
        >
          Tap me
        </button>
        <span className="font-mono text-[12px] text-text-secondary tabular-nums">
          tapped {count}×
        </span>
      </div>
    </div>
  );
}

/* ─── Footer ───────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="mt-16 border-t border-border-subtle pt-8 text-[12px] text-text-tertiary">
      <p className="max-w-[60ch]">
        Phase 1.5 colour gate. Next: <strong>Phase 2 · π logo treatment</strong>{' '}
        (refined SVG, navy → bright-blue gradient fill, hover state, intro
        animation, breathing loader). Then Phase 3 builds the component
        primitives that consume these tokens.
      </p>
    </footer>
  );
}
