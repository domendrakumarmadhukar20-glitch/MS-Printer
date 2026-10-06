import React, { useState } from 'react';
import { 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Smartphone,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { BRAND_CONFIG } from '../../config/branding';

interface AdminLockScreenProps {
  onUnlock: () => void;
  onBackToStudent: () => void;
  targetPanelName: string;
}

export const AdminLockScreen: React.FC<AdminLockScreenProps> = ({
  onUnlock,
  onBackToStudent,
  targetPanelName
}) => {
  const [pin, setPin] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const validPasswords = ['1260', 'admin1260', 'admin', 'msadmin', 'msprinter'];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPin = pin.trim().toLowerCase();
    
    if (validPasswords.includes(cleanPin)) {
      setHasError(false);
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem('msprinters_operator_auth', 'true');
        }
      } catch {
        // ignore
      }
      onUnlock();
    } else {
      setHasError(true);
      setErrorMessage('गलत ऑपरेटर पासवर्ड! कृपया सही पिन (उदा. 1260) दर्ज करें।');
      setPin('');
    }
  };

  const handleKeypadPress = (val: string) => {
    setHasError(false);
    if (val === 'CLEAR') {
      setPin('');
    } else if (val === 'ENTER') {
      handleSubmit();
    } else {
      if (pin.length < 12) {
        setPin(prev => prev + val);
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Amber accent glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Lock Icon & Badge */}
        <div className="text-center space-y-3 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-amber-400 px-2.5 py-0.5 rounded-full border border-slate-700">
              OPERATOR SECURITY GATE
            </span>
            <h2 className="text-xl font-black text-white mt-2">
              ऑपरेटर सुरक्षा पासवर्ड लॉक
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              सुरक्षा कारणों से <strong className="text-amber-400">{targetPanelName}</strong> पैनल केवल अधिकृत कियोस्क ऑपरेटर के लिए पासवर्ड संरक्षित है।
            </p>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <KeyRound className="w-4 h-4 text-amber-400" />
            </div>

            <input
              type={showPassword ? 'text' : 'password'}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setHasError(false);
              }}
              placeholder="मास्टर पिन / पासवर्ड दर्ज करें (उदा. 1260)"
              autoFocus
              className={`w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border text-center font-mono font-bold tracking-widest text-lg sm:text-xl text-white placeholder:text-slate-600 placeholder:text-xs placeholder:font-sans focus:outline-none transition-all ${
                hasError
                  ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/50 animate-shake'
                  : 'border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30'
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Error Message */}
          {hasError && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Touch Keypad for Kiosk touchscreen / Mobile */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map((btn) => (
              <button
                key={btn}
                type="button"
                onClick={() => {
                  if (btn === 'C') handleKeypadPress('CLEAR');
                  else if (btn === 'OK') handleKeypadPress('ENTER');
                  else handleKeypadPress(btn);
                }}
                className={`py-2.5 rounded-xl text-sm font-bold font-mono transition-all active:scale-95 ${
                  btn === 'OK'
                    ? 'bg-amber-500 text-slate-950 font-black hover:bg-amber-400'
                    : btn === 'C'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                    : 'bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-200'
                }`}
              >
                {btn === 'OK' ? 'Unlock 🔓' : btn === 'C' ? 'Clear' : btn}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>पैनल अनलॉक करें (Unlock Panel)</span>
          </button>
        </form>

        {/* Back to Student Portal Button */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={onBackToStudent}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-amber-400 flex items-center justify-center gap-2 transition-all"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>📱 छात्र मोबाइल पोर्टल पर वापस जाएं (Student Portal is Open)</span>
          </button>
          <p className="text-[10px] text-slate-500 mt-2">
            छात्रों के लिए मोबाइल से प्रिंट करना 100% खुला है और किसी पासवर्ड की आवश्यकता नहीं है।
          </p>
        </div>
      </div>
    </div>
  );
};
