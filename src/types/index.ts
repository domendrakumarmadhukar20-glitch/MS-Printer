/**
 * MS PRINTERS - Core System Types & Interfaces
 */

export type PrinterStatusCode = 
  | 'ONLINE'
  | 'OFFLINE'
  | 'PRINTING'
  | 'PAPER_OUT'
  | 'PAPER_JAM'
  | 'DOOR_OPEN'
  | 'LOW_TONER'
  | 'BUSY';

export type JobStatus =
  | 'CREATED'
  | 'FILE_UPLOADED'
  | 'PRICE_CALCULATED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_VERIFIED'
  | 'QUEUED'
  | 'PRINTING'
  | 'PRINTED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'WAITING_FOR_PAPER'
  | 'PRINTER_OFFLINE'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type PaperSize = 'A4' | 'A3' | 'Letter' | 'Legal';
export type ColorMode = 'BW' | 'COLOR';
export type DuplexMode = 'SINGLE' | 'DUPLEX';

export interface PrintJobSettings {
  paperSize: PaperSize;
  colorMode: ColorMode;
  duplexMode: DuplexMode;
  copies: number;
  selectedPages: 'ALL' | string; // e.g. "1-5, 8"
  pageCount: number;
  physicalSheets: number;
}

export interface PrintJob {
  job_id: string; // e.g. "ATP-20261001-000123"
  college_id: string;
  college_name: string;
  machine_id: string;
  printer_id: string;
  file_id: string;
  file_name: string;
  file_size: number;
  file_hash: string;
  student_name?: string;
  student_phone?: string;
  settings: PrintJobSettings;
  amount: number;
  payment_order_id: string;
  payment_id?: string;
  payment_status: 'PENDING' | 'VERIFIED' | 'FAILED';
  print_status: JobStatus;
  progress_page: number; // e.g. page 3 of 8
  created_at: string;
  paid_at?: string;
  printed_at?: string;
  completed_at?: string;
  error_message?: string;
  idempotency_key: string;
}

export interface PaperTray {
  id: string;
  machine_id: string;
  printer_id: string;
  tray_name: string;
  paper_size: PaperSize;
  paper_type: string;
  maximum_capacity: number; // 500
  current_stock: number;
  low_threshold: number;    // 100 (20%)
  critical_threshold: number; // 25 (5%)
  status: 'NORMAL' | 'LOW' | 'CRITICAL' | 'EMPTY';
  updated_at: string;
}

export interface PaperTransaction {
  id: string;
  timestamp: string;
  machine_id: string;
  printer_id: string;
  tray_id: string;
  type: 'ADD' | 'PRINT' | 'WASTE' | 'CORRECTION';
  amount: number;
  opening_stock: number;
  closing_stock: number;
  admin_name?: string;
  reason?: string;
  job_id?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  advertiser: string;
  tagline: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  colorGradient: string;
  durationSeconds: number;
  collegeId?: string; // all or specific
  machineId?: string; // all or specific
  startDate: string;
  endDate: string;
  active: boolean;
  playCount: number;
  totalDurationSeconds: number;
}

export interface KioskTelemetry {
  internetOnline: boolean;
  agentOnline: boolean;
  printerOnline: boolean;
  printerStatus: PrinterStatusCode;
  upsBatteryPct: number;
  upsMainsConnected: boolean;
  upsLoadWatt: number;
  cabinetTemperatureC: number;
  cabinetDoorClosed: boolean;
  coolingFanActive: boolean;
  lastHeartbeat: string;
}

export interface KioskMachine {
  id: string; // e.g. "ATP-ABC-001"
  collegeId: string;
  collegeName: string;
  location: string;
  printerModel: string;
  printerPort: string; // "USB001" or "192.168.1.150"
  telemetry: KioskTelemetry;
  paperTray: PaperTray;
  activeJobsCount: number;
  token: string;
}

export interface PricingRule {
  collegeId: string;
  bwSingle: number;
  bwDuplex: number;
  colorSingle: number;
  colorDuplex: number;
  minCharge: number;
}
