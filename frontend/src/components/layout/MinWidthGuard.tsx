import { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';

const MIN_WIDTH = 1280;

export function MinWidthGuard() {
  const [isTooNarrow, setIsTooNarrow] = useState(false);

  useEffect(() => {
    function check() {
      setIsTooNarrow(window.innerWidth < MIN_WIDTH);
    }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!isTooNarrow) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-navy p-8 text-center text-white">
      <Monitor size={64} className="mb-6 text-cyan" />
      <h2 className="text-xl font-semibold">Desktop Browser Required</h2>
      <p className="mt-3 max-w-md text-sm text-white/70">
        Please use a desktop browser (1280px+) for the best experience with
        Pi-commerce.
      </p>
    </div>
  );
}
