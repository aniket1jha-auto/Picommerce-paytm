interface TagProps {
  label: string;
  color: 'gray' | 'amber' | 'green';
}

interface ConfidenceTagProps {
  tag: TagProps;
}

const colorStyles: Record<TagProps['color'], string> = {
  gray: 'bg-gray-500/15 text-gray-600',
  amber: 'bg-amber-500/15 text-amber-700',
  green: 'bg-green-500/15 text-green-700',
};

export function ConfidenceTag({ tag }: ConfidenceTagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorStyles[tag.color]}`}
    >
      {tag.label}
    </span>
  );
}
