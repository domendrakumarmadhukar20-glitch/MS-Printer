import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Printer, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  Trash2, 
  FileText, 
  CreditCard, 
  QrCode, 
  Download, 
  Search, 
  Filter, 
  Sliders, 
  Volume2, 
  Thermometer, 
  Battery, 
  Zap, 
  Settings,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  Undo2,
  Calendar,
  Building
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';
import { BRAND_CONFIG } from '../../config/branding';
import { soundService } from '../../services/soundService';
import { Advertisement, PricingRule } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    machines,
    currentMachine,
    setCurrentMachineId,
    jobs,
    paperTransactions,
    advertisements,
    toggleAdActive,
    addAdvertisement,
    deleteAdvertisement,
    addPaperToTray,
    recordPaperWaste,
    adjustPaperStock,
    triggerRemoteTestPrint,
    restartWindowsAgent,
    pricingRules,
    updatePricing,
    cancelOrRefundJob
  } = useKiosk();

  // Admin active sub-tab
  const [adminTab, setAdminTab] = useState<'OVERVIEW' | 'MACHINES' | 'PAPER' | 'ADS' | 'JOBS' | 'PRICING'>('OVERVIEW');

  // Paper Management Modals
  const [showAddPaperModal, setShowAddPaperModal] = useState<boolean>(false);
  const [paperToAdd, setPaperToAdd] = useState<number>(200);
  const [addPaperError, setAddPaperError] = useState<string | null>(null);

  const [showWasteModal, setShowWasteModal] = useState<boolean>(false);
  const [wasteSheets, setWasteSheets] = useState<number>(5);
  const [wasteReason, setWasteReason] = useState<string>('Paper Jam');

  const [showAdjustModal, setShowAdjustModal] = useState<boolean>(false);
  const [adjustedStock, setAdjustedStock] = useState<number>(currentMachine.paperTray.current_stock);
  const [adjustReason, setAdjustReason] = useState<string>('Physical Count Verification');

  // Ad creation modal
  const [showAddAdModal, setShowAddAdModal] = useState<boolean>(false);
  const [newAdTitle, setNewAdTitle] = useState<string>('');
  const [newAdAdvertiser, setNewAdAdvertiser] = useState<string>('');
  const [newAdTagline, setNewAdTagline] = useState<string>('');
  const [newAdDuration, setNewAdDuration] = useState<number>(10);
  const [newAdMediaUrl, setNewAdMediaUrl] = useState<string>('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80');

  // Job search & filter
  const [jobSearch, setJobSearch] = useState<string>('');
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('ALL');

  // Printable QR poster modal
  const [showQrPosterModal, setShowQrPosterModal] = useState<boolean>(false);
  const [selectedPosterMachine, setSelectedPosterMachine] = useState(currentMachine);

  // Aggregated Stats
  const totalRevenue = jobs
    .filter(j => j.payment_status === 'VERIFIED')
    .reduce((sum, j) => sum + j.amount, 0);

  const totalSheetsPrinted = jobs
    .filter(j => j.print_status === 'COMPLETED')
    .reduce((sum, j) => sum + j.settings.physicalSheets, 0);

  const todayJobsCount = jobs.length;
  const onlineMachinesCount = machines.filter(m => m.telemetry.agentOnline && m.telemetry.printerOnline).length;
  const lowPaperMachines = machines.filter(m => m.paperTray.current_stock <= m.paperTray.low_threshold);

  // Handle Add Paper Submit (with capacity validation)
  const handleAddPaper = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addPaperToTray(currentMachine.id, paperToAdd, 'SuperAdmin');
    if (!res.success) {
      setAddPaperError(res.message);
    } else {
      setAddPaperError(null);
      setShowAddPaperModal(false);
    }
  };

  // Handle Waste Submit
  const handleWasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordPaperWaste(currentMachine.id, wasteSheets, wasteReason, 'SuperAdmin');
    setShowWasteModal(false);
  };

  // Handle Adjust Submit
  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adjustPaperStock(currentMachine.id, adjustedStock, adjustReason, 'SuperAdmin');
    setShowAdjustModal(false);
  };

  // Handle Create Ad Submit
  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitle.trim() || !newAdAdvertiser.trim()) return;

    addAdvertisement({
      title: newAdTitle,
      advertiser: newAdAdvertiser,
      tagline: newAdTagline || 'Exclusive Offer for College Students',
      mediaType: 'IMAGE',
      mediaUrl: newAdMediaUrl,
      colorGradient: 'from-amber-950 via-slate-950 to-slate-900',
      durationSeconds: newAdDuration || 10,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '2026-12-31',
      active: true,
    });

    setNewAdTitle('');
    setNewAdAdvertiser('');
    setNewAdTagline('');
    setShowAddAdModal(false);
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const csvRows = [
      ['Job ID', 'Machine', 'College', 'File Name', 'Pages', 'Sheets', 'Amount (INR)', 'Payment Status', 'Print Status', 'Created At'],
      ...jobs.map(j => [
        j.job_id,
        j.machine_id,
        `"${j.college_name}"`,
        `"${j.file_name}"`,
        j.settings.pageCount,
        j.settings.physicalSheets,
        j.amount.toFixed(2),
        j.payment_status,
        j.print_status,
        j.created_at
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MS_PRINTERS_JOBS_REPORT_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Admin Title & Quick Status Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400">
            MS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {BRAND_CONFIG.brandName}
              </h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                CENTRAL MANAGEMENT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Unattended Kiosks, Spooler Dispatcher, Digital Ads CMS & Hardware Telemetry
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export Report (CSV)</span>
          </button>

          <button
            onClick={() => {
              setSelectedPosterMachine(currentMachine);
              setShowQrPosterModal(true);
            }}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs transition-colors shadow-md shadow-amber-500/20"
          >
            <QrCode className="w-4 h-4" />
            <span>Print Branded QR Poster</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center overflow-x-auto bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs sm:text-sm font-semibold gap-1">
        <button
          onClick={() => setAdminTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            adminTab === 'OVERVIEW'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Overview & KPIs
        </button>

        <button
          onClick={() => setAdminTab('MACHINES')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            adminTab === 'MACHINES'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Machines & Fleet ({machines.length})
        </button>

        <button
          onClick={() => setAdminTab('PAPER')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'PAPER'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>Paper Stock & Audit</span>
          {lowPaperMachines.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('ADS')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            adminTab === 'ADS'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Digital Advertising CMS ({advertisements.length})
        </button>

        <button
          onClick={() => setAdminTab('JOBS')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            adminTab === 'JOBS'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Job Queue & Refunds ({jobs.length})
        </button>

        <button
          onClick={() => setAdminTab('PRICING')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            adminTab === 'PRICING'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Pricing Engine
        </button>
      </div>

      {/* ================= TAB 1: OVERVIEW & KPIS ================= */}
      {adminTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Total Revenue Collected</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                ₹{totalRevenue.toFixed(2)}
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">100% Server Verified</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Physical Sheets Consumed</span>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {totalSheetsPrinted}
              </div>
              <span className="text-[10px] text-slate-400">Deducted from HP Trays</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Active Kiosks Online</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {onlineMachinesCount} / {machines.length}
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">Heartbeat Healthy (24ms)</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Low Paper Alerts</span>
              <div className={`text-2xl sm:text-3xl font-black font-mono ${lowPaperMachines.length > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
                {lowPaperMachines.length}
              </div>
              <span className="text-[10px] text-slate-400">Trays below 20% capacity</span>
            </div>
          </div>

          {/* Quick Active Kiosks Status Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center justify-between">
              <span>Campus Kiosk Fleet Live Telemetry</span>
              <span className="text-xs text-amber-400 font-mono">Real-time Spooler & Hardware Sync</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {machines.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setCurrentMachineId(m.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    m.id === currentMachine.id
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-sm">{m.id}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ONLINE
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-200 truncate">{m.collegeName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{m.location}</p>
                  </div>

                  {/* Hardware Indicators */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Tray Stock:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {m.paperTray.current_stock} / 500 sheets ({Math.round((m.paperTray.current_stock / 500) * 100)}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Printer Model:</span>
                      <span className="font-mono text-slate-300">HP M126nw</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Cabinet Temp:</span>
                      <span className="font-mono text-slate-300">{m.telemetry.cabinetTemperatureC}°C</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Cabinet Door:</span>
                      <span className={m.telemetry.cabinetDoorClosed ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                        {m.telemetry.cabinetDoorClosed ? 'SECURE' : 'OPEN'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: MACHINES & FLEET ================= */}
      {adminTab === 'MACHINES' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Configured Kiosk Hardware Units</h2>
              <span className="text-xs text-slate-400">Showing {machines.length} active kiosks</span>
            </div>

            <div className="space-y-4">
              {machines.map((m) => (
                <div key={m.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono border border-amber-500/30">
                        <Printer className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono font-bold text-white text-base">{m.id}</h3>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                            {m.printerPort}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{m.collegeName} • {m.location}</p>
                      </div>
                    </div>

                    {/* Remote Operations */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedPosterMachine(m);
                          setShowQrPosterModal(true);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5 text-amber-400" />
                        <span>Poster</span>
                      </button>

                      <button
                        onClick={() => triggerRemoteTestPrint(m.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Test Print</span>
                      </button>

                      <button
                        onClick={() => restartWindowsAgent(m.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Restart Agent</span>
                      </button>
                    </div>
                  </div>

                  {/* Machine Diagnostics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Windows Agent Status</span>
                      <span className="font-bold text-emerald-400 font-mono">Running (v2.4)</span>
                    </div>

                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Paper Stock Status</span>
                      <span className="font-bold text-amber-400 font-mono">
                        {m.paperTray.current_stock} / 500 ({m.paperTray.status})
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">UPS Power Source</span>
                      <span className="font-bold text-emerald-400 font-mono">AC Mains 230V ({m.telemetry.upsBatteryPct}%)</span>
                    </div>

                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Cabinet Temperature</span>
                      <span className="font-bold text-slate-200 font-mono">{m.telemetry.cabinetTemperatureC}°C (Fan Active)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PAPER STOCK MANAGEMENT & AUDIT ================= */}
      {adminTab === 'PAPER' && (
        <div className="space-y-6">
          {/* Active Tray Status Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                  TRAY HARDWARE MANAGEMENT
                </span>
                <h2 className="text-xl font-bold text-white">
                  Tray 1 Stock on {currentMachine.id} ({currentMachine.location})
                </h2>
                <p className="text-xs text-slate-400">
                  Standard 500-sheet cassette for HP LaserJet Pro MFP M126nw
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddPaperModal(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Paper Refill</span>
                </button>

                <button
                  onClick={() => setShowWasteModal(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Record Waste</span>
                </button>

                <button
                  onClick={() => {
                    setAdjustedStock(currentMachine.paperTray.current_stock);
                    setShowAdjustModal(true);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Manual Adjust</span>
                </button>
              </div>
            </div>

            {/* Visual Gauge Bar */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-bold">Current Stock Level:</span>
                <span className="font-mono text-xl font-black text-amber-400">
                  {currentMachine.paperTray.current_stock} / {currentMachine.paperTray.maximum_capacity} sheets
                  <span className="text-xs font-normal text-slate-400 ml-2">
                    ({Math.round((currentMachine.paperTray.current_stock / currentMachine.paperTray.maximum_capacity) * 100)}% available)
                  </span>
                </span>
              </div>

              {/* Progress Bar with Color Coding */}
              <div className="w-full bg-slate-800 rounded-full h-5 overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    currentMachine.paperTray.current_stock <= currentMachine.paperTray.critical_threshold
                      ? 'bg-rose-500 animate-pulse'
                      : currentMachine.paperTray.current_stock <= currentMachine.paperTray.low_threshold
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (currentMachine.paperTray.current_stock / currentMachine.paperTray.maximum_capacity) * 100)}%`
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>0 Empty</span>
                <span className="text-rose-400">Critical &lt; 25 sheets (5%)</span>
                <span className="text-amber-400">Low &lt; 100 sheets (20%)</span>
                <span>500 Full Capacity</span>
              </div>
            </div>
          </div>

          {/* Paper Audit Ledger / History Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Paper Stock Audit Ledger</span>
              <span className="text-xs text-slate-400">Immutable ledger of every physical sheet</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Date / Time</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Opening</th>
                    <th className="py-2.5 px-3">Change</th>
                    <th className="py-2.5 px-3">Closing</th>
                    <th className="py-2.5 px-3">Reason / Details</th>
                    <th className="py-2.5 px-3">Authorized By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {paperTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {new Date(tx.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'ADD' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          tx.type === 'PRINT' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          tx.type === 'WASTE' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{tx.opening_stock}</td>
                      <td className={`py-2.5 px-3 font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">{tx.closing_stock}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans">{tx.reason}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-sans">{tx.admin_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: DIGITAL ADVERTISING CMS ================= */}
      {adminTab === 'ADS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">Digital Advertising Playlists & Banners</h2>
                <p className="text-xs text-slate-400">
                  Ads run during idle time on Kiosk Monitor (Auto-interrupts immediately when student scans QR)
                </p>
              </div>

              <button
                onClick={() => setShowAddAdModal(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Campaign</span>
              </button>
            </div>

            {/* Ad Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {advertisements.map((ad) => (
                <div key={ad.id} className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between">
                  <div className="relative h-36 bg-slate-800">
                    <img src={ad.mediaUrl} alt={ad.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                    <span className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded border border-slate-700">
                      {ad.durationSeconds}s duration
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      {ad.advertiser}
                    </span>
                    <h3 className="font-bold text-sm text-white leading-snug line-clamp-2">
                      {ad.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {ad.tagline}
                    </p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Plays: {ad.playCount}</span>
                      <span>Total Time: {Math.round(ad.totalDurationSeconds / 60)} mins</span>
                    </div>
                  </div>

                  {/* Card Footer Controls */}
                  <div className="bg-slate-900 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => toggleAdActive(ad.id)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        ad.active
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {ad.active ? 'ACTIVE' : 'PAUSED'}
                    </button>

                    <button
                      onClick={() => deleteAdvertisement(ad.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: JOB QUEUE & REFUND MANAGEMENT ================= */}
      {adminTab === 'JOBS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">Central Print Job Queue & Payment Audit</h2>
                <p className="text-xs text-slate-400">
                  Track every print job, spooler state, and issue refunds for jammed/interrupted prints
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search Job ID or File..."
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-48"
                  />
                </div>

                <select
                  value={jobStatusFilter}
                  onChange={(e) => setJobStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PRINTING">Printing</option>
                  <option value="QUEUED">Queued</option>
                  <option value="WAITING_FOR_PAPER">Waiting for Paper</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
            </div>

            {/* Jobs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Job ID</th>
                    <th className="py-2.5 px-3">Kiosk</th>
                    <th className="py-2.5 px-3">File Name</th>
                    <th className="py-2.5 px-3">Specs</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {jobs
                    .filter(j => jobStatusFilter === 'ALL' || j.print_status === jobStatusFilter)
                    .filter(j => !jobSearch || j.job_id.toLowerCase().includes(jobSearch.toLowerCase()) || j.file_name.toLowerCase().includes(jobSearch.toLowerCase()))
                    .map((job) => (
                      <tr key={job.job_id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-amber-400">{job.job_id}</td>
                        <td className="py-2.5 px-3 text-slate-400">{job.machine_id}</td>
                        <td className="py-2.5 px-3 text-white truncate max-w-[150px] font-sans">
                          {job.file_name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {job.settings.pageCount}p • {job.settings.physicalSheets}sh ({job.settings.duplexMode})
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white">₹{job.amount.toFixed(2)}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            job.print_status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                            job.print_status === 'PRINTING' ? 'bg-amber-500/20 text-amber-400 animate-pulse' :
                            job.print_status === 'QUEUED' ? 'bg-blue-500/20 text-blue-400' :
                            job.print_status === 'WAITING_FOR_PAPER' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {job.print_status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {job.print_status !== 'REFUNDED' && (
                            <button
                              onClick={() => cancelOrRefundJob(job.job_id, 'Admin manual reversal request')}
                              className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline font-semibold font-sans"
                            >
                              Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: PRICING ENGINE ================= */}
      {adminTab === 'PRICING' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Campus & Machine Rate Configuration</h2>
            <p className="text-xs text-slate-400">
              Customize student printing rates per page and duplex discounts for each campus partner
            </p>

            <div className="space-y-4">
              {pricingRules.map((rule) => (
                <div key={rule.collegeId} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">{rule.collegeId}</span>
                    <span className="text-xs text-amber-400 font-semibold">Active Rate Profile</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">A4 B&W Single (₹)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={rule.bwSingle}
                        onChange={(e) => updatePricing({ ...rule, bwSingle: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">A4 B&W Duplex (₹ / sheet)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={rule.bwDuplex}
                        onChange={(e) => updatePricing({ ...rule, bwDuplex: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">Color Single (₹)</label>
                      <input
                        type="number"
                        step="1"
                        value={rule.colorSingle}
                        onChange={(e) => updatePricing({ ...rule, colorSingle: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">Color Duplex (₹ / sheet)</label>
                      <input
                        type="number"
                        step="1"
                        value={rule.colorDuplex}
                        onChange={(e) => updatePricing({ ...rule, colorDuplex: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: ADD PAPER WITH STRICT CAPACITY PROTECTION ================= */}
      {showAddPaperModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Add Paper Refill (Tray 1)</h3>
              <button onClick={() => setShowAddPaperModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleAddPaper} className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Current Stock:</span>
                  <span className="font-mono font-bold text-white">{currentMachine.paperTray.current_stock} sheets</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Tray Maximum Capacity:</span>
                  <span className="font-mono font-bold text-white">{currentMachine.paperTray.maximum_capacity} sheets</span>
                </div>
                <div className="flex justify-between text-amber-400 font-semibold pt-1 border-t border-slate-800">
                  <span>Max Additional Allowed:</span>
                  <span className="font-mono font-bold">
                    {currentMachine.paperTray.maximum_capacity - currentMachine.paperTray.current_stock} sheets
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Number of Sheets to Add:</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={paperToAdd}
                  onChange={(e) => setPaperToAdd(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-base focus:outline-none focus:border-amber-500"
                />
              </div>

              {addPaperError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 font-semibold">
                  ⚠ {addPaperError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs shadow-md shadow-amber-500/20"
              >
                Confirm Paper Addition
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: RECORD WASTE ================= */}
      {showWasteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Record Paper Waste</h3>
              <button onClick={() => setShowWasteModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleWasteSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Waste Sheets Count:</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={wasteSheets}
                  onChange={(e) => setWasteSheets(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Reason for Waste:</label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="Paper Jam">Paper Jam</option>
                  <option value="Misprint / Toner Smudge">Misprint / Toner Smudge</option>
                  <option value="Damaged Paper in Cassette">Damaged Paper in Cassette</option>
                  <option value="Manual Removal">Manual Removal</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-400 text-white font-black py-2.5 rounded-xl"
              >
                Deduct & Record in Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: MANUAL ADJUSTMENT ================= */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Manual Stock Adjustment</h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Actual Physical Count (Sheets):</label>
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={adjustedStock}
                  onChange={(e) => setAdjustedStock(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Audit Justification:</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl"
              >
                Save Adjustment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: CREATE NEW AD ================= */}
      {showAddAdModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Create New Advertisement</h3>
              <button onClick={() => setShowAddAdModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAd} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Campaign Headline:</label>
                <input
                  type="text"
                  placeholder="e.g. Free GATE Test Series Registration"
                  value={newAdTitle}
                  onChange={(e) => setNewAdTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Advertiser / Brand Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Unacademy / Local Cafe / Stationery"
                  value={newAdAdvertiser}
                  onChange={(e) => setNewAdAdvertiser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Tagline / Key Message:</label>
                <input
                  type="text"
                  placeholder="e.g. Get 20% discount with your student ID card."
                  value={newAdTagline}
                  onChange={(e) => setNewAdTagline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Duration (Seconds):</label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={newAdDuration}
                    onChange={(e) => setNewAdDuration(parseInt(e.target.value) || 10)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Media Banner Image URL:</label>
                  <input
                    type="url"
                    value={newAdMediaUrl}
                    onChange={(e) => setNewAdMediaUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl shadow-md shadow-amber-500/20"
              >
                Publish to Kiosk Screens
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: BRANDED PRINTABLE QR POSTER ================= */}
      {showQrPosterModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Official Kiosk QR Poster Generator</h3>
              <button onClick={() => setShowQrPosterModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            {/* A4 Printable Poster Preview */}
            <div className="bg-white text-slate-950 p-6 rounded-2xl shadow-xl border-4 border-amber-500 text-center space-y-4">
              <div className="border-b-2 border-slate-950 pb-2">
                <h1 className="text-2xl font-black tracking-tight">{BRAND_CONFIG.brandName}</h1>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">{BRAND_CONFIG.serviceName}</p>
                <p className="text-[10px] text-slate-600 font-medium">24×7 Unattended Smart Self-Service Printing</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">KIOSK LOCATION</span>
                <span className="font-mono font-black text-sm text-slate-900">{selectedPosterMachine.id}</span>
                <p className="text-xs font-bold text-slate-700">{selectedPosterMachine.collegeName}</p>
                <p className="text-[11px] text-slate-500">{selectedPosterMachine.location}</p>
              </div>

              {/* Giant QR */}
              <div className="w-48 h-48 mx-auto bg-white p-2 border-2 border-slate-900 rounded-xl relative flex items-center justify-center">
                <svg className="w-full h-full text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M0 0h32v32H0zM8 8h16v16H8zM68 0h32v32H68zM76 8h16v16H76zM0 68h32v32H0zM8 76h16v16H8zM42 10h16v16H42zM50 36h12v12H50zM36 50h12v12H36zM10 42h16v16H10zM74 42h16v16H74zM42 74h16v16H42zM68 68h12v12H68zM84 84h16v16H84zM68 84h12v12H68z" />
                </svg>
                <div className="absolute bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded shadow border border-amber-300">
                  SCAN HERE
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-mono font-bold text-xs text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  https://{BRAND_CONFIG.domain}/m/{selectedPosterMachine.id}
                </span>
                <p className="text-xs font-black text-slate-900 pt-1">
                  Scan → Upload PDF → Pay UPI → Collect Print
                </p>
                <p className="text-[10px] text-slate-500">
                  Powered by HP LaserJet Pro MFP M126nw • Starting @ ₹2/page
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Poster to PDF / Physical Printer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
