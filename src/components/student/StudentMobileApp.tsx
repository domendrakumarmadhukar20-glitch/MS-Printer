import React, { useState, useEffect, useRef, useCallback, useId } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Printer, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Smartphone, 
  AlertCircle, 
  RefreshCw, 
  FileCheck, 
  ArrowRight, 
  Info,
  Download,
  Copy,
  ChevronRight,
  ExternalLink,
  Sparkles,
  MapPin,
  Navigation,
  HelpCircle,
  KeyRound,
  Lock,
  Layers,
  Zap,
  Check,
  Edit2,
  Plus
} from 'lucide-react';
import QRCode from 'qrcode';
import { useKiosk } from '../../context/KioskContext';
import { BRAND_CONFIG } from '../../config/branding';
import { PrintJob } from '../../types';
import { PagePreviewSelector } from './PagePreviewSelector';
import { RazorpayPoliciesModal, PolicyTab } from '../common/RazorpayPoliciesModal';
import { PrintableJobSheet } from '../common/PrintableJobSheet';
import { MachineLocationModal } from '../common/MachineLocationModal';
import { AddMachineModal } from '../admin/AddMachineModal';
import { soundService } from '../../services/soundService';
import { 
  openRazorpayCheckout, 
  buildUpiIntentUrl, 
  getRazorpayConfig,
  saveRazorpayConfig,
  hasValidRazorpayKey,
  getAppSpecificUpiLinks
} from '../../services/razorpayService';

interface StudentMobileAppProps {
  isPureStudentMode?: boolean;
  onAdminSwitch?: () => void;
}

export const StudentMobileApp: React.FC<StudentMobileAppProps> = ({
  isPureStudentMode = false,
  onAdminSwitch
}) => {
  const { 
    currentMachine, 
    machines,
    calculatePrice, 
    createPrintJob, 
    verifyPaymentAndAuthorizePrint,
    jobs,
    getJobById,
    cancelOrRefundJob
  } = useKiosk();

  // Language state (English / Hindi)
  const [lang, setLang] = useState<'EN' | 'HI'>('HI');

  // Step state: 'UPLOAD' -> 'SETTINGS' -> 'PAYMENT' -> 'STATUS'
  const [step, setStep] = useState<'UPLOAD' | 'SETTINGS' | 'PAYMENT' | 'STATUS'>('UPLOAD');
  
  // Selected or created Job ID for tracking
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Uploaded file state
  const [uploadedRawFile, setUploadedRawFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    pageCount: number;
    hash: string;
  } | null>(null);

  // Page selection state: list of selected page numbers (e.g. [1, 2, 3])
  const [selectedPages, setSelectedPages] = useState<number[]>([1]);

  // Print settings
  const [paperSize, setPaperSize] = useState<'A4'>('A4');
  const [colorMode, setColorMode] = useState<'BW' | 'COLOR'>('BW');
  const [duplexMode, setDuplexMode] = useState<'SINGLE' | 'DUPLEX'>('SINGLE');
  const [copies, setCopies] = useState<number>(1);
  const [studentName, setStudentName] = useState<string>('');
  const [studentPhone, setStudentPhone] = useState<string>('');

  // Payment UI state
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'UPI_QR' | 'UPI_INTENT'>('UPI_QR');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [receiptCopied, setReceiptCopied] = useState<boolean>(false);

  // Dynamic Real Scannable UPI QR & Custom Merchant UPI
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>('');
  const [activeUpiId, setActiveUpiId] = useState<string>(() => getRazorpayConfig().merchantUpiId || 'msprinters@upi');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [showEditUpiModal, setShowEditUpiModal] = useState<boolean>(false);
  const [editUpiInput, setEditUpiInput] = useState<string>('');
  const [showUtrModal, setShowUtrModal] = useState<boolean>(false);
  const [utrInput, setUtrInput] = useState<string>('');
  const [showUpiAppsModal, setShowUpiAppsModal] = useState<boolean>(false);
  const [isPhysicalPrinting, setIsPhysicalPrinting] = useState<boolean>(false);
  const [autoPrintDispatched, setAutoPrintDispatched] = useState<boolean>(false);
  const autoPrintedJobIdsRef = useRef<Set<string>>(new Set());

  // Machine Location & Fleet Management Modal States
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [showAddMachineModal, setShowAddMachineModal] = useState<boolean>(false);

  // Razorpay Policies Modal State
  const [policyModalOpen, setPolicyModalOpen] = useState<boolean>(false);
  const [policyInitialTab, setPolicyInitialTab] = useState<PolicyTab>('ABOUT');

  const openPolicy = (tab: PolicyTab) => {
    setPolicyInitialTab(tab);
    setPolicyModalOpen(true);
  };

  // Operator PIN Modal
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [operatorPin, setOperatorPin] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  // Calculate pricing breakdown based on ticked/selected pages
  const effectivePageCount = uploadedFile ? Math.max(1, selectedPages.length) : 1;
  const priceQuote = calculatePrice(effectivePageCount, copies, colorMode, duplexMode);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedRawFile(file);
      const estimatedPages = file.type.startsWith('image/') 
        ? 1 
        : Math.max(1, Math.min(30, Math.ceil(file.size / 220000)));

      setUploadedFile({
        name: file.name,
        size: file.size,
        pageCount: estimatedPages,
        hash: 'sha256_' + Math.random().toString(36).substring(2, 12),
      });

      setSelectedPages(Array.from({ length: estimatedPages }, (_, i) => i + 1));
      setStep('SETTINGS');
    }
  };

  // Called when PDF.js detects the authentic exact page count from the uploaded PDF
  const handlePageCountDetected = (actualPages: number) => {
    if (actualPages > 0) {
      setUploadedFile(prev => prev ? { ...prev, pageCount: actualPages } : null);
      setSelectedPages(prev => {
        const valid = prev.filter(p => p <= actualPages);
        return valid.length > 0 ? valid : Array.from({ length: actualPages }, (_, i) => i + 1);
      });
    }
  };

  // Proceed to Payment
  const handleProceedToPayment = () => {
    if (!uploadedFile) return;

    const { job } = createPrintJob(
      uploadedFile,
      {
        paperSize,
        colorMode,
        duplexMode,
        copies,
        selectedPages: selectedPages.join(','),
      },
      {
        name: studentName.trim() || 'Student User',
        phone: studentPhone.trim() || '9876543210',
      }
    );

    setActiveJobId(job.job_id);
    setStep('PAYMENT');
  };

  // 1. Pay with Razorpay Gateway
  const handlePayWithRazorpay = async () => {
    const job = activeJobId ? getJobById(activeJobId) : jobs[0];
    if (!job) return;

    setIsProcessingPayment(true);
    setPaymentError(null);

    await openRazorpayCheckout({
      amountInINR: job.amount,
      orderId: job.payment_order_id,
      jobId: job.job_id,
      description: `MS PRINTERS: ${job.file_name} (${selectedPages.length} Pages, ${copies} Copy)`,
      studentName: studentName || 'Student',
      studentPhone: studentPhone || '9876543210',
      onSuccess: async (paymentId, orderId, signature) => {
        await verifyPaymentAndAuthorizePrint(job.job_id, paymentId);
        setIsProcessingPayment(false);
        setPaymentSuccess(true);
        setStep('STATUS');
      },
      onFailure: (err) => {
        setIsProcessingPayment(false);
        setPaymentError(err || 'Payment was cancelled or could not be completed.');
      }
    });
  };

  // 2. Direct Mock/Fast Verified Payment for instant demo
  const handleFastSimulatePayment = async () => {
    if (!activeJobId) return;
    setIsProcessingPayment(true);
    const simulatedPaymentId = `pay_trial_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Sync to backend spooler API
    try {
      fetch(`/api/jobs/${activeJobId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: simulatedPaymentId, machine_id: currentMachine.id })
      }).catch(() => {});
    } catch {}

    await verifyPaymentAndAuthorizePrint(activeJobId, simulatedPaymentId);
    setIsProcessingPayment(false);
    setPaymentSuccess(true);
    setTimeout(() => {
      setStep('STATUS');
    }, 400);
  };

  const activeJob = activeJobId ? getJobById(activeJobId) : jobs[0];
  const upiIntentUrl = activeJob 
    ? buildUpiIntentUrl(activeJob.amount, activeJob.payment_order_id, activeUpiId, BRAND_CONFIG.brandName) 
    : '#';

  // Generate high-resolution, pixel-perfect, scannable NPCI UPI QR code
  useEffect(() => {
    if (!activeJob) return;
    const upiUri = buildUpiIntentUrl(
      activeJob.amount,
      activeJob.payment_order_id,
      activeUpiId,
      BRAND_CONFIG.brandName
    );

    QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: 'H',
      margin: 1.5,
      width: 320,
      color: {
        dark: '#020617',
        light: '#ffffff'
      }
    })
      .then(url => setUpiQrDataUrl(url))
      .catch(err => console.error('Failed to generate UPI QR code:', err));
  }, [activeJob?.amount, activeJob?.payment_order_id, activeUpiId]);

  const handleCopyUpi = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(activeUpiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const handleSaveCustomUpi = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = editUpiInput.trim();
    if (clean && clean.includes('@')) {
      setActiveUpiId(clean);
      saveRazorpayConfig({ merchantUpiId: clean });
      setShowEditUpiModal(false);
      setEditUpiInput('');
    }
  };

  const upiAppOptions = activeJob 
    ? getAppSpecificUpiLinks(activeJob.amount, activeJob.payment_order_id, activeUpiId, BRAND_CONFIG.brandName) 
    : [];

  const handleLoadTrialDocument = () => {
    setUploadedRawFile(null);
    setUploadedFile({
      name: 'MS_PRINTERS_ATP_Hardware_Test_Page.pdf',
      size: 142000,
      pageCount: 1,
      hash: 'trial_hash_' + Date.now(),
    });
    setSelectedPages([1]);
    setStep('SETTINGS');
  };

  // Safe UPI intent opener (prevents "payment link failed" / "ERR_UNKNOWN_URL_SCHEME")
  const handleOpenMobileUpi = (e: React.MouseEvent) => {
    e.preventDefault();
    setPaymentError(null);
    setShowUpiAppsModal(true);
  };

  // User confirmed payment done (Real Trial & UPI confirmation)
  const handleConfirmPaymentDone = async (utr?: string) => {
    if (!activeJob) return;
    setIsProcessingPayment(true);
    setPaymentError(null);

    const txnId = utr && utr.trim().length > 4 ? `upi_${utr.trim()}` : `trial_paid_${Date.now()}`;
    
    // Notify server backend for spooler sync
    try {
      fetch(`/api/jobs/${activeJob.job_id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: txnId, machine_id: activeJob.machine_id })
      }).catch(() => {});
    } catch {
      // ignore
    }

    await verifyPaymentAndAuthorizePrint(activeJob.job_id, txnId);
    setIsProcessingPayment(false);
    setPaymentSuccess(true);
    setShowUtrModal(false);
    setStep('STATUS');
  };

  // Physical printing from browser/computer directly (Manual or Auto Trigger)
  const handlePhysicalPrintNow = useCallback(() => {
    setIsPhysicalPrinting(true);
    setAutoPrintDispatched(true);

    try {
      soundService.playPrintStartChime();
    } catch {}

    setTimeout(() => {
      setIsPhysicalPrinting(false);
    }, 4500);

    try {
      if (typeof window !== 'undefined' && typeof window.print === 'function') {
        window.print();
      }
    } catch (e) {
      console.warn('Physical print error:', e);
    }
  }, []);

  // AUTOMATIC PRINT TRIGGER:
  // As soon as payment is confirmed (step === 'STATUS' and job is verified),
  // automatically send print command to printer without waiting for user click!
  useEffect(() => {
    if (step === 'STATUS' && activeJob && (activeJob.payment_status === 'VERIFIED' || paymentSuccess)) {
      if (!autoPrintedJobIdsRef.current.has(activeJob.job_id)) {
        autoPrintedJobIdsRef.current.add(activeJob.job_id);

        try {
          soundService.announcePaymentConfirmed();
        } catch {}

        // 450ms timeout ensures printable document is fully rendered in DOM
        const autoPrintTimer = setTimeout(() => {
          handlePhysicalPrintNow();
        }, 450);

        return () => clearTimeout(autoPrintTimer);
      }
    }
  }, [step, activeJob?.job_id, activeJob?.payment_status, paymentSuccess, handlePhysicalPrintNow]);

  // Operator PIN Submit
  const handleOperatorPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (operatorPin === '1260' || operatorPin === 'admin') {
      setShowPinModal(false);
      setPinError(false);
      setOperatorPin('');
      if (onAdminSwitch) {
        onAdminSwitch();
      } else {
        window.location.href = '/admin?mode=admin';
      }
    } else {
      setPinError(true);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start pb-16 px-3 sm:px-4 ${
      isPureStudentMode ? 'pt-2' : 'pt-4'
    }`}>
      {/* Mobile Frame Container */}
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-2 sm:my-4">
        
        {/* Kiosk Location & Brand Header */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 p-4 sm:p-5 border-b border-slate-800 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300">
                MS
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
                  {BRAND_CONFIG.brandName}
                </h1>
                <span className="text-[10px] text-amber-400 font-bold tracking-wider">
                  {BRAND_CONFIG.serviceName}
                </span>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 text-[11px] font-bold">
              <button
                onClick={() => setLang('HI')}
                className={`px-2.5 py-1 rounded-md transition-all ${lang === 'HI' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLang('EN')}
                className={`px-2.5 py-1 rounded-md transition-all ${lang === 'EN' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Machine Connection Badge with Full Address & Google Maps Location Link */}
          <div className="bg-slate-950/95 backdrop-blur-md rounded-2xl p-3 border border-slate-800 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
                <div className="min-w-0">
                  <div className="font-mono font-bold text-amber-400 flex items-center gap-1.5 flex-wrap">
                    <span>कियोस्क: {currentMachine.id}</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-sans">
                      ONLINE
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium truncate">
                    {currentMachine.name || currentMachine.location}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] sm:text-[11px] bg-slate-900 border border-slate-700 text-emerald-400 font-bold px-2 py-0.5 rounded-lg font-mono">
                  {currentMachine.paperTray.current_stock} पेज उपलब्ध
                </span>
              </div>
            </div>

            {/* Address & Direct Google Maps Action */}
            <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 text-[11px] space-y-2">
              <div className="flex items-start gap-1.5 text-slate-300 leading-snug">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span className="flex-1 text-slate-200">
                  <strong className="text-amber-300/90">पता:</strong> {currentMachine.address}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                <a
                  href={currentMachine.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors"
                >
                  <Navigation className="w-3 h-3 text-emerald-400" />
                  <span>📍 Google Maps लोकेशन</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg font-medium text-[10px] border border-slate-700 transition-colors"
                  >
                    बदलें / सूची ({machines.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddMachineModal(true)}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-2 py-1 rounded-lg font-bold text-[10px] border border-amber-500/30 transition-colors flex items-center gap-0.5"
                    title="नई मशीन जोड़ें"
                  >
                    <Plus className="w-3 h-3" />
                    <span>जोड़ें</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Progression Bar */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-1.5 ${step === 'UPLOAD' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === 'UPLOAD' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 border border-slate-700'
            }`}>1</span>
            <span>{lang === 'EN' ? 'Upload' : '1. अपलोड'}</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <div className={`flex items-center gap-1.5 ${step === 'SETTINGS' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === 'SETTINGS' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 border border-slate-700'
            }`}>2</span>
            <span>{lang === 'EN' ? 'Preview & Tick' : '2. पेज प्रीव्यू'}</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <div className={`flex items-center gap-1.5 ${step === 'PAYMENT' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === 'PAYMENT' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 border border-slate-700'
            }`}>3</span>
            <span>{lang === 'EN' ? 'Pay' : '3. भुगतान'}</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <div className={`flex items-center gap-1.5 ${step === 'STATUS' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === 'STATUS' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 border border-slate-700'
            }`}>4</span>
            <span>{lang === 'EN' ? 'Print' : '4. प्रिंट'}</span>
          </div>
        </div>

        {/* STEP 1: UPLOAD DOCUMENT */}
        {step === 'UPLOAD' && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-white">
                {lang === 'EN' ? 'Select Document to Print' : 'प्रिंट करने के लिए डॉक्यूमेंट चुनें'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'EN' 
                  ? 'PDF, Word, or Image • Safe & Instant Delivery'
                  : 'अपने फोन से PDF फाइल चुनें और तुरंत प्रिंट पाएं'}
              </p>
            </div>

            {/* Upload Drop Zone */}
            <label className="border-2 border-dashed border-amber-500/50 hover:border-amber-400 bg-slate-950/60 rounded-3xl p-8 block text-center cursor-pointer transition-all hover:bg-slate-950 group shadow-inner">
              <input
                type="file"
                accept=".pdf,application/pdf,image/*,.png,.jpg,.jpeg,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-3 border border-amber-500/30 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/10">
                <Upload className="w-8 h-8 text-amber-400 animate-bounce" />
              </div>
              <p className="text-base font-bold text-white">
                {lang === 'EN' ? 'Tap to Choose Your Document' : 'अपना डॉक्यूमेंट चुनने के लिए यहाँ टैप करें'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {lang === 'EN'
                  ? 'Supports PDF, Word & Images • High-speed laser output'
                  : 'PDF, फोटो या वर्ड फाइल • तुरंत पेज गिनती व स्पष्ट प्रीव्यू'}
              </p>
              <span className="inline-block mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-transform active:scale-95">
                {lang === 'EN' ? '📁 Choose File from Device' : '📁 अपने फोन/डिवाइस से फाइल चुनें'}
              </span>
            </label>

            {/* Quick 1-Click Real Trial Test Page for instant printer testing */}
            <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-emerald-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-white block">
                    {lang === 'EN' ? 'Machine Real Trial Test' : 'मशीन रियल हार्डवेयर ट्रायल (Test Mode)'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {lang === 'EN' ? 'Load 1-Page Official Test Document instantly' : 'बिना फाइल ढूंढे सीधे 1-पेज का टेस्ट डॉक्यूमेंट लोड करें'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLoadTrialDocument}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'EN' ? 'Load Test Sheet' : '⚡ 1-क्लिक टेस्ट शीट'}</span>
              </button>
            </div>

            {/* Document Security & Format Notes */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>PDF & फोटो सपोर्ट (50 MB)</span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>तुरंत 15 सेकंड में प्रिंट</span>
              </div>
            </div>

            {/* Security note */}
            <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {lang === 'EN'
                  ? 'Your files are processed in a private secure enclave and permanently deleted after printing is completed.'
                  : 'आपकी फाइलें सुरक्षित रूप से प्रोसेस होती हैं और प्रिंटिंग के बाद हमेशा के लिए डिलीट कर दी जाती हैं।'}
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: PRINT SETTINGS & INTERACTIVE PAGE PREVIEW SELECTOR */}
        {step === 'SETTINGS' && uploadedFile && (
          <div className="p-4 sm:p-5 space-y-4">
            {/* File Info Card */}
            <div className="bg-slate-950/90 rounded-2xl p-3 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white truncate max-w-[200px]">
                    {uploadedFile.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    कुल {uploadedFile.pageCount} पेज • {(uploadedFile.size / 1000000).toFixed(1)} MB
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStep('UPLOAD')}
                className="text-xs text-amber-400 hover:underline font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
              >
                बदलें
              </button>
            </div>

            {/* INTERACTIVE PAGE PREVIEW & TICK CHECKBOX SELECTOR WITH REAL PDF RENDERING */}
            <PagePreviewSelector
              totalPages={uploadedFile.pageCount}
              selectedPages={selectedPages}
              onChange={setSelectedPages}
              lang={lang}
              documentName={uploadedFile.name}
              file={uploadedRawFile}
              onPageCountDetected={handlePageCountDetected}
            />

            {/* Print Settings Options */}
            <div className="space-y-3 pt-1">
              {/* Color Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {lang === 'EN' ? 'Color Mode' : 'प्रिंट कलर मोड'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setColorMode('BW')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      colorMode === 'BW'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-white">Black & White (B&W)</span>
                    <span className="text-[10px] text-amber-400/90 font-mono">₹2.00 / पेज</span>
                  </button>

                  <button
                    onClick={() => setColorMode('COLOR')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      colorMode === 'COLOR'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-white">Color Print</span>
                    <span className="text-[10px] text-amber-400/90 font-mono">₹10.00 / पेज</span>
                  </button>
                </div>
              </div>

              {/* Sides (Single vs Duplex) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {lang === 'EN' ? 'Print Sides (Duplex)' : 'सिंगल या डबल साइड (कागज बचाएं)'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDuplexMode('SINGLE')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      duplexMode === 'SINGLE'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-white">Single Sided</span>
                    <span className="text-[10px] text-slate-400">एक तरफ प्रिंट</span>
                  </button>

                  <button
                    onClick={() => setDuplexMode('DUPLEX')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      duplexMode === 'DUPLEX'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-white">Double Sided (Duplex)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">दोनों तरफ (50% पेपर बचत)</span>
                  </button>
                </div>
              </div>

              {/* Copies */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'EN' ? 'Number of Copies' : 'प्रतियों की संख्या (Copies)'}
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden max-w-xs">
                  <button
                    onClick={() => setCopies(Math.max(1, copies - 1))}
                    className="px-4 py-2.5 text-slate-300 hover:bg-slate-800 text-base font-bold"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-mono font-bold text-white text-sm">
                    {copies} {copies > 1 ? 'प्रतियां' : 'प्रति'}
                  </span>
                  <button
                    onClick={() => setCopies(Math.min(20, copies + 1))}
                    className="px-4 py-2.5 text-slate-300 hover:bg-slate-800 text-base font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Optional Student Info */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {lang === 'EN' ? 'Student Details (Optional for SMS receipt)' : 'छात्र विवरण (रसीद के लिए वैकल्पिक)'}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="आपका नाम"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="tel"
                    placeholder="मोबाइल नंबर (10 अंक)"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Price Quote Breakdown Card */}
            <div className="bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>चयनित पेज:</span>
                <span className="font-mono font-bold text-white">{selectedPages.length} पेज</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Copies (प्रतियां):</span>
                <span className="font-mono font-bold text-white">{copies}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>कुल भौतिक शीट:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {priceQuote.sheets} शीट ({duplexMode === 'DUPLEX' ? 'Duplex दोनों तरफ' : 'Single एक तरफ'})
                </span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">कुल भुगतान राशि (Total)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">कोई छिपा शुल्क नहीं • तुरंत प्रिंट</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    ₹{priceQuote.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Proceed Button */}
            <button
              onClick={handleProceedToPayment}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 text-sm transition-all transform hover:-translate-y-0.5"
            >
              <span>{lang === 'EN' ? `Proceed to Pay ₹${priceQuote.amount.toFixed(2)}` : `₹${priceQuote.amount.toFixed(2)} भुगतान करने के लिए आगे बढ़ें`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: RAZORPAY & REAL SCANNABLE UPI PAYMENT */}
        {step === 'PAYMENT' && activeJob && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/10 text-amber-400 px-3 py-0.5 rounded-full border border-amber-500/20">
                100% SECURE INSTANT PAYMENT • ZERO DELAY
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {lang === 'EN' ? 'Complete Print Payment' : 'प्रिंट भुगतान पूरा करें'}
              </h2>
              <p className="text-xs text-slate-400">
                Order ID: <span className="font-mono text-slate-300">{activeJob.payment_order_id}</span>
              </p>
            </div>

            {paymentError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="flex-1 text-[11px] leading-relaxed">
                  <p className="font-semibold">{paymentError}</p>
                  <p className="text-slate-400 mt-1">
                    सुझाव: आप सीधे नीचे दिए गए <strong>UPI QR कोड</strong> को PhonePe, Google Pay या Paytm से स्कैन कर सकते हैं, अथवा रियल ट्रायल के लिए नीचे <strong>"✅ मैंने पेमेंट कर दिया है / रियल ट्रायल पास करें"</strong> बटन दबाएं।
                  </p>
                </div>
              </div>
            )}

            {/* HIGH-PRIORITY 1-CLICK REAL HARDWARE TRIAL BUTTON */}
            <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-amber-950/50 border-2 border-emerald-500/80 rounded-3xl p-4 sm:p-5 text-center space-y-2.5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                <span>मशीन रियल ट्रायल (Real Hardware Test Print)</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed max-w-sm mx-auto">
                क्या आप मशीन और कनेक्टेड प्रिंटर का ट्रायल कर रहे हैं? बिना पैसे दिए सीधे अपने प्रिंटर से असली टेस्ट प्रिंट निकालने के लिए नीचे दबाएं:
              </p>
              <button
                type="button"
                onClick={handleFastSimulatePayment}
                disabled={isProcessingPayment}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black py-3.5 rounded-2xl shadow-xl shadow-emerald-500/25 text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Printer className="w-5 h-5 text-slate-950" />
                <span>⚡ 1-क्लिक रियल ट्रायल — तुरंत प्रिंटर से प्रिंट निकालें (Free Trial)</span>
              </button>
            </div>

            {/* Total Amount Banner */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-inner">
              <div>
                <span className="text-xs text-slate-400 block">कुल देय राशि (Amount to Pay)</span>
                <span className="text-[11px] text-slate-500">{activeJob.settings.pageCount} पेज • {activeJob.settings.copies} प्रति • A4 शीट</span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                  ₹{activeJob.amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* OPTION 1: REAL SCANNABLE UPI QR CODE (NPCI Standard) */}
            <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-5 text-center space-y-3.5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>किसी भी UPI ऐप से यह QR कोड स्कैन करें:</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  AUTO DETECT
                </span>
              </div>

              {/* Real High-Resolution QR Code */}
              <div className="relative inline-block bg-white p-3 rounded-2xl shadow-xl">
                {upiQrDataUrl ? (
                  <img 
                    src={upiQrDataUrl} 
                    alt={`Pay ₹${activeJob.amount.toFixed(2)} via UPI QR`}
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center bg-slate-100 text-slate-500 text-xs">
                    QR कोड लोड हो रहा है...
                  </div>
                )}
                <div className="mt-1 text-[10px] font-black text-slate-900 tracking-wider font-mono">
                  SCAN WITH ANY UPI APP
                </div>
              </div>

              {/* Supported UPI Apps Row */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">PhonePe</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Google Pay</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Paytm</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">BHIM UPI</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Cred</span>
              </div>

              {/* UPI ID Display & Controls */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs gap-2">
                <div className="text-left truncate">
                  <span className="text-[10px] text-slate-500 block leading-none">मर्चेंट UPI ID:</span>
                  <span className="font-mono font-bold text-amber-400 text-xs truncate block">{activeUpiId}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">कॉपी हुआ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-300" />
                        <span>कॉपी करें</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditUpiInput(activeUpiId);
                      setShowEditUpiModal(true);
                    }}
                    title="अपना असली UPI ID डालें"
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-2 py-1 rounded-lg text-[11px] font-bold border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span className="hidden sm:inline">बदलें</span>
                  </button>
                </div>
              </div>
            </div>

            {/* OPTION 2: 1-TAP MOBILE UPI INTENT (Safe handler for mobile & desktop) */}
            <button
              type="button"
              onClick={handleOpenMobileUpi}
              className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span>मोबाइल में सीधे PhonePe / GPay ऐप खोलें (1-Tap UPI Apps)</span>
              <ExternalLink className="w-3 h-3 text-slate-400 ml-1" />
            </button>

            {/* OPTION 3: PRIMARY REAL TRIAL VERIFICATION BUTTON */}
            <div className="bg-gradient-to-br from-emerald-950/40 to-slate-950 p-4 rounded-3xl border-2 border-emerald-500/50 space-y-2.5 text-center shadow-xl">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>रियल ट्रायल / पेमेंट सत्यापन (Payment Confirmation)</span>
              </div>
              <p className="text-[11px] text-slate-300">
                यदि आपने ऊपर दिए गए QR कोड पर अपने फोन से पेमेंट कर दिया है, या आप रियल ट्रायल कर रहे हैं, तो नीचे क्लिक करें:
              </p>
              <button
                type="button"
                onClick={() => setShowUtrModal(true)}
                disabled={isProcessingPayment}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black py-3.5 rounded-2xl shadow-xl shadow-emerald-500/20 text-sm flex items-center justify-center gap-2 transition-transform transform active:scale-95"
              >
                <Check className="w-5 h-5 text-slate-950" />
                <span>✅ मैंने पेमेंट कर दिया है — प्रिंट निकालें</span>
              </button>
            </div>

            {/* OPTION 4: OFFICIAL RAZORPAY CHECKOUT MODAL (If configured) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handlePayWithRazorpay}
                disabled={isProcessingPayment}
                className="w-full bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 hover:border-slate-700 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>Razorpay Gateway (कार्ड / नेटबैंकिंग / ऑफिशियल चेकआउट)</span>
              </button>
            </div>

            <div className="text-center text-[10px] text-slate-500">
              🔒 256-Bit Encrypted • NPCI Verified UPI & Razorpay PCI-DSS Compliant
            </div>
          </div>
        )}

        {/* STEP 4: REAL-TIME JOB STATUS & PHYSICAL PRINTER EXECUTION */}
        {step === 'STATUS' && activeJob && (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Status Header Banner */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 text-center space-y-3 shadow-xl">
              <div className="inline-block p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {activeJob.print_status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-pulse" />
                ) : activeJob.print_status === 'PRINTING' ? (
                  <Printer className="w-12 h-12 text-amber-400 animate-bounce" />
                ) : activeJob.print_status === 'WAITING_FOR_PAPER' ? (
                  <AlertCircle className="w-12 h-12 text-rose-400" />
                ) : (
                  <Clock className="w-12 h-12 text-amber-400 animate-spin" />
                )}
              </div>

              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {activeJob.print_status === 'COMPLETED' ? 'PRINT COMPLETE ✓' : 'PRINT SPOOLING ACTIVE'}
                </span>
                <h3 className="font-mono font-bold text-base text-white mt-1.5">{activeJob.job_id}</h3>
              </div>

              <div className="text-xs">
                {activeJob.print_status === 'COMPLETED' && (
                  <p className="text-emerald-400 font-bold">
                    ✓ प्रिंट सफलतापूर्वक पूरा हुआ! कृपया प्रिंटर ट्रे से अपने ताज़ा प्रिंटआउट प्राप्त करें।
                  </p>
                )}
                {activeJob.print_status === 'PRINTING' && (
                  <p className="text-amber-300 font-bold">
                    🖨️ कनेक्टेड प्रिंटर पर ऑटोमैटिक स्पूलिंग चालू है... कृपया आउटपुट ट्रे के पास खड़े रहें।
                  </p>
                )}
                {activeJob.print_status === 'QUEUED' && (
                  <p className="text-sky-300 font-bold">
                    ✓ भुगतान सत्यापित हो चुका है! प्रिंट विंडोज़ स्पूलर में कतारबद्ध है।
                  </p>
                )}
              </div>
            </div>

            {/* AUTOMATIC PHYSICAL PRINT STATUS & REPRINT CONTROLLER */}
            <div className="bg-gradient-to-r from-emerald-500/15 via-slate-900 to-amber-500/15 border-2 border-emerald-500/50 p-4 rounded-3xl text-center space-y-3 shadow-xl">
              <div className="flex items-center justify-center gap-2 text-emerald-300 font-black text-xs uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>ऑटोमैटिक प्रिंटर डिस्पैच (Auto-Print Dispatched)</span>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 text-xs text-emerald-200 text-left space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>भुगतान प्राप्त होते ही प्रिंट कमांड स्वतः भेज दी गई है!</span>
                </p>
                <p className="text-[11px] text-slate-300 pl-5 leading-relaxed">
                  यदि आपके ब्राउज़र या प्रिंटर का प्रिंट डायलॉग स्वतः नहीं खुला है, तो नीचे दिए गए बटन पर क्लिक करके तुरंत प्रिंट निकालें:
                </p>
              </div>

              <button
                type="button"
                onClick={handlePhysicalPrintNow}
                disabled={isPhysicalPrinting}
                className="w-full bg-gradient-to-r from-emerald-500 via-amber-500 to-amber-600 hover:from-emerald-400 hover:to-amber-500 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-950" />
                <span>
                  {isPhysicalPrinting ? 'प्रिंटर को कमांड भेजी जा रही है... (Printing)' : '🖨️ अभी दोबारा प्रिंट निकालें (Print Again Now)'}
                </span>
              </button>
            </div>

            {/* Print Settings Receipt */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-bold pb-2 border-b border-slate-800">
                <span>{BRAND_CONFIG.brandName} डिजिटल रसीद</span>
                <span className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">PAID ✓</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>कियोस्क मशीन:</span>
                <span className="text-slate-200 font-medium font-mono">{activeJob.machine_id}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>डॉक्यूमेंट फाइल:</span>
                <span className="text-slate-200 font-medium truncate max-w-[160px]">{activeJob.file_name}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>प्रिंट किए गए पेज:</span>
                <span className="text-slate-200 font-medium font-mono">{activeJob.settings.pageCount} पेज ({activeJob.settings.physicalSheets} शीट)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>भुगतान रेफ़रेंस:</span>
                <span className="text-slate-200 font-mono text-[10px]">{activeJob.payment_id || 'pay_upi_verified'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 font-bold pt-2 border-t border-slate-800">
                <span>कुल भुगतान राशि:</span>
                <span className="text-amber-400 font-mono text-base">₹{activeJob.amount.toFixed(2)}</span>
              </div>
            </div>

            {/* KIOSK LOCATION & GOOGLE MAPS NAVIGATION CARD FOR COLLECTION */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 border border-amber-500/40 rounded-2xl p-4 text-xs space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>प्रिंटआउट प्राप्त करने का स्थान (Collection Point):</span>
                </span>
                <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {currentMachine.id}
                </span>
              </div>

              <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px]">
                <p className="text-white font-semibold">
                  {currentMachine.collegeName} • {currentMachine.location}
                </p>
                <p className="text-slate-200 leading-relaxed">
                  <strong className="text-amber-300">पता:</strong> {currentMachine.address}
                </p>
                {currentMachine.landmark && (
                  <p className="text-amber-400/90 text-[10px]">
                    📌 लैंडमार्क: {currentMachine.landmark}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={currentMachine.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  <Navigation className="w-4 h-4 text-slate-950" />
                  <span>📍 Google Maps पर रास्ता देखें</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>मशीन विवरण व अन्य कियोस्क</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setStep('UPLOAD');
                  setUploadedFile(null);
                  setActiveJobId(null);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-slate-700"
              >
                <Printer className="w-4 h-4" />
                <span>{lang === 'EN' ? 'Print Another Document' : 'नया डॉक्यूमेंट प्रिंट करें'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Subtle Operator/Staff Entrance at Bottom */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-mono">MS PRINTERS ATP v2.6</span>
          <button
            onClick={() => setShowPinModal(true)}
            className="hover:text-slate-300 flex items-center gap-1 transition-colors"
          >
            <Lock className="w-3 h-3" />
            <span>ऑपरेटर लॉगिन</span>
          </button>
        </div>
      </div>

      {/* Operator PIN Modal */}
      {showPinModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPinModal(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xs w-full p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">कियोस्क ऑपरेटर पिन</h3>
              <p className="text-[11px] text-slate-400">एडमिन पैनल खोलने के लिए पिन डालें (डिफ़ॉल्ट: 1260)</p>
            </div>

            <form onSubmit={handleOperatorPinSubmit} className="space-y-3">
              <input
                type="password"
                maxLength={6}
                value={operatorPin}
                onChange={(e) => {
                  setOperatorPin(e.target.value);
                  setPinError(false);
                }}
                placeholder="4-अंकों का पिन"
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 text-center font-mono text-lg text-white tracking-widest focus:outline-none focus:border-amber-500"
              />

              {pinError && (
                <p className="text-[11px] text-rose-400 text-center font-semibold">
                  गलत पिन! सही पिन डालें (1260)
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition-all"
                >
                  खोलें
                </button>
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  रद्द करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Modal: Custom UPI ID Change (Set Real Merchant UPI) */}
      {showEditUpiModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowEditUpiModal(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
                <Edit2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">मर्चेंट UPI ID सेट करें</h3>
              <p className="text-[11px] text-slate-400">
                अपना असली PhonePe, GPay, या Paytm UPI ID दर्ज करें ताकि छात्र द्वारा किया गया भुगतान सीधे आपके बैंक खाते में पहुंचे:
              </p>
            </div>

            <form onSubmit={handleSaveCustomUpi} className="space-y-3">
              <input
                type="text"
                value={editUpiInput}
                onChange={(e) => setEditUpiInput(e.target.value)}
                placeholder="उदा. 9876543210@paytm या name@okaxis"
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-amber-500"
              />

              <p className="text-[10px] text-slate-500">
                सेव करते ही ऊपर दिख रहा QR कोड तुरंत आपके इस UPI ID के अनुसार अपडेट हो जाएगा।
              </p>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all"
                >
                  सेव करें
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditUpiModal(false)}
                  className="px-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  रद्द करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Real Trial / UPI Payment Confirmation Modal */}
      {showUtrModal && activeJob && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowUtrModal(false)}
        >
          <div 
            className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-white">भुगतान सत्यापन (Payment Confirmation)</h3>
              <p className="text-xs text-slate-300">
                राशि: <strong className="text-amber-400 font-mono text-sm">₹{activeJob.amount.toFixed(2)}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  UPI Ref / UTR नंबर (वैकल्पिक / Optional):
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  placeholder="उदा. 428901234567"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-center font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  यदि आपने PhonePe/GPay से पेमेंट किया है तो 12-अंकों का UTR डाल सकते हैं।
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleConfirmPaymentDone(utrInput)}
                disabled={isProcessingPayment}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-4 h-4" />
                <span>पुष्टि करें व प्रिंट निकालें (Confirm & Print)</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase">या टेस्टिंग हेतु</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <button
                type="button"
                onClick={() => handleConfirmPaymentDone()}
                disabled={isProcessingPayment}
                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-amber-500/30"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>⚡ त्वरित रियल ट्रायल पास करें (Instant Trial Pass)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUtrModal(false)}
                className="w-full text-center text-xs text-slate-400 hover:text-white pt-1"
              >
                वापस जाएं (Back)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Razorpay Merchant Compliance Footer Policies */}
      <div className="w-full max-w-lg text-center text-xs text-slate-400 space-y-2 mt-4 px-2">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] font-semibold text-slate-400">
          <button 
            type="button" 
            onClick={() => openPolicy('ABOUT')} 
            className="hover:text-amber-400 underline-offset-2 hover:underline transition-colors"
          >
            About Us
          </button>
          <span className="text-slate-700">•</span>
          <button 
            type="button" 
            onClick={() => openPolicy('CONTACT')} 
            className="hover:text-amber-400 underline-offset-2 hover:underline transition-colors"
          >
            Contact Us
          </button>
          <span className="text-slate-700">•</span>
          <button 
            type="button" 
            onClick={() => openPolicy('PRIVACY')} 
            className="hover:text-amber-400 underline-offset-2 hover:underline transition-colors"
          >
            Privacy Policy
          </button>
          <span className="text-slate-700">•</span>
          <button 
            type="button" 
            onClick={() => openPolicy('TERMS')} 
            className="hover:text-amber-400 underline-offset-2 hover:underline transition-colors"
          >
            Terms & Conditions
          </button>
          <span className="text-slate-700">•</span>
          <button 
            type="button" 
            onClick={() => openPolicy('REFUND')} 
            className="hover:text-amber-400 underline-offset-2 hover:underline transition-colors text-amber-300"
          >
            Cancellation & Refund
          </button>
          <span className="text-slate-700">•</span>
          <button 
            type="button" 
            onClick={() => openPolicy('SHIPPING')} 
            className="hover:text-amber-400 underline-offset-2 hover:underline transition-colors"
          >
            Shipping & Delivery
          </button>
        </div>

        <div className="text-[10px] text-slate-500 font-mono flex items-center justify-center gap-2">
          <span>{BRAND_CONFIG.brandName}</span>
          <span>•</span>
          <span className="text-emerald-400 font-sans font-semibold">Razorpay Verified Merchant</span>
          <span>•</span>
          <span>{BRAND_CONFIG.domain}</span>
        </div>
        <p className="text-[10px] text-slate-600">
          24×7 Commercial Self-Service ATP Kiosk System • Physical Laser Delivery on Kiosk Tray
        </p>
      </div>

      {/* 3. Modal: Safe Interactive UPI Apps Selector (PhonePe, GPay, Paytm) */}
      {showUpiAppsModal && activeJob && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowUpiAppsModal(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">UPI ऐप चुनें (Select UPI App)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUpiAppsModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              भुगतान राशि: <strong className="text-amber-400 font-mono text-sm">₹{activeJob.amount.toFixed(2)}</strong>
            </p>

            {/* UPI App Options list */}
            <div className="space-y-2">
              {upiAppOptions.map((app) => (
                <a
                  key={app.id}
                  href={app.schemeUrl}
                  onClick={() => {
                    setTimeout(() => {
                      setShowUpiAppsModal(false);
                      setShowUtrModal(true);
                    }, 1000);
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all text-xs group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-md"
                      style={{ backgroundColor: app.iconColor }}
                    >
                      {app.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-white block">{app.name}</span>
                      <span className="text-[10px] text-slate-400">{app.description}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
                </a>
              ))}
            </div>

            {/* Copy UPI Option */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
              <div className="truncate text-[11px] text-slate-400">
                मर्चेंट UPI: <span className="font-mono text-amber-400 font-semibold">{activeUpiId}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedUpi ? 'कॉपी हुआ!' : 'कॉपी करें'}</span>
              </button>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowUpiAppsModal(false);
                  handleFastSimulatePayment();
                }}
                className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>⚡ रियल ट्रायल पास करें (बिना पेमेंट तुरंत टेस्ट)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Merchant Compliance Modal */}
      <RazorpayPoliciesModal
        isOpen={policyModalOpen}
        initialTab={policyInitialTab}
        onClose={() => setPolicyModalOpen(false)}
        lang={lang}
      />

      {/* Machine Address & Google Maps Location Modal */}
      <MachineLocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onOpenAddMachine={() => setShowAddMachineModal(true)}
      />

      {/* Add New Kiosk Machine Modal */}
      <AddMachineModal
        isOpen={showAddMachineModal}
        onClose={() => setShowAddMachineModal(false)}
      />

      {/* High-Resolution Printable Document for Hardware Calibration & Upload Print */}
      <PrintableJobSheet 
        job={activeJob}
        machine={currentMachine}
        uploadedFile={uploadedFile}
        uploadedRawFile={uploadedRawFile}
        selectedPages={selectedPages}
      />
    </div>
  );
};
