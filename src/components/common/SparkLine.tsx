interface SparkLineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function SparkLine({
  data,
  width = 120,
  height = 32,
  color = '#00BAF2',
}: SparkLineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return `${x},${y}`;
  });

  const polylinePoints = points.join(' ');

  // Area fill path: start from bottom-left, trace the line, then back to bottom-right
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaPath = `M${firstPoint} ${points.slice(1).map((p) => `L${p}`).join(' ')} L${lastPoint.split(',')[0]},${height - padding} L${padding},${height - padding} Z`;

  const gradientId = `spark-grad-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
