import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';

import { HeroSection } from './components/HeroSection';
import { UniverseHub } from './components/UniverseHub';
import DashboardLayout from './components/dashboard/DashboardLayout';
import { EntityTable } from './components/dashboard/ui/EntityTable';
import { CosmosCanvas } from './components/dashboard/cosmos/CosmosCanvas';
import { MythologyView } from './components/dashboard/mythology/MythologyView';
import { TimelineView } from './components/dashboard/timeline/TimelineView';
import { MapsView } from './components/dashboard/maps/MapsView';
import { LanguagesView } from './components/dashboard/languages/LanguagesView';
import { AuthPage } from './components/AuthPage';
import { useAuthStore } from './store/useAuthStore';


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
        title={label || `Antigravity ${viewName} Mock`}
        className="w-full h-full border-0"
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
}

import { CustomCursor } from './components/ui/CustomCursor';

function LogoutRoute({ onLogout }: { onLogout: () => Promise<void> }) {
  useEffect(() => {
    void onLogout();
  }, [onLogout]);

  return <Navigate to="/" replace />;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, login, logout } = useAuthStore();

  useEffect(() => {
    const syncAuthSession = async () => {
      try {
        const user = await getCurrentUser();
        const email = user.signInDetails?.loginId ?? user.username;
        login(email);
      } catch {
        logout();
      }
    };

    void syncAuthSession();
  }, [login, logout]);

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      logout();
      navigate('/', { replace: true });
    }
  };

  return (
    <main className="relative min-h-screen bg-mythos-bg selection:bg-mythos-accent/30 selection:text-white">
      {/* Global Custom Cursor */}
      <CustomCursor />
      
      {/* Global Noise Overlay */}
      <div className="noise-bg" />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname.split('/')[1] || '/'}>
          {/* Landing / Hero */}
          <Route path="/" element={
            <PageWrapper>
              <HeroSection
                onEnterUniverse={() => navigate('/hub')}
                onLogin={() => navigate('/auth?mode=login')}
                onRegister={() => navigate('/auth?mode=signup')}
              />
            </PageWrapper>
          } />

          <Route path="/auth" element={
            <PageWrapper>
              <AuthPage />
            </PageWrapper>
          } />

          {/* Universe Hub */}
          <Route path="/hub" element={
            isAuthenticated ? (
              <PageWrapper>
                <UniverseHub
                  onEnterExisting={() => navigate('/dashboard')}
                  onCreateUniverse={() => navigate('/dashboard')}
                />
              </PageWrapper>
            ) : (
              <Navigate to="/auth?mode=login" replace />
            )
          } />

          {/* Dashboard Application */}
          <Route path="/dashboard" element={
            isAuthenticated ? (
              <PageWrapper>
                <DashboardLayout />
              </PageWrapper>
            ) : (
              <Navigate to="/auth?mode=login" replace />
            )
          }>
            {/* Alt Route'lar */}
            <Route index element={<CosmosCanvas />} />
            <Route path="characters" element={<EntityTable />} />
            <Route path="places" element={<EntityTable />} />
            <Route path="events" element={<EntityTable />} />
            
            {/* Geçiçi Legacy Yönlendirmeleri (ve yenilenenler) */}
            <Route path="mythology" element={<MythologyView />} />
            <Route path="timeline" element={<TimelineView />} />
            <Route path="maps" element={<MapsView />} />
            <Route path="languages" element={<LanguagesView />} />
            <Route path="settings" element={<LegacyIframeView viewName="settings" label="Sistem Ayarları (Legacy)" />} />
            
            {/* Logout -> Hero */}
            <Route path="logout" element={<LogoutRoute onLogout={handleLogout} />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </main>
  )
}

export default App

