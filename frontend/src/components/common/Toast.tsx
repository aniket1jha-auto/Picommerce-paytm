import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'info' | 'warning';
  visible: boolean;
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-[#27AE60]',
  },
  info: {
    icon: Info,
    bg: 'bg-[#00BAF2]',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[#F2994A]',
  },
} as const;

export function Toast({ message, type, visible, onClose }: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-lg px-4 py-3 text-white shadow-lg ${config.bg}`}
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ duration: 0.2 }}
        >
          <Icon size={18} className="shrink-0" />
          <span className="text-sm font-medium">{message}</span>
          <button
            onClick={onClose}
            className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded text-white/80 transition-colors hover:text-white"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
