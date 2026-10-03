/**
 * MS PRINTERS - Central Kiosk & Hardware State Context
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  KioskMachine, 
  PrintJob, 
  PaperTransaction, 
  Advertisement, 
  JobStatus, 
  PrinterStatusCode,
  PricingRule,
  PaperTray 
} from '../types';
import { BRAND_CONFIG } from '../config/branding';
import { soundService } from '../services/soundService';

interface KioskContextType {
  // Current active machine for Kiosk display or mobile view
  currentMachineId: string;
  setCurrentMachineId: (id: string) => void;
  currentMachine: KioskMachine;
  machines: KioskMachine[];
  
  // Jobs
  jobs: PrintJob[];
  createPrintJob: (
    fileData: { name: string; size: number; pageCount: number; hash: string },
    settings: {
      paperSize: 'A4';
      colorMode: 'BW' | 'COLOR';
      duplexMode: 'SINGLE' | 'DUPLEX';
      copies: number;
      selectedPages: 'ALL' | string;
    },
    studentInfo?: { name: string; phone: string }
  ) => { job: PrintJob; paymentOrderId: string };

  calculatePrice: (
    pageCount: number,
    copies: number,
    colorMode: 'BW' | 'COLOR',
    duplexMode: 'SINGLE' | 'DUPLEX'
  ) => { amount: number; sheets: number; ratePerUnit: number };

  verifyPaymentAndAuthorizePrint: (jobId: string, paymentId: string) => Promise<boolean>;
  getJobById: (jobId: string) => PrintJob | undefined;
  cancelOrRefundJob: (jobId: string, reason: string) => void;

  // Paper Tray Management
  addPaperToTray: (machineId: string, sheetsToAdd: number, adminName: string) => { success: boolean; message: string };
  recordPaperWaste: (machineId: string, sheets: number, reason: string, adminName: string) => void;
  adjustPaperStock: (machineId: string, newStock: number, reason: string, adminName: string) => void;
  paperTransactions: PaperTransaction[];

  // Ads CMS
  advertisements: Advertisement[];
  toggleAdActive: (adId: string) => void;
  addAdvertisement: (ad: Omit<Advertisement, 'id' | 'playCount' | 'totalDurationSeconds'>) => void;
  deleteAdvertisement: (adId: string) => void;
  recordAdPlay: (adId: string) => void;

  // Hardware Simulator Controls
  updatePrinterStatus: (machineId: string, status: PrinterStatusCode) => void;
  setCabinetDoor: (machineId: string, closed: boolean) => void;
  setCabinetTemperature: (machineId: string, tempC: number) => void;
  setUpsState: (machineId: string, mainsConnected: boolean, batteryPct: number) => void;
  triggerRemoteTestPrint: (machineId: string) => void;
  restartWindowsAgent: (machineId: string) => void;

  // Agent Simulator Logs
  agentLogs: Array<{ id: string; timestamp: string; level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'; message: string }>;
  clearAgentLogs: () => void;

  // Pricing rules
  pricingRules: PricingRule[];
  updatePricing: (rule: PricingRule) => void;

  // Kiosk UI Interactivity Mode (switches from Ads to QR/Print progress)
  kioskActivityMode: 'ADS' | 'INTERACTIVE' | 'PRINTING' | 'MAINTENANCE';
  setKioskActivityMode: (mode: 'ADS' | 'INTERACTIVE' | 'PRINTING' | 'MAINTENANCE') => void;
  resetKioskIdleTimer: () => void;
}

const INITIAL_MACHINES: KioskMachine[] = [
  {
    id: 'ATP-ABC-001',
    collegeId: 'COLLEGE-ABC',
    collegeName: 'ABC Institute of Technology & Research',
    location: 'Central Library, Ground Floor',
    printerModel: 'HP LaserJet Pro MFP M126nw',
    printerPort: 'USB001 / Spooler HP_M126nw',
    telemetry: {
      internetOnline: true,
      agentOnline: true,
      printerOnline: true,
      printerStatus: 'ONLINE',
      upsBatteryPct: 100,
      upsMainsConnected: true,
      upsLoadWatt: 280,
      cabinetTemperatureC: 34,
      cabinetDoorClosed: true,
      coolingFanActive: true,
      lastHeartbeat: new Date().toISOString(),
    },
    paperTray: {
      id: 'TRAY-01-ABC1',
      machine_id: 'ATP-ABC-001',
      printer_id: 'HP-M126NW-01',
      tray_name: 'Tray 1 (Standard Manual/Auto Feed)',
      paper_size: 'A4',
      paper_type: '75 GSM Plain White Paper',
      maximum_capacity: 500,
      current_stock: 395,
      low_threshold: 100,
      critical_threshold: 25,
      status: 'NORMAL',
      updated_at: new Date().toISOString(),
    },
    activeJobsCount: 0,
    token: 'tok_live_atp_abc_001_sec88f91a',
  },
  {
    id: 'ATP-ABC-002',
    collegeId: 'COLLEGE-ABC',
    collegeName: 'ABC Institute of Technology & Research',
    location: 'Computer Science Dept, 2nd Floor Block B',
    printerModel: 'HP LaserJet Pro MFP M126nw',
    printerPort: '192.168.1.155 (LAN JetDirect)',
    telemetry: {
      internetOnline: true,
      agentOnline: true,
      printerOnline: true,
      printerStatus: 'ONLINE',
      upsBatteryPct: 98,
      upsMainsConnected: true,
      upsLoadWatt: 265,
      cabinetTemperatureC: 36,
      cabinetDoorClosed: true,
      coolingFanActive: true,
      lastHeartbeat: new Date().toISOString(),
    },
    paperTray: {
      id: 'TRAY-01-ABC2',
      machine_id: 'ATP-ABC-002',
      printer_id: 'HP-M126NW-02',
      tray_name: 'Tray 1',
      paper_size: 'A4',
      paper_type: '75 GSM Plain White Paper',
      maximum_capacity: 500,
      current_stock: 450,
      low_threshold: 100,
      critical_threshold: 25,
      status: 'NORMAL',
      updated_at: new Date().toISOString(),
    },
    activeJobsCount: 0,
    token: 'tok_live_atp_abc_002_d892bc0f',
  },
  {
    id: 'ATP-DEL-001',
    collegeId: 'COLLEGE-DEL',
    collegeName: 'Delhi Knowledge Campus',
    location: 'Student Activity Center, Gate 2',
    printerModel: 'HP LaserJet Pro MFP M126nw',
    printerPort: 'USB002',
    telemetry: {
      internetOnline: true,
      agentOnline: true,
      printerOnline: true,
      printerStatus: 'ONLINE',
      upsBatteryPct: 100,
      upsMainsConnected: true,
      upsLoadWatt: 290,
      cabinetTemperatureC: 32,
      cabinetDoorClosed: true,
      coolingFanActive: true,
      lastHeartbeat: new Date().toISOString(),
    },
    paperTray: {
      id: 'TRAY-01-DEL1',
      machine_id: 'ATP-DEL-001',
      printer_id: 'HP-M126NW-03',
      tray_name: 'Tray 1',
      paper_size: 'A4',
      paper_type: '80 GSM Premium Executive Paper',
      maximum_capacity: 500,
      current_stock: 120, // Low alert sample
      low_threshold: 100,
      critical_threshold: 25,
      status: 'NORMAL',
      updated_at: new Date().toISOString(),
    },
    activeJobsCount: 0,
    token: 'tok_live_atp_del_001_99182aac',
  }
];

const INITIAL_ADS: Advertisement[] = [
  {
    id: 'AD-001',
    title: 'Admissions Open 2026-27 — B.Tech & MCA',
    advertiser: 'ABC Institute of Technology',
    tagline: 'NAAC A++ Accredited • 98% Placement Record • Apply Now with 50% Merit Scholarship',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80',
    colorGradient: 'from-blue-900 via-indigo-900 to-slate-900',
    durationSeconds: 12,
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    active: true,
    playCount: 142,
    totalDurationSeconds: 1704,
  },
  {
    id: 'AD-002',
    title: 'GATE & IES 2027 Comprehensive Classroom Batches',
    advertiser: 'Made Easy / Apex Coaching Institute',
    tagline: 'Weekend & Regular Batches starting next Monday. Free Demo Lecture & Formula Handbook.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80',
    colorGradient: 'from-amber-900 via-stone-900 to-neutral-900',
    durationSeconds: 10,
    startDate: '2026-09-15',
    endDate: '2026-11-30',
    active: true,
    playCount: 98,
    totalDurationSeconds: 980,
  },
  {
    id: 'AD-003',
    title: 'Student Special Discount: Flat 25% Off on All Books & Stationery',
    advertiser: 'Campus Prime Stationery & Binding',
    tagline: 'Spiral binding, project hard-binding, engineering drawing instruments, calculators.',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80',
    colorGradient: 'from-emerald-950 via-teal-950 to-slate-950',
    durationSeconds: 10,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    active: true,
    playCount: 165,
    totalDurationSeconds: 1650,
  }
];

const INITIAL_PRICING: PricingRule[] = [
  {
    collegeId: 'COLLEGE-ABC',
    bwSingle: 2.00,
    bwDuplex: 3.00,
    colorSingle: 10.00,
    colorDuplex: 18.00,
    minCharge: 2.00,
  },
  {
    collegeId: 'COLLEGE-DEL',
    bwSingle: 2.00,
    bwDuplex: 3.00,
    colorSingle: 10.00,
    colorDuplex: 18.00,
    minCharge: 2.00,
  }
];

const KioskContext = createContext<KioskContextType | null>(null);

export const KioskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [machines, setMachines] = useState<KioskMachine[]>(() => {
    try {
      const stored = localStorage.getItem('msprinters_machines');
      return stored ? JSON.parse(stored) : INITIAL_MACHINES;
    } catch {
      return INITIAL_MACHINES;
    }
  });

  const [currentMachineId, setCurrentMachineId] = useState<string>('ATP-ABC-001');

  const [jobs, setJobs] = useState<PrintJob[]>(() => {
    try {
      const stored = localStorage.getItem('msprinters_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [paperTransactions, setPaperTransactions] = useState<PaperTransaction[]>(() => {
    try {
      const stored = localStorage.getItem('msprinters_paper_tx');
      return stored ? JSON.parse(stored) : [
        {
          id: 'TX-INIT-01',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          machine_id: 'ATP-ABC-001',
          printer_id: 'HP-M126NW-01',
          tray_id: 'TRAY-01-ABC1',
          type: 'ADD',
          amount: 500,
          opening_stock: 0,
          closing_stock: 500,
          admin_name: 'SuperAdmin (MS Printers)',
          reason: 'Initial Kiosk Commissioning & Paper Load'
        }
      ];
    } catch {
      return [];
    }
  });

  const [advertisements, setAdvertisements] = useState<Advertisement[]>(() => {
    try {
      const stored = localStorage.getItem('msprinters_ads');
      return stored ? JSON.parse(stored) : INITIAL_ADS;
    } catch {
      return INITIAL_ADS;
    }
  });

  const [pricingRules, setPricingRules] = useState<PricingRule[]>(INITIAL_PRICING);

  const [agentLogs, setAgentLogs] = useState<Array<{ id: string; timestamp: string; level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'; message: string }>>([
    {
      id: 'log-001',
      timestamp: new Date().toLocaleTimeString(),
      level: 'SUCCESS',
      message: 'Windows ATP Print Agent Service v2.4 initialized on local Win10Pro controller.'
    },
    {
      id: 'log-002',
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      message: 'Connected to HP LaserJet Pro MFP M126nw (USB001). Status: READY / 600 DPI.'
    },
    {
      id: 'log-003',
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      message: 'Heartbeat ping sent to msprinter.in backend: OK (Latency 24ms).'
    }
  ]);

  const [kioskActivityMode, setKioskActivityMode] = useState<'ADS' | 'INTERACTIVE' | 'PRINTING' | 'MAINTENANCE'>('ADS');
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('msprinters_machines', JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem('msprinters_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('msprinters_paper_tx', JSON.stringify(paperTransactions));
  }, [paperTransactions]);

  useEffect(() => {
    localStorage.setItem('msprinters_ads', JSON.stringify(advertisements));
  }, [advertisements]);

  const addAgentLog = useCallback((level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', message: string) => {
    setAgentLogs(prev => [
      {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toLocaleTimeString(),
        level,
        message
      },
      ...prev.slice(0, 75) // Keep last 75 logs
    ]);
  }, []);

  const clearAgentLogs = useCallback(() => {
    setAgentLogs([]);
  }, []);

  // Idle timer to auto-revert Kiosk Monitor back to Advertisement mode
  const resetKioskIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    // Only return to ADS if not currently printing
    idleTimerRef.current = setTimeout(() => {
      setKioskActivityMode(prev => (prev === 'INTERACTIVE' ? 'ADS' : prev));
    }, BRAND_CONFIG.idleAdTimeoutSeconds * 1000);
  }, []);

  const currentMachine = machines.find(m => m.id === currentMachineId) || machines[0];

  // Price Calculation Engine
  const calculatePrice = useCallback((
    pageCount: number,
    copies: number,
    colorMode: 'BW' | 'COLOR',
    duplexMode: 'SINGLE' | 'DUPLEX'
  ) => {
    const rules = pricingRules.find(r => r.collegeId === currentMachine.collegeId) || pricingRules[0];
    
    let physicalSheets = 0;
    if (duplexMode === 'DUPLEX') {
      physicalSheets = Math.ceil(pageCount / 2) * copies;
    } else {
      physicalSheets = pageCount * copies;
    }

    let ratePerUnit = 0;
    let totalAmount = 0;

    if (colorMode === 'COLOR') {
      if (duplexMode === 'DUPLEX') {
        ratePerUnit = rules.colorDuplex;
        totalAmount = Math.ceil(pageCount / 2) * copies * rules.colorDuplex;
      } else {
        ratePerUnit = rules.colorSingle;
        totalAmount = pageCount * copies * rules.colorSingle;
      }
    } else {
      // Black & White (Default HP M126nw)
      if (duplexMode === 'DUPLEX') {
        ratePerUnit = rules.bwDuplex;
        totalAmount = Math.ceil(pageCount / 2) * copies * rules.bwDuplex;
      } else {
        ratePerUnit = rules.bwSingle;
        totalAmount = pageCount * copies * rules.bwSingle;
      }
    }

    totalAmount = Math.max(totalAmount, rules.minCharge);

    return {
      amount: totalAmount,
      sheets: physicalSheets,
      ratePerUnit
    };
  }, [currentMachine, pricingRules]);

  // Create new Print Job (Server Side Simulation)
  const createPrintJob = useCallback((
    fileData: { name: string; size: number; pageCount: number; hash: string },
    settings: {
      paperSize: 'A4';
      colorMode: 'BW' | 'COLOR';
      duplexMode: 'SINGLE' | 'DUPLEX';
      copies: number;
      selectedPages: 'ALL' | string;
    },
    studentInfo?: { name: string; phone: string }
  ) => {
    const pricing = calculatePrice(fileData.pageCount, settings.copies, settings.colorMode, settings.duplexMode);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(100000 + Math.random() * 900000);
    const jobId = `ATP-${dateStr}-${randNum}`;
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newJob: PrintJob = {
      job_id: jobId,
      college_id: currentMachine.collegeId,
      college_name: currentMachine.collegeName,
      machine_id: currentMachine.id,
      printer_id: currentMachine.printerModel,
      file_id: 'f_' + Math.random().toString(36).substring(2, 9),
      file_name: fileData.name,
      file_size: fileData.size,
      file_hash: fileData.hash,
      student_name: studentInfo?.name || 'Student',
      student_phone: studentInfo?.phone || '',
      settings: {
        ...settings,
        pageCount: fileData.pageCount,
        physicalSheets: pricing.sheets,
      },
      amount: pricing.amount,
      payment_order_id: orderId,
      payment_status: 'PENDING',
      print_status: 'PAYMENT_PENDING',
      progress_page: 0,
      created_at: new Date().toISOString(),
      idempotency_key: `idemp_${jobId}_${fileData.hash.slice(0, 8)}`,
    };

    setJobs(prev => [newJob, ...prev]);

    // Wake up kiosk monitor to interactive mode
    setKioskActivityMode('INTERACTIVE');
    resetKioskIdleTimer();

    addAgentLog('INFO', `New Print Order created: [${jobId}] for ${fileData.name} (${fileData.pageCount}p, ${pricing.sheets} sheets, ₹${pricing.amount}).`);

    return { job: newJob, paymentOrderId: orderId };
  }, [currentMachine, calculatePrice, addAgentLog, resetKioskIdleTimer]);

  // Server-Side Payment Verification & Idempotent Authorization
  const verifyPaymentAndAuthorizePrint = useCallback(async (jobId: string, paymentId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setJobs(prevJobs => {
          const targetIndex = prevJobs.findIndex(j => j.job_id === jobId);
          if (targetIndex === -1) return prevJobs;

          const existing = prevJobs[targetIndex];
          // Idempotency: If already verified, do not re-verify or duplicate print!
          if (existing.payment_status === 'VERIFIED') {
            addAgentLog('WARN', `Duplicate webhook/payment verification ignored for ${jobId} (Already verified).`);
            return prevJobs;
          }

          const updatedJob: PrintJob = {
            ...existing,
            payment_status: 'VERIFIED',
            payment_id: paymentId,
            paid_at: new Date().toISOString(),
            print_status: 'QUEUED',
          };

          const newJobs = [...prevJobs];
          newJobs[targetIndex] = updatedJob;

          addAgentLog('SUCCESS', `Payment SIGNATURE VERIFIED for ${jobId} via Gateway Webhook (Txn: ${paymentId}). Print authorized & placed in spool queue.`);
          
          // Trigger audio chime & announcement on kiosk
          soundService.announcePaymentConfirmed();
          setKioskActivityMode('PRINTING');

          return newJobs;
        });
        resolve(true);
      }, 700);
    });
  }, [addAgentLog]);

  // Cancel or Refund a Job
  const cancelOrRefundJob = useCallback((jobId: string, reason: string) => {
    setJobs(prev => prev.map(j => {
      if (j.job_id === jobId) {
        addAgentLog('WARN', `Job [${jobId}] refund initiated. Reason: ${reason}`);
        return {
          ...j,
          print_status: 'REFUND_PENDING',
          error_message: reason,
        };
      }
      return j;
    }));
  }, [addAgentLog]);

  // Paper Tray Management: Add Paper with strict capacity protection
  const addPaperToTray = useCallback((machineId: string, sheetsToAdd: number, adminName: string) => {
    let result = { success: false, message: '' };

    setMachines(prevMachines => {
      const target = prevMachines.find(m => m.id === machineId);
      if (!target) {
        result = { success: false, message: 'Machine not found.' };
        return prevMachines;
      }

      const tray = target.paperTray;
      const spaceAvailable = tray.maximum_capacity - tray.current_stock;

      if (sheetsToAdd <= 0) {
        result = { success: false, message: 'Please enter a valid number of sheets to add.' };
        return prevMachines;
      }

      // Rule #23: Paper Capacity Protection
      if (sheetsToAdd > spaceAvailable) {
        result = {
          success: false,
          message: `Tray capacity exceeded! Maximum additional sheets allowed: ${spaceAvailable} (Current: ${tray.current_stock}/${tray.maximum_capacity})`
        };
        soundService.announcePaperAlert('Tray capacity exceeded');
        return prevMachines;
      }

      const newStock = tray.current_stock + sheetsToAdd;
      const newStatus = newStock <= tray.critical_threshold ? 'CRITICAL' : newStock <= tray.low_threshold ? 'LOW' : 'NORMAL';

      const updatedTray: PaperTray = {
        ...tray,
        current_stock: newStock,
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Record transaction
      const newTx: PaperTransaction = {
        id: 'TX-' + Date.now(),
        timestamp: new Date().toISOString(),
        machine_id: machineId,
        printer_id: target.printerModel,
        tray_id: tray.id,
        type: 'ADD',
        amount: sheetsToAdd,
        opening_stock: tray.current_stock,
        closing_stock: newStock,
        admin_name: adminName || 'Admin',
        reason: 'Paper Tray Refill'
      };

      setPaperTransactions(p => [newTx, ...p]);

      addAgentLog('SUCCESS', `Paper Refill on [${machineId}]: Added ${sheetsToAdd} sheets. New stock: ${newStock}/${tray.maximum_capacity}.`);

      result = {
        success: true,
        message: `Successfully added ${sheetsToAdd} sheets. Tray stock is now ${newStock}/${tray.maximum_capacity} sheets.`
      };

      return prevMachines.map(m => m.id === machineId ? { ...m, paperTray: updatedTray } : m);
    });

    return result;
  }, [addAgentLog]);

  // Record Paper Waste (Misprint, Jam, Damaged)
  const recordPaperWaste = useCallback((machineId: string, sheets: number, reason: string, adminName: string) => {
    setMachines(prev => prev.map(m => {
      if (m.id !== machineId) return m;
      const tray = m.paperTray;
      const actualDeduction = Math.min(tray.current_stock, sheets);
      const newStock = Math.max(0, tray.current_stock - actualDeduction);

      const newTx: PaperTransaction = {
        id: 'TX-WST-' + Date.now(),
        timestamp: new Date().toISOString(),
        machine_id: machineId,
        printer_id: m.printerModel,
        tray_id: tray.id,
        type: 'WASTE',
        amount: -actualDeduction,
        opening_stock: tray.current_stock,
        closing_stock: newStock,
        admin_name: adminName,
        reason: `Paper Waste: ${reason}`
      };
      setPaperTransactions(p => [newTx, ...p]);
      addAgentLog('WARN', `Paper Waste logged [${machineId}]: ${sheets} sheets deducted for "${reason}". Stock: ${newStock}.`);

      return {
        ...m,
        paperTray: {
          ...tray,
          current_stock: newStock,
          status: newStock === 0 ? 'EMPTY' : newStock <= tray.critical_threshold ? 'CRITICAL' : newStock <= tray.low_threshold ? 'LOW' : 'NORMAL',
          updated_at: new Date().toISOString()
        }
      };
    }));
  }, [addAgentLog]);

  // Manual Stock Correction
  const adjustPaperStock = useCallback((machineId: string, newStock: number, reason: string, adminName: string) => {
    setMachines(prev => prev.map(m => {
      if (m.id !== machineId) return m;
      const tray = m.paperTray;
      const clampedStock = Math.max(0, Math.min(tray.maximum_capacity, newStock));
      const diff = clampedStock - tray.current_stock;

      const newTx: PaperTransaction = {
        id: 'TX-ADJ-' + Date.now(),
        timestamp: new Date().toISOString(),
        machine_id: machineId,
        printer_id: m.printerModel,
        tray_id: tray.id,
        type: 'CORRECTION',
        amount: diff,
        opening_stock: tray.current_stock,
        closing_stock: clampedStock,
        admin_name: adminName,
        reason: `Stock Adjustment: ${reason}`
      };
      setPaperTransactions(p => [newTx, ...p]);
      addAgentLog('INFO', `Stock Adjustment [${machineId}]: Adjusted by ${diff > 0 ? '+' : ''}${diff}. New stock: ${clampedStock}.`);

      return {
        ...m,
        paperTray: {
          ...tray,
          current_stock: clampedStock,
          status: clampedStock === 0 ? 'EMPTY' : clampedStock <= tray.critical_threshold ? 'CRITICAL' : clampedStock <= tray.low_threshold ? 'LOW' : 'NORMAL',
          updated_at: new Date().toISOString()
        }
      };
    }));
  }, [addAgentLog]);

  // Ads CMS operations
  const toggleAdActive = useCallback((adId: string) => {
    setAdvertisements(prev => prev.map(ad => ad.id === adId ? { ...ad, active: !ad.active } : ad));
  }, []);

  const addAdvertisement = useCallback((adData: Omit<Advertisement, 'id' | 'playCount' | 'totalDurationSeconds'>) => {
    const newAd: Advertisement = {
      ...adData,
      id: 'AD-' + Date.now().toString().slice(-4),
      playCount: 0,
      totalDurationSeconds: 0,
    };
    setAdvertisements(prev => [newAd, ...prev]);
    addAgentLog('INFO', `New Advertisement created: "${adData.title}" (${adData.advertiser}).`);
  }, [addAgentLog]);

  const deleteAdvertisement = useCallback((adId: string) => {
    setAdvertisements(prev => prev.filter(ad => ad.id !== adId));
  }, []);

  const recordAdPlay = useCallback((adId: string) => {
    setAdvertisements(prev => prev.map(ad => {
      if (ad.id === adId) {
        return {
          ...ad,
          playCount: ad.playCount + 1,
          totalDurationSeconds: ad.totalDurationSeconds + ad.durationSeconds
        };
      }
      return ad;
    }));
  }, []);

  // Hardware Simulator Controls
  const updatePrinterStatus = useCallback((machineId: string, status: PrinterStatusCode) => {
    setMachines(prev => prev.map(m => {
      if (m.id !== machineId) return m;
      return {
        ...m,
        telemetry: {
          ...m.telemetry,
          printerStatus: status,
          printerOnline: status !== 'OFFLINE'
        }
      };
    }));
    addAgentLog(status === 'ONLINE' ? 'SUCCESS' : 'WARN', `HP M126nw state on [${machineId}] changed to: ${status}`);
  }, [addAgentLog]);

  const setCabinetDoor = useCallback((machineId: string, closed: boolean) => {
    setMachines(prev => prev.map(m => {
      if (m.id !== machineId) return m;
      return {
        ...m,
        telemetry: {
          ...m.telemetry,
          cabinetDoorClosed: closed
        }
      };
    }));
    if (!closed) {
      soundService.announcePaperAlert('Cabinet door opened unexpectedly');
      addAgentLog('WARN', `CABINET DOOR OPENED on [${machineId}]! Sensor triggered.`);
    } else {
      addAgentLog('INFO', `Cabinet door closed securely on [${machineId}].`);
    }
  }, [addAgentLog]);

  const setCabinetTemperature = useCallback((machineId: string, tempC: number) => {
    setMachines(prev => prev.map(m => {
      if (m.id !== machineId) return m;
      return {
        ...m,
        telemetry: {
          ...m.telemetry,
          cabinetTemperatureC: tempC,
          coolingFanActive: tempC > 38
        }
      };
    }));
    if (tempC >= 45) {
      addAgentLog('ERROR', `HIGH CABINET TEMPERATURE: ${tempC}°C on [${machineId}]. Cooling fan at MAX.`);
    }
  }, [addAgentLog]);

  const setUpsState = useCallback((machineId: string, mainsConnected: boolean, batteryPct: number) => {
    setMachines(prev => prev.map(m => {
      if (m.id !== machineId) return m;
      return {
        ...m,
        telemetry: {
          ...m.telemetry,
          upsMainsConnected: mainsConnected,
          upsBatteryPct: batteryPct
        }
      };
    }));
    if (!mainsConnected) {
      addAgentLog('WARN', `AC Mains Power Failure! Kiosk on [${machineId}] switched to UPS Battery Backup (${batteryPct}% remaining).`);
    } else {
      addAgentLog('SUCCESS', `AC Mains Restored on [${machineId}]. UPS operating normally.`);
    }
  }, [addAgentLog]);

  const triggerRemoteTestPrint = useCallback((machineId: string) => {
    const target = machines.find(m => m.id === machineId);
    if (!target) return;

    createPrintJob(
      {
        name: 'HP_M126nw_Test_Page_Diagnostics.pdf',
        size: 142000,
        pageCount: 1,
        hash: 'test_hash_' + Date.now()
      },
      {
        paperSize: 'A4',
        colorMode: 'BW',
        duplexMode: 'SINGLE',
        copies: 1,
        selectedPages: 'ALL'
      },
      { name: 'Admin Remote Test', phone: '0000000000' }
    );
    addAgentLog('INFO', `Remote Test Print queued for [${machineId}].`);
  }, [machines, createPrintJob, addAgentLog]);

  const restartWindowsAgent = useCallback((machineId: string) => {
    addAgentLog('WARN', `Restarting Windows ATP Agent service on [${machineId}]...`);
    setTimeout(() => {
      addAgentLog('SUCCESS', `Windows ATP Agent service on [${machineId}] restarted successfully and re-synced spooler.`);
    }, 1200);
  }, [addAgentLog]);

  const updatePricing = useCallback((rule: PricingRule) => {
    setPricingRules(prev => prev.map(r => r.collegeId === rule.collegeId ? rule : r));
    addAgentLog('INFO', `Pricing updated for College [${rule.collegeId}]. Single: ₹${rule.bwSingle}, Duplex: ₹${rule.bwDuplex}.`);
  }, [addAgentLog]);

  const getJobById = useCallback((jobId: string) => {
    return jobs.find(j => j.job_id === jobId);
  }, [jobs]);

  // Automated Windows Print Agent Spooling Loop (Background Processor)
  useEffect(() => {
    const interval = setInterval(() => {
      // Find the first job that is QUEUED for the active machine
      const activeMachine = machines.find(m => m.id === currentMachineId);
      if (!activeMachine) return;

      const printerStatus = activeMachine.telemetry.printerStatus;
      const currentStock = activeMachine.paperTray.current_stock;

      // 1. Process active PRINTING jobs
      const printingJob = jobs.find(j => j.machine_id === currentMachineId && j.print_status === 'PRINTING');
      if (printingJob) {
        const totalPages = printingJob.settings.pageCount * printingJob.settings.copies;
        const nextPage = printingJob.progress_page + 1;

        if (nextPage <= totalPages) {
          // Play mechanical tick sound
          soundService.playPrintStartChime();
          setJobs(prev => prev.map(j => j.job_id === printingJob.job_id ? { ...j, progress_page: nextPage } : j));
          addAgentLog('INFO', `[HP M126nw] Spooling page ${nextPage}/${totalPages} of Job #${printingJob.job_id}...`);
        } else {
          // Job Completed!
          const sheetsConsumed = printingJob.settings.physicalSheets;
          const newStock = Math.max(0, currentStock - sheetsConsumed);

          // Update job
          setJobs(prev => prev.map(j => j.job_id === printingJob.job_id ? {
            ...j,
            print_status: 'COMPLETED',
            printed_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          } : j));

          // Deduct paper stock (Rule #22)
          setMachines(prev => prev.map(m => {
            if (m.id !== currentMachineId) return m;
            const tray = m.paperTray;
            return {
              ...m,
              paperTray: {
                ...tray,
                current_stock: newStock,
                status: newStock === 0 ? 'EMPTY' : newStock <= tray.critical_threshold ? 'CRITICAL' : newStock <= tray.low_threshold ? 'LOW' : 'NORMAL',
                updated_at: new Date().toISOString()
              }
            };
          }));

          // Record paper transaction
          const newTx: PaperTransaction = {
            id: 'TX-PRINT-' + Date.now(),
            timestamp: new Date().toISOString(),
            machine_id: currentMachineId,
            printer_id: activeMachine.printerModel,
            tray_id: activeMachine.paperTray.id,
            type: 'PRINT',
            amount: -sheetsConsumed,
            opening_stock: currentStock,
            closing_stock: newStock,
            admin_name: 'Automated ATP Agent',
            reason: `Printed Job ${printingJob.job_id} (${printingJob.file_name})`,
            job_id: printingJob.job_id
          };
          setPaperTransactions(p => [newTx, ...p]);

          soundService.announcePrintCompleted();
          addAgentLog('SUCCESS', `Job [${printingJob.job_id}] PRINT COMPLETED! ${sheetsConsumed} physical sheets consumed. Remaining paper: ${newStock}/${activeMachine.paperTray.maximum_capacity}.`);

          // After 8 seconds, revert kiosk to ADS mode
          setTimeout(() => {
            setKioskActivityMode(mode => mode === 'PRINTING' ? 'ADS' : mode);
          }, 8000);
        }
        return;
      }

      // 2. Pick next QUEUED job
      const nextQueuedJob = jobs.find(j => j.machine_id === currentMachineId && j.print_status === 'QUEUED');
      if (nextQueuedJob) {
        // Check printer health
        if (printerStatus === 'OFFLINE') {
          setJobs(prev => prev.map(j => j.job_id === nextQueuedJob.job_id ? { ...j, print_status: 'PRINTER_OFFLINE', error_message: 'Printer is currently offline or unreachable.' } : j));
          addAgentLog('ERROR', `Cannot print ${nextQueuedJob.job_id}: HP LaserJet M126nw is OFFLINE.`);
          return;
        }

        if (printerStatus === 'PAPER_JAM') {
          setJobs(prev => prev.map(j => j.job_id === nextQueuedJob.job_id ? { ...j, print_status: 'FAILED', error_message: 'Printer reported a paper jam in paper path.' } : j));
          addAgentLog('ERROR', `Cannot print ${nextQueuedJob.job_id}: PAPER JAM in HP M126nw.`);
          return;
        }

        // Check paper stock
        if (currentStock < nextQueuedJob.settings.physicalSheets) {
          setJobs(prev => prev.map(j => j.job_id === nextQueuedJob.job_id ? { ...j, print_status: 'WAITING_FOR_PAPER', error_message: 'Kiosk tray has insufficient paper. Waiting for refill.' } : j));
          soundService.announcePaperAlert('Printer out of paper. Waiting for paper refill.');
          addAgentLog('WARN', `Job ${nextQueuedJob.job_id} moved to WAITING_FOR_PAPER. Required: ${nextQueuedJob.settings.physicalSheets}, Available: ${currentStock}.`);
          return;
        }

        // Start Printing!
        setJobs(prev => prev.map(j => j.job_id === nextQueuedJob.job_id ? {
          ...j,
          print_status: 'PRINTING',
          progress_page: 0
        } : j));

        setKioskActivityMode('PRINTING');
        soundService.announcePrintStarted(nextQueuedJob.settings.pageCount * nextQueuedJob.settings.copies);
        addAgentLog('INFO', `Starting print for Job [${nextQueuedJob.job_id}] on HP LaserJet M126nw...`);
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [currentMachineId, machines, jobs, addAgentLog]);

  return (
    <KioskContext.Provider
      value={{
        currentMachineId,
        setCurrentMachineId,
        currentMachine,
        machines,
        jobs,
        createPrintJob,
        calculatePrice,
        verifyPaymentAndAuthorizePrint,
        getJobById,
        cancelOrRefundJob,
        addPaperToTray,
        recordPaperWaste,
        adjustPaperStock,
        paperTransactions,
        advertisements,
        toggleAdActive,
        addAdvertisement,
        deleteAdvertisement,
        recordAdPlay,
        updatePrinterStatus,
        setCabinetDoor,
        setCabinetTemperature,
        setUpsState,
        triggerRemoteTestPrint,
        restartWindowsAgent,
        agentLogs,
        clearAgentLogs,
        pricingRules,
        updatePricing,
        kioskActivityMode,
        setKioskActivityMode,
        resetKioskIdleTimer,
      }}
    >
      {children}
    </KioskContext.Provider>
  );
};

export const useKiosk = () => {
  const context = useContext(KioskContext);
  if (!context) {
    throw new Error('useKiosk must be used within a KioskProvider');
  }
  return context;
};
