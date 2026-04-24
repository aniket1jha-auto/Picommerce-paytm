import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import type {
  IntegrationDefinition,
  IntegrationConnectionStatus,
} from '@/data/integrationsCatalog';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
      {children}
    </p>
  );
}

const COMMERCE_FIELDS = [
  'phone',
  'email',
  'first_name',
  'last_name',
  'external_id',
  'loan_id',
  'dpd_bucket',
  'outstanding_amount',
];

const PROVIDER_FIELDS = [
  'Contact.Email',
  'Contact.Phone',
  'Lead.Status',
  'Account.Name',
  'Custom.LoanStage',
];

const MOCK_LOGS = [
  { t: '2026-04-18 09:12:04', ok: true, n: 1240, msg: 'Incremental sync completed' },
  { t: '2026-04-18 03:00:01', ok: true, n: 1188, msg: 'Scheduled sync' },
  { t: '2026-04-17 15:44:22', ok: false, n: 0, msg: 'OAuth token expired — refresh failed' },
  { t: '2026-04-17 09:00:00', ok: true, n: 1202, msg: 'Incremental sync completed' },
  { t: '2026-04-16 21:05:11', ok: true, n: 56, msg: 'Webhook batch processed' },
];

interface IntegrationsDrawerProps {
  integration: IntegrationDefinition;
  onClose: () => void;
  status: IntegrationConnectionStatus;
  onSave: () => void;
}

function StatusBadge({ status }: { status: IntegrationConnectionStatus }) {
  if (status === 'connected') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-xs font-semibold text-[#059669]">
        <CheckCircle2 size={12} />
        Connected
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF2F2] px-2.5 py-0.5 text-xs font-semibold text-[#DC2626]">
        <AlertTriangle size={12} />
        Error
      </span>
    );
  }
  return (
    <span className="rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
      Not connected
    </span>
  );
}

function MaskedInput({
  label,
  placeholder,
}: {
  label: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-text-secondary">{label}</span>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          autoComplete="off"
          placeholder={placeholder}
          className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 pr-10 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-secondary hover:bg-[#F3F4F6]"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide' : 'Show'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}

function ConfigurationFields({ def }: { def: IntegrationDefinition }) {
  const k = def.configKind;

  if (k === 'oauth') {
    return (
      <div className="space-y-4">
        <button
          type="button"
          className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-text-primary shadow-sm transition-colors hover:bg-[#F9FAFB]"
        >
          Connect with {def.name.split(' ')[0]}
        </button>
        <p className="text-xs text-text-secondary">
          After authorization, your workspace name and admin email will appear here with a{' '}
          <button type="button" className="font-medium text-cyan hover:underline">
            Disconnect
          </button>{' '}
          option.
        </p>
      </div>
    );
  }

  if (k === 'api_twilio' || k === 'api_zentrunk') {
    return (
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-text-secondary">Account SID</span>
          <input
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            placeholder="ACxxxxxxxx"
          />
        </label>
        <MaskedInput label="Auth Token" />
      </div>
    );
  }

  if (k === 'api_plivo') {
    return (
      <div className="space-y-3">
        <MaskedInput label="Auth ID" />
        <MaskedInput label="Auth Token" />
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-text-secondary">Default caller ID</span>
          <input
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            placeholder="+91xxxxxxxxxx"
          />
        </label>
      </div>
    );
  }

  if (k === 'api_whatsapp') {
    return (
      <div className="space-y-3">
        <MaskedInput label="API Key / System User token" />
        <MaskedInput label="API Secret" />
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-text-secondary">WABA ID</span>
          <input className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-text-secondary">Phone Number ID</span>
          <input className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20" />
        </label>
        <MaskedInput label="Webhook verify token" placeholder="Verify token" />
      </div>
    );
  }

  if (k === 'api_sendgrid') {
    return (
      <div className="space-y-3">
        <MaskedInput label="API Key" />
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-text-secondary">Sender email</span>
          <input
            type="email"
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            placeholder="noreply@yourdomain.com"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-text-secondary">Sender name</span>
          <input className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20" placeholder="Commerce" />
        </label>
      </div>
    );
  }

  if (k === 'api_razorpay') {
    return (
      <div className="space-y-3">
        <MaskedInput label="Key ID" />
        <MaskedInput label="Key Secret" />
        <MaskedInput label="Webhook secret" />
      </div>
    );
  }

  if (k === 'api_sms_gateway' || k === 'api_rcs') {
    return (
      <div className="space-y-3">
        <MaskedInput label="API Key / Username" />
        <MaskedInput label="API Secret / Password" />
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-text-secondary">Provider base URL</span>
          <input className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20" placeholder="https://" />
        </label>
      </div>
    );
  }

  if (k === 'api_slack') {
    return (
      <div className="space-y-3">
        <MaskedInput label="Bot User OAuth Token" />
        <MaskedInput label="Signing Secret" />
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-text-secondary">Default channel ID</span>
          <input className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20" placeholder="C01234567" />
        </label>
      </div>
    );
  }

  if (k === 'sftp') {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-text-secondary">Host</span>
            <input className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-text-secondary">Port</span>
            <input className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20" defaultValue="22" />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-text-secondary">Username</span>
          <input className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20" />
        </label>
        <MaskedInput label="Password / SSH key passphrase" />
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-text-secondary">Remote directory path</span>
          <input className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20" placeholder="/incoming/contacts" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-text-secondary">Sync frequency</span>
          <select className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20">
            <option>Hourly</option>
            <option>Every 6 hours</option>
            <option>Daily</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-text-secondary">File format</span>
          <select className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20">
            <option>CSV</option>
            <option>JSON</option>
          </select>
        </label>
      </div>
    );
  }

  if (k === 'webhook_inbound') {
    const isPayment = def.id === 'custom_payment_webhook';
    return (
      <div className="space-y-3">
        {isPayment ? (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-text-secondary">
              Listener URL (add this in your PSP)
            </span>
            <input
              readOnly
              className="w-full rounded-lg border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-text-primary"
              value="https://commerce.paytm.com/v1/hooks/payments/in_7f3a2b"
            />
          </label>
        ) : (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-text-secondary">
              Ingest base URL (call from your systems)
            </span>
            <input
              readOnly
              className="w-full rounded-lg border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-text-primary"
              value="https://commerce.paytm.com/v1/ingest/contacts"
            />
          </label>
        )}
        <MaskedInput label={isPayment ? 'Signing secret (verify PSP payload)' : 'Bearer / API key'} />
        {!isPayment && (
          <p className="text-xs text-text-secondary">
            Send JSON payloads with your API key. Map columns under{' '}
            <button type="button" className="font-medium text-cyan hover:underline">
              Schema
            </button>
            .
          </p>
        )}
        {isPayment && (
          <p className="text-xs text-text-secondary">
            Map PSP fields under{' '}
            <button type="button" className="font-medium text-cyan hover:underline">
              Event mapping
            </button>
            .
          </p>
        )}
      </div>
    );
  }

  if (k === 'webhook_outbound') {
    return (
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-text-secondary">Endpoint URL</span>
          <input className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20" placeholder="https://your-endpoint.com/webhooks/commerce" />
        </label>
        <MaskedInput label="Secret key for signature verification" />
        <div>
          <p className="mb-2 text-xs font-medium text-text-secondary">Events to send</p>
          <div className="flex flex-col gap-2 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] p-3">
            {[
              'Campaign sent',
              'Message delivered',
              'Message opened / call answered',
              'Contact responded',
              'Conversion / payment confirmed',
              'Contact opted out',
            ].map((ev) => (
              <label key={ev} className="flex cursor-pointer items-center gap-2 text-sm text-text-primary">
                <input type="checkbox" className="rounded border-[#D1D5DB]" defaultChecked />
                {ev}
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (k === 'rest_api') {
    return (
      <div className="space-y-3">
        <MaskedInput label="API key" />
        <MaskedInput label="API secret" />
        <p className="text-xs text-text-secondary">
          Keys are scoped under your workspace. Rotate keys from this screen at any time.
        </p>
      </div>
    );
  }

  return null;
}

export function IntegrationsDrawer({
  integration: def,
  onClose,
  status,
  onSave,
}: IntegrationsDrawerProps) {
  const [aboutOpen, setAboutOpen] = useState(true);
  const [testMsg, setTestMsg] = useState<'idle' | 'ok' | 'err'>('idle');
  const [syncDir, setSyncDir] = useState<'pull' | 'push' | 'both'>('both');
  const [dedupe, setDedupe] = useState<'phone' | 'email' | 'both'>('both');
  const [syncFq, setSyncFq] = useState<'realtime' | 'hourly' | 'daily'>('hourly');
  const [mapRows, setMapRows] = useState([{ id: 1, src: PROVIDER_FIELDS[0], dst: COMMERCE_FIELDS[0] }]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    setAboutOpen(true);
    setTestMsg('idle');
  }, [def.id]);

  const showLogs = status === 'connected';

  function runTest() {
    setTestMsg('idle');
    window.setTimeout(() => {
      setTestMsg(Math.random() > 0.15 ? 'ok' : 'err');
    }, 600);
  }

  return (
    <motion.div
      className="fixed inset-0 z-[60]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <button
        type="button"
        aria-label="Close panel"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="integration-drawer-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white ring-1 ring-[#E5E7EB]"
        style={{ boxShadow: '0 4px 12px rgba(0,41,112,0.12)' }}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.2, ease: 'easeInOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E5E7EB] px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-semibold text-[#6366F1]">
                {def.categoryLabel}
              </span>
            </div>
            <h2
              id="integration-drawer-title"
              className="mt-1 text-lg font-semibold leading-snug text-text-primary"
            >
              {def.name}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={status} />
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-[#F3F4F6] hover:text-text-primary"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {status === 'error' && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2.5 text-sm text-[#991B1B]">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <span>Re-authentication required — refresh credentials or reconnect.</span>
            </div>
          )}

          {/* About */}
          <section className="mb-4">
            <button
              type="button"
              onClick={() => setAboutOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F7F9FC] px-4 py-3 text-left transition-colors hover:bg-[#F3F4F6]"
            >
              <SectionLabel>About</SectionLabel>
              {aboutOpen ? (
                <ChevronUp size={18} className="shrink-0 text-text-secondary" />
              ) : (
                <ChevronDown size={18} className="shrink-0 text-text-secondary" />
              )}
            </button>
            {aboutOpen && (
              <div className="mt-2 space-y-3 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-text-secondary">
                <p>{def.about}</p>
                <div>
                  <p className="text-xs font-semibold text-text-primary">What gets synced</p>
                  <ul className="mt-2 space-y-1.5">
                    {def.whatGetsSynced.map((line) => (
                      <li key={line} className="flex gap-2 text-sm">
                        <span className="text-cyan">→</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">Used by</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {def.usedBy.map((u) => (
                      <span
                        key={u}
                        className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-[11px] font-medium text-text-secondary"
                      >
                        {u}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Configuration */}
          <section className="mb-4">
            <SectionLabel>Configuration</SectionLabel>
            <div className="mt-2 rounded-lg border border-[#E5E7EB] bg-white p-4">
              <ConfigurationFields def={def} />
            </div>
          </section>

          {/* CRM sync */}
          {def.hasCrmSyncSettings && (
            <section className="mb-4">
              <SectionLabel>Sync settings</SectionLabel>
              <div className="mt-2 space-y-4 rounded-lg border border-[#E5E7EB] bg-white p-4">
                <div>
                  <p className="mb-2 text-xs font-medium text-text-secondary">Sync direction</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ['pull', 'Pull only'],
                        ['push', 'Push only'],
                        ['both', 'Bidirectional'],
                      ] as const
                    ).map(([v, lab]) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSyncDir(v)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                          syncDir === v ? 'bg-cyan text-white' : 'bg-[#F3F4F6] text-text-secondary'
                        }`}
                      >
                        {lab}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-text-secondary">Contact deduplication</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ['phone', 'Phone'],
                        ['email', 'Email'],
                        ['both', 'Both'],
                      ] as const
                    ).map(([v, lab]) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setDedupe(v)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                          dedupe === v ? 'bg-cyan text-white' : 'bg-[#F3F4F6] text-text-secondary'
                        }`}
                      >
                        {lab}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-text-secondary">Field mapping</p>
                  <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
                    <table className="w-full min-w-[320px] text-left text-xs">
                      <thead className="bg-[#F9FAFB] text-text-secondary">
                        <tr>
                          <th className="px-2 py-2 font-medium">Source field</th>
                          <th className="px-2 py-2 font-medium">→</th>
                          <th className="px-2 py-2 font-medium">Commerce field</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mapRows.map((row) => (
                          <tr key={row.id} className="border-t border-[#F3F4F6]">
                            <td className="px-2 py-2">
                              <select
                                className="w-full rounded border border-[#E5E7EB] bg-white px-1 py-1"
                                value={row.src}
                                onChange={(e) =>
                                  setMapRows((rs) =>
                                    rs.map((r) =>
                                      r.id === row.id ? { ...r, src: e.target.value } : r,
                                    ),
                                  )
                                }
                              >
                                {PROVIDER_FIELDS.map((f) => (
                                  <option key={f} value={f}>
                                    {f}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-2 text-center text-text-secondary">→</td>
                            <td className="px-2 py-2">
                              <select
                                className="w-full rounded border border-[#E5E7EB] bg-white px-1 py-1"
                                value={row.dst}
                                onChange={(e) =>
                                  setMapRows((rs) =>
                                    rs.map((r) =>
                                      r.id === row.id ? { ...r, dst: e.target.value } : r,
                                    ),
                                  )
                                }
                              >
                                {COMMERCE_FIELDS.map((f) => (
                                  <option key={f} value={f}>
                                    {f}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    className="mt-2 text-xs font-medium text-cyan hover:underline"
                    onClick={() =>
                      setMapRows((rs) => [
                        ...rs,
                        {
                          id: Math.max(...rs.map((r) => r.id), 0) + 1,
                          src: PROVIDER_FIELDS[0],
                          dst: COMMERCE_FIELDS[0],
                        },
                      ])
                    }
                  >
                    + Add field mapping
                  </button>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-text-secondary">Sync frequency</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ['realtime', 'Real-time'],
                        ['hourly', 'Hourly'],
                        ['daily', 'Daily'],
                      ] as const
                    ).map(([v, lab]) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSyncFq(v)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                          syncFq === v ? 'bg-cyan text-white' : 'bg-[#F3F4F6] text-text-secondary'
                        }`}
                      >
                        {lab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Logs */}
          {showLogs && (
            <section className="mb-4">
              <SectionLabel>Status &amp; logs</SectionLabel>
              <div className="mt-2 rounded-lg border border-[#E5E7EB] bg-white p-4 text-sm">
                <div className="flex flex-wrap gap-4 text-xs">
                  <div>
                    <span className="text-text-secondary">Last synced</span>
                    <p className="mt-0.5 font-semibold text-text-primary">2026-04-18 09:12:04 IST</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Records synced</span>
                    <p className="mt-0.5 font-semibold text-text-primary">842,190</p>
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="text-text-secondary">
                      <tr>
                        <th className="pb-2 font-medium">Timestamp</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Records</th>
                        <th className="pb-2 font-medium">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_LOGS.map((row) => (
                        <tr key={row.t} className="border-t border-[#F3F4F6]">
                          <td className="py-2 text-text-secondary">{row.t}</td>
                          <td className="py-2">
                            {row.ok ? (
                              <span className="text-[#059669]">Success</span>
                            ) : (
                              <span className="text-[#DC2626]">Error</span>
                            )}
                          </td>
                          <td className="py-2">{row.n.toLocaleString()}</td>
                          <td className="py-2 text-text-secondary">{row.msg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" className="mt-3 text-xs font-medium text-cyan hover:underline">
                  View full logs
                </button>
              </div>
            </section>
          )}

          {testMsg !== 'idle' && (
            <div
              className={`mb-4 rounded-lg px-3 py-2 text-sm ${
                testMsg === 'ok'
                  ? 'border border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]'
                  : 'border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]'
              }`}
            >
              {testMsg === 'ok'
                ? 'Connection successful — credentials verified.'
                : 'Connection failed — check credentials and network.'}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-5 py-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={runTest}
                className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50"
              >
                Test connection
              </button>
              <button
                type="button"
                onClick={onSave}
                className="inline-flex items-center justify-center rounded-md bg-cyan px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}
