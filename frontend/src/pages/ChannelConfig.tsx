import { useMemo, useState } from 'react';
import {
  Plus,
  Trash2,
  KeyRound,
  Mail,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Smartphone,
  Phone,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/common/Toast';

/**
 * Account Manager — connect the accounts and senders that campaigns and agents
 * use. Each channel surfaces its connected accounts and an "Add account" flow.
 */

type AccountChannelKey =
  | 'whatsapp'
  | 'sms'
  | 'rcs'
  | 'ai_voice'
  | 'email'
  | 'meta_ads';

type FieldType = 'text' | 'password' | 'select';

interface AccountField {
  key: string;
  label: string;
  placeholder?: string;
  type?: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
}

interface ChannelDef {
  key: AccountChannelKey;
  name: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  accountSingular: string;
  accountPlural: string;
  fields: AccountField[];
  primaryFieldKey: string;
  secondaryFieldKey?: string;
}

const CHANNEL_DEFS: ChannelDef[] = [
  {
    key: 'whatsapp',
    name: 'WhatsApp',
    description: 'WhatsApp Business API — send templated messages and handle live sessions.',
    icon: MessageCircle,
    iconBg: '#25D36614',
    iconColor: '#25D366',
    accountSingular: 'WhatsApp business account',
    accountPlural: 'WhatsApp business accounts',
    primaryFieldKey: 'phone',
    secondaryFieldKey: 'displayName',
    fields: [
      { key: 'displayName', label: 'Display name', placeholder: 'Paytm Commerce', required: true },
      { key: 'wabaId', label: 'WABA ID', placeholder: '123456789012345', required: true },
      { key: 'phoneNumberId', label: 'Phone number ID', placeholder: '987654321098765', required: true },
      { key: 'phone', label: 'Phone number', placeholder: '+91 90000 11111', required: true },
      {
        key: 'apiToken',
        label: 'Permanent access token',
        placeholder: 'EAA…',
        type: 'password',
        required: true,
        helpText: 'Stored encrypted. Used to send messages on behalf of this WABA.',
      },
    ],
  },
  {
    key: 'sms',
    name: 'SMS',
    description: 'Bulk transactional and campaign SMS via your aggregator.',
    icon: MessageSquare,
    iconBg: '#6366F114',
    iconColor: '#6366F1',
    accountSingular: 'sender ID',
    accountPlural: 'sender IDs',
    primaryFieldKey: 'senderId',
    secondaryFieldKey: 'category',
    fields: [
      { key: 'senderId', label: 'Sender ID', placeholder: 'PYTMCM', required: true, helpText: '6-character DLT-registered header' },
      {
        key: 'category',
        label: 'Category',
        type: 'select',
        required: true,
        options: [
          { value: 'Promotional', label: 'Promotional' },
          { value: 'Transactional', label: 'Transactional' },
          { value: 'Service-Implicit', label: 'Service – Implicit' },
          { value: 'Service-Explicit', label: 'Service – Explicit' },
        ],
      },
      { key: 'entityId', label: 'DLT entity ID', placeholder: '1102…', required: true },
      { key: 'principalEntityId', label: 'Principal entity ID', placeholder: '1701…' },
    ],
  },
  {
    key: 'rcs',
    name: 'RCS',
    description: 'Rich Communication Services for supported Android carriers.',
    icon: Smartphone,
    iconBg: '#00BAF214',
    iconColor: '#00BAF2',
    accountSingular: 'RCS brand',
    accountPlural: 'RCS brands',
    primaryFieldKey: 'brandName',
    secondaryFieldKey: 'agentId',
    fields: [
      { key: 'brandName', label: 'Brand name', placeholder: 'Paytm Commerce', required: true },
      { key: 'agentId', label: 'RBM agent ID', placeholder: 'paytm-commerce-agent', required: true },
      { key: 'serviceAccountKey', label: 'Service account key (JSON)', type: 'password', required: true, helpText: 'Google service account JSON for RBM API' },
    ],
  },
  {
    key: 'ai_voice',
    name: 'AI Voice Call',
    description: 'Phone numbers used by voice agents for outbound and inbound calls.',
    icon: Phone,
    iconBg: '#F59E0B14',
    iconColor: '#F59E0B',
    accountSingular: 'phone number',
    accountPlural: 'phone numbers',
    primaryFieldKey: 'phone',
    secondaryFieldKey: 'provider',
    fields: [
      { key: 'phone', label: 'Phone number', placeholder: '+91 80000 11111', required: true },
      {
        key: 'provider',
        label: 'Carrier / provider',
        type: 'select',
        required: true,
        options: [
          { value: 'Plivo', label: 'Plivo' },
          { value: 'Other', label: 'Other' },
        ],
      },
      { key: 'authId', label: 'Auth ID', placeholder: 'MA…', required: true },
      { key: 'authToken', label: 'Auth token', type: 'password', required: true },
    ],
  },
  {
    key: 'email',
    name: 'Email',
    description: 'Send campaign and transactional email from your verified senders.',
    icon: Mail,
    iconBg: '#0F766E14',
    iconColor: '#0F766E',
    accountSingular: 'sender address',
    accountPlural: 'sender addresses',
    primaryFieldKey: 'fromAddress',
    secondaryFieldKey: 'fromName',
    fields: [
      { key: 'fromName', label: 'From name', placeholder: 'Paytm Commerce', required: true },
      { key: 'fromAddress', label: 'From address', placeholder: 'hello@paytm.com', required: true },
      { key: 'replyTo', label: 'Reply-to address', placeholder: 'support@paytm.com' },
      { key: 'smtpHost', label: 'SMTP host', placeholder: 'smtp.eu.mailgun.org', required: true },
      { key: 'smtpUser', label: 'SMTP username', placeholder: 'postmaster@paytm.com', required: true },
      { key: 'smtpPassword', label: 'SMTP password', type: 'password', required: true },
    ],
  },
  {
    key: 'meta_ads',
    name: 'Meta Ads',
    description: 'Run Meta (Facebook + Instagram) ads with audiences synced from Commerce.',
    icon: Megaphone,
    iconBg: '#1877F214',
    iconColor: '#1877F2',
    accountSingular: 'ad account',
    accountPlural: 'ad accounts',
    primaryFieldKey: 'adAccountId',
    secondaryFieldKey: 'businessName',
    fields: [
      { key: 'businessName', label: 'Business name', placeholder: 'Paytm Loans', required: true },
      { key: 'businessId', label: 'Business Manager ID', placeholder: '1234567890', required: true },
      { key: 'adAccountId', label: 'Ad account ID', placeholder: 'act_1234567890', required: true },
      {
        key: 'oauthToken',
        label: 'System user access token',
        type: 'password',
        required: true,
        helpText: 'Long-lived token from Meta Business Manager',
      },
    ],
  },
];

interface AccountRecord {
  id: string;
  channel: AccountChannelKey;
  values: Record<string, string>;
  createdAt: string;
}

const INITIAL_ACCOUNTS: AccountRecord[] = [
  {
    id: 'acc-wa-1',
    channel: 'whatsapp',
    values: {
      displayName: 'Paytm Commerce',
      wabaId: '108457299234561',
      phoneNumberId: '904671234567890',
      phone: '+91 90000 11111',
      apiToken: '••••••••',
    },
    createdAt: '2026-04-12T09:14:00Z',
  },
  {
    id: 'acc-sms-1',
    channel: 'sms',
    values: {
      senderId: 'PYTMCM',
      category: 'Promotional',
      entityId: '1101234567890',
    },
    createdAt: '2026-04-08T11:02:00Z',
  },
  {
    id: 'acc-sms-2',
    channel: 'sms',
    values: {
      senderId: 'PYTMTX',
      category: 'Transactional',
      entityId: '1101234567899',
    },
    createdAt: '2026-04-08T11:04:00Z',
  },
  {
    id: 'acc-voice-1',
    channel: 'ai_voice',
    values: {
      phone: '+91 80000 11111',
      provider: 'Plivo',
      authId: 'MAYZK0YZQ4M2RMNJ…',
      authToken: '••••••••',
    },
    createdAt: '2026-04-15T10:28:00Z',
  },
  {
    id: 'acc-email-1',
    channel: 'email',
    values: {
      fromName: 'Paytm Commerce',
      fromAddress: 'hello@paytm.com',
      replyTo: 'support@paytm.com',
      smtpHost: 'smtp.eu.mailgun.org',
      smtpUser: 'postmaster@paytm.com',
      smtpPassword: '••••••••',
    },
    createdAt: '2026-04-20T08:00:00Z',
  },
  {
    id: 'acc-meta-1',
    channel: 'meta_ads',
    values: {
      businessName: 'Paytm Loans',
      businessId: '1234567890',
      adAccountId: 'act_1234567890',
      oauthToken: '••••••••',
    },
    createdAt: '2026-04-22T15:46:00Z',
  },
];

export function ChannelConfig() {
  const [accounts, setAccounts] = useState<AccountRecord[]>(INITIAL_ACCOUNTS);
  const [adding, setAdding] = useState<ChannelDef | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AccountRecord | null>(null);

  const accountsByChannel = useMemo(() => {
    const map: Record<AccountChannelKey, AccountRecord[]> = {
      whatsapp: [],
      sms: [],
      rcs: [],
      ai_voice: [],
      email: [],
      meta_ads: [],
    };
    for (const a of accounts) map[a.channel].push(a);
    return map;
  }, [accounts]);

  const totalAccounts = accounts.length;
  const channelsWithAccounts = CHANNEL_DEFS.filter(
    (c) => accountsByChannel[c.key].length > 0,
  ).length;

  function handleSave(channel: ChannelDef, values: Record<string, string>) {
    const newAcc: AccountRecord = {
      id: `acc-${channel.key}-${Date.now()}`,
      channel: channel.key,
      values,
      createdAt: new Date().toISOString(),
    };
    setAccounts((prev) => [...prev, newAcc]);
    setAdding(null);
    setToast(`${channel.accountSingular[0].toUpperCase() + channel.accountSingular.slice(1)} added`);
  }

  function handleDelete(acc: AccountRecord) {
    setAccounts((prev) => prev.filter((a) => a.id !== acc.id));
    setPendingDelete(null);
    setToast('Account removed');
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Account Manager"
        subtitle="Connect the accounts, phone numbers, and senders your campaigns and agents use"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={KeyRound}
          iconBg="#0EA5E91A"
          iconColor="#0EA5E9"
          label="Connected accounts"
          value={totalAccounts}
          hint="Across all channels"
        />
        <StatCard
          icon={MessageCircle}
          iconBg="#25D3661A"
          iconColor="#25D366"
          label="Channels active"
          value={channelsWithAccounts}
          hint={`${CHANNEL_DEFS.length} channels supported`}
        />
        <StatCard
          icon={Megaphone}
          iconBg="#1877F21A"
          iconColor="#1877F2"
          label="Ad accounts"
          value={accountsByChannel.meta_ads.length}
          hint="Connected to Meta Business Manager"
        />
      </div>

      <div className="flex flex-col gap-4">
        {CHANNEL_DEFS.map((ch) => (
          <ChannelAccountsCard
            key={ch.key}
            channel={ch}
            accounts={accountsByChannel[ch.key]}
            onAdd={() => setAdding(ch)}
            onDelete={(acc) => setPendingDelete(acc)}
          />
        ))}
      </div>

      {adding && (
        <AddAccountModal
          channel={adding}
          onClose={() => setAdding(null)}
          onSave={(values) => handleSave(adding, values)}
        />
      )}

      {pendingDelete && (
        <Modal
          open={!!pendingDelete}
          onClose={() => setPendingDelete(null)}
          title="Remove account?"
          size="sm"
          footer={
            <>
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-md border border-border-subtle bg-surface px-3.5 py-1.5 text-[13px] font-medium text-text-secondary hover:bg-surface-sunken"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(pendingDelete)}
                className="rounded-md bg-red-600 px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-red-700"
              >
                Remove
              </button>
            </>
          }
        >
          <p className="text-sm text-text-secondary">
            Campaigns and agents using this account will need to be re-pointed to a different one
            before they can run.
          </p>
        </Modal>
      )}

      <Toast
        message={toast ?? ''}
        type="success"
        visible={!!toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

/* ─── Stat card ─────────────────────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={16} style={{ color: iconColor }} />
        </div>
        <p className="text-xs font-medium text-text-secondary">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p>
      <p className="mt-0.5 text-xs text-text-secondary">{hint}</p>
    </div>
  );
}

/* ─── Channel card with accounts list ──────────────────────────────────── */

interface ChannelAccountsCardProps {
  channel: ChannelDef;
  accounts: AccountRecord[];
  onAdd: () => void;
  onDelete: (acc: AccountRecord) => void;
}

function ChannelAccountsCard({ channel, accounts, onAdd, onDelete }: ChannelAccountsCardProps) {
  const Icon = channel.icon;
  return (
    <section className="rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
      <header className="flex items-start justify-between gap-4 border-b border-[#F3F4F6] px-5 py-4">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: channel.iconBg }}
          >
            <Icon size={18} style={{ color: channel.iconColor }} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-text-primary">{channel.name}</h2>
            <p className="mt-0.5 text-[12.5px] text-text-secondary">{channel.description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-cyan px-3 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-cyan/90"
        >
          <Plus size={14} />
          Add {channel.accountSingular}
        </button>
      </header>

      <div className="px-5 py-4">
        {accounts.length === 0 ? (
          <div className="rounded-md border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-4 py-6 text-center">
            <p className="text-[13px] text-text-secondary">
              No {channel.accountPlural} connected yet.
            </p>
            <button
              type="button"
              onClick={onAdd}
              className="mt-2 text-[12.5px] font-medium text-cyan hover:underline"
            >
              + Add your first {channel.accountSingular}
            </button>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-[#F3F4F6]">
            {accounts.map((acc) => (
              <AccountRow
                key={acc.id}
                channel={channel}
                account={acc}
                onDelete={() => onDelete(acc)}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function AccountRow({
  channel,
  account,
  onDelete,
}: {
  channel: ChannelDef;
  account: AccountRecord;
  onDelete: () => void;
}) {
  const primary = account.values[channel.primaryFieldKey] || '—';
  const secondary = channel.secondaryFieldKey
    ? account.values[channel.secondaryFieldKey]
    : undefined;

  return (
    <li className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <div className="text-[13.5px] font-medium text-text-primary">{primary}</div>
        {secondary && (
          <div className="mt-0.5 text-[12px] text-text-secondary">{secondary}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-semibold text-[#059669]">
          Active
        </span>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Remove account"
          className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  );
}

/* ─── Add account modal ─────────────────────────────────────────────────── */

interface AddAccountModalProps {
  channel: ChannelDef;
  onClose: () => void;
  onSave: (values: Record<string, string>) => void;
}

function AddAccountModal({ channel, onClose, onSave }: AddAccountModalProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(channel.fields.map((f) => [f.key, ''])),
  );
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState(false);

  const missingRequired = channel.fields.some(
    (f) => f.required && !values[f.key]?.trim(),
  );

  function update(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setTouched(true);
    if (missingRequired) return;
    onSave(values);
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title={`Add ${channel.accountSingular}`}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border-subtle bg-surface px-3.5 py-1.5 text-[13px] font-medium text-text-secondary hover:bg-surface-sunken"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={touched && missingRequired}
            className="inline-flex items-center gap-1.5 rounded-md bg-cyan px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-cyan/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save account
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        <p className="text-[12.5px] text-text-secondary">
          {channel.description} Credentials are stored encrypted.
        </p>
        {channel.fields.map((f) => (
          <FieldInput
            key={f.key}
            field={f}
            value={values[f.key] ?? ''}
            onChange={(v) => update(f.key, v)}
            revealed={!!revealed[f.key]}
            onToggleReveal={() =>
              setRevealed((prev) => ({ ...prev, [f.key]: !prev[f.key] }))
            }
            showError={touched && f.required === true && !values[f.key]?.trim()}
          />
        ))}
      </div>
    </Modal>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  revealed,
  onToggleReveal,
  showError,
}: {
  field: AccountField;
  value: string;
  onChange: (v: string) => void;
  revealed: boolean;
  onToggleReveal: () => void;
  showError: boolean;
}) {
  const baseInput =
    'w-full rounded-md border bg-white px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2';
  const stateClasses = showError
    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
    : 'border-[#E5E7EB] focus:border-cyan focus:ring-cyan/20';

  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-text-primary">
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </label>

      {field.type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} ${stateClasses}`}
        >
          <option value="">Select…</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.type === 'password' ? (
        <div className="relative">
          <input
            type={revealed ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={`${baseInput} ${stateClasses} pr-9`}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={onToggleReveal}
            aria-label={revealed ? 'Hide value' : 'Show value'}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-tertiary hover:text-text-primary"
          >
            {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`${baseInput} ${stateClasses}`}
        />
      )}

      {field.helpText && !showError && (
        <p className="mt-1 text-[11px] text-text-tertiary">{field.helpText}</p>
      )}
      {showError && (
        <p className="mt-1 text-[11px] text-red-600">This field is required.</p>
      )}
    </div>
  );
}
