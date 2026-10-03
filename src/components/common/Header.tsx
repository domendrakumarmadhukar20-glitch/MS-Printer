import React, { useState } from 'react';
import { 
  Printer, 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  Cpu, 
  FileCode2, 
  Volume2, 
  VolumeX, 
  Activity,
  Layers,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { BRAND_CONFIG } from '../../config/branding';
import { useKiosk } from '../../context/KioskContext';
import { soundService } from '../../services/soundService';

interface HeaderProps {
  activeTab: 'STUDENT' | 'KIOSK' | 'ADMIN' | 'SIMULATOR' | 'DEPLOY';
  setActiveTab: (tab: 'STUDENT' | 'KIOSK' | 'ADMIN' | 'SIMULATOR' | 'DEPLOY') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { currentMachineId, setCurrentMachineId, machines, currentMachine } = useKiosk();
  const [isMuted, setIsMuted] = useState(soundService.getMuted());
  const [showMachineDropdown, setShowMachineDropdown] = useState(false);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundService.setMuted(nextState);
    if (!nextState) {
      soundService.playPaymentSuccessChime();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      {/* Top Brand Notification Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 font-bold px-4 py-1 text-xs tracking-wider flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2">
          <span className="bg-slate-950 text-amber-400 px-1.5 py-0.5 rounded text-[10px] tracking-widest uppercase">
            OFFICIAL KIOSK NETWORK
          </span>
          <span>{BRAND_CONFIG.brandName} • {BRAND_CONFIG.serviceName} — 24×7 UNATTENDED SMART PRINTING</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-950 animate-pulse"></span>
            DOMAIN: <strong className="underline underline-offset-2">{BRAND_CONFIG.domain}</strong>
          </span>
          <span>HARDWARE: {BRAND_CONFIG.initialHardware.printerModel}</span>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black text-xl tracking-tighter border border-amber-400/40">
            MS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                {BRAND_CONFIG.brandName}
              </span>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                ATP SYSTEM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Any Time Print • <span className="text-amber-400/90 font-mono">{BRAND_CONFIG.domain}</span>
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('STUDENT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'STUDENT'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Student Mobile</span>
          </button>

          <button
            onClick={() => setActiveTab('KIOSK')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'KIOSK'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Kiosk Screen</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          </button>

          <button
            onClick={() => setActiveTab('ADMIN')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ADMIN'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Central</span>
          </button>

          <button
            onClick={() => setActiveTab('SIMULATOR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'SIMULATOR'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Hardware & Agent</span>
          </button>

          <button
            onClick={() => setActiveTab('DEPLOY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'DEPLOY'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Deploy Hub</span>
          </button>
        </nav>

        {/* Machine Selector & Audio Toggle */}
        <div className="flex items-center gap-2">
          {/* Active Machine Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMachineDropdown(!showMachineDropdown)}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs px-3 py-1.5 rounded-lg text-slate-200 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="font-mono font-bold text-amber-400">{currentMachine.id}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showMachineDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Select Kiosk Machine
                </div>
                {machines.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setCurrentMachineId(m.id);
                      setShowMachineDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex flex-col gap-0.5 ${
                      m.id === currentMachineId ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span>{m.id}</span>
                      <span className="text-[10px] text-emerald-400 font-normal">
                        Paper: {m.paperTray.current_stock}/500
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 truncate">{m.collegeName}</span>
                    <span className="text-[10px] text-slate-500 truncate">{m.location}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Unmute Audio Announcements' : 'Mute Audio Announcements'}
            className={`p-2 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
              isMuted
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline font-mono text-[10px]">
              {isMuted ? 'MUTED' : 'SPEAKER ON'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
