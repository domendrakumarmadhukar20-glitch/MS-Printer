import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  MapPin, 
  Navigation, 
  Building2, 
  FileText, 
  Check, 
  Phone, 
  Sparkles, 
  ExternalLink,
  Layers,
  Compass
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';
import { BRAND_CONFIG } from '../../config/branding';

interface AddMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (machineId: string) => void;
}

export const AddMachineModal: React.FC<AddMachineModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { machines, addNewMachine, setCurrentMachineId } = useKiosk();

  // Auto-suggest next ID based on existing fleet
  const nextNumber = machines.length + 1;
  const suggestedId = `ATP-CAMPUS-${String(nextNumber).padStart(3, '0')}`;

  const [machineId, setMachineId] = useState(suggestedId);
  const [name, setName] = useState(`New Campus Kiosk #${nextNumber}`);
  const [collegeName, setCollegeName] = useState('ABC Institute of Technology & Research');
  const [location, setLocation] = useState('Academic Block A, Ground Floor');
  const [address, setAddress] = useState('Knowledge Park III, Plot 14, Greater Noida, UP - 201306');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('https://www.google.com/maps/search/?api=1&query=28.47204,77.48805');
  const [landmark, setLandmark] = useState('Near Central Reception & Cafeteria');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [printerModel, setPrinterModel] = useState('Auto-Connected Windows Printer (Universal Spooler)');
  const [printerPort, setPrinterPort] = useState('Auto-Detect (USB / Wi-Fi / LAN)');
  const [paperStock, setPaperStock] = useState<number>(500);
  const [paperCapacity, setPaperCapacity] = useState<number>(500);
  const [switchToNew, setSwitchToNew] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  if (!isOpen) return null;

  const handleAutoGenerateMapUrl = () => {
    const query = `${location}, ${address}, ${collegeName}`;
    const generated = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    setGoogleMapsUrl(generated);
  };

  const handleGetCurrentGps = () => {
    if (!navigator.geolocation) {
      alert('आपके ब्राउज़र में GPS लोकेशन सपोर्ट उपलब्ध नहीं है।');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const gpsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        setGoogleMapsUrl(gpsUrl);
        setIsGettingLocation(false);
      },
      (err) => {
        setIsGettingLocation(false);
        setStatusMsg({
          type: 'error',
          text: 'GPS अनुमति अस्वीकार की गई या उपलब्ध नहीं है। कृपया मैन्युअल लिंक दर्ज करें।'
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setIsSubmitting(true);

    if (!machineId.trim()) {
      setStatusMsg({ type: 'error', text: 'मशीन ID भरना अनिवार्य है।' });
      setIsSubmitting(false);
      return;
    }

    if (!address.trim()) {
      setStatusMsg({ type: 'error', text: 'मशीन का पूरा भौतिक पता (Full Address) भरना अनिवार्य है।' });
      setIsSubmitting(false);
      return;
    }

    // Fallback google maps url if empty
    const finalMapUrl = googleMapsUrl.trim() || 
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location}, ${address}, ${collegeName}`)}`;

    const res = addNewMachine({
      id: machineId.trim().toUpperCase(),
      name: name.trim(),
      collegeName: collegeName.trim(),
      location: location.trim(),
      address: address.trim(),
      googleMapsUrl: finalMapUrl,
      landmark: landmark.trim(),
      contactPhone: contactPhone.trim(),
      printerModel: printerModel.trim(),
      printerPort: printerPort.trim(),
      paperStock: Number(paperStock) || 500,
      paperCapacity: Number(paperCapacity) || 500,
    });

    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      if (switchToNew) {
        setCurrentMachineId(machineId.trim().toUpperCase());
      }
      setTimeout(() => {
        if (onSuccess) onSuccess(machineId.trim().toUpperCase());
        onClose();
      }, 700);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-5 shadow-2xl my-auto text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-bold">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>नई मशीन जोड़ें</span>
                <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono">
                  Add Kiosk Unit
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {BRAND_CONFIG.brandName} फ्लीट में नया प्रिंटिंग कियोस्क और उसका गूगल मैप्स पता दर्ज करें
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

        {/* Status Alert */}
        {statusMsg && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMsg.type === 'error' 
              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300' 
              : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
          }`}>
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Machine Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                मशीन ID (Kiosk ID) <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={machineId}
                onChange={(e) => setMachineId(e.target.value.toUpperCase())}
                placeholder="e.g. ATP-ABC-003"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Unique identifier for QR code & telemetry</span>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                मशीन का नाम (Display Nickname)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Main Library Floor 1 Kiosk"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: College & Campus Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>कॉलेज / यूनिवर्सिटी का नाम (Campus Name)</span>
              </label>
              <input
                type="text"
                required
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. ABC Institute of Technology"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>विशिष्ट कमरा / स्थान (Room/Floor Location)</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Central Library, Ground Floor, Gate 1"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Physical Address & Google Maps Location Link (Primary Requirement) */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                <Navigation className="w-4 h-4 text-amber-400" />
                <span>मशीन का पता और गूगल मैप्स लोकेशन (Address & Maps Link)</span>
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                छात्रों को रास्ता दिखाने हेतु आवश्यक
              </span>
            </div>

            {/* Address */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                मशीन का पूरा पता (Full Physical Campus/Street Address) <span className="text-amber-400">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Plot No. 14, Knowledge Park III, Greater Noida, Gautam Buddha Nagar, UP - 201306"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none text-xs"
              />
            </div>

            {/* Google Maps Link */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-bold">
                  गूगल मैप्स लोकेशन लिंक (Google Maps Link) <span className="text-amber-400">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleAutoGenerateMapUrl}
                    className="text-[10px] text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>ऑटो-लिंक बनाएं</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGetCurrentGps}
                    disabled={isGettingLocation}
                    className="text-[10px] text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30 transition-colors flex items-center gap-1"
                  >
                    <Compass className={`w-3 h-3 ${isGettingLocation ? 'animate-spin' : ''}`} />
                    <span>{isGettingLocation ? 'GPS प्राप्त कर रहे...' : 'करंट GPS लें'}</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:border-amber-400 focus:outline-none"
                />

                {googleMapsUrl && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs flex items-center gap-1 shrink-0 transition-colors"
                    title="Google Maps में खोलकर देखें"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>टेस्ट करें</span>
                  </a>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                छात्र जब मोबाइल ऐप में "लोकेशन देखें" पर क्लिक करेंगे तो यह गूगल मैप्स खुल जाएगा।
              </span>
            </div>

            {/* Landmark & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  लैंडमार्क / पहचान चिह्न (Landmark)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Lift / Opposite Reading Hall"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>हेल्पलाइन / ऑपरेटर फ़ोन</span>
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono focus:border-amber-400 focus:outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Hardware & Paper Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                प्रिंटर मॉडल (Printer Model)
              </label>
              <input
                type="text"
                value={printerModel}
                onChange={(e) => setPrinterModel(e.target.value)}
                placeholder="e.g. HP M126nw / Canon LBP2900"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                प्रिंटर पोर्ट / कनेक्शन (Port)
              </label>
              <input
                type="text"
                value={printerPort}
                onChange={(e) => setPrinterPort(e.target.value)}
                placeholder="e.g. USB001 / Wi-Fi IP / Universal"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>प्रारंभिक पेपर स्टॉक (Sheets)</span>
              </label>
              <input
                type="number"
                min="0"
                max="2500"
                value={paperStock}
                onChange={(e) => setPaperStock(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Checkbox: Switch to newly added machine */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="switchMachineCheck"
              checked={switchToNew}
              onChange={(e) => setSwitchToNew(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 w-4 h-4"
            />
            <label htmlFor="switchMachineCheck" className="text-slate-300 text-xs cursor-pointer select-none">
              जोड़ने के तुरंत बाद इस नई मशीन को सक्रिय करें (Set as Active Kiosk now)
            </label>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold transition-colors"
            >
              रद्द करें (Cancel)
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-transform transform active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'मशीन जोड़ी जा रही है...' : '✓ मशीन जोड़ें (Save & Add Kiosk)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
