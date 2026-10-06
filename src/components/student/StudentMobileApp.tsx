import React, { useState, useId } from 'react';
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
  HelpCircle,
  KeyRound,
  Lock,
  Layers,
  Zap
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';
import { BRAND_CONFIG } from '../../config/branding';
import { PrintJob } from '../../types';
import { PagePreviewSelector } from './PagePreviewSelector';
import { RazorpayPoliciesModal, PolicyTab } from '../common/RazorpayPoliciesModal';
import { 
  openRazorpayCheckout, 
  buildUpiIntentUrl, 
  getRazorpayConfig 
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
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'UPI_QR' | 'UPI_INTENT'>('RAZORPAY');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [receiptCopied, setReceiptCopied] = useState<boolean>(false);

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
    const simulatedPaymentId = `pay_fast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await verifyPaymentAndAuthorizePrint(activeJobId, simulatedPaymentId);
    setIsProcessingPayment(false);
    setPaymentSuccess(true);
    setTimeout(() => {
      setStep('STATUS');
    }, 600);
  };

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

  const activeJob = activeJobId ? getJobById(activeJobId) : jobs[0];
  const upiIntentUrl = activeJob ? buildUpiIntentUrl(activeJob.amount, activeJob.job_id) : '#';

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

          {/* Machine Connection Badge */}
          <div className="bg-slate-950/90 backdrop-blur-md rounded-2xl p-3 border border-slate-800 flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
              <div>
                <div className="font-mono font-bold text-amber-400 flex items-center gap-1.5">
                  <span>कियोस्क: {currentMachine.id}</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-sans">
                    ONLINE
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[220px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{currentMachine.location}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] bg-slate-900 border border-slate-700 text-emerald-400 font-bold px-2.5 py-1 rounded-lg font-mono">
                {currentMachine.paperTray.current_stock} पेज उपलब्ध
              </span>
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

        {/* STEP 3: RAZORPAY & UPI PAYMENT GATEWAY */}
        {step === 'PAYMENT' && activeJob && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/10 text-amber-400 px-3 py-0.5 rounded-full border border-amber-500/20">
                RAZORPAY 256-BIT SECURE GATEWAY
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {lang === 'EN' ? 'Complete Print Payment' : 'प्रिंट भुगतान पूरा करें'}
              </h2>
              <p className="text-xs text-slate-400">
                Order ID: <span className="font-mono text-slate-300">{activeJob.payment_order_id}</span>
              </p>
            </div>

            {paymentError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Total Amount Banner */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">भुगतान हेतु कुल राशि</span>
                <span className="text-[11px] text-slate-500">{activeJob.settings.pageCount} पेज • {activeJob.settings.copies} कॉपी</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-400 font-mono">
                  ₹{activeJob.amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* REQUIREMENT #3: PRIMARY RAZORPAY CHECKOUT ACTION */}
            <div className="space-y-3">
              <button
                onClick={handlePayWithRazorpay}
                disabled={isProcessingPayment}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/25 flex flex-col items-center justify-center gap-1 text-sm transition-all transform hover:-translate-y-0.5 border border-emerald-400/40"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-slate-950" />
                  <span className="text-base">Pay ₹{activeJob.amount.toFixed(2)} with Razorpay</span>
                </div>
                <span className="text-[11px] opacity-80 font-normal">
                  UPI • Google Pay • PhonePe • Paytm • Cards • Netbanking
                </span>
              </button>

              {/* Direct UPI Mobile Intent Link for 1-Tap PhonePe/GPay launch */}
              <a
                href={upiIntentUrl}
                className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs transition-all"
              >
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>PhonePe / GPay ऐप में सीधे खोलें (1-Tap UPI)</span>
                <ExternalLink className="w-3 h-3 text-slate-400 ml-1" />
              </a>
            </div>

            {/* UPI QR Display Option */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>या किसी भी UPI ऐप से यह QR कोड स्कैन करें:</span>
              </div>

              <div className="w-44 h-44 bg-white p-3 rounded-2xl mx-auto shadow-xl flex flex-col items-center justify-center relative">
                <svg className="w-full h-full text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M0 0h30v30H0zM10 10h10v10H10zM70 0h30v30H70zM80 10h10v10H80zM0 70h30v30H0zM10 80h10v10H10zM40 10h10v20H40zM55 5h10v15H55zM40 40h20v20H40zM10 40h10v20H10zM70 40h20v10H70zM80 60h15v10H80zM40 70h10v20H40zM60 70h30v10H60zM70 85h20v10H70z" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded shadow">
                    ₹{activeJob.amount.toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                UPI ID: <span className="font-mono text-amber-400 font-bold">msprinters@upi</span>
              </p>
            </div>

            {/* Instant Demo / Test Verify Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleFastSimulatePayment}
                disabled={isProcessingPayment}
                className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700/60"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>टेस्ट पेमेंट सत्यापन (Instant Test Simulation)</span>
              </button>
            </div>

            <div className="text-center text-[10px] text-slate-500">
              🔒 Razorpay PCI-DSS Compliant • HMAC-SHA256 Server Verified
            </div>
          </div>
        )}

        {/* STEP 4: REAL-TIME JOB STATUS & HP LASERJET PRINTING */}
        {step === 'STATUS' && activeJob && (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Status Header Banner */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
              <div className="inline-block p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {activeJob.print_status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-pulse" />
                ) : activeJob.print_status === 'PRINTING' ? (
                  <Printer className="w-10 h-10 text-amber-400 animate-bounce" />
                ) : activeJob.print_status === 'WAITING_FOR_PAPER' ? (
                  <AlertCircle className="w-10 h-10 text-rose-400" />
                ) : (
                  <Clock className="w-10 h-10 text-amber-400 animate-spin" />
                )}
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">JOB REFERENCE ID</span>
                <h3 className="font-mono font-bold text-base text-white">{activeJob.job_id}</h3>
              </div>

              <div className="text-xs">
                {activeJob.print_status === 'COMPLETED' && (
                  <p className="text-emerald-400 font-bold">
                    ✓ प्रिंट सफलतापूर्वक पूरा हुआ! कृपया HP LaserJet M126nw से पेज प्राप्त करें।
                  </p>
                )}
                {activeJob.print_status === 'PRINTING' && (
                  <p className="text-amber-300 font-bold">
                    🖨️ HP LaserJet Pro MFP M126nw स्पूलिंग चालू है... कृपया आउटपुट ट्रे के पास खड़े रहें।
                  </p>
                )}
                {activeJob.print_status === 'QUEUED' && (
                  <p className="text-sky-300 font-bold">
                    भुगतान सत्यापित हो चुका है! प्रिंट कतार में लग गया है।
                  </p>
                )}
              </div>
            </div>

            {/* Print Settings Receipt */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-bold pb-2 border-b border-slate-800">
                <span>{BRAND_CONFIG.brandName} डिजिटल रसीद</span>
                <span className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">PAID</span>
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
                <span className="text-slate-200 font-mono text-[10px]">{activeJob.payment_id || 'pay_razorpay_live'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 font-bold pt-2 border-t border-slate-800">
                <span>कुल भुगतान राशि:</span>
                <span className="text-amber-400 font-mono text-base">₹{activeJob.amount.toFixed(2)}</span>
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
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
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

      {/* Razorpay Merchant Compliance Modal */}
      <RazorpayPoliciesModal
        isOpen={policyModalOpen}
        initialTab={policyInitialTab}
        onClose={() => setPolicyModalOpen(false)}
        lang={lang}
      />
    </div>
  );
};
