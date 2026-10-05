import React, { useState } from 'react';
import { 
  Folder, 
  FileText, 
  Upload, 
  Archive, 
  Check, 
  ArrowRight, 
  AlertCircle, 
  Monitor, 
  FolderOpen,
  MousePointer,
  CornerDownRight,
  ExternalLink
} from 'lucide-react';

export const HostingerExtractGuide: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 font-black text-xl flex items-center justify-center border border-amber-500/40">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Hostinger File Manager में ZIP कहाँ और कैसे Extract करें</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                सचित्र स्क्रीनशॉट गाइड
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              सबसे ज़रूरी नियम: ZIP फ़ाइल को हमेशा केवल <strong className="text-amber-400 font-mono">public_html</strong> फोल्डर के अंदर ही Extract करना है!
            </p>
          </div>
        </div>

        {/* Quick Link to Hostinger */}
        <a
          href="https://hpanel.hostinger.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all"
        >
          <span>Hostinger hPanel खोलें</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Golden Rule Banner */}
      <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-amber-200">
        <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-sm text-amber-300">
            🎯 पक्का रास्ता (Golden Path):
          </div>
          <p className="text-slate-300">
            Hostinger File Manager खोलते ही आपको बाएँ हाथ (Left Side) पर <span className="bg-slate-950 font-mono font-bold text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">public_html</span> फोल्डर दिखेगा। आपको सिर्फ उसी पर डबल क्लिक करना है और <span className="text-white font-bold">hostinger_deploy.zip</span> को वहीं Extract करना है।
          </p>
        </div>
      </div>

      {/* Step Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
        {[
          { num: 1, label: '1. public_html खोलें' },
          { num: 2, label: '2. ZIP अपलोड करें' },
          { num: 3, label: '3. Right Click ➔ Extract' },
          { num: 4, label: '4. लाइव वेबसाइट देखें' },
        ].map((tab) => (
          <button
            key={tab.num}
            onClick={() => setActiveStep(tab.num)}
            className={`p-3 rounded-xl border text-center transition-all ${
              activeStep === tab.num
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* VISUAL SIMULATED SCREENSHOT OF HOSTINGER FILE MANAGER */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-white font-bold">
            <Monitor className="w-4 h-4 text-sky-400" />
            <span>Hostinger File Manager स्क्रीनशॉट (Visual Mockup):</span>
          </span>
          <span className="text-slate-500">Path: /home/u123456789/domains/msprinter.in/public_html</span>
        </div>

        {/* Window Chrome Container */}
        <div className="bg-[#1b1e2e] border-2 border-slate-700 rounded-2xl overflow-hidden shadow-2xl font-sans text-xs">
          {/* Top Bar */}
          <div className="bg-[#24283b] px-4 py-2.5 border-b border-[#2e334d] flex items-center justify-between text-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-[#6c5ce7] text-white flex items-center justify-center font-black text-xs">
                H
              </div>
              <span className="font-bold text-white text-xs">Hostinger File Manager — msprinter.in</span>
            </div>

            {/* Simulated Action Toolbar */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                activeStep === 2 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse' 
                  : 'bg-[#2f354f] text-slate-300 border-slate-700'
              }`}>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Files</span>
                {activeStep === 2 && <span className="text-[10px] ml-1">👈 यहाँ क्लिक करें</span>}
              </div>
            </div>
          </div>

          {/* Breadcrumb Path Bar */}
          <div className="bg-[#151824] px-4 py-2 border-b border-[#2e334d] flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>Root</span>
            <span>/</span>
            <span>domains</span>
            <span>/</span>
            <span>msprinter.in</span>
            <span>/</span>
            <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/40">
              public_html 📁 (यही सही जगह है!)
            </span>
          </div>

          {/* Main Area: Left Tree + Right File List */}
          <div className="grid grid-cols-1 md:grid-cols-3 min-h-[300px] bg-[#181b28]">
            {/* Left Folder Tree */}
            <div className="p-3 border-r border-[#2e334d] space-y-1 bg-[#151824]/60 font-mono text-[11px]">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Folder Tree</div>
              
              <div className="text-slate-400 flex items-center gap-1.5 pl-1 py-1">
                <Folder className="w-3.5 h-3.5 text-slate-500" />
                <span>domains</span>
              </div>

              <div className="text-slate-400 flex items-center gap-1.5 pl-4 py-1">
                <Folder className="w-3.5 h-3.5 text-slate-500" />
                <span>msprinter.in</span>
              </div>

              {/* The Target Folder: public_html */}
              <div className="bg-amber-500/20 border-2 border-amber-500/60 text-amber-300 font-bold flex items-center justify-between pl-7 pr-2 py-1.5 rounded-lg shadow-sm">
                <div className="flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span>public_html</span>
                </div>
                <span className="text-[9px] bg-amber-500 text-slate-950 px-1 rounded font-black">OPEN</span>
              </div>

              <div className="text-slate-500 flex items-center gap-1.5 pl-7 py-1 text-[10px]">
                <Folder className="w-3 h-3 text-slate-600" />
                <span>public_ftp (खाली छोड़ें)</span>
              </div>
            </div>

            {/* Right File List (Shows inside public_html) */}
            <div className="md:col-span-2 p-4 space-y-3 relative">
              <div className="flex items-center justify-between border-b border-[#2e334d] pb-2 text-[11px] text-slate-400 font-mono">
                <span>Name</span>
                <span>Size</span>
              </div>

              {/* File 1: hostinger_deploy.zip with Right Click Callout */}
              <div className="relative">
                <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  activeStep === 3
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-[#1f2335] border-slate-700 text-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <Archive className="w-6 h-6 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold font-mono text-xs flex items-center gap-2">
                        <span>hostinger_deploy.zip</span>
                        <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                          ZIP
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">आपकी डिप्लॉयमेंट फाइल (~1.2 MB)</div>
                    </div>
                  </div>

                  <span className="font-mono text-slate-400 text-xs">1,271 KB</span>
                </div>

                {/* Right Click Popup Menu Simulation (Step 3) */}
                {(activeStep === 3 || activeStep === 2) && (
                  <div className="absolute top-1/2 left-1/3 -translate-y-1/2 bg-[#252a3d] border-2 border-emerald-400 rounded-xl shadow-2xl p-1.5 w-48 z-20 text-xs font-medium space-y-0.5">
                    <div className="text-[10px] text-slate-400 px-2 py-1 uppercase font-bold border-b border-slate-700">
                      Right Click Menu
                    </div>
                    <div className="px-2.5 py-1.5 text-slate-300 hover:bg-slate-700 rounded cursor-pointer">
                      Download
                    </div>
                    {/* The Highlighted Extract Option */}
                    <div className="px-2.5 py-1.5 bg-emerald-500 text-slate-950 font-black rounded flex items-center justify-between shadow-lg cursor-pointer">
                      <span>👉 Extract (अनज़िप करें)</span>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div className="px-2.5 py-1.5 text-slate-300 hover:bg-slate-700 rounded cursor-pointer">
                      Rename
                    </div>
                    <div className="px-2.5 py-1.5 text-rose-400 hover:bg-slate-700 rounded cursor-pointer">
                      Delete
                    </div>
                  </div>
                )}
              </div>

              {/* Step 4: After Extraction View */}
              {activeStep === 4 && (
                <div className="space-y-1.5 pt-2">
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>सफलतापूर्वक Extract होने के बाद public_html ऐसा दिखेगा:</span>
                  </div>

                  <div className="bg-[#1f2335] p-2.5 rounded-lg border border-slate-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-amber-400" />
                      <span className="font-mono font-bold text-white">assets/</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">(index.js, index.css)</span>
                  </div>

                  <div className="bg-[#1f2335] p-2.5 rounded-lg border border-slate-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-400" />
                      <span className="font-mono font-bold text-white">index.html</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold font-mono">✓ मुख्य होमपेज</span>
                  </div>

                  <div className="bg-[#1f2335] p-2.5 rounded-lg border border-slate-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="font-mono text-slate-300">.htaccess</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Routing Rules</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Extract Popup Dialog Simulation (when Extract is clicked) */}
          <div className="bg-[#24283b] p-4 border-t border-[#2e334d] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-bold text-amber-400">Extract Destination (गंतव्य फोल्डर):</span>
              <span className="font-mono bg-black/60 px-2.5 py-1 rounded border border-slate-700 text-emerald-400 font-bold">
                /public_html
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              (यदि खाली बॉक्स दिखे, तो बस एक बिंदु <code className="text-white font-bold">.</code> या <code className="text-white font-bold">public_html</code> लिख दें)
            </div>
          </div>
        </div>
      </div>

      {/* Step by Step Hindi Instructions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="font-bold text-amber-400 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">1</span>
            <span>public_html खोलें</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Hostinger File Manager में बाएँ हाथ की मेनू में <b className="text-white">public_html</b> नाम के फोल्डर पर क्लिक करें। कभी भी public_html के बाहर फाइल न रखें।
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="font-bold text-sky-400 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center font-black text-xs">2</span>
            <span>ZIP अपलोड करें</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            ऊपर दिए गए <b className="text-white">Upload</b> बटन (तीर का निशान) पर क्लिक करके अपने कंप्यूटर से <b className="text-amber-400 font-mono">hostinger_deploy.zip</b> अपलोड कर दें।
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="font-bold text-emerald-400 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">3</span>
            <span>Right Click ➔ Extract</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            अपलोड हुई ज़िप फाइल पर माउस से <b className="text-white">Right Click</b> करें और <b className="text-emerald-400 font-bold">Extract</b> दबाएं। फोल्डर में <code className="text-white font-bold">.</code> या <code className="text-white font-bold">public_html</code> लिखकर OK दबाएं।
          </p>
        </div>
      </div>
    </div>
  );
};
