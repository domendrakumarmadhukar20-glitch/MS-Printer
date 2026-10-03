/**
 * MS PRINTERS — ANY TIME PRINT (ATP) SMART PRINT + DIGITAL ADVERTISING KIOSK
 * Target Domain: msprinter.in
 */

import React, { useState } from 'react';
import { KioskProvider } from './context/KioskContext';
import { Header } from './components/common/Header';
import { StudentMobileApp } from './components/student/StudentMobileApp';
import { KioskScreen } from './components/kiosk/KioskScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { HardwareSimulator } from './components/simulator/HardwareSimulator';
import { DeploymentHub } from './components/deploy/DeploymentHub';
import { BRAND_CONFIG } from './config/branding';
import { 
  Printer, 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  Cpu, 
  FileCode2, 
  Sparkles, 
  Layers, 
  ArrowRight,
  Zap,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'KIOSK' | 'ADMIN' | 'SIMULATOR' | 'DEPLOY'>('STUDENT');

  return (
    <KioskProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
        {/* Master Navigation Header */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Quick Launch Bar / Overview Strip */}
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-slate-300">
                ACTIVE VIEW:
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded text-[11px]">
                {activeTab === 'STUDENT' && '📱 Student Mobile Web App (Scan QR → Upload → Pay → Print)'}
                {activeTab === 'KIOSK' && '🖥️ Kiosk Fullscreen Monitor (Idle Ads & Live Spooling)'}
                {activeTab === 'ADMIN' && '⚙️ Central Admin Management & Paper Stock Audit'}
                {activeTab === 'SIMULATOR' && '🖨️ HP LaserJet M126nw & Hardware Bus Simulator'}
                {activeTab === 'DEPLOY' && '📦 Windows ATP Agent Script & Hostinger DNS Hub'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
              <span>HP LaserJet Pro MFP M126nw</span>
              <span>•</span>
              <span>Tray: 500 Sheets</span>
              <span>•</span>
              <span className="text-amber-400">msprinter.in</span>
            </div>
          </div>
        </div>

        {/* Main Tab View Rendering */}
        <main className="flex-1 w-full">
          {activeTab === 'STUDENT' && <StudentMobileApp />}
          {activeTab === 'KIOSK' && (
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
              <KioskScreen />
            </div>
          )}
          {activeTab === 'ADMIN' && <AdminDashboard />}
          {activeTab === 'SIMULATOR' && <HardwareSimulator />}
          {activeTab === 'DEPLOY' && <DeploymentHub />}
        </main>

        {/* Commercial Footer */}
        <footer className="bg-slate-950 border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500 space-y-2">
          <div className="flex items-center justify-center gap-2 font-bold text-slate-400">
            <span>{BRAND_CONFIG.brandName}</span>
            <span>•</span>
            <span className="text-amber-400">{BRAND_CONFIG.serviceName}</span>
            <span>•</span>
            <span className="font-mono text-slate-400">{BRAND_CONFIG.domain}</span>
          </div>
          <p className="text-[11px] max-w-xl mx-auto text-slate-500">
            Commercial Self-Service Any Time Print (ATP) Kiosk Platform with HP LaserJet Pro MFP M126nw Spooler Integration, Automated Paper Cassette Deduction, Digital Out-of-Home (DOOH) Advertising CMS, and Hostinger Deployment Architecture.
          </p>
        </footer>
      </div>
    </KioskProvider>
  );
}
