import { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Upload, Download, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SegmentPreviewPanel } from '@/components/audience/SegmentPreviewPanel';
import {
  downloadCommerceContactsTemplate,
  parseCsvSimple,
  normalizeHeader,
  isTruthyCell,
} from '@/utils/csvSegmentTemplate';
import type { Segment } from '@/types';
import { formatCount } from '@/utils/format';
import type { ChannelType } from '@/types';

const STEPS_CSV = [
  { label: 'Upload File', shortLabel: '1' },
  { label: 'Map Fields', shortLabel: '2' },
  { label: 'Review & Save', shortLabel: '3' },
];

type MapVal =
  | 'phone'
  | 'full_name'
  | 'email'
  | 'dob'
  | 'age'
  | 'gender'
  | 'state'
  | 'city'
  | 'pincode'
  | 'product_type'
  | 'outstanding_amount'
  | 'dpd_bucket'
  | 'emi_amount'
  | 'last_transaction_date'
  | 'account_number'
  | 'pan'
  | 'aadhaar'
  | 'opt_whatsapp'
  | 'opt_sms'
  | 'opt_email'
  | 'custom'
  | 'skip';

const HEADER_GUESS: Record<string, MapVal> = {
  phone_number: 'phone',
  mobile: 'phone',
  phone: 'phone',
  full_name: 'full_name',
  name: 'full_name',
  email: 'email',
  state: 'state',
  city: 'city',
  age: 'age',
  gender: 'gender',
  dob: 'dob',
  date_of_birth: 'dob',
  pincode: 'pincode',
  product_type: 'product_type',
  outstanding_amount: 'outstanding_amount',
  dpd_bucket: 'dpd_bucket',
  emi_amount: 'emi_amount',
  last_transaction_date: 'last_transaction_date',
  account_number: 'account_number',
  pan: 'pan',
  pan_number: 'pan',
  aadhaar: 'aadhaar',
  aadhar: 'aadhaar',
  opt_in_whatsapp: 'opt_whatsapp',
  opt_in_sms: 'opt_sms',
  opt_in_email: 'opt_email',
};

function guessMap(header: string): MapVal {
  const n = normalizeHeader(header);
  return HEADER_GUESS[n] ?? 'custom';
}

function rid(): string {
  return `seg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function StepNavCsv({ currentStep }: { currentStep: number }) {
  const total = STEPS_CSV.length;
  return (
    <nav aria-label="CSV import steps">
      <ol className="flex items-center gap-0">
        {STEPS_CSV.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          return (
            <li key={step.label} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    isCompleted
                      ? 'bg-cyan text-white'
                      : isCurrent
                        ? 'bg-cyan text-white ring-2 ring-cyan ring-offset-2'
                        : 'bg-[#E5E7EB] text-text-secondary',
                  ].join(' ')}
                >
                  {isCompleted ? <Check size={14} strokeWidth={2.5} /> : stepNum}
                </div>
                <span
                  className={[
                    'text-xs font-medium transition-colors',
                    isCurrent ? 'text-cyan' : isCompleted ? 'text-text-primary' : 'text-text-secondary',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>
              {index < total - 1 && (
                <div
                  className={['h-[2px] flex-1 transition-colors', isCompleted ? 'bg-cyan' : 'bg-[#E5E7EB]'].join(' ')}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -48 : 48, opacity: 0 }),
};

function maskPreviewVal(map: MapVal, raw: string): string {
  if (!raw) return '—';
  if (map === 'pan' || map === 'aadhaar') return '••••••';
  if (map === 'phone' && raw.length >= 10) return `${raw.slice(0, 5)}•••${raw.slice(-2)}`;
  return raw.length > 20 ? `${raw.slice(0, 20)}…` : raw;
}

function phoneDisplayMasked(raw: string): string {
  if (raw.length < 10) return raw;
  return `${raw.slice(0, 5)}•••${raw.slice(-2)}`;
}

export function CreateSegmentCsv() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState(0);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, MapVal>>({});
  const [hasPhoneColumn, setHasPhoneColumn] = useState(false);

  const [segName, setSegName] = useState('');
  const [segDescription, setSegDescription] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const [phase, setPhase] = useState<'form' | 'loading' | 'success'>('form');
  const [savedMeta, setSavedMeta] = useState<{ id: string; rows: number; dups: number } | null>(null);
  const [completedSegment, setCompletedSegment] = useState<Segment | null>(null);

  const rowCount = rows.length;

  const colIdxFor = useCallback(
    (target: MapVal) => {
      const h = headers.find((header) => columnMap[header] === target);
      return h ? headers.indexOf(h) : -1;
    },
    [headers, columnMap],
  );

  const applyFile = useCallback(async (file: File | null) => {
    if (!file || !file.name.toLowerCase().endsWith('.csv')) return;
    if (file.size > 10 * 1024 * 1024) return;
    const text = await file.text();
    const { headers: h, rows: r } = parseCsvSimple(text);
    setFileName(file.name);
    setFileSize(file.size);
    setHeaders(h);
    setRows(r);
    const phoneOk = h.some((col) => normalizeHeader(col) === 'phone_number');
    setHasPhoneColumn(phoneOk);
    const map: Record<string, MapVal> = {};
    h.forEach((col) => {
      map[col] = guessMap(col);
    });
    setColumnMap(map);
    const base = file.name.replace(/\.csv$/i, '');
    setSegName(base);
  }, []);

  const clearFile = () => {
    setFileName(null);
    setFileSize(0);
    setHeaders([]);
    setRows([]);
    setColumnMap({});
    setHasPhoneColumn(false);
    setSegName('');
  };

  const countOptIn = useCallback(
    (target: MapVal) => {
      const idx = colIdxFor(target);
      if (idx < 0) return 0;
      return rows.filter((row) => isTruthyCell(row[idx])).length;
    },
    [colIdxFor, rows],
  );

  const csvPreviewChannels = useMemo(() => {
    const out: { key: ChannelType | 'email'; label: string; color: string; count: number }[] = [];
    const sms = countOptIn('opt_sms');
    const wa = countOptIn('opt_whatsapp');
    const em = countOptIn('opt_email');
    if (sms > 0) out.push({ key: 'sms', label: 'SMS', color: '#6366F1', count: sms });
    if (wa > 0) out.push({ key: 'whatsapp', label: 'WhatsApp', color: '#25D366', count: wa });
    if (em > 0) out.push({ key: 'email', label: 'Email', color: '#64748B', count: em });
    return out;
  }, [countOptIn]);

  const duplicatesMerged = useMemo(() => {
    const idx = headers.length ? colIdxFor('phone') : -1;
    if (idx < 0) return 0;
    const seen = new Set<string>();
    let dup = 0;
    for (const row of rows) {
      const p = (row[idx] ?? '').trim();
      if (!p) continue;
      if (seen.has(p)) dup += 1;
      else seen.add(p);
    }
    return dup;
  }, [colIdxFor, rows, headers.length]);

  const mappedCount = useMemo(
    () => Object.values(columnMap).filter((v) => v !== 'skip').length,
    [columnMap],
  );
  const skippedCount = useMemo(
    () => Object.values(columnMap).filter((v) => v === 'skip').length,
    [columnMap],
  );
  const piiSecured = useMemo(
    () => Object.values(columnMap).filter((v) => v === 'pan' || v === 'aadhaar').length,
    [columnMap],
  );

  const firstValues = useMemo(() => {
    const out: Record<string, string> = {};
    headers.forEach((h) => {
      const idx = headers.indexOf(h);
      const v = rows.map((r) => r[idx]).find((c) => c && String(c).trim());
      out[h] = v ?? '';
    });
    return out;
  }, [headers, rows]);

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/audiences/segments/new');
      return;
    }
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  };

  const handleNext = () => {
    if (currentStep === 1 && (!fileName || !hasPhoneColumn)) return;
    if (currentStep < 3) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const createSegment = () => {
    if (!segName.trim() || !fileName) return;
    setPhase('loading');
    window.setTimeout(() => {
      const smsC = countOptIn('opt_sms');
      const waC = countOptIn('opt_whatsapp');
      const emC = countOptIn('opt_email');
      const reach: Segment['reachability'] = {
        sms: smsC > 0 ? smsC : 0,
        whatsapp: waC > 0 ? waC : 0,
        email: emC > 0 ? emC : 0,
      };
      const now = new Date().toISOString();
      const dups = duplicatesMerged;
      const seg: Segment = {
        id: rid(),
        name: segName.trim(),
        description: segDescription.trim() || `Imported from ${fileName}`,
        size: rowCount,
        segmentSource: 'rule-based',
        creationSource: 'csv',
        csvImport: { fileName, importedAt: now },
        reachability: reach,
        lastUpdated: now,
        usedInCampaigns: [],
        filters: JSON.stringify({ type: 'csv_import', columnMap, rowCount }).slice(0, 500),
      };
      setCompletedSegment(seg);
      setSavedMeta({ id: seg.id, rows: rowCount, dups });
      setPhase('success');
    }, 1200);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    void applyFile(f);
  };

  const mapSelect = (header: string, v: MapVal) => {
    setColumnMap((m) => ({ ...m, [header]: v }));
  };

  if (phase === 'loading') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
        <p className="text-sm font-medium text-text-secondary">Importing contacts…</p>
      </div>
    );
  }

  if (phase === 'success' && savedMeta && completedSegment) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_4px_12px_rgba(0,41,112,0.12)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF5] text-[#059669]">
            <Check size={28} strokeWidth={2.5} />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-text-primary">Segment created successfully</h2>
          <p className="mt-2 text-sm text-text-secondary">
            {formatCount(savedMeta.rows)} contacts imported · {savedMeta.dups} duplicates merged
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                navigate('/audiences', {
                  state: {
                    savedSegment: completedSegment,
                    highlightSegmentId: completedSegment.id,
                  },
                });
              }}
              className="inline-flex justify-center rounded-md bg-cyan px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan/90"
            >
              View Segment →
            </button>
            <button
              type="button"
              onClick={() => {
                setPhase('form');
                setSavedMeta(null);
                setCompletedSegment(null);
                setCurrentStep(1);
                clearFile();
                navigate('/audiences/segments/new');
              }}
              className="inline-flex justify-center rounded-md border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-[#F9FAFB]"
            >
              Create another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1 text-sm">
          <Link to="/audiences" className="font-medium text-cyan hover:underline">
            ← Audiences
          </Link>
          <span className="text-text-secondary">/</span>
          <Link to="/audiences/segments/new" className="text-text-secondary hover:text-text-primary">
            Create Segment
          </Link>
          <span className="text-text-secondary">/</span>
          <span className="text-text-secondary">Upload CSV</span>
        </div>
        <PageHeader title="Create Segment" subtitle="CSV import" />
      </div>

      <div className="rounded-xl bg-white p-6 ring-1 ring-[#E5E7EB]">
        <StepNavCsv currentStep={currentStep} />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-xl bg-white ring-1 ring-[#E5E7EB]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="p-6"
              >
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-base font-semibold text-text-primary">Upload your contact list</h2>

                    <div className="flex flex-col gap-4 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-cyan shadow-sm">
                          <Download size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">Download our CSV template</p>
                          <p className="mt-0.5 text-xs text-text-secondary">
                            Use our template to ensure your file is formatted correctly and all fields are recognized.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={downloadCommerceContactsTemplate}
                        className="shrink-0 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-text-primary hover:bg-[#F9FAFB]"
                      >
                        Download template
                      </button>
                    </div>

                    {!fileName ? (
                      <div
                        role="button"
                        tabIndex={0}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={onDrop}
                        onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
                        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#CBD5E1] bg-[#FAFAFA] py-14 text-center transition-colors hover:border-cyan hover:bg-cyan/[0.03]"
                        onClick={() => fileRef.current?.click()}
                      >
                        <Upload className="text-text-secondary" size={32} />
                        <p className="mt-3 text-sm font-medium text-text-primary">Drag your CSV file here</p>
                        <p className="mt-1 text-sm text-text-secondary">or</p>
                        <button
                          type="button"
                          className="mt-2 text-sm font-semibold text-cyan hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileRef.current?.click();
                          }}
                        >
                          Browse files
                        </button>
                        <p className="mt-3 text-xs text-text-secondary">Accepted: .csv files only · Maximum size: 10MB</p>
                        <input
                          ref={fileRef}
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={(e) => {
                            void applyFile(e.target.files?.[0] ?? null);
                            e.target.value = '';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex gap-3">
                            <FileSpreadsheet className="shrink-0 text-[#059669]" size={24} />
                            <div>
                              <p className="text-sm font-semibold text-text-primary">{fileName}</p>
                              <p className="text-xs text-text-secondary">
                                {(fileSize / 1024).toFixed(1)} KB · {formatCount(rowCount)} rows detected
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={clearFile}
                            className="text-xs font-medium text-cyan hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    {fileName && (
                      <div
                        className={[
                          'rounded-lg border px-3 py-2 text-sm',
                          hasPhoneColumn
                            ? 'border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]'
                            : 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]',
                        ].join(' ')}
                      >
                        {hasPhoneColumn
                          ? "✓ Required field 'phone_number' detected"
                          : "✗ 'phone_number' column not found. This field is required. Please check your file or download our template."}
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-base font-semibold text-text-primary">Map your columns to contact fields</h2>
                      <p className="mt-1 text-sm text-text-secondary">
                        Tell us what each column in your file represents. Unrecognized columns can be saved as custom
                        attributes.
                      </p>
                    </div>
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                      🔒 PII fields like Aadhaar and PAN are automatically masked and encrypted at rest. They will never
                      appear in exports or campaign previews.
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
                      <table className="w-full min-w-[640px] text-left text-xs">
                        <thead className="bg-[#F9FAFB] text-text-secondary">
                          <tr>
                            <th className="px-3 py-2 font-medium">Your CSV Column</th>
                            <th className="px-3 py-2 font-medium">Maps To</th>
                            <th className="px-3 py-2 font-medium">Preview (first value)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {headers.map((h) => {
                            const mv = columnMap[h] ?? 'custom';
                            return (
                              <tr key={h} className="border-t border-[#F3F4F6]">
                                <td className="px-3 py-2 font-medium text-text-primary">{h}</td>
                                <td className="px-3 py-2 align-top">
                                  <select
                                    value={mv}
                                    onChange={(e) => mapSelect(h, e.target.value as MapVal)}
                                    className="w-full max-w-[220px] rounded border border-[#E5E7EB] bg-white px-2 py-1.5 text-[11px]"
                                  >
                                    <optgroup label="REQUIRED">
                                      <option value="phone">Phone Number</option>
                                    </optgroup>
                                    <optgroup label="PERSONAL INFO">
                                      <option value="full_name">Full Name</option>
                                      <option value="email">Email Address</option>
                                      <option value="dob">Date of Birth</option>
                                      <option value="age">Age</option>
                                      <option value="gender">Gender</option>
                                      <option value="state">State</option>
                                      <option value="city">City</option>
                                      <option value="pincode">Pincode</option>
                                    </optgroup>
                                    <optgroup label="FINANCIAL">
                                      <option value="product_type">Product Type</option>
                                      <option value="outstanding_amount">Outstanding Amount</option>
                                      <option value="dpd_bucket">DPD Bucket</option>
                                      <option value="emi_amount">EMI Amount</option>
                                      <option value="last_transaction_date">Last Transaction Date</option>
                                      <option value="account_number">Account Number</option>
                                    </optgroup>
                                    <optgroup label="PII — SENSITIVE">
                                      <option value="pan">PAN Number 🔒</option>
                                      <option value="aadhaar">Aadhaar Number (masked) 🔒</option>
                                    </optgroup>
                                    <optgroup label="CHANNEL OPT-INS">
                                      <option value="opt_whatsapp">WhatsApp Opt-in</option>
                                      <option value="opt_sms">SMS Opt-in</option>
                                      <option value="opt_email">Email Opt-in</option>
                                    </optgroup>
                                    <optgroup label="OTHER">
                                      <option value="custom">Custom Attribute</option>
                                      <option value="skip">Skip this column</option>
                                    </optgroup>
                                  </select>
                                  {(mv === 'pan' || mv === 'aadhaar') && (
                                    <p className="mt-1 text-[10px] text-amber-800">
                                      This field will be encrypted and masked in all views
                                    </p>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-text-secondary">
                                  {maskPreviewVal(mv, firstValues[h] ?? '')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {mappedCount} fields mapped · {skippedCount} fields skipped · {piiSecured} PII fields secured
                    </p>
                  </div>
                )}

                {currentStep === 3 && fileName && (
                  <div className="mx-auto max-w-2xl space-y-6">
                    <h2 className="text-base font-semibold text-text-primary">Review and save your segment</h2>

                    <div className="rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                        Import summary
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                        <li>
                          File: <span className="font-medium text-text-primary">{fileName}</span>
                        </li>
                        <li>Total contacts: {formatCount(rowCount)}</li>
                        <li>Fields mapped: {mappedCount}</li>
                        <li>PII fields (encrypted): {piiSecured}</li>
                        <li>
                          Duplicates detected: {duplicatesMerged}
                          {duplicatesMerged > 0 && (
                            <span className="block text-xs">
                              Duplicates will be merged using phone number as the unique key
                            </span>
                          )}
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-text-primary">Segment name</label>
                      <input
                        value={segName}
                        onChange={(e) => setSegName(e.target.value)}
                        placeholder="e.g. Recovery List — Nov 2024"
                        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                      />
                      <label className="block text-sm font-medium text-text-primary">Description</label>
                      <textarea
                        value={segDescription}
                        onChange={(e) => setSegDescription(e.target.value)}
                        rows={3}
                        placeholder="Describe the source and purpose of this list"
                        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                      />
                    </div>

                    <div className="rounded-lg border border-[#E5E7EB] bg-[#F7F9FC] p-4">
                      <p className="text-sm font-semibold text-text-primary">📌 CSV imports are always static segments</p>
                      <p className="mt-2 text-sm text-text-secondary">
                        The list is fixed at the time of upload and will not auto-update. To create a dynamic segment, use
                        Filter synced contacts instead.
                      </p>
                      <Link
                        to="/audiences/segments/new"
                        className="mt-3 inline-block text-xs font-medium text-cyan hover:underline"
                      >
                        Switch to filter-based segment →
                      </Link>
                    </div>

                    <div className="rounded-lg border border-[#E5E7EB] p-4">
                      <button
                        type="button"
                        onClick={() => setPreviewOpen((o) => !o)}
                        className="flex w-full items-center justify-between text-left text-sm font-medium text-cyan"
                      >
                        Preview first 5 rows →
                        {previewOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      {previewOpen && (
                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full min-w-[400px] text-[11px]">
                            <thead className="bg-[#F9FAFB]">
                              <tr>
                                {headers
                                  .filter((h) => columnMap[h] !== 'skip')
                                  .map((h) => (
                                    <th key={h} className="px-2 py-1.5 text-left font-medium text-text-secondary">
                                      {h}
                                    </th>
                                  ))}
                              </tr>
                            </thead>
                            <tbody>
                              {rows.slice(0, 5).map((row, ri) => (
                                <tr key={ri} className="border-t border-[#F3F4F6]">
                                  {headers
                                    .filter((h) => columnMap[h] !== 'skip')
                                    .map((h) => {
                                      const idx = headers.indexOf(h);
                                      const mv = columnMap[h];
                                      let cell = row[idx] ?? '';
                                      if (mv === 'phone') cell = phoneDisplayMasked(cell);
                                      else cell = maskPreviewVal(mv, cell);
                                      return (
                                        <td key={h} className="px-2 py-1.5 text-text-secondary">
                                          {cell || '—'}
                                        </td>
                                      );
                                    })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-text-primary hover:bg-[#F9FAFB]"
            >
              Back
            </button>
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 && (!fileName || !hasPhoneColumn)}
                className="inline-flex items-center rounded-md bg-cyan px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={createSegment}
                disabled={!segName.trim()}
                className="inline-flex items-center rounded-md bg-cyan px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create Segment
              </button>
            )}
          </div>
        </div>

        <div className="w-full shrink-0 lg:sticky lg:top-6 lg:w-80">
          <SegmentPreviewPanel
            estimate={rowCount || 0}
            variant="csv"
            csvChannels={csvPreviewChannels}
          />
        </div>
      </div>
    </div>
  );
}
