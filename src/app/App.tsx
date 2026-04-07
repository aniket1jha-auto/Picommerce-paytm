import { motion } from 'framer-motion';
import { usePhaseStore } from '@/store/phaseStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { MinWidthGuard } from '@/components/layout/MinWidthGuard';
import { AppRoutes } from '@/app/routes';

export function App() {
  const sidebarCollapsed = usePhaseStore((s) => s.sidebarCollapsed);

  const sidebarWidth = sidebarCollapsed ? 64 : 240;

  return (
    <>
      <MinWidthGuard />
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <motion.main
          className="flex flex-1 flex-col overflow-hidden"
          animate={{
            marginLeft: sidebarWidth,
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {/* Page content — scrollable */}
          <div className="flex-1 overflow-y-auto px-8 py-5">
            <AppRoutes />
          </div>
        </motion.main>
      </div>
    </>
  );
}
