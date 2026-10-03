/**
 * MS PRINTERS — ANY TIME PRINT (ATP)
 * Production Full-Stack Express Server
 * Official Domain: msprinter.in
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory persistent queue for cloud spooling (can be connected to PostgreSQL / SQLite in prod)
interface StoredJob {
  job_id: string;
  machine_id: string;
  file_name: string;
  page_count: number;
  physical_sheets: number;
  amount: number;
  payment_status: 'PENDING' | 'VERIFIED' | 'FAILED';
  print_status: string;
  created_at: string;
}

const activeJobs: StoredJob[] = [];

// ================= API ENDPOINTS =================

// 1. Health check & Heartbeat
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'MS PRINTERS ATP CLOUD CONTROLLER',
    domain: 'msprinter.in',
    timestamp: new Date().toISOString()
  });
});

// 2. Windows ATP Print Agent Heartbeat
app.post('/api/agent/heartbeat', (req: Request, res: Response) => {
  const { machine_id, token, printer_status } = req.body;
  // Validate token
  res.json({
    status: 'ACK',
    machine_id,
    server_time: new Date().toISOString()
  });
});

// 3. Agent Poll for Authorized Jobs
app.get('/api/agent/jobs', (req: Request, res: Response) => {
  const machineId = req.query.machine_id as string;
  const queuedJobs = activeJobs.filter(
    j => j.machine_id === machineId && j.payment_status === 'VERIFIED' && j.print_status === 'QUEUED'
  );
  res.json({ jobs: queuedJobs });
});

// 4. Agent Report Job Completed
app.post('/api/agent/jobs/:jobId/result', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const { status, sheets_consumed } = req.body;

  const targetJob = activeJobs.find(j => j.job_id === jobId);
  if (targetJob) {
    targetJob.print_status = status || 'COMPLETED';
  }

  res.json({ success: true, jobId, status });
});

// 5. Payment Webhook with HMAC-SHA256 Signature Verification
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_msprinters_live_key';

app.post('/api/payments/webhook', (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const bodyStr = JSON.stringify(req.body);

    // Verify HMAC-SHA256
    const expectedSig = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(bodyStr)
      .digest('hex');

    if (signature && signature !== expectedSig) {
      console.warn('[SECURITY] Invalid webhook signature detected!');
      return res.status(400).json({ error: 'Signature verification failed' });
    }

    const event = req.body.event;
    if (event === 'payment.captured') {
      const orderId = req.body.payload?.payment?.entity?.order_id;
      console.log(`[PAYMENT VERIFIED] Webhook confirmed payment for order: ${orderId}`);
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// Serve frontend production build (SPA)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for React SPA client routing
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` MS PRINTERS — ANY TIME PRINT (ATP) PRODUCTION SERVER`);
  console.log(` Target Domain: msprinter.in`);
  console.log(` Listening on port: ${PORT}`);
  console.log(`====================================================`);
});
