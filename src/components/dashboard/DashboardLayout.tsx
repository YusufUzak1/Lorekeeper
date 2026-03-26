import { Outlet } from 'react-router-dom';
import { Sidebar } from './ui/Sidebar';
import { Topbar } from './ui/Topbar';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen w-full bg-[#0A0A0B] text-gray-200 overflow-hidden font-sans">
      {/* Background Noise Layer */}
      <div className="absolute inset-0 z-[-1] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')"
        }}
      />
      
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-mythos-accent/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#8c9bd2]/[0.02] blur-[150px] rounded-full" />
      </div>

      {/* Main Sidebar */}
      <Sidebar />

      {/* Content Area */}
      <main className="flex-1 flex flex-col relative min-w-0">
        <Topbar />
        
        {/* Dynamic Content Outlet */}
        <div className="flex-1 overflow-hidden relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
