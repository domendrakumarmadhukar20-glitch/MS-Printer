/**
 * MS PRINTERS — Razorpay & Real UPI Payment Gateway Service
 * Handles Razorpay Checkout SDK, NPCI UPI QR standards, and Real Trial execution
 */

export interface RazorpayConfig {
  keyId: string;
  keySecret?: string;
  merchantName: string;
  themeColor: string;
  isLiveMode: boolean;
  webhookSecret?: string;
  merchantUpiId: string;      // e.g. "domendrakumarmadhukar20@okaxis" or "9876543210@paytm"
  merchantUpiName: string;    // e.g. "MS PRINTERS"
}

const DEFAULT_CONFIG: RazorpayConfig = {
  keyId: '',
  merchantName: 'MS PRINTERS — Any Time Print',
  themeColor: '#f59e0b', // Amber-500
  isLiveMode: false,
  merchantUpiId: 'msprinters@upi',
  merchantUpiName: 'MS PRINTERS',
};

const STORAGE_KEY = 'msprinters_razorpay_config';

export function getRazorpayConfig(): RazorpayConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_CONFIG;
}

export function saveRazorpayConfig(config: Partial<RazorpayConfig>): RazorpayConfig {
  const current = getRazorpayConfig();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

/**
 * Checks whether user has entered a valid, non-placeholder Razorpay API Key ID
 */
export function hasValidRazorpayKey(config?: RazorpayConfig): boolean {
  const cfg = config || getRazorpayConfig();
  const cleanKey = (cfg.keyId || '').trim();
  if (!cleanKey) return false;
  if (cleanKey.includes('MSPrinters2026')) return false;
  return cleanKey.startsWith('rzp_live_') || cleanKey.startsWith('rzp_test_');
}

/**
 * Dynamically loads the official Razorpay Checkout SDK script
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('[Razorpay] Failed to load official checkout script from CDN');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface RazorpayPaymentPayload {
  amountInINR: number;
  orderId: string;
  jobId: string;
  description: string;
  studentName?: string;
  studentPhone?: string;
  studentEmail?: string;
  onSuccess: (paymentId: string, orderId: string, signature?: string) => void;
  onFailure: (errorMessage: string) => void;
  onTrialRequested?: () => void;
}

/**
 * Opens Razorpay modal if live/test key is present, or returns friendly guide for trial / QR
 */
export async function openRazorpayCheckout(payload: RazorpayPaymentPayload): Promise<void> {
  const config = getRazorpayConfig();
  const isKeyConfigured = hasValidRazorpayKey(config);

  if (!isKeyConfigured) {
    // Provide a non-blocking graceful notice advising UPI QR or Real Trial bypass
    payload.onFailure('Razorpay Gateway Key अभी सेट नहीं है। आप सीधे UPI QR कोड स्कैन करके पेमेंट कर सकते हैं, या रियल ट्रायल के लिए "⚡ 1-क्लिक रियल ट्रायल पास करें" दबाएं।');
    return;
  }

  const scriptLoaded = await loadRazorpayScript();
  const amountInPaise = Math.round(payload.amountInINR * 100);

  if (scriptLoaded && (window as any).Razorpay && config.keyId) {
    try {
      const options = {
        key: config.keyId,
        amount: amountInPaise,
        currency: 'INR',
        name: config.merchantName,
        description: payload.description,
        image: 'https://msprinter.in/favicon.ico',
        order_id: payload.orderId.startsWith('order_') ? payload.orderId : undefined,
        handler: function (response: any) {
          payload.onSuccess(
            response.razorpay_payment_id || `pay_${Date.now()}`,
            response.razorpay_order_id || payload.orderId,
            response.razorpay_signature
          );
        },
        prefill: {
          name: payload.studentName || 'Student',
          contact: payload.studentPhone || '9876543210',
          email: payload.studentEmail || 'student@msprinter.in',
        },
        notes: {
          kiosk_job_id: payload.jobId,
          service: 'MS_PRINTERS_ATP',
        },
        theme: {
          color: config.themeColor,
          backdrop_color: '#020617',
        },
        modal: {
          ondismiss: function () {
            payload.onFailure('भुगतान रद्द किया गया (Payment was cancelled). आप UPI QR कोड या रियल ट्रायल का उपयोग कर सकते हैं।');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        payload.onFailure(response.error?.description || 'Razorpay भुगतान प्रोसेस नहीं हो सका');
      });
      rzp.open();
      return;
    } catch (err: any) {
      console.warn('[Razorpay] Checkout modal invocation error:', err);
      payload.onFailure(err?.message || 'Razorpay Checkout शुरू नहीं हो सका। कृपया UPI QR कोड का उपयोग करें।');
    }
  } else {
    payload.onFailure('Razorpay Checkout SDK लोड नहीं हो सका। कृपया UPI QR कोड द्वारा भुगतान करें या रियल ट्रायल पास करें।');
  }
}

/**
 * Builds standard NPCI compliant UPI URL for QR code & mobile intent
 * Format: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE
 */
export function buildUpiIntentUrl(
  amount: number,
  orderId: string,
  payeeVpa?: string,
  merchantName?: string
): string {
  const config = getRazorpayConfig();
  const vpa = (payeeVpa || config.merchantUpiId || 'msprinters@upi').trim();
  const name = (merchantName || config.merchantUpiName || 'MS PRINTERS').trim();
  const cleanOrderId = orderId.replace(/[^a-zA-Z0-9_-]/g, '').slice(-10);

  const params = new URLSearchParams();
  params.set('pa', vpa);
  params.set('pn', name);
  params.set('am', amount.toFixed(2));
  params.set('cu', 'INR');
  params.set('tn', `Print-${cleanOrderId}`);

  return `upi://pay?${params.toString()}`;
}

export interface UpiAppOption {
  id: string;
  name: string;
  iconColor: string;
  schemeUrl: string;
  description: string;
}

/**
 * Generates app-specific deep links for PhonePe, Google Pay, Paytm, and BHIM
 */
export function getAppSpecificUpiLinks(
  amount: number,
  orderId: string,
  payeeVpa?: string,
  merchantName?: string
): UpiAppOption[] {
  const config = getRazorpayConfig();
  const vpa = (payeeVpa || config.merchantUpiId || 'msprinters@upi').trim();
  const name = (merchantName || config.merchantUpiName || 'MS PRINTERS').trim();
  const cleanOrderId = orderId.replace(/[^a-zA-Z0-9_-]/g, '').slice(-10);

  const baseQuery = new URLSearchParams({
    pa: vpa,
    pn: name,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: `Print-${cleanOrderId}`
  }).toString();

  return [
    {
      id: 'phonepe',
      name: 'PhonePe',
      iconColor: '#5f259f',
      schemeUrl: `phonepe://pay?${baseQuery}`,
      description: 'PhonePe ऐप में तुरंत खोलें'
    },
    {
      id: 'gpay',
      name: 'Google Pay',
      iconColor: '#4285F4',
      schemeUrl: `tez://upi/pay?${baseQuery}`,
      description: 'Google Pay (Tez) में खोलें'
    },
    {
      id: 'paytm',
      name: 'Paytm',
      iconColor: '#00b9f5',
      schemeUrl: `paytmmp://pay?${baseQuery}`,
      description: 'Paytm Wallet & UPI में खोलें'
    },
    {
      id: 'bhim',
      name: 'BHIM / All UPI',
      iconColor: '#00843D',
      schemeUrl: `upi://pay?${baseQuery}`,
      description: 'कोई भी इंस्टॉल किया हुआ UPI ऐप'
    }
  ];
}
