import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Eye, 
  X, 
  ZoomIn, 
  CheckSquare, 
  Square, 
  Layers, 
  FileText, 
  Sliders, 
  ArrowRight,
  Maximize2,
  Sparkles
} from 'lucide-react';

interface PagePreviewSelectorProps {
  totalPages: number;
  selectedPages: number[];
  onChange: (selected: number[]) => void;
  lang: 'EN' | 'HI';
  documentName: string;
}

export const PagePreviewSelector: React.FC<PagePreviewSelectorProps> = ({
  totalPages,
  selectedPages,
  onChange,
  lang,
  documentName
}) => {
  const [activeModalPage, setActiveModalPage] = useState<number | null>(null);
  const [customRangeText, setCustomRangeText] = useState<string>('');
  const [selectionMode, setSelectionMode] = useState<'ALL' | 'CUSTOM' | 'ODD' | 'EVEN'>('ALL');

  // Convert selected page array into human-readable string (e.g. "1, 3, 5-7")
  const formatRangeString = (pages: number[]): string => {
    if (pages.length === 0) return '';
    const sorted = [...pages].sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i <= sorted.length; i++) {
      if (i < sorted.length && sorted[i] === prev + 1) {
        prev = sorted[i];
      } else {
        if (start === prev) {
          ranges.push(`${start}`);
        } else {
          ranges.push(`${start}-${prev}`);
        }
        if (i < sorted.length) {
          start = sorted[i];
          prev = sorted[i];
        }
      }
    }
    return ranges.join(', ');
  };

  // Parse custom range text (e.g. "1, 3, 5-8") into page numbers
  const parseRangeString = (text: string, max: number): number[] => {
    const parts = text.split(',').map(p => p.trim()).filter(Boolean);
    const set = new Set<number>();

    for (const part of parts) {
      if (part.includes('-')) {
        const [rawStart, rawEnd] = part.split('-').map(s => parseInt(s.trim(), 10));
        if (!isNaN(rawStart) && !isNaN(rawEnd)) {
          const start = Math.max(1, Math.min(rawStart, rawEnd));
          const end = Math.min(max, Math.max(rawStart, rawEnd));
          for (let p = start; p <= end; p++) {
            set.add(p);
          }
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num >= 1 && num <= max) {
          set.add(num);
        }
      }
    }
    return Array.from(set).sort((a, b) => a - b);
  };

  // Sync range text when selectedPages changes
  useEffect(() => {
    setCustomRangeText(formatRangeString(selectedPages));
  }, [selectedPages]);

  // Toggle single page
  const togglePage = (pageNum: number) => {
    if (selectedPages.includes(pageNum)) {
      if (selectedPages.length === 1) {
        // Keep at least one page selected
        return;
      }
      onChange(selectedPages.filter(p => p !== pageNum));
    } else {
      onChange([...selectedPages, pageNum].sort((a, b) => a - b));
    }
    setSelectionMode('CUSTOM');
  };

  // Presets
  const selectAll = () => {
    const all = Array.from({ length: totalPages }, (_, i) => i + 1);
    onChange(all);
    setSelectionMode('ALL');
  };

  const selectNone = () => {
    onChange([1]); // Minimum 1 page
    setSelectionMode('CUSTOM');
  };

  const selectOdd = () => {
    const odd = Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p % 2 !== 0);
    onChange(odd);
    setSelectionMode('ODD');
  };

  const selectEven = () => {
    const even = Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p % 2 === 0);
    onChange(even.length > 0 ? even : [1]);
    setSelectionMode('EVEN');
  };

  const handleCustomRangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomRangeText(val);
    const parsed = parseRangeString(val, totalPages);
    if (parsed.length > 0) {
      onChange(parsed);
      setSelectionMode('CUSTOM');
    }
  };

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header and Quick Counters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-bold text-white">
              {lang === 'EN' ? 'Select Pages to Print (Tick / Checkbox)' : 'प्रिंट करने के लिए पेज चुनें (टिक लगाएं)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {lang === 'EN' 
              ? 'Click each page thumbnail or tick the checkbox to select/deselect'
              : 'पेज पर क्लिक करके या बॉक्स में टिक लगाकर मनपसंद पेज चुनें'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full">
            {selectedPages.length} / {totalPages} {lang === 'EN' ? 'Pages' : 'पेज चयनित'}
          </span>
        </div>
      </div>

      {/* Preset Filter Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <button
          type="button"
          onClick={selectAll}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            selectedPages.length === totalPages
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {lang === 'EN' ? 'All Pages' : 'सभी पेज'} ({totalPages})
        </button>

        <button
          type="button"
          onClick={selectOdd}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            selectionMode === 'ODD'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {lang === 'EN' ? 'Odd Only (1, 3, 5...)' : 'विषम पेज (1, 3, 5...)'}
        </button>

        <button
          type="button"
          onClick={selectEven}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            selectionMode === 'EVEN'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {lang === 'EN' ? 'Even Only (2, 4, 6...)' : 'सम पेज (2, 4, 6...)'}
        </button>

        <button
          type="button"
          onClick={selectNone}
          className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-rose-400 bg-slate-900/60 border border-slate-800/80 transition-all text-[11px]"
        >
          {lang === 'EN' ? 'Reset' : 'रीसेट'}
        </button>
      </div>

      {/* Custom Range Input Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 shrink-0">
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'EN' ? 'Custom Range:' : 'कस्टम रेंज:'}</span>
        </label>
        <div className="flex-1 min-w-[180px]">
          <input
            type="text"
            value={customRangeText}
            onChange={handleCustomRangeInput}
            placeholder="उदा. 1, 3, 5-8"
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
          />
        </div>
        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
          {lang === 'EN' ? 'e.g. 1-3, 5' : 'उदा: 1-3, 5'}
        </span>
      </div>

      {/* Visual Page Thumbnails Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1 py-1 custom-scrollbar">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
          const isSelected = selectedPages.includes(pageNum);

          return (
            <div
              key={pageNum}
              onClick={() => togglePage(pageNum)}
              className={`relative rounded-xl border-2 p-2.5 cursor-pointer transition-all flex flex-col justify-between select-none group ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/15'
                  : 'bg-slate-950/80 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
              }`}
            >
              {/* Top Header of Thumbnail: Page Number and Checkbox */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${
                  isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                }`}>
                  P.{pageNum}
                </span>

                {/* Prominent Checkbox (टिक बॉक्स) */}
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black shadow'
                      : 'border-slate-600 bg-slate-900 group-hover:border-slate-400'
                  }`}
                  title={isSelected ? 'क्लिक करके हटाएं' : 'क्लिक करके टिक लगाएं'}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>

              {/* Simulated Page Content Thumbnail */}
              <div className="w-full aspect-[3/4] bg-white rounded-lg p-2 text-slate-900 shadow-inner flex flex-col justify-between overflow-hidden relative border border-slate-200">
                <div className="space-y-1">
                  {/* Document Header Line */}
                  <div className="flex items-center justify-between text-[7px] text-slate-400 font-mono border-b border-slate-100 pb-0.5">
                    <span className="truncate max-w-[60px]">{documentName.split('.')[0]}</span>
                    <span>#{pageNum}</span>
                  </div>

                  {/* Simulated Title */}
                  <div className="h-1.5 bg-slate-800 rounded w-4/5 mt-1"></div>

                  {/* Simulated Paragraph Lines */}
                  <div className="space-y-0.5 pt-0.5">
                    <div className="h-1 bg-slate-300 rounded w-full"></div>
                    <div className="h-1 bg-slate-300 rounded w-11/12"></div>
                    <div className="h-1 bg-slate-300 rounded w-4/5"></div>
                    <div className="h-1 bg-slate-200 rounded w-full"></div>
                  </div>

                  {/* Simulated Diagram or Subheading */}
                  {pageNum % 2 === 0 ? (
                    <div className="h-6 bg-slate-100 rounded border border-slate-200 flex items-center justify-center mt-1">
                      <span className="text-[6px] text-slate-500 font-mono">DIAGRAM / TABLE</span>
                    </div>
                  ) : (
                    <div className="space-y-0.5 pt-1">
                      <div className="h-1 bg-slate-300 rounded w-full"></div>
                      <div className="h-1 bg-slate-300 rounded w-3/4"></div>
                    </div>
                  )}
                </div>

                {/* Footer simulation */}
                <div className="text-[6px] text-slate-400 text-center font-mono border-t border-slate-100 pt-0.5">
                  Page {pageNum} of {totalPages}
                </div>

                {/* Overlay Zoom Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModalPage(pageNum);
                  }}
                  className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-bold"
                  title="बड़ा करके देखें"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px]">Preview</span>
                </button>
              </div>

              {/* Bottom selection indicator */}
              <div className="mt-2 text-center text-[10px] font-bold">
                {isSelected ? (
                  <span className="text-emerald-400 flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>{lang === 'EN' ? 'Selected' : 'चयनित'}</span>
                  </span>
                ) : (
                  <span className="text-slate-500">{lang === 'EN' ? 'Tap to print' : 'क्लिक करें'}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Large Page Preview Modal */}
      {activeModalPage !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveModalPage(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-sm border border-amber-500/30">
                  {activeModalPage}
                </span>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {documentName} — Page {activeModalPage}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    High Resolution Page Inspection Preview
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModalPage(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Page Sheet Display */}
            <div className="bg-white rounded-2xl p-6 text-slate-900 shadow-2xl aspect-[3/4] flex flex-col justify-between border border-slate-300 overflow-y-auto max-h-[460px]">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-500 border-b pb-2 font-mono">
                  <span>{documentName}</span>
                  <span>Page {activeModalPage} of {totalPages}</span>
                </div>

                <div className="h-4 bg-slate-800 rounded w-2/3"></div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="h-2.5 bg-slate-200 rounded w-full"></div>
                  <div className="h-2.5 bg-slate-200 rounded w-11/12"></div>
                  <div className="h-2.5 bg-slate-200 rounded w-4/5"></div>
                  <div className="h-2.5 bg-slate-200 rounded w-full"></div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 my-4 space-y-2">
                  <div className="h-3 bg-amber-500/40 rounded w-1/2"></div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                    MS PRINTERS Commercial Kiosk Engine • Document Content Inspection Enclave.
                    High quality 600x600 DPI vector output generated for HP LaserJet Pro MFP M126nw.
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="h-2.5 bg-slate-200 rounded w-full"></div>
                  <div className="h-2.5 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-2.5 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 border-t pt-3 font-mono">
                Printed via MS PRINTERS Any Time Print (ATP) Kiosk — msprinter.in
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  togglePage(activeModalPage);
                  setActiveModalPage(null);
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  selectedPages.includes(activeModalPage)
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400'
                }`}
              >
                {selectedPages.includes(activeModalPage) ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>{lang === 'EN' ? 'Remove this page from Print' : 'इस पेज को हटाएं'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{lang === 'EN' ? 'Tick & Select this Page' : 'इस पेज पर टिक लगाएं'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveModalPage(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                {lang === 'EN' ? 'Close' : 'बंद करें'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
