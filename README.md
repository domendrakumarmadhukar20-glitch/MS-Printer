# MS PRINTERS — Any Time Print (ATP) Smart Kiosk

[![Official Domain](https://img.shields.io/badge/Domain-msprinter.in-amber.svg)](https://msprinter.in)
[![Target Printer](https://img.shields.io/badge/Hardware-HP%20LaserJet%20M126nw-blue.svg)](https://support.hp.com)
[![OS Target](https://img.shields.io/badge/Controller-Windows%2010%20Pro-0078D6.svg)](https://microsoft.com)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-emerald.svg)](#)

Commercial, 24×7 unattended, self-service **Any Time Print (ATP) Kiosk System** engineered for colleges, universities, libraries, and coaching institutes. Integrates smartphone QR scanning, instant PDF uploads, server-side payment verification (UPI/Razorpay), automatic Windows spooler printing on **HP LaserJet Pro MFP M126nw**, real-time paper stock accounting, and digital out-of-home (DOOH) advertising.

---

## 🌟 System Overview & Workflow

```text
STUDENT PHONE                     CENTRAL BACKEND (msprinter.in)            KIOSK CABINET (Win 10 + HP M126nw)
┌──────────────────────┐         ┌──────────────────────────────┐          ┌──────────────────────────────────┐
│ 1. Scan Machine QR   │ ──────> │ Map College & Machine ID     │          │ Monitor: Digital Ads (Idle Mode) │
│    msprinter.in/m/...│         │                              │          │                                  │
│ 2. Upload PDF File   │ ──────> │ Calculate Pages & Rate (₹)   │          │                                  │
│ 3. Select Settings   │         │ (A4, B&W, Duplex, Copies)    │          │                                  │
│ 4. Pay via UPI / QR  │ ──────> │ Server Webhook Verification  │ ───────> │ Instant Interrupt Ad Mode        │
│    (GPay, PhonePe...)│         │ (HMAC-SHA256 Signature)      │          │ Audio Chime: "Payment Confirmed" │
└──────────────────────┘         └──────────────┬───────────────┘          │ Voice: "Printing on HP M126nw"   │
                                                │                          │                                  │
                                         [QUEUED JOB]                      │ Windows ATP Print Agent          │
                                                │                          │   ↓ Win32 Spooler Dispatch       │
                                                └────────────────────────> │   ↓ HP LaserJet Pro MFP M126nw   │
                                                                           │   ↓ Physical Sheet Output        │
                                                                           │ Automatic Paper Tray Deduction   │
                                                                           │ Voice: "Collect your document"   │
                                                                           └──────────────────────────────────┘
```

---

## 🛠️ Hardware Specification

| Component | Specification | Function |
| :--- | :--- | :--- |
| **Printer** | **HP LaserJet Pro MFP M126nw** | High-speed monochrome laser printing via USB 2.0 / LAN JetDirect |
| **Controller PC** | **Windows 10 Pro 64-bit** | Runs Windows ATP Agent background service & Kiosk Fullscreen app |
| **Cabinet** | **Reinforced Lockable Metal Kiosk** | Tamper-proof enclosure, dual cooling fans, door sensor & thermal probe |
| **Power Backup** | **1000VA Line-Interactive UPS** | AVR voltage regulation, battery status telemetry & graceful shutdown |
| **Display** | **Full HD 1080p Monitor with Speaker** | Idle commercial advertising player, interactive QR screen & voice cues |
| **Paper Tray** | **Tray 1 (500 sheets capacity)** | Monitored cassette with software-managed low/critical alerts |

---

## 🚀 Key Features

### 1. Student Mobile Web Application
- **Bilingual Interface:** Instant switch between English and हिन्दी.
- **Zero App Installation:** Works directly in Safari, Chrome, and any mobile browser upon QR scan.
- **File Integrity & Security:** SHA-256 hash checks, automatic file deletion immediately upon completion.
- **Configurable Settings:**
  - A4 Paper Size
  - Black & White (₹2.00/page) vs Color (₹10.00/page)
  - Single Sided vs Double Sided / Duplex (₹3.00/sheet — saves 50% paper)
  - Custom Copies (1–20) & Page Ranges (e.g. `1-5, 8`)
- **Strict Payment Security (Rule #13):** Client responses are never trusted. Print execution is only authorized after server-side HMAC-SHA256 signature verification.
- **Live Pipeline Tracker:** Real-time feedback (`UPLOADED` → `PAYMENT_VERIFIED` → `SPOOLED` → `PRINTING` → `COMPLETED`) with downloadable digital tax receipts.

### 2. Kiosk Monitor & Digital Advertising
- **Idle Ad Rotation:** High-definition advertising display for college admissions, coaching institutes, and local businesses.
- **Immediate Activity Interrupt:** Touches or inbound print orders instantly switch the monitor to QR instructions.
- **Voice Announcements & Chimes:** Integrated Web Audio chimes and SpeechSynthesis announcements:
  - *"Your payment has been confirmed."*
  - *"Your document is now printing on HP LaserJet Pro M126nw."*
  - *"Print completed. Please collect your document from the output tray."*
- **On-Screen Technician Maintenance:** PIN-protected console (`1260`) for paper refills and self-test pages.

### 3. Paper Stock Accounting & Capacity Protection
- **Rule #23 Capacity Guard:** System rejects additions that exceed the 500-sheet limit (`Maximum additional sheets: X`).
- **Physical Sheet Tracking:** Accurately deducts sheets (e.g., a 10-page duplex job consumes exactly 5 physical sheets).
- **Waste & Correction Logging:** Audit logs for paper jams, misprints, damaged sheets, and manual count corrections.

### 4. Central Multi-College Admin Dashboard
- Fleet health monitoring across multiple campuses (`ATP-ABC-001`, `ATP-ABC-002`, `ATP-DEL-001`).
- High-resolution, printable A4 Branded QR Poster Generator ready for cabinet lamination.
- Campaign manager for digital ads with impression counters and playback analytics.
- Pricing engine for college-specific rate overrides.
- One-click CSV export of job logs and revenue reports.

---

## 💻 Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Motion, Lucide Icons
- **Backend API:** Node.js Express, TypeScript (`tsx`)
- **Audio Engine:** Web Audio API (Synthesized chimes) + Web Speech API
- **Windows Print Agent:** Python 3 (`win32print`, `requests`, `pywin32`) / NSSM Service Controller
- **Hosting Target:** Hostinger VPS / Cloud Run (`msprinter.in`)

---

## 📦 Windows ATP Print Agent Setup

On the Windows 10 Pro Kiosk computer:

```bash
# 1. Install Python 3.10+ and prerequisites
pip install requests pywin32

# 2. Configure credentials in atp_agent.py
# Set MACHINE_ID, MACHINE_TOKEN, and BACKEND_URL="https://msprinter.in"

# 3. Install as an auto-starting Windows background service
install_service.bat
```

To lock down the kiosk screen into fullscreen mode, double-click:
```bash
windows_kiosk_lockdown.reg
```

---

## 🔄 Connect GitHub to Hostinger (Auto-Deployment CI/CD)

Whenever you push to GitHub, code automatically builds and updates **`msprinter.in`** on Hostinger:

1. In your GitHub Repository, go to **Settings** ➔ **Secrets and variables** ➔ **Actions**.
2. Add these 3 secrets from your Hostinger FTP Accounts (hPanel ➔ Files ➔ FTP Accounts):
   - `HOSTINGER_FTP_SERVER` (e.g. `ftp.msprinter.in`)
   - `HOSTINGER_FTP_USERNAME` (e.g. `u123456789`)
   - `HOSTINGER_FTP_PASSWORD` (Your FTP Password)
3. The workflow file **`.github/workflows/deploy.yml`** is already configured in this repository. Any `git push` to `main` will automatically build and deploy `dist/` directly into Hostinger `public_html/`.

---

## 🌐 Hostinger Domain & DNS Setup (`msprinter.in`)

Configure the following records in Hostinger hPanel DNS Manager:

| Type | Host | Points to | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `[YOUR_SERVER_IP]` | 300 |
| **A** | `www` | `[YOUR_SERVER_IP]` | 300 |
| **A** | `m` | `[YOUR_SERVER_IP]` | 300 |
| **A** | `print` | `[YOUR_SERVER_IP]` | 300 |

Issue SSL via Certbot:
```bash
sudo certbot --nginx -d msprinter.in -d www.msprinter.in
```

---

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Lint & type check
npm run lint

# Build for production
npm run build
```

---

## 📄 License & Attribution

Designed and maintained for **MS PRINTERS** (`msprinter.in`).
All rights reserved © 2026.
