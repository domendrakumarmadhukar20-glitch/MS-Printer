import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Smartphone, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Zap, 
  Layers, 
  Copy, 
  Check,
  ShieldCheck,
  ScanLine
} from 'lucide-react';
import { BRAND_CONFIG } from '../../config/branding';

interface BrandedKioskQRCodeProps {
  machineId: string;
  className?: string;
  size?: number;
}

export const BrandedKioskQRCode: React.FC<BrandedKioskQRCodeProps> = ({
  machineId,
  className = '',
  size = 280
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Determine target student portal URL
  const getTargetUrl = () => {
    if (typeof window === 'undefined') return `https://${BRAND_CONFIG.domain}/m/${machineId}`;
    const origin = window.location.origin;
    // Always route directly to /m/{machineId} with student mode flag for zero-latency load
    return `${origin}/m/${machineId}?mode=student`;
  };

  const targetUrl = getTargetUrl();

  useEffect(() => {
    let isCancelled = false;

    // Generate high-resolution, high-error-correction QR Code (Level 'H' for 30% fault tolerance)
    QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'H',
      margin: 1.5,
      width: Math.max(size * 2, 480), // 2x resolution for retina/ultra-sharp scanning
      color: {
        dark: '#030712', // Deep rich black for maximum camera contrast
        light: '#ffffff'
      }
    })
      .then(url => {
        if (!isCancelled) {
          setQrDataUrl(url);
        }
      })
      .catch(err => {
        console.error('QR Generation failed:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [targetUrl, size]);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex flex-col items-center justify-center p-5 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl shadow-amber-500/10 ${className}`}
    >
      {/* Top Professional Kiosk Header */}
      <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
            MS
          </div>
          <div className="text-left">
            <h4 className="text-xs font-black tracking-wider text-white uppercase leading-none">
              {BRAND_CONFIG.brandName}
            </h4>
            <span className="text-[9px] text-amber-400 font-bold tracking-widest uppercase">
              ATP SMART KIOSK
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">
            LIVE PORTAL
          </span>
        </div>
      </div>

      {/* QR Framing Container with Corner Brackets & Scanner Beam */}
      <div className="relative p-3 bg-white rounded-2xl shadow-2xl border-4 border-amber-400 overflow-hidden group">
        {/* Animated Radar Scanning Line */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-[0_0_12px_#f59e0b] opacity-80 animate-scan pointer-events-none z-10"></div>

        {/* Top-Left Corner Bracket */}
        <div className="absolute top-1 left-1 w-4 h-4 border-t-4 border-l-4 border-amber-600 pointer-events-none z-10 rounded-tl-sm"></div>
        {/* Top-Right Corner Bracket */}
        <div className="absolute top-1 right-1 w-4 h-4 border-t-4 border-r-4 border-amber-600 pointer-events-none z-10 rounded-tr-sm"></div>
        {/* Bottom-Left Corner Bracket */}
        <div className="absolute bottom-1 left-1 w-4 h-4 border-b-4 border-l-4 border-amber-600 pointer-events-none z-10 rounded-bl-sm"></div>
        {/* Bottom-Right Corner Bracket */}
        <div className="absolute bottom-1 right-1 w-4 h-4 border-b-4 border-r-4 border-amber-600 pointer-events-none z-10 rounded-br-sm"></div>

        {/* Sharp High-Contrast QR Canvas Image */}
        <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt="MS PRINTERS Student Portal Instant QR"
              className="w-full h-full object-contain block select-none"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-xs font-mono">
              Generating QR...
            </div>
          )}

          {/* Center Brand Emblem Badge (Protected by Error Correction Level H) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="p-1 bg-white rounded-xl shadow-xl border border-slate-200">
              <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-xs px-2 py-1 rounded-lg shadow-md flex items-center gap-1 border border-amber-300">
                <span className="font-extrabold tracking-tighter">MS</span>
                <span className="text-[8px] bg-slate-950 text-amber-300 px-1 py-0.2 rounded font-sans uppercase tracking-wider">
                  PRINT
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instant Action Badge Below QR */}
      <div className="mt-4 w-full text-center space-y-2">
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 rounded-xl py-2 px-3 flex items-center justify-center gap-2">
          <ScanLine className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-bold text-amber-300">
            कैमरे से स्कैन करें • तुरंत पोर्टल खुलेगा (Instant)
          </span>
        </div>

        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>No App Download Needed • Direct Browser Print</span>
        </p>

        {/* Machine ID & Quick Direct Click Link (for testing or direct browser click) */}
        <div className="pt-1 flex items-center justify-center gap-2">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-slate-400 hover:text-amber-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5 transition-colors"
            title="Open Student Portal in new tab"
          >
            <span>kiosk/{machineId}</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          <button
            type="button"
            onClick={handleCopyLink}
            className="text-[11px] font-mono text-slate-400 hover:text-white bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 flex items-center gap-1 transition-colors"
            title="Copy portal URL"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 text-[10px]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-500" />
                <span className="text-[10px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
