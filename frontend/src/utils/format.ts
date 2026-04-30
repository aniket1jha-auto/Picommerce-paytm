/**
 * Format a number as Indian Rupees with compact notation.
 * Examples: 4200 → "₹4.2K", 420000 → "₹4.2L", 12000000 → "₹1.2Cr"
 */
export function formatINR(value: number): string {
  if (value < 0) return `-${formatINR(-value)}`;
  if (value >= 1_00_00_000) {
    const cr = value / 1_00_00_000;
    return `₹${stripTrailingZero(cr.toFixed(1))}Cr`;
  }
  if (value >= 1_00_000) {
    const lakh = value / 1_00_000;
    return `₹${stripTrailingZero(lakh.toFixed(1))}L`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `₹${stripTrailingZero(k.toFixed(1))}K`;
  }
  return `₹${Math.round(value)}`;
}

/**
 * Format a count with Indian compact notation.
 * Examples: 1240000 → "12.4L", 45000 → "45K", 24000000 → "2.4Cr"
 */
export function formatCount(value: number): string {
  if (value < 0) return `-${formatCount(-value)}`;
  if (value >= 1_00_00_000) {
    const cr = value / 1_00_00_000;
    return `${stripTrailingZero(cr.toFixed(1))}Cr`;
  }
  if (value >= 1_00_000) {
    const lakh = value / 1_00_000;
    return `${stripTrailingZero(lakh.toFixed(1))}L`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `${stripTrailingZero(k.toFixed(1))}K`;
  }
  return `${Math.round(value)}`;
}

/**
 * Format a decimal as a percentage string.
 * Example: 0.042 → "4.2%", 4.2 → "4.2%"
 */
export function formatPercent(value: number): string {
  // If value is already in percentage form (> 1), use as-is
  // If value is a ratio (0–1), multiply by 100
  const pct = value <= 1 && value >= -1 ? value * 100 : value;
  return `${stripTrailingZero(pct.toFixed(1))}%`;
}

/**
 * Format a number as ROI multiplier.
 * Example: 3.4 → "3.4x"
 */
export function formatROI(value: number): string {
  return `${stripTrailingZero(value.toFixed(1))}x`;
}

function stripTrailingZero(str: string): string {
  if (str.includes('.') && str.endsWith('0')) {
    return str.slice(0, -1).replace(/\.$/, '');
  }
  return str;
}

/**
 * Per-channel cost label for cost estimation rows.
 * Voice → "₹X.XX/call", field exec → "₹X/task", everything else → "₹X.XX/msg".
 * Consolidated from three local duplicates in campaign components.
 */
export function formatChannelCost(channelId: string, unitCost: number): string {
  if (channelId === 'ai_voice') return `₹${unitCost.toFixed(2)}/call`;
  if (channelId === 'field_executive') return `₹${unitCost.toFixed(0)}/task`;
  return `₹${unitCost.toFixed(2)}/msg`;
}
