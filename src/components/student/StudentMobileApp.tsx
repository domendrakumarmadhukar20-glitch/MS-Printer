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
  HelpCircle
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';
import { BRAND_CONFIG } from '../../config/branding';
import { PrintJob } from '../../types';

export const StudentMobileApp: React.FC = () => {
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
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');

  // Step state: 'UPLOAD' -> 'SETTINGS' -> 'PAYMENT' -> 'STATUS'
  const [step, setStep] = useState<'UPLOAD' | 'SETTINGS' | 'PAYMENT' | 'STATUS'>('UPLOAD');
  
  // Selected or created Job ID for tracking
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Uploaded file state
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    pageCount: number;
    hash: string;
  } | null>(null);

  // Print settings
  const [paperSize, setPaperSize] = useState<'A4'>('A4');
  const [colorMode, setColorMode] = useState<'BW' | 'COLOR'>('BW');
  const [duplexMode, setDuplexMode] = useState<'SINGLE' | 'DUPLEX'>('SINGLE');
  const [copies, setCopies] = useState<number>(1);
  const [pageSelectionType, setPageSelectionType] = useState<'ALL' | 'CUSTOM'>('ALL');
  const [customPageRange, setCustomPageRange] = useState<string>('1-4');
  const [studentName, setStudentName] = useState<string>('');
  const [studentPhone, setStudentPhone] = useState<string>('');

  // Payment UI state
  const [paymentMethod, setPaymentMethod] = useState<'UPI_QR' | 'UPI_APP' | 'CARD'>('UPI_QR');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [receiptCopied, setReceiptCopied] = useState<boolean>(false);

  // Calculate pricing breakdown
  const effectivePageCount = uploadedFile 
    ? (pageSelectionType === 'CUSTOM' ? 4 : uploadedFile.pageCount) 
    : 4;

  const priceQuote = calculatePrice(effectivePageCount, copies, colorMode, duplexMode);

  // Sample quick load files for instant testing
  const sampleFiles = [
    { name: 'Computer_Networks_Unit3_Notes.pdf', size: 1420000, pageCount: 6, hash: 'sha256_e8912fc882b01' },
    { name: 'Engineering_Physics_Lab_Manual.pdf', size: 2150000, pageCount: 12, hash: 'sha256_bb902419ac092' },
    { name: 'Final_Year_Project_Synopsis.pdf', size: 840000, pageCount: 4, hash: 'sha256_9941a877be103' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate PDF parsing
      const estimatedPages = Math.max(1, Math.min(25, Math.ceil(file.size / 250000)));
      setUploadedFile({
        name: file.name,
        size: file.size,
        pageCount: estimatedPages,
        hash: 'sha256_' + Math.random().toString(36).substring(2, 12),
      });
      setStep('SETTINGS');
    }
  };

  const handleSelectSample = (sample: typeof sampleFiles[0]) => {
    setUploadedFile(sample);
    setStep('SETTINGS');
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
        selectedPages: pageSelectionType === 'ALL' ? 'ALL' : customPageRange,
      },
      {
        name: studentName.trim() || 'Student User',
        phone: studentPhone.trim() || '9876543210',
      }
    );

    setActiveJobId(job.job_id);
    setStep('PAYMENT');
  };

  // Simulate Razorpay / Webhook signature verified payment
  const handlePayNow = async () => {
    if (!activeJobId) return;
    setIsProcessingPayment(true);

    const simulatedPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Critical Rule #13: Payment verified strictly via server-side webhook logic
    await verifyPaymentAndAuthorizePrint(activeJobId, simulatedPaymentId);

    setIsProcessingPayment(false);
    setPaymentSuccess(true);
    setTimeout(() => {
      setStep('STATUS');
    }, 800);
  };

  const activeJob = activeJobId ? getJobById(activeJobId) : jobs[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start pb-16 px-3 sm:px-4">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4">
        
        {/* Kiosk Location & Brand Header */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 p-5 border-b border-slate-800 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/20">
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
                onClick={() => setLang('EN')}
                className={`px-2 py-0.5 rounded ${lang === 'EN' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('HI')}
                className={`px-2 py-0.5 rounded ${lang === 'HI' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              >
                हिंदी
              </button>
            </div>
          </div>

          {/* Machine Connection Badge */}
          <div className="bg-slate-950/80 backdrop-blur-md rounded-xl p-2.5 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <div>
                <div className="font-mono font-bold text-amber-400">{currentMachine.id}</div>
                <div className="text-[10px] text-slate-400 truncate max-w-[200px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{currentMachine.location}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                A4 Tray: {currentMachine.paperTray.current_stock}
              </span>
            </div>
          </div>
        </div>

        {/* Step Progression Bar */}
        <div className="px-5 py-3 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-1.5 ${step === 'UPLOAD' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] border border-slate-700">1</span>
            <span>{lang === 'EN' ? 'Upload' : 'अपलोड'}</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <div className={`flex items-center gap-1.5 ${step === 'SETTINGS' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] border border-slate-700">2</span>
            <span>{lang === 'EN' ? 'Settings' : 'सेटिंग्स'}</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <div className={`flex items-center gap-1.5 ${step === 'PAYMENT' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] border border-slate-700">3</span>
            <span>{lang === 'EN' ? 'Pay' : 'भुगतान'}</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <div className={`flex items-center gap-1.5 ${step === 'STATUS' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] border border-slate-700">4</span>
            <span>{lang === 'EN' ? 'Status' : 'प्रिंट'}</span>
          </div>
        </div>

        {/* STEP 1: UPLOAD DOCUMENT */}
        {step === 'UPLOAD' && (
          <div className="p-5 space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-base font-bold text-white">
                {lang === 'EN' ? 'Select Document to Print' : 'प्रिंट करने के लिए डॉक्यूमेंट चुनें'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'EN' 
                  ? 'Upload PDF document directly from your phone' 
                  : 'अपने फोन से सीधे PDF डॉक्यूमेंट अपलोड करें'}
              </p>
            </div>

            {/* Drag & Drop / File Input Box */}
            <label className="block border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-amber-500/10">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-3 border border-amber-500/30">
                <Upload className="w-7 h-7 animate-bounce" />
              </div>
              <p className="text-sm font-bold text-white">
                {lang === 'EN' ? 'Tap to Browse PDF File' : 'PDF फाइल चुनने के लिए टैप करें'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports PDF up to 50 MB • Instant page count
              </p>
              <span className="inline-block mt-3 bg-amber-500 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-lg shadow-md shadow-amber-500/20">
                {lang === 'EN' ? 'Choose from Phone' : 'फोन से चुनें'}
              </span>
            </label>

            {/* Quick Demo Samples */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>{lang === 'EN' ? 'Or Test with Sample Document:' : 'या सैंपल डॉक्यूमेंट से तुरंत टेस्ट करें:'}</span>
                <span className="text-[10px] text-amber-400">1-Tap Load</span>
              </div>

              <div className="space-y-2">
                {sampleFiles.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSample(file)}
                    className="w-full text-left p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/60 transition-all flex items-center justify-between text-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {file.pageCount} Pages • {(file.size / 1000000).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
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

        {/* STEP 2: PRINT SETTINGS */}
        {step === 'SETTINGS' && uploadedFile && (
          <div className="p-5 space-y-4">
            {/* File Info Card */}
            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white truncate max-w-[200px]">
                    {uploadedFile.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {uploadedFile.pageCount} Pages • {(uploadedFile.size / 1000000).toFixed(1)} MB
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStep('UPLOAD')}
                className="text-[11px] text-amber-400 hover:underline font-semibold"
              >
                Change
              </button>
            </div>

            {/* Settings Options */}
            <div className="space-y-3">
              {/* Color Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {lang === 'EN' ? 'Color Mode' : 'कलर मोड'}
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
                    <span className="text-[10px] text-amber-400/90 font-mono">₹2.00 / page</span>
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
                    <span className="text-[10px] text-amber-400/90 font-mono">₹10.00 / page</span>
                  </button>
                </div>
              </div>

              {/* Sides (Single vs Duplex) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {lang === 'EN' ? 'Print Sides' : 'प्रिंट साइड्स'}
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
                    <span className="text-[10px] text-slate-400">1 side per sheet</span>
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
                    <span className="text-[10px] text-emerald-400 font-mono">Save 50% Paper (₹3/sheet)</span>
                  </button>
                </div>
              </div>

              {/* Copies & Page Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'EN' ? 'Copies' : 'प्रतियां (Copies)'}
                  </label>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setCopies(Math.max(1, copies - 1))}
                      className="px-3 py-2 text-slate-300 hover:bg-slate-800 text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-mono font-bold text-white text-sm">
                      {copies}
                    </span>
                    <button
                      onClick={() => setCopies(Math.min(20, copies + 1))}
                      className="px-3 py-2 text-slate-300 hover:bg-slate-800 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'EN' ? 'Pages' : 'पेज चयन'}
                  </label>
                  <select
                    value={pageSelectionType}
                    onChange={(e) => setPageSelectionType(e.target.value as 'ALL' | 'CUSTOM')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL">All Pages ({uploadedFile.pageCount})</option>
                    <option value="CUSTOM">Custom Range (1-4)</option>
                  </select>
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
                    placeholder="Your Name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile (10 digits)"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Price Quote Breakdown Card */}
            <div className="bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Total Document Pages:</span>
                <span className="font-mono font-bold text-white">{effectivePageCount} pages</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Copies:</span>
                <span className="font-mono font-bold text-white">{copies}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Physical Paper Sheets:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {priceQuote.sheets} sheets ({duplexMode === 'DUPLEX' ? 'Duplex' : 'Single'})
                </span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Total Amount to Pay</span>
                  <span className="text-[10px] text-emerald-400 font-mono">No hidden fees • Direct at kiosk</span>
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
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 text-sm transition-all"
            >
              <span>{lang === 'EN' ? `Proceed to Pay ₹${priceQuote.amount.toFixed(2)}` : `₹${priceQuote.amount.toFixed(2)} भुगतान करें`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: PAYMENT GATEWAY SIMULATION */}
        {step === 'PAYMENT' && activeJob && (
          <div className="p-5 space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                SECURE RAZORPAY / UPI GATEWAY
              </span>
              <h2 className="text-base font-bold text-white">
                {lang === 'EN' ? 'Complete Payment' : 'भुगतान पूरा करें'}
              </h2>
              <p className="text-xs text-slate-400">
                Order ID: <span className="font-mono text-slate-300">{activeJob.payment_order_id}</span>
              </p>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setPaymentMethod('UPI_QR')}
                className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
                  paymentMethod === 'UPI_QR' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>UPI QR</span>
              </button>
              <button
                onClick={() => setPaymentMethod('UPI_APP')}
                className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
                  paymentMethod === 'UPI_APP' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>UPI Apps</span>
              </button>
              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
                  paymentMethod === 'CARD' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Cards / Net</span>
              </button>
            </div>

            {/* UPI QR Display */}
            {paymentMethod === 'UPI_QR' && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
                <div className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto shadow-xl flex flex-col items-center justify-center relative">
                  {/* Generated Dynamic SVG QR Code Simulation */}
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M0 0h30v30H0zM10 10h10v10H10zM70 0h30v30H70zM80 10h10v10H80zM0 70h30v30H0zM10 80h10v10H10zM40 10h10v20H40zM55 5h10v15H55zM40 40h20v20H40zM10 40h10v20H10zM70 40h20v10H70zM80 60h15v10H80zM40 70h10v20H40zM60 70h30v10H60zM70 85h20v10H70z" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded shadow">
                      MS PRINTERS
                    </span>
                  </div>
                </div>

                <div className="text-xs">
                  <p className="font-bold text-white">Scan with Google Pay, PhonePe, Paytm, BHIM</p>
                  <p className="text-[11px] text-slate-400">UPI ID: <span className="font-mono text-amber-400">msprinters@upi</span></p>
                </div>
              </div>
            )}

            {/* UPI App Quick Pick */}
            {paymentMethod === 'UPI_APP' && (
              <div className="space-y-2">
                {['Google Pay', 'PhonePe', 'Paytm', 'Cred UPI'].map((app, i) => (
                  <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{app}</span>
                    <span className="text-[11px] text-amber-400 font-mono">Pay ₹{activeJob.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Card Form */}
            {paymentMethod === 'CARD' && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Card Number (4000 1234 5678 9010)"
                  defaultValue="4532 •••• •••• 8821"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    defaultValue="09/28"
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    defaultValue="821"
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
            )}

            {/* Amount Summary */}
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-300">Amount to Authorize:</span>
              <span className="text-xl font-black text-amber-400 font-mono">₹{activeJob.amount.toFixed(2)}</span>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayNow}
              disabled={isProcessingPayment}
              className={`w-full py-3.5 rounded-xl font-black text-slate-950 text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                isProcessingPayment
                  ? 'bg-amber-600/50 cursor-not-allowed'
                  : 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/20'
              }`}
            >
              {isProcessingPayment ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Webhook Signature...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Simulate Payment & Authorize Print</span>
                </>
              )}
            </button>

            <div className="text-center text-[10px] text-slate-500">
              🔒 256-bit Encrypted • 100% Server Signature Verified
            </div>
          </div>
        )}

        {/* STEP 4: REAL-TIME JOB STATUS & RECEIPT */}
        {step === 'STATUS' && activeJob && (
          <div className="p-5 space-y-4">
            {/* Status Header Banner */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
              <div className="inline-block p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {activeJob.print_status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-pulse" />
                ) : activeJob.print_status === 'PRINTING' ? (
                  <Printer className="w-8 h-8 text-amber-400 animate-bounce" />
                ) : activeJob.print_status === 'WAITING_FOR_PAPER' ? (
                  <AlertCircle className="w-8 h-8 text-rose-400" />
                ) : (
                  <Clock className="w-8 h-8 text-amber-400" />
                )}
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400">JOB ID</span>
                <h3 className="font-mono font-bold text-sm text-white">{activeJob.job_id}</h3>
              </div>

              <div className="text-xs">
                {activeJob.print_status === 'COMPLETED' && (
                  <div className="bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/40 inline-block">
                    ✓ {lang === 'EN' ? 'PRINT COMPLETED — COLLECT FROM TRAY' : 'प्रिंट पूरा हुआ — ट्रे से कलेक्ट करें'}
                  </div>
                )}
                {activeJob.print_status === 'PRINTING' && (
                  <div className="bg-amber-500/20 text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-500/40 inline-block">
                    ⏳ {lang === 'EN' ? `Printing on HP M126nw (Page ${activeJob.progress_page}/${activeJob.settings.pageCount * activeJob.settings.copies})` : `प्रिंट हो रहा है (पेज ${activeJob.progress_page})`}
                  </div>
                )}
                {activeJob.print_status === 'QUEUED' && (
                  <div className="bg-blue-500/20 text-blue-300 font-bold px-3 py-1 rounded-full border border-blue-500/40 inline-block">
                    ✓ Payment Verified — Queued in Windows Spooler
                  </div>
                )}
                {activeJob.print_status === 'WAITING_FOR_PAPER' && (
                  <div className="bg-rose-500/20 text-rose-300 font-bold px-3 py-1 rounded-full border border-rose-500/40 inline-block">
                    ⚠ Tray Empty — Waiting for Paper Refill
                  </div>
                )}
              </div>
            </div>

            {/* Real-time Status Timeline Stepper */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-300 mb-2">Live Execution Pipeline:</div>
              
              {/* Step 1 */}
              <div className="flex items-center gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-slate-200">File Uploaded & Hashed</span>
                  <span className="text-[10px] font-mono text-slate-400">Done</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-slate-200">Payment Verified (₹{activeJob.amount.toFixed(2)})</span>
                  <span className="text-[10px] font-mono text-emerald-400">Verified</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-3 text-xs">
                {activeJob.print_status === 'COMPLETED' || activeJob.print_status === 'PRINTING' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-amber-400 shrink-0 animate-spin" />
                )}
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-slate-200">Windows ATP Agent Spooled</span>
                  <span className="text-[10px] font-mono text-slate-400">HP LaserJet M126nw</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-center gap-3 text-xs">
                {activeJob.print_status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-700 shrink-0" />
                )}
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-slate-200">Physical Print Output</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activeJob.print_status === 'COMPLETED' ? 'Delivered' : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-white border-b border-slate-800 pb-2">
                <span>{BRAND_CONFIG.brandName} e-Receipt</span>
                <span className="text-amber-400 font-mono">PAID</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Machine Location:</span>
                <span className="text-slate-200 font-medium">{activeJob.machine_id}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Document:</span>
                <span className="text-slate-200 font-medium truncate max-w-[160px]">{activeJob.file_name}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Sheets Consumed:</span>
                <span className="text-slate-200 font-medium">{activeJob.settings.physicalSheets} physical sheets</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Payment Reference:</span>
                <span className="text-slate-200 font-mono text-[10px]">{activeJob.payment_id || 'pay_online_sim'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 font-bold pt-1 border-t border-slate-800">
                <span>Total Amount Paid:</span>
                <span className="text-amber-400 font-mono text-sm">₹{activeJob.amount.toFixed(2)}</span>
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
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>{lang === 'EN' ? 'Print Another Document' : 'दूसरा डॉक्यूमेंट प्रिंट करें'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="text-center text-xs text-slate-500 space-y-1">
        <p className="font-mono">{BRAND_CONFIG.brandName} • {BRAND_CONFIG.domain}</p>
        <p className="text-[11px]">24×7 Commercial Smart Kiosk System • Powered by HP LaserJet M126nw</p>
      </div>
    </div>
  );
};
