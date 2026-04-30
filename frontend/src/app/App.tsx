import { motion } from 'framer-motion';
import { Routes, Route } from 'react-router-dom';
import { usePhaseStore } from '@/store/phaseStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { MinWidthGuard } from '@/components/layout/MinWidthGuard';
import { AppRoutes } from '@/app/routes';
import { MediaLibraryProvider } from '@/context/MediaLibraryContext';
import { ToastProvider } from '@/components/ui';
import { TokensReference } from '@/pages/TokensReference';

export function App() {
  const sidebarCollapsed = usePhaseStore((s) => s.sidebarCollapsed);
  const sidebarWidth = sidebarCollapsed ? 64 : 240;

  return (
    <ToastProvider>
      {/* Phase 1 of the beautification brief — sandbox page rendered
          outside the app shell so it shows the tokens cleanly.
          Reachable only by URL; not in the sidebar. */}
      <Routes>
        <Route path="/tokens-reference" element={<TokensReference />} />
        <Route
          path="*"
          element={
            <>
              <MinWidthGuard />
              <div className="flex h-screen overflow-hidden bg-canvas">
                <Sidebar />
                <motion.main
                  className="flex flex-1 flex-col overflow-hidden"
                  animate={{ marginLeft: sidebarWidth }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex-1 overflow-y-auto px-8 py-5">
                    <MediaLibraryProvider>
                      <AppRoutes />
                    </MediaLibraryProvider>
                  </div>
                </motion.main>
              </div>
            </>
          }
        />
      </Routes>
    </ToastProvider>
  );
}
