import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Phone, 
  HelpCircle, 
  RefreshCcw, 
  Truck, 
  ExternalLink,
  CheckCircle2,
  Lock,
  Building2,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';
import { BRAND_CONFIG } from '../../config/branding';

export type PolicyTab = 'ABOUT' | 'CONTACT' | 'PRIVACY' | 'TERMS' | 'REFUND' | 'SHIPPING';

interface RazorpayPoliciesModalProps {
  isOpen: boolean;
  initialTab?: PolicyTab;
  onClose: () => void;
  lang?: 'EN' | 'HI';
}

export const RazorpayPoliciesModal: React.FC<RazorpayPoliciesModalProps> = ({
  isOpen,
  initialTab = 'ABOUT',
  onClose,
  lang = 'HI'
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300">
              MS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white leading-none">
                  {BRAND_CONFIG.brandName}
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Razorpay Verified Merchant
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Official Legal & Regulatory Policies • {BRAND_CONFIG.domain}
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

        {/* Tab Navigation Strip */}
        <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex overflow-x-auto gap-1 text-xs scrollbar-none">
          <button
            onClick={() => setActiveTab('ABOUT')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'ABOUT'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>About Us</span>
          </button>

          <button
            onClick={() => setActiveTab('CONTACT')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'CONTACT'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Contact Us</span>
          </button>

          <button
            onClick={() => setActiveTab('PRIVACY')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'PRIVACY'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('TERMS')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'TERMS'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms & Conditions</span>
          </button>

          <button
            onClick={() => setActiveTab('REFUND')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'REFUND'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Cancellation & Refund</span>
          </button>

          <button
            onClick={() => setActiveTab('SHIPPING')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'SHIPPING'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Shipping / Delivery</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed max-h-[60vh]">
          {/* 1. ABOUT US */}
          {activeTab === 'ABOUT' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                <h4 className="text-sm font-bold text-amber-400 mb-1 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>About MS PRINTERS (Any Time Print Kiosk Network)</span>
                </h4>
                <p className="text-slate-300">
                  <strong>MS PRINTERS</strong> is India’s premier automated, self-service smart kiosk printing platform operating under the registered brand domain <strong>msprinter.in</strong>. We bring 24/7 unattended high-speed digital printing to educational institutions, university libraries, hostels, coaching hubs, and public complexes.
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-white text-sm">Our Mission & Technology</h5>
                <p>
                  Traditionally, students lose valuable study time waiting in long queues at local photocopy shops. MS PRINTERS eliminates this friction through our proprietary <strong>Any Time Print (ATP)</strong> architecture:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                  <li><strong>Instant Mobile Touchless Access:</strong> Students simply scan the QR code on the kiosk screen with any smartphone.</li>
                  <li><strong>Live Document & Page Inspector:</strong> Choose specific pages to print with instant thumbnail previews and live price calculations.</li>
                  <li><strong>Seamless Online Payments:</strong> Integrated with Razorpay Gateway supporting UPI (Google Pay, PhonePe, Paytm, BHIM), Debit/Credit Cards, and Net Banking.</li>
                  <li><strong>High-Speed Laser Output:</strong> Automated hardware integration with HP LaserJet Pro MFP commercial laser hardware dispensing fresh prints in under 15 seconds.</li>
                </ul>

                <h5 className="font-bold text-white text-sm pt-2">Operational Scope</h5>
                <p>
                  Every kiosk unit is equipped with battery UPS backup, automated paper-tray stock auditing (500 sheet capacity), thermal management, and an interactive digital notice board for academic announcements.
                </p>
              </div>
            </div>
          )}

          {/* 2. CONTACT US */}
          {activeTab === 'CONTACT' && (
            <div className="space-y-4">
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>Customer Support & Grievance Contact</span>
                </h4>
                <p className="text-slate-400 text-xs">
                  For payment queries, print receipt assistance, refund claims, or kiosk technical support, please contact us through any of the channels below:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email Support
                    </span>
                    <p className="font-mono font-bold text-white select-all">
                      domendrakumarmadhukar20@gmail.com
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Average response time: &lt; 2 Hours
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Helpline / WhatsApp
                    </span>
                    <p className="font-mono font-bold text-white select-all">
                      +91 98765 43210 / +91 79870 00000
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Mon - Sat: 8:00 AM – 10:00 PM IST
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Operating Registered Address
                  </span>
                  <p className="text-slate-300 font-medium">
                    MS PRINTERS Headquarters, Ground Floor, Central Tech Complex, Near Bilaspur University Road, Bilaspur, Chhattisgarh - 495001, India.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Kiosk Physical Operational Timings
                  </span>
                  <p className="text-slate-300">
                    24 Hours × 7 Days Unattended Automated Printing at all deployed campus kiosk stations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. PRIVACY POLICY */}
          {activeTab === 'PRIVACY' && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-xs">Strict Ephemeral Privacy Guarantee</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Your uploaded notes, assignments, and personal documents are never stored permanently. They are immediately and permanently erased from volatile memory after spooling to the printer.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-white text-xs">1. Information We Collect</h5>
                <p>
                  To fulfill print requests, we collect minimal operational information:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong>Document Metadata:</strong> File name, file size, and page count for pricing calculations.</li>
                  <li><strong>Contact Details:</strong> Student name and mobile number (optional) solely for sending digital payment receipts and print order status updates.</li>
                  <li><strong>Transaction Records:</strong> Unique Razorpay Payment ID, date, time, and amount paid for accounting reconciliation.</li>
                </ul>

                <h5 className="font-bold text-white text-xs">2. Payment Security & RBI Compliance</h5>
                <p>
                  MS PRINTERS does not collect, capture, or store your credit/debit card numbers, UPI PINs, CVV codes, or net banking credentials. All payments are securely routed through <strong>Razorpay Software Private Limited</strong>, an RBI-licensed payment aggregator certified under PCI-DSS Level 1 compliance with 256-bit SSL encryption.
                </p>

                <h5 className="font-bold text-white text-xs">3. Third-Party Sharing</h5>
                <p>
                  We strictly do NOT sell, rent, or trade student personal information or document content to advertisers or external commercial third parties.
                </p>
              </div>
            </div>
          )}

          {/* 4. TERMS & CONDITIONS */}
          {activeTab === 'TERMS' && (
            <div className="space-y-4">
              <p className="text-slate-400">
                By scanning the QR code, uploading documents, or making payment at <strong>msprinter.in</strong>, you agree to comply with and be bound by the following Terms & Conditions:
              </p>

              <div className="space-y-3">
                <h5 className="font-bold text-white text-xs">1. Lawful & Permitted Use</h5>
                <p>
                  Users must hold lawful rights, authorization, or fair-use educational privilege for the materials uploaded for printing. Printing of currency, counterfeit certificates, pornographic/obscene content, defamatory materials, or state-restricted classified documents is strictly prohibited.
                </p>

                <h5 className="font-bold text-white text-xs">2. Pricing & Currency</h5>
                <p>
                  All print rates are displayed transparently in Indian Rupees (₹ INR) inclusive of all applicable taxes prior to payment authorization:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-[11px]">
                  <li>A4 Black & White (Single Side): ₹2.00 per page</li>
                  <li>A4 Black & White (Duplex Back-to-Back): ₹3.50 per sheet</li>
                  <li>A4 Full Color: ₹10.00 per page</li>
                </ul>

                <h5 className="font-bold text-white text-xs">3. Machine Availability & Maintenance</h5>
                <p>
                  While our kiosks strive for 99.9% uptime with automated paper tray tracking and UPS battery backup, occasional maintenance, paper replenishment, or network outages may occur. In any event where printing cannot be executed post-payment, our automated refund policy protects the customer.
                </p>
              </div>
            </div>
          )}

          {/* 5. CANCELLATION & REFUND POLICY */}
          {activeTab === 'REFUND' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-start gap-2.5">
                <RefreshCcw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-xs">100% Student Money-Back Guarantee</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    If payment succeeds but the kiosk fails to dispense your complete prints due to paper jam, power outage, or hardware error, you are entitled to a full, instant refund.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-white text-xs">1. Automated System Refunds</h5>
                <p>
                  Our smart agent controller monitors real-time hardware status. If the print spooler detects a paper out, paper jam, or hardware fault within 60 seconds of payment:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>The print job is automatically aborted and flagged as <code>FAILED_REFUND_DUE</code>.</li>
                  <li>An automated refund reversal API call is triggered to Razorpay.</li>
                  <li>Funds are returned directly to the original UPI ID or bank account within 24 to 48 banking hours.</li>
                </ul>

                <h5 className="font-bold text-white text-xs">2. Manual Refund Claims</h5>
                <p>
                  In the rare event where pages are smudged, torn, or partially truncated due to a mechanical issue, students can request a refund within <strong>24 hours</strong>:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-slate-400">
                  <li>Email us at <strong>domendrakumarmadhukar20@gmail.com</strong> or WhatsApp <strong>+91 98765 43210</strong>.</li>
                  <li>Mention your <strong>Job ID</strong> (e.g. <code>JOB-2026-XXXX</code>) and Razorpay Payment ID.</li>
                  <li>Our support representative will audit the kiosk spooler log and issue credit or direct UPI refund within 2 to 4 business hours.</li>
                </ol>

                <h5 className="font-bold text-white text-xs">3. Cancellation Window</h5>
                <p>
                  Because print jobs are instantly dispatched to the laser hardware upon payment verification, cancellation is not possible once the paper feed rollers have engaged. Users may freely cancel or discard orders anytime before clicking "Pay Now".
                </p>
              </div>
            </div>
          )}

          {/* 6. SHIPPING & DELIVERY POLICY */}
          {activeTab === 'SHIPPING' && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 flex items-start gap-2.5">
                <Truck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-xs">Instant On-Spot Physical Delivery</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    MS PRINTERS is a self-service on-premise kiosk system. Printed materials are delivered immediately into the physical output tray at the kiosk location.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-white text-xs">Delivery Timeline & Process</h5>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong>Turnaround Time:</strong> 10 to 30 seconds immediately following Razorpay payment confirmation.</li>
                  <li><strong>Delivery Point:</strong> Physical output tray of the specific kiosk machine (e.g. <code>ATP-ABC-001</code>) where the user initiated the session.</li>
                  <li><strong>No Courier Shipping:</strong> No postal, courier, or third-party home delivery fees apply. The service is entirely dispensed on-site directly to the user.</li>
                </ul>

                <h5 className="font-bold text-white text-xs">Order Completion Notification</h5>
                <p>
                  The kiosk screen chimes audio announcements ("Print Completed, Please Collect Your Sheets") and updates the student’s mobile browser screen with an itemized digital collection receipt.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Compliant with Razorpay Merchant Integration Guidelines</span>
          </div>

          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl transition-all"
          >
            Close Policy Window
          </button>
        </div>
      </div>
    </div>
  );
};
