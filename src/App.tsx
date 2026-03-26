import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { HeroSection } from './components/HeroSection';
import { UniverseHub } from './components/UniverseHub';
import DashboardLayout from './components/dashboard/DashboardLayout';
import { EntityTable } from './components/dashboard/ui/EntityTable';
import { CosmosCanvas } from './components/dashboard/cosmos/CosmosCanvas';

// Animasyonlu sayfa geçiş sarmalayıcısı
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
}

// 3D Haritayı ve eski sayfaları şimdilik iframe ile göm (Phase 2'ye kadar geçici)
function LegacyIframeView({ viewName = 'cosmos', label = 'Etkileşimli 3D Kozmos (Legacy HTML içinden)' }: { viewName?: string, label?: string }) {
  // Use a key to force re-render when viewName changes, triggering the iframe to reload with new URL params
  return (
    <div key={viewName} className="w-full h-full relative">
      <iframe
        src={`/antigravity-dashboard-1.html?view=${viewName}`}
        title={`Antigravity ${viewName} Mock`}
        className="w-full h-full border-0"
        style={{ pointerEvents: 'auto' }}
      />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/80 border border-mythos-accent text-mythos-accent font-serif text-xs 
                      tracking-[0.1em] rounded-sm backdrop-blur-md z-50 pointer-events-none">
        {label}
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen bg-mythos-bg selection:bg-mythos-accent/30 selection:text-white">
      {/* Global Noise Overlay */}
      <div className="noise-bg" />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname.split('/')[1] || '/'}>
          {/* Landing / Hero */}
          <Route path="/" element={
            <PageWrapper>
              <HeroSection onEnterUniverse={() => navigate('/hub')} />
            </PageWrapper>
          } />

          {/* Universe Hub */}
          <Route path="/hub" element={
            <PageWrapper>
              <UniverseHub
                onEnterExisting={() => navigate('/dashboard')}
                onCreateUniverse={() => navigate('/dashboard')}
              />
            </PageWrapper>
          } />

          {/* Dashboard Application */}
          <Route path="/dashboard" element={
            <PageWrapper>
              <DashboardLayout />
            </PageWrapper>
          }>
            {/* Alt Route'lar */}
            <Route index element={<CosmosCanvas />} />
            <Route path="characters" element={<EntityTable />} />
            <Route path="places" element={<EntityTable />} />
            <Route path="events" element={<EntityTable />} />
            
            {/* Geçici Legacy Yönlendirmeleri */}
            <Route path="mythology" element={<LegacyIframeView viewName="myth" label="Mitoloji Modülü (Legacy)" />} />
            <Route path="timeline" element={<LegacyIframeView viewName="timeline" label="Zaman Çizelgesi (Legacy)" />} />
            <Route path="maps" element={<LegacyIframeView viewName="map" label="Haritalar Modülü (Legacy)" />} />
            <Route path="languages" element={<LegacyIframeView viewName="lang" label="Diller ve Alfabeler (Legacy)" />} />
            <Route path="settings" element={<LegacyIframeView viewName="settings" label="Sistem Ayarları (Legacy)" />} />
            
            {/* Logout -> Hero */}
            <Route path="logout" element={<Navigate to="/" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </main>
  )
}

export default App
