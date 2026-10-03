import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  QrCode, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  KeyRound, 
  Maximize2, 
  Minimize2, 
  Thermometer, 
  BatteryCharging, 
  ShieldCheck, 
  Layers, 
  RefreshCw, 
  Play, 
  Pause, 
  Sparkles,
  Zap,
  ArrowRight,
  HardDrive
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';
import { BRAND_CONFIG } from '../../config/branding';
import { soundService } from '../../services/soundService';

export const KioskScreen: React.FC = () => {
  const { 
    currentMachine, 
    jobs, 
    advertisements, 
    recordAdPlay, 
    kioskActivityMode, 
    setKioskActivityMode,
    resetKioskIdleTimer,
    addPaperToTray,
    triggerRemoteTestPrint
  } = useKiosk();

  // Ad rotation state
  const activeAds = advertisements.filter(a => a.active);
  const [currentAdIndex, setCurrentAdIndex] = useState<number>(0);
  const [adTimeRemaining, setAdTimeRemaining] = useState<number>(10);
  const [isAdPaused, setIsAdPaused] = useState<boolean>(false);

  // Maintenance PIN Modal
  const [showMaintenanceModal, setShowMaintenanceModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);
  const [isMaintenanceUnlocked, setIsMaintenanceUnlocked] = useState<boolean>(false);
  const [sheetsToAddInput, setSheetsToAddInput] = useState<number>(100);
  const [refillFeedback, setRefillFeedback] = useState<string | null>(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Current active job being printed or queued
  const activePrintingJob = jobs.find(
    j => j.machine_id === currentMachine.id && (j.print_status === 'PRINTING' || j.print_status === 'QUEUED')
  );

  const completedJob = jobs.find(
    j => j.machine_id === currentMachine.id && j.print_status === 'COMPLETED'
  );

  // Ad rotation timer effect
  useEffect(() => {
    if (kioskActivityMode !== 'ADS' || activeAds.length === 0 || isAdPaused) return;

    const currentAd = activeAds[currentAdIndex] || activeAds[0];
    setAdTimeRemaining(currentAd.durationSeconds);

    const interval = setInterval(() => {
      setAdTimeRemaining(prev => {
        if (prev <= 1) {
          // Advance to next ad
          recordAdPlay(currentAd.id);
          setCurrentAdIndex(idx => (idx + 1) % activeAds.length);
          const nextAd = activeAds[(currentAdIndex + 1) % activeAds.length];
          return nextAd ? nextAd.durationSeconds : 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [kioskActivityMode, currentAdIndex, activeAds, isAdPaused, recordAdPlay]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Maintenance PIN Check
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1260' || pinInput === 'admin') {
      setIsMaintenanceUnlocked(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleRefillPaper = () => {
    const res = addPaperToTray(currentMachine.id, sheetsToAddInput, 'Kiosk Technician (Screen)');
    setRefillFeedback(res.message);
    setTimeout(() => setRefillFeedback(null), 4000);
  };

  const currentAd = activeAds[currentAdIndex] || activeAds[0];
  const publicKioskUrl = `https://${BRAND_CONFIG.domain}/m/${currentMachine.id}`;

  return (
    <div 
      onClick={resetKioskIdleTimer}
      className="relative w-full min-h-[85vh] bg-slate-950 text-white select-none overflow-hidden flex flex-col justify-between border-4 border-slate-800 rounded-2xl shadow-2xl"
    >
      {/* ================= TOP BRAND & KIOSK STATUS BAR ================= */}
      <div className="bg-slate-900/95 backdrop-blur-md px-6 py-3 border-b border-slate-800 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center font-black text-2xl text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-400">
            MS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">
                {BRAND_CONFIG.brandName}
              </h1>
              <span className="bg-amber-500 text-slate-950 font-extrabold text-[11px] px-2 py-0.5 rounded tracking-wider">
                {BRAND_CONFIG.serviceName}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {currentMachine.collegeName} • <span className="text-amber-400">{currentMachine.location}</span>
            </p>
          </div>
        </div>

        {/* Center Mode Controls */}
        <div className="hidden md:flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setKioskActivityMode('INTERACTIVE')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              kioskActivityMode === 'INTERACTIVE'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            QR Scan Screen
          </button>
          <button
            onClick={() => setKioskActivityMode('ADS')}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              kioskActivityMode === 'ADS'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Idle Ad Player</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>
        </div>

        {/* Right Status Badges & Technician Key */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-slate-300 font-bold">{currentMachine.id}</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">ONLINE</span>
          </div>

          <button
            onClick={() => setShowMaintenanceModal(true)}
            title="Technician Maintenance Mode"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl border border-slate-700 transition-colors"
          >
            <KeyRound className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen Display"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT VIEWPORT ================= */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
        
        {/* --- VIEW 1: ACTIVE PRINTING PROGRESS SCREEN --- */}
        {activePrintingJob ? (
          <div className="max-w-2xl w-full bg-slate-900/90 backdrop-blur-xl border border-amber-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-3xl mx-auto flex items-center justify-center border border-amber-500/30">
              <Printer className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                HP LASERJET PRO MFP M126NW • PRINTING IN PROGRESS
              </span>
              <h2 className="text-3xl font-black text-white pt-2">
                Printing Your Document
              </h2>
              <p className="text-slate-400 text-sm">
                Job ID: <span className="font-mono text-amber-300 font-bold">{activePrintingJob.job_id}</span>
              </p>
            </div>

            {/* Live Page Progress */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Page Progress:</span>
                <span className="font-mono font-bold text-amber-400 text-base">
                  Page {activePrintingJob.progress_page} of {activePrintingJob.settings.pageCount * activePrintingJob.settings.copies}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden p-0.5 border border-slate-700">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500 relative"
                  style={{
                    width: `${Math.min(100, Math.round((activePrintingJob.progress_page / Math.max(1, activePrintingJob.settings.pageCount * activePrintingJob.settings.copies)) * 100))}%`
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>File: {activePrintingJob.file_name}</span>
                <span>Mode: {activePrintingJob.settings.colorMode === 'BW' ? 'Black & White' : 'Color'}</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Please stand by the output tray. Audio notification will chime upon completion.</span>
            </div>
          </div>

        ) : completedJob && kioskActivityMode === 'PRINTING' ? (
          /* --- VIEW 2: PRINT COMPLETED BANNER --- */
          <div className="max-w-xl w-full bg-emerald-950/40 backdrop-blur-xl border border-emerald-500/50 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 animate-pulse" />
            </div>

            <h2 className="text-3xl font-black text-white">
              ✓ PRINT COMPLETED!
            </h2>
            <p className="text-slate-300 text-sm">
              Please collect your documents from the HP LaserJet M126nw output tray.
            </p>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
              <p>Job: <span className="text-white">{completedJob.job_id}</span></p>
              <p>Physical Sheets: <span className="text-emerald-400 font-bold">{completedJob.settings.physicalSheets}</span></p>
              <p>Status: Safely Spooled & Delivered</p>
            </div>

            <p className="text-amber-400 text-xs font-semibold">
              Thank you for using MS PRINTERS. Returning to standby in a few seconds...
            </p>
          </div>

        ) : kioskActivityMode === 'INTERACTIVE' ? (
          /* --- VIEW 3: INTERACTIVE QR CODE SCAN SCREEN --- */
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl">
            {/* Left: Giant QR Code */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-amber-500 relative group">
                {/* Visual SVG QR */}
                <div className="w-60 h-60 flex flex-col items-center justify-center relative">
                  <svg className="w-full h-full text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M0 0h32v32H0zM8 8h16v16H8zM68 0h32v32H68zM76 8h16v16H76zM0 68h32v32H0zM8 76h16v16H8zM42 10h16v16H42zM50 36h12v12H50zM36 50h12v12H36zM10 42h16v16H10zM74 42h16v16H74zM42 74h16v16H42zM68 68h12v12H68zM84 84h16v16H84zM68 84h12v12H68z" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md shadow-lg border border-amber-300">
                      MS PRINTERS
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <span className="font-mono text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  {publicKioskUrl}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">No app install required • Direct browser access</p>
              </div>
            </div>

            {/* Right: Step-by-Step Instructions */}
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">
                  SELF-SERVICE INSTRUCTIONS
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Scan QR with your phone to print immediately
                </h2>
                <p className="text-slate-400 text-xs">
                  फोन के कैमरे से QR कोड स्कैन करें और 1 मिनट में प्रिंट प्राप्त करें।
                </p>
              </div>

              {/* 4 Simple Steps */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-sm border border-amber-500/30">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white">Scan QR Code</h3>
                    <p className="text-[11px] text-slate-400">Open phone camera or Google Lens to scan</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-sm border border-amber-500/30">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white">Upload PDF Document</h3>
                    <p className="text-[11px] text-slate-400">Select pages, copies & single/duplex settings</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-sm border border-amber-500/30">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white">Pay Online via UPI</h3>
                    <p className="text-[11px] text-slate-400">GPay, PhonePe, Paytm or BHIM (starting at ₹2)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-sm border border-emerald-500/30">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white">Collect from Tray</h3>
                    <p className="text-[11px] text-slate-400">HP LaserJet M126nw delivers instantly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        ) : (
          /* --- VIEW 4: DIGITAL ADVERTISING PLAYER (IDLE MODE) --- */
          <div className="relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 group">
            {/* Background Media Banner */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
              style={{ backgroundImage: `url(${currentAd.mediaUrl})` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-t ${currentAd.colorGradient} opacity-90 backdrop-blur-sm`}></div>
              <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Ad Content Overlay */}
            <div className="relative z-10 max-w-3xl p-8 text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>SPONSORED ANNOUNCEMENT • {currentAd.advertiser}</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                {currentAd.title}
              </h2>

              <p className="text-base sm:text-lg text-slate-200 font-medium max-w-2xl mx-auto drop-shadow">
                {currentAd.tagline}
              </p>

              {/* Bottom Touch to Print Prompter */}
              <div className="pt-6">
                <button
                  onClick={() => setKioskActivityMode('INTERACTIVE')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-4 rounded-2xl shadow-2xl shadow-amber-500/40 text-base inline-flex items-center gap-3 transition-transform transform hover:scale-105"
                >
                  <QrCode className="w-6 h-6" />
                  <span>TOUCH SCREEN TO PRINT (SCAN QR)</span>
                </button>
              </div>
            </div>

            {/* Ad Timer Countdown Bar */}
            <div className="absolute bottom-4 left-6 right-6 z-20 flex items-center justify-between text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-2">
                <span>Ad {currentAdIndex + 1} of {activeAds.length}</span>
                <span className="text-slate-500">•</span>
                <span>Next in {adTimeRemaining}s</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAdPaused(!isAdPaused)}
                  className="p-1.5 rounded bg-slate-900/80 border border-slate-700 hover:bg-slate-800"
                >
                  {isAdPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= BOTTOM HARDWARE TELEMETRY TICKER ================= */}
      <div className="bg-slate-900/95 backdrop-blur-md px-6 py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-300 z-30">
        <div className="flex items-center gap-4">
          {/* Paper Stock */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Tray 1 Stock:</span>
            <span className={`font-bold ${
              currentMachine.paperTray.current_stock <= 25 ? 'text-rose-400 font-black animate-pulse' :
              currentMachine.paperTray.current_stock <= 100 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {currentMachine.paperTray.current_stock} / {currentMachine.paperTray.maximum_capacity} sheets
            </span>
          </div>

          {/* Printer */}
          <div className="hidden sm:flex items-center gap-2">
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Printer:</span>
            <span className="text-emerald-400 font-bold">{currentMachine.printerModel}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Cabinet Temp */}
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>Temp:</span>
            <span className={`font-bold ${currentMachine.telemetry.cabinetTemperatureC >= 42 ? 'text-rose-400' : 'text-slate-200'}`}>
              {currentMachine.telemetry.cabinetTemperatureC}°C
            </span>
          </div>

          {/* UPS Power */}
          <div className="flex items-center gap-1.5">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span>UPS:</span>
            <span className="text-emerald-400 font-bold">{currentMachine.telemetry.upsBatteryPct}%</span>
          </div>

          {/* Cabinet Door */}
          <div className="hidden md:flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Door:</span>
            <span className={currentMachine.telemetry.cabinetDoorClosed ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
              {currentMachine.telemetry.cabinetDoorClosed ? 'SECURE' : 'OPEN'}
            </span>
          </div>
        </div>
      </div>

      {/* ================= TECHNICIAN MAINTENANCE MODAL ================= */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-white text-base">Technician Maintenance</h3>
              </div>
              <button
                onClick={() => {
                  setShowMaintenanceModal(false);
                  setIsMaintenanceUnlocked(false);
                }}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            {!isMaintenanceUnlocked ? (
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <p className="text-xs text-slate-400">
                  Enter authorized Kiosk PIN to access hardware diagnostics, paper reload, and agent controls. (Default PIN: <strong className="text-amber-400 font-mono">1260</strong>)
                </p>

                <input
                  type="password"
                  placeholder="Enter 4-digit PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-center text-xl font-mono text-white tracking-widest focus:outline-none focus:border-amber-500"
                  autoFocus
                />

                {pinError && (
                  <p className="text-xs text-rose-400 font-semibold text-center">
                    Invalid PIN. Please try again.
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs"
                >
                  Unlock Maintenance Console
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-2.5 rounded-xl font-semibold text-center">
                  ✓ Console Unlocked for {currentMachine.id}
                </div>

                {/* Paper Refill Section */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Paper Tray Refill</span>
                    <span className="font-mono text-amber-400">
                      {currentMachine.paperTray.current_stock} / {currentMachine.paperTray.maximum_capacity}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={sheetsToAddInput}
                      onChange={(e) => setSheetsToAddInput(parseInt(e.target.value) || 0)}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono w-24 text-center"
                    />
                    <button
                      onClick={handleRefillPaper}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-lg"
                    >
                      Confirm Paper Load
                    </button>
                  </div>

                  {refillFeedback && (
                    <p className="text-[11px] text-amber-300 font-semibold">{refillFeedback}</p>
                  )}
                </div>

                {/* Diagnostic Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => triggerRemoteTestPrint(currentMachine.id)}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-bold flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Print Test Page</span>
                  </button>

                  <button
                    onClick={() => {
                      soundService.playPrintCompletedChime();
                      soundService.speakAnnouncement('Testing kiosk audio announcements.');
                    }}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-bold flex items-center justify-center gap-1.5"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Test Speaker</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
