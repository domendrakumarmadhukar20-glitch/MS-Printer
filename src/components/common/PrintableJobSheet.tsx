import React, { useEffect, useState } from 'react';
import { PrintJob, KioskMachine } from '../../types';
import { BRAND_CONFIG } from '../../config/branding';

interface PrintableJobSheetProps {
  job?: PrintJob | null;
  machine?: KioskMachine | null;
  uploadedFile?: {
    name: string;
    size: number;
    pageCount: number;
    hash?: string;
  } | null;
  uploadedRawFile?: File | null;
  selectedPages?: number[];
}

export const PrintableJobSheet: React.FC<PrintableJobSheetProps> = ({
  job,
  machine,
  uploadedFile,
  uploadedRawFile,
  selectedPages = [1],
}) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (uploadedRawFile && uploadedRawFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(uploadedRawFile);
      setImagePreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImagePreviewUrl(null);
    }
  }, [uploadedRawFile]);

  const machineId = machine?.id || job?.machine_id || 'ATP-ABC-001';
  const location = machine?.location || 'Engineering Block Kiosk';
  const printerModel = machine?.printerModel || 'HP LaserJet Pro MFP / Network Printer';
  const jobId = job?.job_id || 'ATP-TRIAL-' + Date.now();
  const paymentId = job?.payment_id || 'PAY_UPI_VERIFIED_AUTOPRINT';
  const amount = job?.amount ? `₹${job.amount.toFixed(2)}` : '₹2.00';
  const fileName = uploadedFile?.name || job?.file_name || 'ATP_Hardware_Calibration_Sheet.pdf';

  return (
    <div id="printable-document" className="hidden print:block text-black bg-white p-6 font-sans">
      <div className="border-4 border-black p-6 rounded-lg max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">{BRAND_CONFIG.brandName}</h1>
            <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
              {BRAND_CONFIG.serviceName} • HARDWARE TEST & CALIBRATION SHEET
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs font-bold">DATE: {new Date().toLocaleDateString('en-IN')}</p>
            <p className="font-mono text-xs">TIME: {new Date().toLocaleTimeString('en-IN')}</p>
            <span className="inline-block mt-1 bg-black text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
              PAID & VERIFIED ✓
            </span>
          </div>
        </div>

        {/* Uploaded Image Print Content (If user uploaded a photo/image) */}
        {imagePreviewUrl && (
          <div className="border-2 border-dashed border-gray-400 p-2 my-2 text-center rounded">
            <p className="text-[10px] font-mono text-gray-500 mb-1">UPLOADED DOCUMENT IMAGE:</p>
            <img 
              src={imagePreviewUrl} 
              alt="Uploaded document to print" 
              className="max-h-[500px] max-w-full mx-auto object-contain"
            />
          </div>
        )}

        {/* Job & Hardware Parameters Table */}
        <div className="grid grid-cols-2 gap-2 bg-gray-100 p-4 border border-gray-400 rounded text-xs font-mono">
          <div>
            <p><strong>KIOSK ID:</strong> {machineId}</p>
            <p><strong>LOCATION:</strong> {location}</p>
            <p><strong>PRINTER MODEL:</strong> {printerModel}</p>
            <p><strong>PAPER FEED:</strong> A4 Standard 75 GSM</p>
          </div>
          <div>
            <p><strong>JOB REFERENCE:</strong> {jobId}</p>
            <p><strong>PAYMENT REF:</strong> {paymentId}</p>
            <p><strong>AMOUNT PAID:</strong> {amount}</p>
            <p><strong>SELECTED PAGES:</strong> {selectedPages.join(', ')}</p>
          </div>
        </div>

        {/* Machine Physical Address & Google Maps Location Link */}
        {machine?.address && (
          <div className="bg-amber-50/80 border border-amber-300 p-2.5 rounded text-[11px] font-mono">
            <p><strong>मशीन का पता (KIOSK ADDRESS):</strong> {machine.address}</p>
            {machine.googleMapsUrl && (
              <p className="text-[10px] text-gray-700 truncate mt-0.5">
                <strong>GOOGLE MAPS LINK:</strong> {machine.googleMapsUrl}
              </p>
            )}
            {machine.landmark && (
              <p className="text-[10px] text-gray-600 mt-0.5">
                <strong>LANDMARK:</strong> {machine.landmark}
              </p>
            )}
          </div>
        )}

        {/* Verification & Alignment Grid */}
        <div className="space-y-2 border border-gray-300 p-3 rounded">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-xs uppercase">✓ AUTOMATIC HARDWARE TRIGGER CONFIRMED</h2>
            <span className="font-mono text-[10px] bg-green-100 text-green-900 border border-green-600 px-2 py-0.5 rounded font-bold">
              PRINT STATUS: DISPATCHED
            </span>
          </div>
          <p className="text-[11px] text-gray-700 leading-relaxed">
            यह रसीद और टेस्ट पेज प्रमाणित करता है कि Any Time Print (ATP) ऑटोमैटिक हार्डवेयर स्पूलर और पेमेंट गेटवे पूरी तरह कार्यरत हैं। भुगतान प्राप्त होते ही यह प्रिंट कमांड स्वतः निष्पादित (Auto-Executed) की गई है।
          </p>
          <p className="text-[10px] font-mono text-gray-600">
            FILE: {fileName}
          </p>
        </div>

        {/* Alignment Calibration Marks */}
        <div className="flex justify-between items-center text-[10px] font-mono border-t border-gray-300 pt-3 text-gray-500">
          <span>[+] TOP-LEFT ALIGN</span>
          <span>CENTER MARGIN OK</span>
          <span>[+] TOP-RIGHT ALIGN</span>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-dashed border-gray-400 pt-3 flex justify-between items-center text-[10px] text-gray-600 font-mono">
          <span>Official Domain: {BRAND_CONFIG.domain}</span>
          <span>Universal Spooler v2.6 • Auto-Print Verified</span>
        </div>
      </div>
    </div>
  );
};
