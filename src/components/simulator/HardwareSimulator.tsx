import React, { useState } from 'react';
import { 
  Cpu, 
  Printer, 
  Thermometer, 
  BatteryCharging, 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Trash2, 
  RefreshCw, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  Power,
  HardDrive,
  Fan,
  Volume2,
  Lock,
  Unlock,
  Radio
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';
import { BRAND_CONFIG } from '../../config/branding';
import { PrinterStatusCode } from '../../types';

export const HardwareSimulator: React.FC = () => {
  const { 
    currentMachine, 
    updatePrinterStatus, 
    setCabinetDoor, 
    setCabinetTemperature, 
    setUpsState, 
    triggerRemoteTestPrint,
    restartWindowsAgent,
    agentLogs,
    clearAgentLogs
  } = useKiosk();

  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'>('ALL');

  const filteredLogs = agentLogs.filter(log => logFilter === 'ALL' || log.level === logFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title & Introduction */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 font-black text-2xl flex items-center justify-center border border-amber-500/40">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Hardware Controller & Windows Agent Simulator
              </h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                LIVE HARDWARE BUS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive test bench for HP LaserJet Pro MFP M126nw, UPS Power, Cabinet Sensors, and Windows Agent Service
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerRemoteTestPrint(currentMachine.id)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Send Test Print to HP M126nw</span>
          </button>

          <button
            onClick={() => restartWindowsAgent(currentMachine.id)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Reboot Agent</span>
          </button>
        </div>
      </div>

      {/* Hardware Control Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PANEL 1: HP LaserJet Pro MFP M126nw Diagnostics */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">
                HP LaserJet Pro MFP M126nw Hardware Status
              </h2>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Port: {currentMachine.printerPort}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Simulate physical printer errors to verify safe spooler queuing, student notifications, and paper recovery.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {(['ONLINE', 'PAPER_JAM', 'PAPER_OUT', 'OFFLINE', 'LOW_TONER'] as PrinterStatusCode[]).map((status) => (
              <button
                key={status}
                onClick={() => updatePrinterStatus(currentMachine.id, status)}
                className={`p-3 rounded-xl border font-bold text-center transition-all ${
                  currentMachine.telemetry.printerStatus === status
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Tray Stock Quick Readout */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Tray 1 Paper Sensor</span>
              <span className="text-white font-bold text-sm">
                {currentMachine.paperTray.current_stock} / {currentMachine.paperTray.maximum_capacity} sheets
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
              currentMachine.paperTray.status === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-400' :
              currentMachine.paperTray.status === 'LOW' ? 'bg-amber-500/20 text-amber-400' :
              'bg-rose-500/20 text-rose-400 animate-pulse'
            }`}>
              {currentMachine.paperTray.status}
            </span>
          </div>
        </div>

        {/* PANEL 2: Cabinet Enclosure & Environment Sensors */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">
                Cabinet Sensors & Power Management
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Kiosk: {currentMachine.id}
            </span>
          </div>

          {/* Cabinet Door Sensor */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-white block">Cabinet Access Door Sensor</span>
              <span className="text-[11px] text-slate-400">
                Detects tampering or technician opening
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCabinetDoor(currentMachine.id, true)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ${
                  currentMachine.telemetry.cabinetDoorClosed
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Closed</span>
              </button>

              <button
                onClick={() => setCabinetDoor(currentMachine.id, false)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ${
                  !currentMachine.telemetry.cabinetDoorClosed
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Open (Tamper Alert)</span>
              </button>
            </div>
          </div>

          {/* Cabinet Temperature Slider */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">Cabinet Internal Temperature:</span>
              </div>
              <span className={`font-mono font-bold text-sm ${
                currentMachine.telemetry.cabinetTemperatureC >= 45 ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {currentMachine.telemetry.cabinetTemperatureC}°C
              </span>
            </div>

            <input
              type="range"
              min={25}
              max={55}
              value={currentMachine.telemetry.cabinetTemperatureC}
              onChange={(e) => setCabinetTemperature(currentMachine.id, parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>25°C Normal</span>
              <span className="text-amber-400">38°C (Cooling Fan ON)</span>
              <span className="text-rose-400">&gt;45°C High Temp Alarm</span>
            </div>
          </div>

          {/* UPS Power State */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">UPS Power Backup (1000VA):</span>
              </div>
              <span className="font-mono font-bold text-emerald-400">
                {currentMachine.telemetry.upsBatteryPct}% ({currentMachine.telemetry.upsMainsConnected ? 'AC Mains 230V' : 'Battery Backup Mode'})
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setUpsState(currentMachine.id, true, 100)}
                className={`flex-1 py-1.5 rounded-lg font-bold ${
                  currentMachine.telemetry.upsMainsConnected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                }`}
              >
                AC Mains Normal
              </button>

              <button
                onClick={() => setUpsState(currentMachine.id, false, 80)}
                className={`flex-1 py-1.5 rounded-lg font-bold ${
                  !currentMachine.telemetry.upsMainsConnected ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                }`}
              >
                Power Cut (Simulate UPS Battery)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL 3: Windows ATP Agent Terminal Stream */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5 text-xs text-white">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm">Windows ATP Agent (Service: atp_agent.exe) Live Log Stream</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* Filter Buttons */}
            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px]">
              {(['ALL', 'INFO', 'SUCCESS', 'WARN', 'ERROR'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  className={`px-2 py-0.5 rounded ${logFilter === lvl ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              onClick={clearAgentLogs}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800"
              title="Clear Terminal Logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Log Box */}
        <div className="bg-black/90 p-4 rounded-2xl border border-slate-900 h-64 overflow-y-auto space-y-2 text-xs">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-600 text-center py-12">No logs matching filter.</div>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
                <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
                <span className={`px-1 rounded text-[9px] font-bold shrink-0 ${
                  log.level === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' :
                  log.level === 'WARN' ? 'bg-amber-500/20 text-amber-400' :
                  log.level === 'ERROR' ? 'bg-rose-500/20 text-rose-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  [{log.level}]
                </span>
                <span className={`text-[11px] ${
                  log.level === 'SUCCESS' ? 'text-emerald-300' :
                  log.level === 'WARN' ? 'text-amber-300' :
                  log.level === 'ERROR' ? 'text-rose-300 font-bold' :
                  'text-slate-300'
                }`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Target Spooler: \\localhost\HP LaserJet Pro MFP M126nw</span>
          <span>Authentication: Machine Token SHA-256 Validated</span>
        </div>
      </div>
    </div>
  );
};
