import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  KeyRound, 
  ShieldCheck, 
  ExternalLink, 
  Check, 
  Copy, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  HelpCircle,
  Globe,
  Lock,
  Zap,
  Info
} from 'lucide-react';
import { BRAND_CONFIG } from '../../config/branding';

interface RazorpaySetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RazorpaySetupGuideModal: React.FC<RazorpaySetupGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(label);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const steps = [
    {
      step: 1,
      title: 'Razorpay Dashboard में लॉगिन करें और Live Mode चुनें',
      tagline: 'Login to dashboard.razorpay.com & Toggle to Live Mode',
      desc: 'अपने कंप्यूटर या फोन पर Razorpay खाते में लॉगिन करें और ऊपर दाईं ओर "Live Mode" बटन ऑन करें।'
    },
    {
      step: 2,
      title: 'Settings में जाकर "API Keys" खोलें',
      tagline: 'Navigate to Account & Settings → API Keys',
      desc: 'बाएं मेनू (Left Sidebar) में सबसे नीचे "Account & Settings" पर क्लिक करें और "API Keys" विकल्प चुनें।'
    },
    {
      step: 3,
      title: 'Generate Live Key पर क्लिक करें और Key ID कॉपी करें',
      tagline: 'Click "+ Generate Live Key" to obtain Key ID & Secret',
      desc: 'नया की (Key) बनाएं। आपको rzp_live_... से शुरू होने वाली Key ID और Key Secret मिलेगा।'
    },
    {
      step: 4,
      title: 'MS PRINTERS ऐप में Key ID सेव करें',
      tagline: 'Save Key ID in MS PRINTERS .env and Admin Configuration',
      desc: 'अपनी Key ID को MS PRINTERS की .env फाइल या Admin Settings में पेस्ट करके सेव करें।'
    },
    {
      step: 5,
      title: 'Webhook सेट करें (पेमेंट होते ही तुरंत ऑटोमैटिक प्रिंट के लिए)',
      tagline: 'Add Webhook URL with payment.captured event',
      desc: 'Webhook URL डालें ताकि छात्र द्वारा UPI से पेमेंट करते ही प्रिंटर बिना 1 सेकंड रुके तुरंत प्रिंट निकाल दे।'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white leading-none">
                  Razorpay पेमेंट गेटवे कनेक्ट करने की पूरी गाइड (स्क्रीनशॉट सहित)
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Step-by-Step Guide
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                How to Connect Razorpay API Keys & Webhooks to MS PRINTERS Kiosk
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between overflow-x-auto gap-2">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeStep === s.step
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                activeStep === s.step ? 'bg-white text-blue-900' : 'bg-slate-800 text-slate-300'
              }`}>
                {s.step}
              </span>
              <span className="hidden sm:inline">स्टेप {s.step}</span>
            </button>
          ))}
        </div>

        {/* Step Body Container */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 max-h-[68vh]">
          {/* Step Heading */}
          <div className="space-y-1">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">
              स्टेप {activeStep} ऑफ़ 5
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white">
              {steps[activeStep - 1].title}
            </h2>
            <p className="text-xs text-slate-300">
              {steps[activeStep - 1].desc}
            </p>
          </div>

          {/* ================= STEP 1 SCREENSHOT ================= */}
          {activeStep === 1 && (
            <div className="space-y-4">
              {/* Simulated Razorpay Dashboard UI Screenshot */}
              <div className="bg-slate-950 rounded-2xl border-2 border-slate-700 p-4 shadow-2xl relative overflow-hidden font-sans">
                {/* Simulated Browser Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="ml-2 font-mono text-slate-300 bg-slate-900 px-3 py-0.5 rounded-md border border-slate-800">
                      https://dashboard.razorpay.com/app/dashboard
                    </span>
                  </div>
                  <span className="font-bold text-blue-400">Razorpay Merchant Portal</span>
                </div>

                {/* Simulated Header */}
                <div className="bg-[#0b1426] p-3 rounded-xl border border-blue-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-black text-white text-xs">
                      R
                    </div>
                    <div>
                      <span className="font-bold text-xs text-white">MS PRINTERS</span>
                      <span className="text-[10px] text-slate-400 block font-mono">MID: MERCH_2026_IN</span>
                    </div>
                  </div>

                  {/* Highlighting Target: LIVE MODE TOGGLE */}
                  <div className="flex items-center gap-2 bg-emerald-950/80 border-2 border-emerald-400 px-3 py-1 rounded-full shadow-lg shadow-emerald-500/20 animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs font-bold text-emerald-300 uppercase">
                      ● LIVE MODE (चालू करें)
                    </span>
                  </div>
                </div>

                {/* Body Simulation */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Today's Revenue</span>
                    <span className="font-mono font-bold text-white text-sm">₹ 2,450.00</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Print Transactions</span>
                    <span className="font-mono font-bold text-white text-sm">48 Jobs</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Settlement Account</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">Verified ✓</span>
                  </div>
                </div>

                {/* Annotation Note */}
                <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>महत्वपूर्ण:</strong> यदि आप असली पैसे (Real UPI/Rupees) स्वीकार करना चाहते हैं, तो "Live Mode" चुनें। यदि टेस्टिंग करना चाहते हैं, तो "Test Mode" में रख सकते हैं।
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <a 
                  href="https://dashboard.razorpay.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md"
                >
                  <span>dashboard.razorpay.com खोलें</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setActiveStep(2)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <span>अगला स्टेप (Step 2)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2 SCREENSHOT ================= */}
          {activeStep === 2 && (
            <div className="space-y-4">
              {/* Simulated Left Sidebar & Settings Navigation */}
              <div className="bg-slate-950 rounded-2xl border-2 border-slate-700 p-4 shadow-2xl relative font-sans">
                <div className="text-[11px] text-slate-400 border-b border-slate-800 pb-2 mb-3">
                  Razorpay Sidebar Navigation ➔ Account & Settings
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Left Sidebar Simulation */}
                  <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Main Menu</div>
                    <div className="p-2 text-slate-400 rounded hover:bg-slate-800">📊 Overview</div>
                    <div className="p-2 text-slate-400 rounded hover:bg-slate-800">💳 Transactions</div>
                    <div className="p-2 text-slate-400 rounded hover:bg-slate-800">📄 Invoices & Orders</div>
                    <div className="p-2 text-slate-400 rounded hover:bg-slate-800">🔗 Payment Links</div>
                    
                    {/* Highlighted Account & Settings */}
                    <div className="p-2 bg-blue-600/30 border-2 border-blue-400 text-white font-bold rounded-lg flex items-center justify-between shadow">
                      <span>⚙️ Account & Settings</span>
                      <ChevronRight className="w-3.5 h-3.5 text-blue-300" />
                    </div>
                  </div>

                  {/* Settings Sub-Panel Simulation */}
                  <div className="md:col-span-2 bg-[#0f172a] p-4 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1.5">
                      Developer Settings
                    </h4>

                    {/* Highlighted API Keys Option */}
                    <div className="p-3 bg-amber-500/20 border-2 border-amber-400 rounded-xl flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <KeyRound className="w-5 h-5 text-amber-400" />
                        <div>
                          <span className="font-black text-white text-xs block">
                            🔑 API Keys (क्लिक करें)
                          </span>
                          <span className="text-[10px] text-slate-300">
                            Generate Key ID and Secret for website & kiosk integration
                          </span>
                        </div>
                      </div>
                      <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded">
                        यहाँ क्लिक करें
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span>Webhooks</span>
                      <span className="text-[10px] font-mono text-slate-500">Instant Event Hooks</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStep(1)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>पिछला स्टेप</span>
                </button>

                <button
                  onClick={() => setActiveStep(3)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <span>अगला स्टेप (Step 3)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3 SCREENSHOT ================= */}
          {activeStep === 3 && (
            <div className="space-y-4">
              {/* Simulated Key Generation Modal */}
              <div className="bg-slate-950 rounded-2xl border-2 border-slate-700 p-4 shadow-2xl relative font-sans">
                <div className="text-[11px] text-slate-400 border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
                  <span>API Keys Generation Screen</span>
                  <span className="text-emerald-400 font-bold">Key Created Successfully</span>
                </div>

                <div className="bg-[#0b1426] p-4 rounded-xl border border-blue-900/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">Active API Key Credentials</h4>
                      <p className="text-[10px] text-slate-400">Keep your Key Secret confidential</p>
                    </div>

                    <button className="bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow">
                      <span>+ Generate Key</span>
                    </button>
                  </div>

                  {/* KEY ID FIELD */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                      Key ID (यह पब्लिक की है — इसे कॉपी करें)
                    </span>
                    <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-700 font-mono text-xs text-emerald-400">
                      <span>rzp_live_ABC123xyz7890</span>
                      <button 
                        onClick={() => handleCopy('rzp_live_ABC123xyz7890', 'key_id')}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-2 py-0.5 rounded text-[10px] font-sans flex items-center gap-1"
                      >
                        {copiedKey === 'key_id' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>

                  {/* KEY SECRET FIELD */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">
                      Key Secret (सीक्रेट की — इसे सुरक्षित नोट करें)
                    </span>
                    <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-700 font-mono text-xs text-slate-300">
                      <span>••••••••••••••••••••••••••••</span>
                      <button 
                        onClick={() => handleCopy('your_secret_key_here', 'secret')}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-2 py-0.5 rounded text-[10px] font-sans flex items-center gap-1"
                      >
                        {copiedKey === 'secret' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    इस <strong>Key ID</strong> को कॉपी कर लें। अगले स्टेप में हम इसे MS PRINTERS में पेस्ट करेंगे।
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStep(2)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>पिछला स्टेप</span>
                </button>

                <button
                  onClick={() => setActiveStep(4)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <span>अगला स्टेप (Step 4)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4 SCREENSHOT ================= */}
          {activeStep === 4 && (
            <div className="space-y-4">
              {/* Simulated MS PRINTERS Config */}
              <div className="bg-slate-950 rounded-2xl border-2 border-slate-700 p-4 shadow-2xl relative font-sans">
                <div className="text-[11px] text-slate-400 border-b border-slate-800 pb-2 mb-3">
                  MS PRINTERS Environment Configuration (.env / Hostinger / Admin)
                </div>

                <div className="bg-[#0b1426] p-4 rounded-xl border border-blue-900/50 space-y-3">
                  <h4 className="font-bold text-white text-xs">
                    .env / Vercel / Hostinger Environment Variables
                  </h4>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5">
                    <div className="text-slate-400"># Razorpay Live Integration Key for MS PRINTERS</div>
                    <div className="text-amber-300">
                      VITE_RAZORPAY_KEY_ID=<span className="text-emerald-400">rzp_live_YOUR_ACTUAL_KEY_ID</span>
                    </div>
                    <div className="text-slate-500">
                      RAZORPAY_KEY_SECRET=your_razorpay_secret_here
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-300">Copy Template Configuration:</span>
                    <button
                      onClick={() => handleCopy("VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY\nRAZORPAY_KEY_SECRET=YOUR_SECRET", 'env')}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition-all"
                    >
                      {copiedKey === 'env' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'env' ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-3 p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-[11px] text-blue-300">
                  💡 <strong>सुझाव:</strong> जैसे ही आप यह Key ID डालेंगे, स्टूडेंट पोर्टल पर Razorpay का असली पेमेंट पेज (Google Pay, PhonePe, Paytm, QR कोड) एक्टिवेट हो जाएगा।
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStep(3)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>पिछला स्टेप</span>
                </button>

                <button
                  onClick={() => setActiveStep(5)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <span>अगला स्टेप (Step 5)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 5 SCREENSHOT ================= */}
          {activeStep === 5 && (
            <div className="space-y-4">
              {/* Simulated Webhook Setup */}
              <div className="bg-slate-950 rounded-2xl border-2 border-slate-700 p-4 shadow-2xl relative font-sans">
                <div className="text-[11px] text-slate-400 border-b border-slate-800 pb-2 mb-3">
                  Razorpay Webhooks Configuration (For Instant Auto-Printing)
                </div>

                <div className="bg-[#0b1426] p-4 rounded-xl border border-blue-900/50 space-y-3">
                  <div>
                    <h4 className="font-bold text-white text-xs">Webhook Setup in Razorpay Dashboard</h4>
                    <p className="text-[10px] text-slate-400">Settings → Webhooks → Add New Webhook</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <label className="text-slate-400 text-[11px] font-bold block">Webhook Endpoint URL:</label>
                    <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-700 font-mono text-xs text-amber-300">
                      <span>https://msprinter.in/api/razorpay-webhook</span>
                      <button 
                        onClick={() => handleCopy("https://msprinter.in/api/razorpay-webhook", 'webhook')}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-2 py-0.5 rounded text-[10px] font-sans flex items-center gap-1"
                      >
                        {copiedKey === 'webhook' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Events Selection */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[11px] font-bold block">Select Active Events:</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-emerald-950/60 border border-emerald-500/60 rounded-lg flex items-center gap-2 text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-mono">payment.captured</span>
                      </div>
                      <div className="p-2 bg-emerald-950/60 border border-emerald-500/60 rounded-lg flex items-center gap-2 text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-mono">order.paid</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>बधाई हो! अब आपका Razorpay पूरी तरह कनेक्ट हो चुका है!</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    जैसे ही कोई छात्र अपने फोन पर UPI (GPay/PhonePe/Paytm) से भुगतान करेगा, Razorpay तुरंत सिग्नल भेजेगा और आपका कंप्यूटर से कनेक्टेड प्रिंटर <strong>बिना 1 सेकंड रुके तुरंत प्रिंट निकाल देगा</strong>!
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStep(4)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>पिछला स्टेप</span>
                </button>

                <button
                  onClick={onClose}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-6 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>समझ आ गया (बंद करें)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Encrypted & PCI-DSS Compliant Gateway Integration</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
            <span>Domain: {BRAND_CONFIG.domain}</span>
            <span>•</span>
            <span className="text-amber-400">Razorpay Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
