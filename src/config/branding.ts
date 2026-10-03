/**
 * MS PRINTERS - ANY TIME PRINT (ATP)
 * Brand & Production Configuration
 * Official Domain: msprinter.in
 */

export const BRAND_CONFIG = {
  brandName: 'MS PRINTERS',
  serviceName: 'ANY TIME PRINT',
  shortTagline: '24×7 Self-Service Smart Print Kiosk',
  domain: 'msprinter.in',
  appUrl: 'https://msprinter.in',
  supportEmail: 'support@msprinter.in',
  supportPhone: '+91 98765 43210',
  defaultKioskId: 'ATP-ABC-001',
  defaultCollegeName: 'ABC Institute of Technology & Research',
  defaultKioskLocation: 'Central Library, Ground Floor',
  initialHardware: {
    printerModel: 'HP LaserJet Pro MFP M126nw',
    os: 'Windows 10 Pro 64-bit',
    kioskCabinet: 'Reinforced Metal Tamper-Proof Enclosure',
    upsBackup: '1000VA Line-Interactive UPS with AVR',
    standardTrayCapacity: 500, // sheets
  },
  defaultPricing: {
    bwSingle: 2.00,    // ₹2 per page
    bwDuplex: 3.00,    // ₹3 per physical sheet (2 sides)
    colorSingle: 10.00, // ₹10 per page
    colorDuplex: 18.00, // ₹18 per sheet
    minimumOrderAmount: 2.00,
    currencySymbol: '₹',
  },
  paperThresholds: {
    lowPercentage: 20,      // 20% = 100 sheets out of 500
    criticalPercentage: 5,  // 5% = 25 sheets out of 500
  },
  idleAdTimeoutSeconds: 30,
};
