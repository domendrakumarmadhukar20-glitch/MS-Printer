import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Copy, 
  Check, 
  Phone, 
  Building2, 
  Printer, 
  Layers,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';
import { KioskMachine } from '../../types';
import { BRAND_CONFIG } from '../../config/branding';

interface MachineLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddMachine?: () => void;
}

export const MachineLocationModal: React.FC<MachineLocationModalProps> = ({
  isOpen,
  onClose,
  onOpenAddMachine,
}) => {
  const { machines, currentMachine, setCurrentMachineId } = useKiosk();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyAddress = (machine: KioskMachine) => {
    const textToCopy = `${machine.id} - ${machine.location}\nपता: ${machine.address}\nगूगल मैप्स लिंक: ${machine.googleMapsUrl}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedId(machine.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleOpenGoogleMaps = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-5 sm:p-6 space-y-5 shadow-2xl my-auto text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg font-bold">
              <MapPin className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>कियोस्क मशीन लोकेशन व पता</span>
              </h2>
              <p className="text-xs text-slate-400">
                मशीन तक पहुंचने के लिए Google Maps लिंक व कैंपस पता
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected / Current Machine Hero Card */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-amber-400 text-lg sm:text-xl">
                  {currentMachine.id}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                  सक्रिय कियोस्क (Active)
                </span>
              </div>
              <p className="text-xs font-semibold text-white mt-0.5">
                {currentMachine.name || currentMachine.location}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] bg-slate-900 border border-slate-700 text-emerald-400 font-bold px-2.5 py-1 rounded-lg font-mono">
                {currentMachine.paperTray.current_stock} पेज उपलब्ध
              </span>
            </div>
          </div>

          {/* Location & Full Address */}
          <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">कैंपस व कमरा:</span>
                <span className="text-slate-100 font-medium">{currentMachine.collegeName} • {currentMachine.location}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-slate-800/80">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">भौतिक पता (Full Physical Address):</span>
                <p className="text-slate-200 font-medium leading-relaxed">{currentMachine.address}</p>
                {currentMachine.landmark && (
                  <p className="text-[11px] text-amber-300/80 mt-1">
                    📌 लैंडमार्क: {currentMachine.landmark}
                  </p>
                )}
              </div>
            </div>

            {currentMachine.contactPhone && (
              <div className="flex items-center gap-2.5 pt-2 border-t border-slate-800/80 text-[11px]">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-slate-400">हेल्पलाइन:</span>
                <a href={`tel:${currentMachine.contactPhone}`} className="text-blue-300 font-mono font-bold hover:underline">
                  {currentMachine.contactPhone}
                </a>
              </div>
            )}
          </div>

          {/* Action Buttons: Google Maps & Copy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => handleOpenGoogleMaps(currentMachine.googleMapsUrl)}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-transform transform active:scale-95"
            >
              <Navigation className="w-4 h-4 text-slate-950" />
              <span>📍 Google Maps पर रास्ता देखें (Open Map)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleCopyAddress(currentMachine)}
              className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {copiedId === currentMachine.id ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">पता कॉपी हो गया!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>पता व लिंक कॉपी करें (Share)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Fleet Machines List (Switch Machine) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              कैंपस की अन्य मशीनें ({machines.length} Total)
            </span>
            {onOpenAddMachine && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAddMachine();
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ नई मशीन जोड़ें</span>
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {machines.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setCurrentMachineId(m.id);
                }}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  m.id === currentMachine.id
                    ? 'bg-amber-500/15 border-amber-500/40'
                    : 'bg-slate-950 hover:bg-slate-850 border-slate-800'
                }`}
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400">{m.id}</span>
                    <span className="text-slate-300 font-medium truncate">{m.name || m.location}</span>
                    {m.id === currentMachine.id && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                        चयनित
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{m.address}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenGoogleMaps(m.googleMapsUrl);
                    }}
                    title="Google Maps में खोलें"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                  </button>

                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            {BRAND_CONFIG.brandName} • 24x7 ऑटोमेटेड प्रिंटिंग कियोस्क नेटवर्क
          </p>
        </div>
      </div>
    </div>
  );
};
