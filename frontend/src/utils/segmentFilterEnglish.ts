import { getAttributeById } from '@/data/segmentBuilderConstants';
import type { FilterItem, FilterState, ConditionLine } from '@/components/audience/ConditionBuilder';

function lineToPhrase(line: ConditionLine): string {
  const attr = getAttributeById(line.attributeId);
  const label = attr?.label ?? line.attributeId;
  const op = line.operator;
  if (op === 'is empty') return `${label} is empty`;
  if (op === 'between') {
    return `${label} is between ${line.value || '…'} and ${line.value2 ?? '…'}`;
  }
  const v = line.value?.trim();
  if (!v) return `${label} ${op}`;
  return `${label} ${op} ${v}`;
}

function itemEnglish(item: FilterItem): string {
  if (item.kind === 'condition') {
    return lineToPhrase(item.condition);
  }
  const between = item.betweenConditions;
  const phrases = item.conditions.map(lineToPhrase);
  if (phrases.length === 0) return '';
  if (phrases.length === 1) return `(${phrases[0]})`;
  const inner = phrases.reduce((acc, p, i) => {
    if (i === 0) return p;
    const j = between[i - 1] ?? 'AND';
    return `${acc} ${j} ${p}`;
  }, '');
  return `(${inner})`;
}

/** Plain-English summary for Review step */
export function filterStateToPlainEnglish(state: FilterState): string {
  const { items, betweenTopLevel } = state;
  if (items.length === 0) return 'No conditions defined.';
  const parts = items.map(itemEnglish);
  if (parts.length === 1) return parts[0];
  return parts.reduce((acc, p, i) => {
    if (i === 0) return p;
    const j = betweenTopLevel[i - 1] ?? 'AND';
    return `${acc} ${j} ${p}`;
  }, '');
}
