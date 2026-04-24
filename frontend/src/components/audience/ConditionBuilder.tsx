import { Plus, Trash2 } from 'lucide-react';
import {
  ATTRIBUTE_GROUPS,
  ALL_ATTRIBUTES,
  OPERATORS,
  getAttributeById,
  type SegmentValueType,
} from '@/data/segmentBuilderConstants';

export interface ConditionLine {
  id: string;
  attributeId: string;
  operator: string;
  value: string;
  value2?: string;
}

export type FilterItem =
  | { id: string; kind: 'condition'; condition: ConditionLine }
  | {
      id: string;
      kind: 'group';
      betweenConditions: ('AND' | 'OR')[];
      conditions: ConditionLine[];
    };

export interface FilterState {
  betweenTopLevel: ('AND' | 'OR')[];
  items: FilterItem[];
}

function rid(): string {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyConditionLine(): ConditionLine {
  const first = ALL_ATTRIBUTES[0];
  const vt = first.valueType;
  const ops = OPERATORS[vt];
  return {
    id: rid(),
    attributeId: first.id,
    operator: ops[0],
    value: '',
  };
}

export function defaultFilterState(): FilterState {
  return {
    betweenTopLevel: [],
    items: [{ id: rid(), kind: 'condition', condition: emptyConditionLine() }],
  };
}

function syncJoins(length: number, prev: ('AND' | 'OR')[]): ('AND' | 'OR')[] {
  const next = [...prev];
  while (next.length < Math.max(0, length - 1)) next.push('AND');
  return next.slice(0, Math.max(0, length - 1));
}

export function cloneFilterState(s: FilterState): FilterState {
  return JSON.parse(JSON.stringify(s)) as FilterState;
}

interface ConditionBuilderProps {
  state: FilterState;
  onChange: (next: FilterState) => void;
}

export function ConditionBuilder({ state, onChange }: ConditionBuilderProps) {
  const { items, betweenTopLevel } = state;

  function setBetweenTopLevel(next: ('AND' | 'OR')[]) {
    onChange({ ...state, betweenTopLevel: syncJoins(items.length, next) });
  }

  function setItems(nextItems: FilterItem[]) {
    onChange({
      items: nextItems,
      betweenTopLevel: syncJoins(nextItems.length, betweenTopLevel),
    });
  }

  function updateConditionLine(line: ConditionLine) {
    const attr = getAttributeById(line.attributeId);
    if (!attr) return line;
    const ops = OPERATORS[attr.valueType];
    let operator = line.operator;
    if (!ops.includes(operator)) operator = ops[0];
    return { ...line, operator };
  }

  function renderValueInputs(line: ConditionLine, onLineChange: (c: ConditionLine) => void) {
    const attr = getAttributeById(line.attributeId);
    if (!attr) return null;
    const vt = attr.valueType;

    if (line.operator === 'is empty') return null;

    if (vt === 'list' && (line.operator === 'in list' || line.operator === 'not in list')) {
      const opts = attr.listOptions ?? [];
      const selected = line.value ? line.value.split(',').filter(Boolean) : [];
      return (
        <div className="flex flex-wrap gap-1.5">
          {opts.map((opt) => {
            const on = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  const next = on ? selected.filter((s) => s !== opt) : [...selected, opt];
                  onLineChange({ ...line, value: next.join(',') });
                }}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  on
                    ? 'bg-cyan/15 text-cyan ring-1 ring-cyan/40'
                    : 'bg-[#F3F4F6] text-text-secondary hover:bg-gray-200'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    }

    if (line.operator === 'between' && (vt === 'number' || vt === 'date')) {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type={vt === 'date' ? 'date' : 'number'}
            value={line.value}
            onChange={(e) => onLineChange({ ...line, value: e.target.value })}
            className="min-w-[7rem] rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
          />
          <span className="text-xs text-text-secondary">and</span>
          <input
            type={vt === 'date' ? 'date' : 'number'}
            value={line.value2 ?? ''}
            onChange={(e) => onLineChange({ ...line, value2: e.target.value })}
            className="min-w-[7rem] rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
          />
        </div>
      );
    }

    if (vt === 'date' && line.operator === 'in last N days') {
      return (
        <input
          type="number"
          min={1}
          placeholder="Days"
          value={line.value}
          onChange={(e) => onLineChange({ ...line, value: e.target.value })}
          className="w-28 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
        />
      );
    }

    const inputType =
      vt === 'number' ? 'number' : vt === 'date' ? (line.operator.includes('between') ? 'date' : 'date') : 'text';

    return (
      <input
        type={inputType === 'date' ? 'date' : inputType}
        value={line.value}
        onChange={(e) => onLineChange({ ...line, value: e.target.value })}
        placeholder="Value"
        className="min-w-[8rem] flex-1 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
      />
    );
  }

  function renderConditionRow(
    line: ConditionLine,
    onLineChange: (c: ConditionLine) => void,
    onRemove: () => void,
  ) {
    const attr = getAttributeById(line.attributeId);
    const vt: SegmentValueType = attr?.valueType ?? 'text';
    const ops = OPERATORS[vt];

    return (
      <div className="flex flex-col gap-2 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] p-3 sm:flex-row sm:items-start sm:gap-3">
        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-12">
          <div className="sm:col-span-4">
            <select
              value={line.attributeId}
              onChange={(e) => {
                const nextAttr = getAttributeById(e.target.value);
                if (!nextAttr) return;
                const nOps = OPERATORS[nextAttr.valueType];
                onLineChange(
                  updateConditionLine({
                    ...line,
                    attributeId: e.target.value,
                    operator: nOps[0],
                    value: '',
                    value2: undefined,
                  }),
                );
              }}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-2 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            >
              {ATTRIBUTE_GROUPS.map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.attributes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            <select
              value={line.operator}
              onChange={(e) =>
                onLineChange(
                  updateConditionLine({
                    ...line,
                    operator: e.target.value,
                    value: '',
                    value2: undefined,
                  }),
                )
              }
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-2 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            >
              {ops.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-1 flex-col gap-2 sm:col-span-5">
            {renderValueInputs(line, onLineChange)}
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 self-end rounded-md p-2 text-text-secondary hover:bg-red-50 hover:text-red-600 sm:self-start"
          aria-label="Remove condition"
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  }

  function renderGroup(
    item: Extract<FilterItem, { kind: 'group' }>,
    itemIndex: number,
  ) {
    const setGroup = (patch: Partial<Extract<FilterItem, { kind: 'group' }>>) => {
      const next = items.map((it, i) =>
        i === itemIndex ? ({ ...it, ...patch } as FilterItem) : it,
      );
      setItems(next);
    };

    const between = item.betweenConditions;
    const conds = item.conditions;

    function setConditions(nextConds: ConditionLine[]) {
      setGroup({
        conditions: nextConds,
        betweenConditions: syncJoins(nextConds.length, between),
      });
    }

    return (
      <div className="rounded-lg border border-cyan/30 bg-cyan/[0.04] p-4 ring-1 ring-cyan/15">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-cyan">Condition group</span>
          <button
            type="button"
            onClick={() => setItems(items.filter((_, i) => i !== itemIndex))}
            className="rounded-md p-1.5 text-text-secondary hover:bg-red-50 hover:text-red-600"
            aria-label="Remove group"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {conds.map((cond, ci) => (
            <div key={cond.id}>
              {ci > 0 && (
                <div className="my-2 flex justify-center">
                  <div className="flex rounded-full border border-[#E5E7EB] bg-white p-0.5 text-[11px] font-semibold">
                    {(['AND', 'OR'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          const nextBetween = [...between];
                          nextBetween[ci - 1] = c;
                          setGroup({ betweenConditions: nextBetween });
                        }}
                        className={`rounded-full px-2.5 py-0.5 transition-colors ${
                          between[ci - 1] === c ? 'bg-cyan text-white' : 'text-text-secondary'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {renderConditionRow(
                cond,
                (c) => {
                  const next = conds.map((x) => (x.id === c.id ? c : x));
                  setConditions(next);
                },
                () => {
                  const next = conds.filter((x) => x.id !== cond.id);
                  if (next.length === 0) {
                    setItems(items.filter((_, i) => i !== itemIndex));
                  } else {
                    setConditions(next);
                  }
                },
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setGroup({
              conditions: [...conds, emptyConditionLine()],
              betweenConditions: syncJoins(conds.length + 1, between),
            })
          }
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-cyan hover:underline"
        >
          <Plus size={14} /> Add condition in group
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-text-primary">Define conditions</label>
        <p className="text-sm text-text-secondary">
          Build filters with AND/OR logic. Add groups for nested rules.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={item.id}>
            {i > 0 && (
              <div className="my-2 flex justify-center">
                <div className="flex rounded-full border border-[#E5E7EB] bg-white p-0.5 text-[11px] font-semibold shadow-sm">
                  {(['AND', 'OR'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        const next = [...betweenTopLevel];
                        next[i - 1] = c;
                        setBetweenTopLevel(next);
                      }}
                      className={`rounded-full px-3 py-1 transition-colors ${
                        betweenTopLevel[i - 1] === c ? 'bg-cyan text-white' : 'text-text-secondary'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {item.kind === 'condition' ? (
              renderConditionRow(
                item.condition,
                (c) => {
                  const next = items.map((it, j) =>
                    j === i && it.kind === 'condition' ? { ...it, condition: c } : it,
                  );
                  setItems(next);
                },
                () => {
                  const next = items.filter((_, j) => j !== i);
                  if (next.length === 0) {
                    setItems([{ id: rid(), kind: 'condition', condition: emptyConditionLine() }]);
                  } else {
                    setItems(next);
                  }
                },
              )
            ) : (
              renderGroup(item, i)
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() =>
            setItems([...items, { id: rid(), kind: 'condition', condition: emptyConditionLine() }])
          }
          className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-[#E5E7EB] px-3 py-2 text-sm font-medium text-text-secondary hover:border-cyan hover:text-cyan"
        >
          <Plus size={16} /> Add condition
        </button>
        <button
          type="button"
          onClick={() =>
            setItems([
              ...items,
              {
                id: rid(),
                kind: 'group',
                betweenConditions: [],
                conditions: [emptyConditionLine()],
              },
            ])
          }
          className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-[#E5E7EB] px-3 py-2 text-sm font-medium text-text-secondary hover:border-cyan hover:text-cyan"
        >
          <Plus size={16} /> Add group
        </button>
      </div>
    </div>
  );
}
