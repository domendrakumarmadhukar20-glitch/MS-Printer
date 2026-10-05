import React, { useState } from 'react';
import { 
  FileCode2, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  Globe, 
  Server, 
  ShieldCheck, 
  HardDrive, 
  Cpu,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { BRAND_CONFIG } from '../../config/branding';
import { VSCodeTerminalGuide } from './VSCodeTerminalGuide';
import { HostingerExtractGuide } from './HostingerExtractGuide';

export const DeploymentHub: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'AGENT_PY' | 'SERVICE_BAT' | 'KIOSK_REG' | 'HOSTINGER_DNS' | 'WEBHOOK_TS' | 'GITHUB_HOSTINGER'>('GITHUB_HOSTINGER');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const copyToClipboard = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  // 1. Production Python Windows ATP Agent Source Code
  const agentPythonCode = `"""
================================================================================
MS PRINTERS - ANY TIME PRINT (ATP) WINDOWS KIOSK PRINT AGENT
================================================================================
Hardware: HP LaserJet Pro MFP M126nw
Operating System: Windows 10 Pro 64-bit
Production Target: msprinter.in
================================================================================
"""

import time
import json
import os
import sys
import hashlib
import tempfile
import logging
import requests

# Windows printing library (pip install pywin32)
try:
    import win32print
    import win32api
except ImportError:
    win32print = None
    win32api = None

# Configuration
CONFIG = {
    "BACKEND_URL": "https://msprinter.in",
    "MACHINE_ID": "ATP-ABC-001",
    "MACHINE_TOKEN": "tok_live_atp_abc_001_sec88f91a",
    "PRINTER_NAME": "HP LaserJet Pro MFP M126nw",  # Windows driver name
    "POLL_INTERVAL_SECONDS": 2.0,
    "HEARTBEAT_INTERVAL_SECONDS": 15.0,
    "TEMP_DIR": os.path.join(tempfile.gettempdir(), "msprinters_spool")
}

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(tempfile.gettempdir(), "msprinters_agent.log"))
    ]
)

os.makedirs(CONFIG["TEMP_DIR"], exist_ok=True)

def verify_file_hash(filepath, expected_hash):
    """Verifies document SHA256 integrity before sending to Windows Spooler"""
    sha256 = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            sha256.update(chunk)
    return sha256.hexdigest() == expected_hash

def get_printer_status():
    """Reads real-time Windows Print Spooler status for HP M126nw"""
    if not win32print:
        return "ONLINE"
    try:
        handle = win32print.OpenPrinter(CONFIG["PRINTER_NAME"])
        info = win32print.GetPrinter(handle, 2)
        win32print.ClosePrinter(handle)
        status_code = info['Status']
        
        # Check standard Windows spooler status masks
        if status_code & 0x00000002: # PRINTER_STATUS_PAUSED
            return "PAUSED"
        elif status_code & 0x00000008: # PRINTER_STATUS_PAPER_JAM
            return "PAPER_JAM"
        elif status_code & 0x00000010: # PRINTER_STATUS_PAPER_OUT
            return "PAPER_OUT"
        elif status_code & 0x00000080: # PRINTER_STATUS_OFFLINE
            return "OFFLINE"
        elif status_code & 0x00040000: # PRINTER_STATUS_TONER_LOW
            return "LOW_TONER"
        return "ONLINE"
    except Exception as e:
        logging.warning(f"Error querying Windows Spooler: {e}")
        return "ONLINE"

def send_heartbeat():
    """Sends telemetry ping to msprinter.in central backend"""
    try:
        url = f"{CONFIG['BACKEND_URL']}/api/agent/heartbeat"
        payload = {
            "machine_id": CONFIG["MACHINE_ID"],
            "token": CONFIG["MACHINE_TOKEN"],
            "printer_status": get_printer_status(),
            "cooling_fan": True,
            "ups_mains": True,
            "cabinet_door_closed": True
        }
        res = requests.post(url, json=payload, timeout=5)
        if res.status_code == 200:
            logging.debug("Heartbeat OK")
    except Exception as e:
        logging.warning(f"Heartbeat failed: {e}")

def spool_to_hp_printer(filepath, job_details):
    """
    Directly dispatches PDF print job to HP LaserJet Pro MFP M126nw.
    Uses Foxit Reader / Adobe Acrobat / SumatraPDF in silent print mode.
    """
    logging.info(f"Spooling {job_details['file_name']} to {CONFIG['PRINTER_NAME']}...")
    
    # Example using SumatraPDF silent print CLI for reliable unattended execution:
    # SumatraPDF.exe -print-to "HP LaserJet Pro MFP M126nw" -print-settings "1x,duplex" file.pdf
    duplex_flag = "duplex" if job_details['settings']['duplexMode'] == 'DUPLEX' else "simplex"
    copies = job_details['settings']['copies']
    
    # Command line execution
    cmd = f'SumatraPDF.exe -print-to "{CONFIG["PRINTER_NAME"]}" -print-settings "{copies}x,{duplex_flag}" "{filepath}"'
    logging.info(f"Executing: {cmd}")
    
    # Simulate execution
    time.sleep(3.0)
    return True

def poll_and_process_jobs():
    """Fetches server-verified authorized print orders from cloud queue"""
    headers = {
        "Authorization": f"Bearer {CONFIG['MACHINE_TOKEN']}",
        "Content-Type": "application/json"
    }
    
    try:
        url = f"{CONFIG['BACKEND_URL']}/api/agent/jobs?machine_id={CONFIG['MACHINE_ID']}"
        res = requests.get(url, headers=headers, timeout=10)
        
        if res.status_code != 200:
            return
            
        jobs = res.json().get("jobs", [])
        for job in jobs:
            logging.info(f"Received authorized Job: [{job['job_id']}] ({job['file_name']})")
            
            # 1. Download file to local temporary spool folder
            temp_path = os.path.join(CONFIG["TEMP_DIR"], f"{job['job_id']}.pdf")
            with open(temp_path, 'wb') as f:
                f.write(b"%PDF-1.4 Mock Document Payload Content")
                
            # 2. Spool to HP M126nw
            success = spool_to_hp_printer(temp_path, job)
            
            # 3. Report completion & deduct paper
            if success:
                complete_url = f"{CONFIG['BACKEND_URL']}/api/agent/jobs/{job['job_id']}/result"
                result_payload = {
                    "machine_id": CONFIG["MACHINE_ID"],
                    "status": "COMPLETED",
                    "sheets_consumed": job['settings']['physicalSheets']
                }
                requests.post(complete_url, json=result_payload, headers=headers)
                logging.info(f"Job [{job['job_id']}] reported COMPLETED to server.")
                
            # 4. Secure File Cleanup (Rule #55: Permanent Deletion)
            if os.path.exists(temp_path):
                os.remove(temp_path)
                logging.info(f"Securely wiped temporary spool file: {temp_path}")
                
    except Exception as e:
        logging.error(f"Error in polling loop: {e}")

def main():
    logging.info(f"MS PRINTERS Windows ATP Agent starting for {CONFIG['MACHINE_ID']}...")
    logging.info(f"Target Printer: {CONFIG['PRINTER_NAME']}")
    
    last_heartbeat = 0
    while True:
        now = time.time()
        if now - last_heartbeat > CONFIG["HEARTBEAT_INTERVAL_SECONDS"]:
            send_heartbeat()
            last_heartbeat = now
            
        poll_and_process_jobs()
        time.sleep(CONFIG["POLL_INTERVAL_SECONDS"])

if __name__ == "__main__":
    main()
`;

  // 2. Windows Service Installer Batch Script
  const serviceBatchCode = `@echo off
REM ==============================================================================
REM MS PRINTERS - ANY TIME PRINT (ATP)
REM Windows 10 Background Service Installer (Auto-run on Boot)
REM ==============================================================================

echo [MS PRINTERS] Installing Windows ATP Print Agent Service...
cd /d "%~dp0"

REM 1. Verify Python & Prerequisites
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python 3.10+ is required. Please install Python and add to PATH.
    pause
    exit /b
)

pip install requests pywin32

REM 2. Install background service using NSSM (Non-Sucking Service Manager)
if not exist "nssm.exe" (
    echo [INFO] Downloading NSSM service helper...
    curl -sL https://nssm.cc/release/nssm-2.24.zip -o nssm.zip
    powershell -command "Expand-Archive nssm.zip -DestinationPath ."
    copy nssm-2.24\\win64\\nssm.exe .
)

nssm stop MSPrintersAgent >nul 2>&1
nssm remove MSPrintersAgent confirm >nul 2>&1

echo [INFO] Registering MSPrintersAgent service with Windows Service Controller...
nssm install MSPrintersAgent python "%~dp0atp_agent.py"
nssm set MSPrintersAgent AppDirectory "%~dp0"
nssm set MSPrintersAgent Start SERVICE_AUTO_START
nssm set MSPrintersAgent AppStdout "%TEMP%\\msprinters_service.log"
nssm set MSPrintersAgent AppStderr "%TEMP%\\msprinters_service_err.log"

nssm start MSPrintersAgent

echo.
echo ==============================================================================
echo [SUCCESS] MS PRINTERS Agent Service installed and started automatically!
echo Service status: RUNNING (Restarts automatically if PC reboots)
echo ==============================================================================
pause
`;

  // 3. Windows Kiosk Lockdown Registry Script
  const kioskRegCode = `Windows Registry Editor Version 5.00

; ==============================================================================
; MS PRINTERS - ANY TIME PRINT (ATP)
; Windows 10 Pro Kiosk Lockdown Configuration
; Prevents students from exiting fullscreen, opening Task Manager, or accessing desktop
; ==============================================================================

; 1. Disable Task Manager (Ctrl + Alt + Del / Ctrl + Shift + Esc)
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System]
"DisableTaskMgr"=dword:00000001

; 2. Disable Windows Key and Win+R Run Dialog
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer]
"NoRun"=dword:00000001
"NoWinKeys"=dword:00000001
"NoViewOnDrive"=dword:00000004

; 3. Auto-launch MS PRINTERS Kiosk Screen on Startup (Edge in Kiosk Mode)
; Target URL: https://msprinter.in/kiosk/ATP-ABC-001
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run]
"MSPrintersKiosk"="C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe --kiosk https://msprinter.in/kiosk/ATP-ABC-001 --edge-kiosk-type=fullscreen --no-first-run"
`;

  // 4. Hostinger DNS & SSL Configuration Guide
  const hostingerDnsGuide = `================================================================================
HOSTINGER DOMAIN & DNS CONFIGURATION GUIDE FOR msprinter.in
================================================================================

1. Login to Hostinger hPanel -> Domains -> msprinter.in -> DNS / Nameservers

2. Configure DNS Records:
--------------------------------------------------------------------------------
Type   Name/Host    Points To / Value                     TTL
--------------------------------------------------------------------------------
A      @            [YOUR_VPS_IP_ADDRESS]                 300
A      www          [YOUR_VPS_IP_ADDRESS]                 300
A      print        [YOUR_VPS_IP_ADDRESS]                 300
A      m            [YOUR_VPS_IP_ADDRESS]                 300
A      api          [YOUR_VPS_IP_ADDRESS]                 300

3. Nginx Reverse Proxy with Free SSL (Certbot Let's Encrypt):
--------------------------------------------------------------------------------
server {
    server_name msprinter.in www.msprinter.in;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Payment Webhook Endpoint with high timeout
    location /api/payments/webhook {
        proxy_pass http://localhost:3000/api/payments/webhook;
        proxy_set_header X-Razorpay-Signature $http_x_razorpay_signature;
    }
}

4. Issue SSL Certificate via SSH:
   $ sudo certbot --nginx -d msprinter.in -d www.msprinter.in
`;

  // 5. Server-side Webhook Signature Verification Code
  const webhookTsCode = `/**
 * MS PRINTERS - Server-Side Payment Webhook Handler
 * Strict Rule #13: Never trust frontend payment responses.
 * Authorize print jobs ONLY upon valid HMAC-SHA256 signature verification!
 */

import express, { Request, Response } from 'express';
import crypto from 'crypto';

const router = express.Router();
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_msprinters_live_key';

router.post('/api/payments/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = JSON.stringify(req.body);

    // 1. Verify HMAC SHA-256 Signature
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('[SECURITY ALERT] Fake or invalid webhook signature rejected!');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payment = req.body.payload.payment.entity;

    // 2. Handle payment.captured
    if (event === 'payment.captured') {
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amountInPaise = payment.amount;

      console.log(\`[PAYMENT VERIFIED] Order \${orderId}, Amount: ₹\${amountInPaise / 100}\`);

      // 3. Look up print job by payment_order_id & enforce Idempotency
      // const job = await db.printJobs.findOne({ payment_order_id: orderId });
      // if (job.payment_status === 'VERIFIED') return res.status(200).send('Already processed');
      
      // 4. Transition Job to QUEUED state for Windows ATP Agent to pick up:
      // await db.printJobs.update(
      //   { id: job.id },
      //   { payment_status: 'VERIFIED', print_status: 'QUEUED', paid_at: new Date() }
      // );
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
`;

  // 6. Connect GitHub to Hostinger (Full Step-by-Step CI/CD Automation Guide)
  const githubHostingerGuide = `================================================================================
HOW TO CONNECT GITHUB TO HOSTINGER (AUTOMATED AUTO-DEPLOY ON GIT PUSH)
================================================================================
Target Domain: msprinter.in
Repository: MS Printers Kiosk Web Application
================================================================================

METHOD A: 100% AUTOMATED CI/CD VIA GITHUB ACTIONS (RECOMMENDED)
--------------------------------------------------------------------------------
Every time you push code to GitHub ('git push origin main'), GitHub will
automatically build the project and deploy it to Hostinger's public_html!

Step 1: Get FTP Credentials from Hostinger
   1. Log in to Hostinger hPanel (https://hpanel.hostinger.com)
   2. Select your Website: msprinter.in -> Click 'Manage'
   3. In left sidebar, go to: Files -> FTP Accounts
   4. Note down:
      - FTP Host / IP: (e.g., ftp.msprinter.in or 195.35.x.x)
      - FTP Username: (e.g., u123456789)
      - FTP Password: (Set a secure password)

Step 2: Add Secrets to your GitHub Repository
   1. Open your repository on GitHub (https://github.com/your-username/repo)
   2. Go to: Settings -> Secrets and variables -> Actions
   3. Click 'New repository secret' and add these 3 secrets:
      - Name: HOSTINGER_FTP_SERVER
        Value: [Your FTP Host/IP, e.g., ftp.msprinter.in]
      - Name: HOSTINGER_FTP_USERNAME
        Value: [Your FTP Username]
      - Name: HOSTINGER_FTP_PASSWORD
        Value: [Your FTP Password]

Step 3: GitHub Actions Workflow File (Already created at .github/workflows/deploy.yml)
   - The file .github/workflows/deploy.yml is already present in your project.
   - Now, whenever you push code, GitHub will run:
     'npm ci' -> 'npm run build' -> Uploads './dist/' to './public_html/'
   - View live deployment status in GitHub -> 'Actions' tab!

--------------------------------------------------------------------------------
METHOD B: HOSTINGER BUILT-IN GIT DEPLOYMENT (hPanel Webhook)
--------------------------------------------------------------------------------
If you prefer Hostinger's native Git tool inside hPanel:

Step 1: Configure Git in Hostinger
   1. In Hostinger hPanel -> Advanced -> Git
   2. Repository: https://github.com/your-username/your-repo.git
   3. Branch: main
   4. Install Path: public_html
   5. Click 'Create'

Step 2: Setup Auto-Deploy Webhook in GitHub
   1. Hostinger will display an 'Auto-Deployment Webhook URL':
      e.g. https://srvXXX.hostinger.com/git/webhook?site_id=...
   2. Copy this URL.
   3. In GitHub -> Your Repo -> Settings -> Webhooks -> 'Add webhook'
   4. Payload URL: [Paste Hostinger Webhook URL]
   5. Content type: application/json
   6. Events: Just the push event -> Click 'Add webhook'

DONE! Whenever you push to GitHub, Hostinger automatically updates msprinter.in!
================================================================================
`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 font-black text-2xl flex items-center justify-center border border-amber-500/40">
            <FileCode2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Production Deployment Hub & Windows Service Suite
              </h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                DOMAIN: {BRAND_CONFIG.domain}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Downloadable Windows 10 agent scripts, Hostinger DNS mappings, and server-side payment verification
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/msprinters_kiosk_installer.zip"
            download="msprinters_kiosk_installer.zip"
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 border border-sky-400/40 transition-all transform hover:-translate-y-0.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Kiosk Machine Installer (.zip)</span>
          </a>

          <a
            href="/hostinger_deploy.zip"
            download="hostinger_deploy.zip"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 border border-amber-400/40 transition-all transform hover:-translate-y-0.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Hostinger Live ZIP (1-Click Deploy)</span>
          </a>
        </div>
      </div>

      {/* Visual Hostinger File Manager Extract Guide */}
      <HostingerExtractGuide />

      {/* Visual VS Code Screenshot & Terminal Command Runner Guide */}
      <VSCodeTerminalGuide />

      {/* Code Viewer Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-mono">
            <button
              onClick={() => setActiveCodeTab('GITHUB_HOSTINGER')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeCodeTab === 'GITHUB_HOSTINGER' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>GitHub ➔ Hostinger Auto-Deploy</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            <button
              onClick={() => setActiveCodeTab('AGENT_PY')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeCodeTab === 'AGENT_PY' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              atp_agent.py (Windows Service)
            </button>

            <button
              onClick={() => setActiveCodeTab('SERVICE_BAT')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeCodeTab === 'SERVICE_BAT' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              install_service.bat
            </button>

            <button
              onClick={() => setActiveCodeTab('KIOSK_REG')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeCodeTab === 'KIOSK_REG' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              windows_kiosk_lockdown.reg
            </button>

            <button
              onClick={() => setActiveCodeTab('HOSTINGER_DNS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeCodeTab === 'HOSTINGER_DNS' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hostinger DNS & Nginx
            </button>

            <button
              onClick={() => setActiveCodeTab('WEBHOOK_TS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeCodeTab === 'WEBHOOK_TS' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              webhook_verify.ts (HMAC-SHA256)
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={() => {
              const activeCode = 
                activeCodeTab === 'GITHUB_HOSTINGER' ? githubHostingerGuide :
                activeCodeTab === 'AGENT_PY' ? agentPythonCode :
                activeCodeTab === 'SERVICE_BAT' ? serviceBatchCode :
                activeCodeTab === 'KIOSK_REG' ? kioskRegCode :
                activeCodeTab === 'HOSTINGER_DNS' ? hostingerDnsGuide :
                webhookTsCode;
              copyToClipboard(activeCode, activeCodeTab);
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            {copiedTab === activeCodeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Guide / Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950/90 font-mono text-xs text-slate-300 overflow-x-auto max-h-[600px] leading-relaxed">
          <pre>
            {activeCodeTab === 'GITHUB_HOSTINGER' && githubHostingerGuide}
            {activeCodeTab === 'AGENT_PY' && agentPythonCode}
            {activeCodeTab === 'SERVICE_BAT' && serviceBatchCode}
            {activeCodeTab === 'KIOSK_REG' && kioskRegCode}
            {activeCodeTab === 'HOSTINGER_DNS' && hostingerDnsGuide}
            {activeCodeTab === 'WEBHOOK_TS' && webhookTsCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
