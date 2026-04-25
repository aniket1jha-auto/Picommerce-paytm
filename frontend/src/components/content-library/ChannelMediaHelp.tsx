import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

export function ChannelMediaHelp({ channel }: { channel: 'whatsapp' | 'rcs' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full p-1 text-text-secondary hover:bg-[#F3F4F6] hover:text-text-primary"
        aria-label="Channel media specifications"
      >
        <HelpCircle size={16} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-40 mt-1 w-72 rounded-lg border border-[#E5E7EB] bg-white p-3 text-xs shadow-lg ring-1 ring-black/5">
          {channel === 'whatsapp' ? (
            <>
              <p className="mb-2 font-semibold text-text-primary">WhatsApp media specs</p>
              <ul className="space-y-1.5 text-text-secondary">
                <li>
                  <span className="font-medium text-text-primary">Header image:</span> JPG/PNG ·
                  Max 5MB · Recommended 800×418px
                </li>
                <li>
                  <span className="font-medium text-text-primary">Header video:</span> MP4/3GP ·
                  Max 15MB · Max 30 seconds
                </li>
                <li>
                  <span className="font-medium text-text-primary">Header document:</span> PDF ·
                  Max 100MB
                </li>
                <li>
                  <span className="font-medium text-text-primary">Body:</span> Text only, max 1024
                  characters
                </li>
              </ul>
            </>
          ) : (
            <>
              <p className="mb-2 font-semibold text-text-primary">RCS media specs</p>
              <ul className="space-y-1.5 text-text-secondary">
                <li>
                  <span className="font-medium text-text-primary">Rich card image:</span> JPG/PNG ·
                  Max 1MB · Recommended 1080×1080px
                </li>
                <li>
                  <span className="font-medium text-text-primary">Rich card video:</span> MP4 ·
                  Max 15MB
                </li>
                <li>
                  <span className="font-medium text-text-primary">Standalone image:</span> JPG/PNG
                  · Max 1MB
                </li>
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
