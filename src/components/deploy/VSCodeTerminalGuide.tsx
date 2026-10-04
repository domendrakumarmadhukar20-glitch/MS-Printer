import React, { useState } from 'react';
import { Terminal, Copy, Check, CornerDownLeft, Play, Monitor, Globe, CheckCircle2, ArrowRight } from 'lucide-react';

export const VSCodeTerminalGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const commands = [
    {
      step: 1,
      cmd: 'git add .',
      desc: 'तमाम बदली हुई फाइल्स (index.html और assets) को गिट में जोड़ें',
      output: '[No error - files staged successfully]'
    },
    {
      step: 2,
      cmd: 'git commit -m "Fix white screen: load production assets in index.html"',
      desc: 'व्हाइट स्क्रीन फिक्स का नया कमिट बनाएं',
      output: '[main abc1234] Fix white screen: load production assets in index.html\n 2 files changed, 25 insertions(+), 5 deletions(-)'
    },
    {
      step: 3,
      cmd: 'git push origin main',
      desc: 'GitHub पर कोड अपलोड करें (यहीं से Hostinger कोड खींचेगा)',
      output: 'Enumerating objects: 7, done.\nWriting objects: 100% (7/7), done.\nTo https://github.com/your-username/msprinters.git\n   1234567..abcdef8  main -> main'
    }
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 font-black text-xl flex items-center justify-center border border-sky-500/40">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>VS Code में टर्मिनल खोलकर कमांड कैसे चलाएं</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                Step-by-Step Screenshot Guide
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              नीचे VS Code का विजुअल स्क्रीनशॉट और तीनों कमांड्स दिए गए हैं। बस क्लिक करके कॉपी करें और एंटर दबाएं!
            </p>
          </div>
        </div>
      </div>

      {/* STEP 1: How to open Terminal in VS Code */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
          <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold">1</div>
          <span>चरण 1: VS Code में Terminal (टर्मिनल) कैसे खोलें?</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              माउस से (Menu Bar):
            </div>
            <p className="text-slate-400">
              VS Code की सबसे ऊपर वाली पट्टी में देखें:
            </p>
            <div className="font-mono bg-slate-950 px-3 py-2 rounded border border-slate-800 text-sky-300 flex items-center gap-2">
              <span>Terminal</span>
              <span>➔</span>
              <span className="text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">New Terminal</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              कीबोर्ड शॉर्टकट (सबसे तेज़):
            </div>
            <p className="text-slate-400">
              कीबोर्ड पर यह दोनों बटन एक साथ दबाएं:
            </p>
            <div className="flex items-center gap-2 font-mono">
              <kbd className="bg-slate-800 border border-slate-700 text-white px-2.5 py-1.5 rounded-lg font-bold shadow text-xs">Ctrl</kbd>
              <span className="text-slate-500">+</span>
              <kbd className="bg-slate-800 border border-slate-700 text-amber-400 px-2.5 py-1.5 rounded-lg font-bold shadow text-xs">` (टिल्ड/बैकटिक key, Tab के ऊपर)</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* VISUAL MOCKUP OF VS CODE SCREEN */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Monitor className="w-4 h-4 text-sky-400" />
            <span>VS Code का असली इंटरफेस (Visual Mockup):</span>
          </span>
          <span className="text-slate-500 font-mono">Visual Studio Code (Dark Modern)</span>
        </div>

        {/* Window Chrome */}
        <div className="bg-[#1e1e1e] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs">
          {/* Top Window Bar */}
          <div className="bg-[#323233] px-4 py-2 border-b border-[#252526] flex items-center justify-between text-slate-300 select-none">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              <span className="text-[11px] text-slate-400 ml-2 font-sans">Visual Studio Code — msprinters</span>
            </div>
            {/* Search Mock */}
            <div className="hidden sm:block bg-[#1e1e1e] text-slate-400 px-6 py-0.5 rounded border border-slate-700 text-[11px]">
              msprinters [Workspace]
            </div>
            <div className="w-12"></div>
          </div>

          {/* Menubar */}
          <div className="bg-[#2d2d2d] px-3 py-1.5 border-b border-[#252526] flex items-center gap-4 text-slate-300 text-[11px] select-none">
            <span className="hover:text-white cursor-default">File</span>
            <span className="hover:text-white cursor-default">Edit</span>
            <span className="hover:text-white cursor-default">Selection</span>
            <span className="hover:text-white cursor-default">View</span>
            <span className="hover:text-white cursor-default">Go</span>
            <span className="hover:text-white cursor-default">Run</span>
            {/* Highlighted Terminal Menu */}
            <div className="relative bg-sky-600/30 text-sky-300 font-bold px-2 py-0.5 rounded border border-sky-400/60 shadow-sm flex items-center gap-1">
              <span>Terminal</span>
              <span className="text-[9px]">▼</span>
              {/* Dropdown Callout */}
              <div className="absolute top-full left-0 mt-1 bg-[#252526] border border-sky-500 rounded shadow-xl py-1 z-20 w-44">
                <div className="px-3 py-1 bg-sky-600 text-white font-bold text-[11px] flex items-center justify-between">
                  <span>👉 New Terminal</span>
                  <span className="text-[9px] opacity-80">Ctrl+Shift+`</span>
                </div>
                <div className="px-3 py-1 text-slate-400 text-[10px]">Split Terminal</div>
                <div className="px-3 py-1 text-slate-400 text-[10px]">Run Task...</div>
              </div>
            </div>
            <span className="hover:text-white cursor-default">Help</span>
          </div>

          {/* Editor Body */}
          <div className="flex h-36 bg-[#1e1e1e]">
            {/* Left Explorer Sidebar */}
            <div className="w-48 bg-[#252526] border-r border-[#1e1e1e] p-2.5 space-y-1 text-slate-400 text-[11px] hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Explorer: msprinters</div>
              <div className="text-slate-300 flex items-center gap-1.5 pl-1 font-bold">
                <span className="text-amber-400">📁</span>
                <span>assets/</span>
              </div>
              <div className="text-slate-400 flex items-center gap-1.5 pl-4 text-[10px]">
                <span className="text-sky-400">📄</span>
                <span>index.js</span>
              </div>
              <div className="text-slate-400 flex items-center gap-1.5 pl-4 text-[10px]">
                <span className="text-purple-400">📄</span>
                <span>index.css</span>
              </div>
              <div className="text-amber-300 flex items-center gap-1.5 pl-1 font-bold bg-[#37373d]/40 rounded px-1">
                <span className="text-orange-400">📄</span>
                <span>index.html</span>
              </div>
            </div>

            {/* Code View Area */}
            <div className="flex-1 p-4 bg-[#1e1e1e] text-slate-300 overflow-hidden font-mono text-[11px] space-y-1">
              <div className="text-slate-500">// index.html (Updated with production loader)</div>
              <div>
                <span className="text-purple-400">&lt;link</span>{' '}
                <span className="text-sky-300">rel</span>=<span className="text-amber-300">"stylesheet"</span>{' '}
                <span className="text-sky-300">href</span>=<span className="text-amber-300">"/assets/index.css"</span>
                <span className="text-purple-400">&gt;</span>
              </div>
              <div>
                <span className="text-purple-400">&lt;script&gt;</span>
                <span className="text-slate-400"> s.src = </span>
                <span className="text-emerald-300">'/assets/index.js'</span>
                <span className="text-purple-400">&lt;/script&gt;</span>
              </div>
              <div className="text-emerald-400/80 font-bold text-[10px] mt-2">
                ✓ Ready for GitHub Push & Hostinger Live
              </div>
            </div>
          </div>

          {/* Bottom Integrated Terminal Panel (THE MAIN FOCUS) */}
          <div className="border-t-2 border-sky-500 bg-[#181818] p-3 space-y-2">
            {/* Terminal Tab Bar */}
            <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-1 text-[11px]">
              <div className="flex items-center gap-4">
                <span className="font-bold text-sky-400 border-b-2 border-sky-400 pb-1 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>TERMINAL (bash / powershell)</span>
                </span>
                <span className="text-slate-500 hover:text-slate-400 cursor-pointer">OUTPUT</span>
                <span className="text-slate-500 hover:text-slate-400 cursor-pointer">DEBUG CONSOLE</span>
                <span className="text-slate-500 hover:text-slate-400 cursor-pointer">PROBLEMS (0)</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                1: bash / node
              </span>
            </div>

            {/* Terminal Live Output Simulation */}
            <div className="space-y-3 py-2 text-xs">
              {commands.map((item, idx) => (
                <div key={item.step} className="bg-black/60 rounded-xl p-3 border border-slate-800 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black text-[11px] flex items-center justify-center">
                        {item.step}
                      </span>
                      <span className="text-slate-400 text-xs">{item.desc}:</span>
                    </div>

                    <button
                      onClick={() => handleCopy(item.cmd, idx)}
                      className="flex items-center gap-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Command</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-emerald-400 bg-slate-950 px-3 py-2 rounded-lg border border-slate-900">
                    <span className="text-sky-400 select-none">msprinters&gt;</span>
                    <span className="font-bold text-white selection:bg-amber-500 selection:text-black">{item.cmd}</span>
                    <CornerDownLeft className="w-3.5 h-3.5 text-slate-500 ml-auto" />
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono pl-2 border-l border-slate-800 whitespace-pre-line">
                    {item.output}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FINAL STEP: Hostinger Deploy Button */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
          <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold">2</div>
          <span>चरण 2: GitHub पुश के बाद Hostinger में 1 बटन दबाएं</span>
        </div>

        <div className="text-xs text-slate-300 space-y-2">
          <p>
            जैसे ही आप ऊपर के 3 कमांड्स चलाकर GitHub पर कोड भेज देते हैं:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">1. लॉगिन करें</span>
              <span>Hostinger hPanel खोलें और msprinter.in पर जाएं</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">2. Git खोलें</span>
              <span>Advanced ➔ Git पर क्लिक करें</span>
            </div>
            <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-500/40 text-emerald-300">
              <span className="text-emerald-400 font-bold block mb-1">3. डिप्लॉय करें</span>
              <span>"Deploy" या "Pull Latest" बटन दबाएं!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
