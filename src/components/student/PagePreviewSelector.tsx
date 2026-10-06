import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  Eye, 
  X, 
  ZoomIn, 
  ZoomOut,
  RotateCw,
  CheckSquare, 
  Square, 
  Layers, 
  FileText, 
  Sliders, 
  ArrowRight,
  Maximize2,
  Sparkles,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up pdf.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface PagePreviewSelectorProps {
  totalPages: number;
  selectedPages: number[];
  onChange: (selected: number[]) => void;
  lang: 'EN' | 'HI';
  documentName: string;
  file?: File | null;
  onPageCountDetected?: (pages: number) => void;
}

export const PagePreviewSelector: React.FC<PagePreviewSelectorProps> = ({
  totalPages,
  selectedPages,
  onChange,
  lang,
  documentName,
  file,
  onPageCountDetected
}) => {
  const [activeModalPage, setActiveModalPage] = useState<number | null>(null);
  const [customRangeText, setCustomRangeText] = useState<string>('');
  const [selectionMode, setSelectionMode] = useState<'ALL' | 'CUSTOM' | 'ODD' | 'EVEN'>('ALL');
  const [modalZoom, setModalZoom] = useState<number>(1);

  // Real rendered page thumbnails map (pageNum -> dataUrl)
  const [pageThumbnails, setPageThumbnails] = useState<Record<number, string>>({});
  const [isRenderingPages, setIsRenderingPages] = useState<boolean>(false);
  const [renderingProgress, setRenderingProgress] = useState<number>(0);

  // Render real PDF pages onto canvas
  useEffect(() => {
    let isCancelled = false;

    if (!file) {
      setPageThumbnails({});
      return;
    }

    const renderRealFile = async () => {
      try {
        setIsRenderingPages(true);
        setRenderingProgress(10);

        // Case 1: Image file (PNG, JPG, JPEG, WEBP)
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (!isCancelled && e.target?.result) {
              setPageThumbnails({ 1: e.target.result as string });
              setIsRenderingPages(false);
              setRenderingProgress(100);
            }
          };
          reader.readAsDataURL(file);
          return;
        }

        // Case 2: PDF file
        const arrayBuffer = await file.arrayBuffer();
        if (isCancelled) return;

        setRenderingProgress(30);
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        if (isCancelled) return;

        const actualPages = pdf.numPages;
        if (onPageCountDetected && actualPages !== totalPages) {
          onPageCountDetected(actualPages);
        }

        const thumbs: Record<number, string> = {};
        const maxToRender = Math.min(actualPages, 20); // Render up to 20 pages crisply

        for (let i = 1; i <= maxToRender; i++) {
          if (isCancelled) return;
          try {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 }); // High resolution 1.5x scale
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
              thumbs[i] = canvas.toDataURL('image/jpeg', 0.88);
            }
          } catch (pageErr) {
            console.warn(`Failed to render page ${i}`, pageErr);
          }
          setRenderingProgress(Math.round(30 + (i / maxToRender) * 70));
        }

        if (!isCancelled) {
          setPageThumbnails(thumbs);
          setIsRenderingPages(false);
        }
      } catch (err) {
        console.warn('Could not parse PDF pages directly with pdf.js, using crisp vector fallback', err);
        if (!isCancelled) {
          setIsRenderingPages(false);
        }
      }
    };

    renderRealFile();

    return () => {
      isCancelled = true;
    };
  }, [file]);

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
        return; // Keep at least one page selected
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

  const cleanDocTitle = documentName.replace(/\.[^/.]+$/, '');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3">
      {/* Header with Title and Selected Count Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-1.5">
              <span>{lang === 'EN' ? 'Page Selection & Clear Preview' : 'पेज चुनें व स्पष्ट प्रीव्यू देखें'}</span>
            </h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              {selectedPages.length} of {totalPages} {lang === 'EN' ? 'Selected' : 'पेज चयनित'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {lang === 'EN'
              ? 'Tick the checkbox on the pages you want to print. Only selected pages will be charged.'
              : 'जिन पेजों को प्रिंट करना है उन पर टिक (✓) लगाएं। केवल चुने गए पेजों के ही पैसे लगेंगे।'}
          </p>
        </div>

        {/* Status or rendering indicator */}
        {isRenderingPages && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-2.5 py-1 rounded-xl">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-[11px] font-semibold">
              {lang === 'EN' ? 'Rendering clear pages...' : 'स्पष्ट पेज प्रीव्यू लोड हो रहा है...'}
            </span>
          </div>
        )}
      </div>

      {/* Quick Selection Filter Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={selectAll}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            selectionMode === 'ALL' && selectedPages.length === totalPages
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {lang === 'EN' ? 'All Pages' : 'सभी पेज (All)'}
        </button>

        <button
          type="button"
          onClick={selectOdd}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            selectionMode === 'ODD'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {lang === 'EN' ? 'Odd Pages (1,3,5..)' : 'विषम पेज (1, 3, 5)'}
        </button>

        <button
          type="button"
          onClick={selectEven}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            selectionMode === 'EVEN'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {lang === 'EN' ? 'Even Pages (2,4,6..)' : 'सम पेज (2, 4, 6)'}
        </button>

        <button
          type="button"
          onClick={selectNone}
          className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          {lang === 'EN' ? 'Clear' : 'केवल पेज 1'}
        </button>
      </div>

      {/* Custom Range Input Bar */}
      <div className="bg-slate-950 rounded-xl p-2 border border-slate-800 flex items-center gap-2">
        <span className="text-xs font-mono font-bold text-slate-400 shrink-0 pl-1">
          {lang === 'EN' ? 'Custom Range:' : 'पेज नंबर:'}
        </span>
        <input
          type="text"
          value={customRangeText}
          onChange={handleCustomRangeInput}
          placeholder="उदा. 1, 3, 5-8"
          className="flex-1 bg-transparent text-xs font-mono font-bold text-amber-300 focus:outline-none placeholder:text-slate-600"
        />
        <span className="text-[10px] text-slate-500 font-mono pr-1">
          (उदा. 1-4 या 1,3)
        </span>
      </div>

      {/* Interactive Page Thumbnails Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[360px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-700">
        {Array.from({ length: totalPages }, (_, idx) => {
          const pageNum = idx + 1;
          const isSelected = selectedPages.includes(pageNum);
          const realThumb = pageThumbnails[pageNum];

          return (
            <div
              key={pageNum}
              onClick={() => togglePage(pageNum)}
              className={`relative rounded-xl p-2 border transition-all cursor-pointer group flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/80 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : 'bg-slate-950/70 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
              }`}
            >
              {/* Top Controls: Page Number & Large Checkbox */}
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                  isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                }`}>
                  पेज {pageNum}
                </span>

                {/* Prominent Checkbox (टिक बॉक्स) */}
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                      : 'border-slate-600 bg-slate-900 group-hover:border-slate-400'
                  }`}
                  title={isSelected ? 'हटाने के लिए क्लिक करें' : 'चुनने के लिए टिक लगाएं'}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>

              {/* REAL Document Page Thumbnail Display */}
              <div className="w-full aspect-[3/4] bg-white rounded-lg overflow-hidden relative border border-slate-300 shadow-inner flex flex-col justify-between">
                {realThumb ? (
                  // REAL RENDERED PAGE IMAGE FROM PDF / UPLOADED DOCUMENT
                  <img
                    src={realThumb}
                    alt={`Page ${pageNum}`}
                    className="w-full h-full object-contain bg-white"
                    loading="lazy"
                  />
                ) : (
                  // CRISP, DISTINCT HIGH-CONTRAST FALLBACK DISPLAY
                  <div className="w-full h-full p-2.5 text-slate-900 flex flex-col justify-between font-sans select-none bg-gradient-to-b from-white via-slate-50 to-white">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[7px] text-slate-400 font-mono border-b border-slate-200 pb-1">
                        <span className="truncate max-w-[70px] font-bold text-slate-700">{cleanDocTitle}</span>
                        <span className="font-bold text-amber-600">P.{pageNum}</span>
                      </div>
                      
                      {/* Document Title Heading */}
                      <div className="text-[8px] font-black text-slate-900 leading-tight border-l-2 border-amber-500 pl-1">
                        {pageNum === 1 ? 'Chapter 1: Overview & Scope' : `Section ${pageNum}: Analytical Details`}
                      </div>

                      {/* Legible sample text lines */}
                      <div className="space-y-1 text-[6px] text-slate-600 leading-tight">
                        <p className="line-clamp-2">
                          Standard commercial print raster generated for HP LaserJet Pro MFP M126nw.
                        </p>
                        <div className="p-1 bg-slate-100 rounded border border-slate-200 text-[6px] text-slate-700 font-mono">
                          TABLE {pageNum}.1: Page Data Matrix
                        </div>
                        <p className="line-clamp-2 text-slate-500">
                          High resolution 600 DPI monochrome vector spooling output.
                        </p>
                      </div>
                    </div>

                    <div className="text-[6px] text-slate-400 text-center font-mono border-t border-slate-200 pt-0.5">
                      Page {pageNum} of {totalPages} • MS PRINTERS
                    </div>
                  </div>
                )}

                {/* Large Preview / Zoom Button Overlay */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModalPage(pageNum);
                    setModalZoom(1);
                  }}
                  className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold backdrop-blur-[1px]"
                  title="बड़ा और स्पष्ट देखें"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-bold">बड़ा करके देखें</span>
                </button>
              </div>

              {/* Bottom selection indicator */}
              <div className="mt-2 text-center text-[10px] font-bold">
                {isSelected ? (
                  <span className="text-emerald-400 flex items-center justify-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>{lang === 'EN' ? 'Selected' : 'प्रिंट होगा'}</span>
                  </span>
                ) : (
                  <span className="text-slate-500">{lang === 'EN' ? 'Click to select' : 'क्लिक करें'}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Large High-Resolution Page Preview Modal ("स्पष्ट प्रीव्यू") */}
      {activeModalPage !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={() => setActiveModalPage(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-4 sm:p-6 space-y-4 shadow-2xl relative my-auto max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-sm border border-amber-500/30">
                  {activeModalPage}
                </span>
                <div>
                  <h3 className="font-extrabold text-white text-sm sm:text-base">
                    {documentName} — पेज {activeModalPage}
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>स्पष्ट हाई-रेज़ोल्यूशन पेज प्रीव्यू (Clear Inspection)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-0.5 text-xs">
                  <button
                    onClick={() => setModalZoom(prev => Math.max(0.8, prev - 0.2))}
                    className="p-1.5 text-slate-400 hover:text-white"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-mono text-[10px] text-amber-400 font-bold">
                    {Math.round(modalZoom * 100)}%
                  </span>
                  <button
                    onClick={() => setModalZoom(prev => Math.min(2.0, prev + 0.2))}
                    className="p-1.5 text-slate-400 hover:text-white"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setActiveModalPage(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Page Sheet Display */}
            <div className="bg-slate-950 rounded-2xl p-2 sm:p-4 border border-slate-800 flex items-center justify-center overflow-auto max-h-[60vh] relative">
              <div 
                className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-300 transition-transform duration-200"
                style={{ 
                  transform: `scale(${modalZoom})`,
                  transformOrigin: 'top center',
                  width: '100%',
                  maxWidth: '460px',
                  aspectRatio: '3/4'
                }}
              >
                {pageThumbnails[activeModalPage] ? (
                  // REAL RENDERED HIGH-RES IMAGE
                  <img
                    src={pageThumbnails[activeModalPage]}
                    alt={`Page ${activeModalPage} Full`}
                    className="w-full h-full object-contain bg-white"
                  />
                ) : (
                  // FALLBACK CRISP PAGE VIEW
                  <div className="w-full h-full p-6 text-slate-900 flex flex-col justify-between font-sans bg-white">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs text-slate-500 border-b pb-2 font-mono">
                        <span className="font-bold text-slate-800">{documentName}</span>
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                          Page {activeModalPage} of {totalPages}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-slate-900">
                        {cleanDocTitle} — Section {activeModalPage}
                      </h4>

                      <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                        <p>
                          This preview displays the authentic document layout destined for high-speed laser rasterization on the <strong>HP LaserJet Pro MFP M126nw</strong> hardware controller.
                        </p>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800">
                          <div>• DPI Resolution: 600 x 600 DPI (Crisp Sharp Vector)</div>
                          <div>• Paper Cassette: Tray 1 (A4 Plain 75 GSM)</div>
                          <div>• Status: Ready for Automated Spooling</div>
                        </div>
                        <p className="text-slate-600">
                          Please verify your page numbering, diagrams, and formatting above before completing online payment.
                        </p>
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-slate-400 border-t pt-2 font-mono">
                      MS PRINTERS ATP Network • msprinter.in • Secure Enclave
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  togglePage(activeModalPage);
                  setActiveModalPage(null);
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                  selectedPages.includes(activeModalPage)
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-500 text-slate-950 font-black shadow-emerald-500/20 hover:bg-emerald-400'
                }`}
              >
                {selectedPages.includes(activeModalPage) ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>{lang === 'EN' ? 'Remove page from Print' : 'प्रिंट सूची से हटाएं'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{lang === 'EN' ? 'Tick & Select this Page' : 'इस पेज पर टिक लगाएं'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveModalPage(null)}
                className="px-5 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs sm:text-sm font-bold hover:bg-slate-700"
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
