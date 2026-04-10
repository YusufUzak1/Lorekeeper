import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';

import { HeroSection } from './components/HeroSection';
import { UniverseHub } from './components/UniverseHub';
import DashboardLayout from './components/dashboard/DashboardLayout';
import { EntityTable } from './components/dashboard/ui/EntityTable';
import { CosmosCanvas } from './components/dashboard/cosmos/CosmosCanvas';
import { MythologyView } from './components/dashboard/mythology/MythologyView';
import { AuthPage } from './components/AuthPage';
import { useAuthStore } from './store/useAuthStore';
import { createLore } from './services/loreService';

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
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSavingLore, setIsSavingLore] = useState(false);

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

  const handleLoreSubmit = async () => {
    try {
      setIsSavingLore(true);
      await createLore(title, content);
      alert('Basariyla kaydedildi!');
      setTitle('');
      setContent('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lore kaydi basarisiz oldu.';
      alert(message);
    } finally {
      setIsSavingLore(false);
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
                <section className="w-full min-h-screen">
                  <div className="max-w-6xl mx-auto px-6 pt-6">
                    <div className="glass-panel rounded-2xl p-5 mb-4">
                      <h3 className="text-sm md:text-base text-white/85 tracking-[0.2em] uppercase mb-3">
                        Lore Ekle
                      </h3>
                      <div className="grid gap-3">
                        <input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Lore basligi"
                          className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-mythos-accent/70 focus:ring-1 focus:ring-mythos-accent/70"
                        />
                        <textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Lore icerigi"
                          rows={4}
                          className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-mythos-accent/70 focus:ring-1 focus:ring-mythos-accent/70 resize-none"
                        />
                        <div>
                          <button
                            type="button"
                            onClick={() => void handleLoreSubmit()}
                            disabled={isSavingLore || !title.trim() || !content.trim()}
                            className="rounded-md bg-mythos-accent/85 px-4 py-2 text-xs uppercase tracking-[0.2em] text-black font-semibold hover:bg-mythos-accent transition-colors disabled:opacity-60"
                          >
                            {isSavingLore ? 'Kaydediliyor...' : 'Kaydet'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <UniverseHub
                    onEnterExisting={() => navigate('/dashboard')}
                    onCreateUniverse={() => navigate('/dashboard')}
                  />
                </section>
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
            <Route path="timeline" element={<LegacyIframeView viewName="timeline" label="Zaman Çizelgesi (Legacy)" />} />
            <Route path="maps" element={<LegacyIframeView viewName="map" label="Haritalar Modülü (Legacy)" />} />
            <Route path="languages" element={<LegacyIframeView viewName="lang" label="Diller ve Alfabeler (Legacy)" />} />
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
