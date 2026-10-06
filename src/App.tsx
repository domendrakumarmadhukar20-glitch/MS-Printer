/**
 * MS PRINTERS — ANY TIME PRINT (ATP) SMART PRINT + DIGITAL ADVERTISING KIOSK
 * Target Domain: msprinter.in
 */

import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { KioskProvider } from './context/KioskContext';
import { Header } from './components/common/Header';
import { StudentMobileApp } from './components/student/StudentMobileApp';
import { KioskScreen } from './components/kiosk/KioskScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { HardwareSimulator } from './components/simulator/HardwareSimulator';
import { DeploymentHub } from './components/deploy/DeploymentHub';
import { AdminLockScreen } from './components/auth/AdminLockScreen';
import { RazorpayPoliciesModal, PolicyTab } from './components/common/RazorpayPoliciesModal';
import { BRAND_CONFIG } from './config/branding';
import { 
  Printer, 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  Cpu, 
  FileCode2, 
  Sparkles, 
  Layers, 
  ArrowRight,
  Zap,
  CheckCircle2,
  Lock,
  RefreshCw
} from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Kiosk System Runtime Error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.clear();
      }
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30 text-2xl font-black">
              MS
            </div>
            <h1 className="text-xl font-bold text-white">MS PRINTERS — Kiosk System</h1>
            <p className="text-xs text-slate-400">
              A temporary display error occurred. Click below to refresh the system state.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-rose-400 border border-slate-800 text-left overflow-x-auto">
              {this.state.error?.message || 'Unexpected application render state'}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset & Reload Kiosk System</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [overrideView, setOverrideView] = useState<'STUDENT' | 'KIOSK' | 'ADMIN' | 'SIMULATOR' | 'DEPLOY' | null>(null);

  // Operator PIN / Password authentication state (Protected panels: Admin, Kiosk, Simulator, Deploy)
  const [isOperatorAuth, setIsOperatorAuth] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem('msprinters_operator_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Razorpay Policies Modal state
  const [policyModalOpen, setPolicyModalOpen] = useState<boolean>(false);
  const [policyInitialTab, setPolicyInitialTab] = useState<PolicyTab>('ABOUT');

  const openPolicy = (tab: PolicyTab) => {
    setPolicyInitialTab(tab);
    setPolicyModalOpen(true);
  };

  const handleUnlock = () => {
    setIsOperatorAuth(true);
  };

  const handleLockPanels = () => {
    try {
      sessionStorage.removeItem('msprinters_operator_auth');
    } catch {
      // ignore
    }
    setIsOperatorAuth(false);
    setOverrideView(null);
    setActiveTab('STUDENT');
  };

  const getInitialTab = (): 'STUDENT' | 'KIOSK' | 'ADMIN' | 'SIMULATOR' | 'DEPLOY' => {
    if (typeof window === 'undefined') return 'STUDENT';
    const path = window.location.pathname.toLowerCase();
    const search = new URLSearchParams(window.location.search);
    const mode = search.get('mode')?.toLowerCase();

    if (path.startsWith('/m/') || path === '/student' || path === '/print' || mode === 'student') {
      return 'STUDENT';
    }
    if (path.startsWith('/kiosk') || mode === 'kiosk') {
      return 'KIOSK';
    }
    if (path.startsWith('/admin') || mode === 'admin') {
      return 'ADMIN';
    }
    if (path.startsWith('/deploy') || mode === 'deploy') {
      return 'DEPLOY';
    }
    if (path.startsWith('/simulator') || mode === 'simulator') {
      return 'SIMULATOR';
    }
    return 'STUDENT';
  };

  const [activeTab, setActiveTab] = useState<'STUDENT' | 'KIOSK' | 'ADMIN' | 'SIMULATOR' | 'DEPLOY'>(getInitialTab);

  const isPureStudentMode = () => {
    if (overrideView) return false;
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const search = new URLSearchParams(window.location.search);
    const mode = search.get('mode')?.toLowerCase();
    return path.startsWith('/m/') || path === '/student' || path === '/print' || mode === 'student';
  };

  const isPureKioskMode = () => {
    if (overrideView) return false;
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const search = new URLSearchParams(window.location.search);
    const mode = search.get('mode')?.toLowerCase();
    return (path.startsWith('/kiosk') || mode === 'kiosk') && !search.has('view');
  };

  // If student scanned QR code on kiosk machine, show ONLY the student mobile portal
  if (isPureStudentMode()) {
    return (
      <ErrorBoundary>
        <KioskProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
            <main className="flex-1 w-full">
              <StudentMobileApp 
                isPureStudentMode={true} 
                onAdminSwitch={() => setOverrideView('ADMIN')} 
              />
            </main>
          </div>
        </KioskProvider>
      </ErrorBoundary>
    );
  }

  // If kiosk machine is running on the physical monitor, show ONLY fullscreen kiosk screen
  if (isPureKioskMode()) {
    return (
      <ErrorBoundary>
        <KioskProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
            <main className="flex-1 w-full">
              <KioskScreen />
            </main>
          </div>
        </KioskProvider>
      </ErrorBoundary>
    );
  }

  const currentTab = overrideView || activeTab;

  return (
    <ErrorBoundary>
      <KioskProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
          {/* Master Navigation Header */}
          <Header 
            activeTab={currentTab} 
            setActiveTab={(t) => { setOverrideView(null); setActiveTab(t); }} 
            isOperatorAuthenticated={isOperatorAuth}
            onLockPanels={handleLockPanels}
          />

        {/* Quick Launch Bar / Overview Strip */}
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-slate-300">
                ACTIVE VIEW:
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1.5">
                {currentTab === 'STUDENT' && '📱 Student Mobile Web App (OPEN — Scan QR → Upload → Pay → Print)'}
                {currentTab === 'KIOSK' && '🖥️ Kiosk Fullscreen Monitor (Locked)'}
                {currentTab === 'ADMIN' && '⚙️ Central Admin Management (Locked)'}
                {currentTab === 'SIMULATOR' && '🖨️ HP LaserJet M126nw Bus Simulator (Locked)'}
                {currentTab === 'DEPLOY' && '📦 Windows ATP Agent Script & Hostinger DNS Hub (Locked)'}
                {currentTab !== 'STUDENT' && !isOperatorAuth && <Lock className="w-3 h-3 text-amber-400" />}
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
              <span>HP LaserJet Pro MFP M126nw</span>
              <span>•</span>
              <span>Tray: 500 Sheets</span>
              <span>•</span>
              <span className="text-amber-400">msprinter.in</span>
            </div>
          </div>
        </div>

        {/* Main View: Student Panel is OPEN; All other panels require Master Password */}
        <main className="flex-1 w-full">
          {/* 1. STUDENT MOBILE PANEL: ALWAYS OPEN WITHOUT PASSWORD */}
          {currentTab === 'STUDENT' && <StudentMobileApp />}

          {/* 2. OPERATOR LOCK SCREEN: Shown when attempting to access any other panel without password */}
          {currentTab !== 'STUDENT' && !isOperatorAuth && (
            <AdminLockScreen
              onUnlock={handleUnlock}
              onBackToStudent={() => {
                setOverrideView(null);
                setActiveTab('STUDENT');
              }}
              targetPanelName={
                currentTab === 'KIOSK' ? 'Kiosk Screen' :
                currentTab === 'ADMIN' ? 'Admin Central' :
                currentTab === 'SIMULATOR' ? 'Hardware Simulator' : 'Deploy Hub'
              }
            />
          )}

          {/* 3. PROTECTED PANELS (Rendered ONLY after entering Master PIN: 1260) */}
          {currentTab !== 'STUDENT' && isOperatorAuth && (
            <>
              {currentTab === 'KIOSK' && (
                <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
                  <KioskScreen />
                </div>
              )}
              {currentTab === 'ADMIN' && <AdminDashboard />}
              {currentTab === 'SIMULATOR' && <HardwareSimulator />}
              {currentTab === 'DEPLOY' && <DeploymentHub />}
            </>
          )}
        </main>

        {/* Commercial & Razorpay Compliance Regulatory Footer */}
        <footer className="bg-slate-950 border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500 space-y-3">
          <div className="flex items-center justify-center gap-2 font-bold text-slate-400">
            <span>{BRAND_CONFIG.brandName}</span>
            <span>•</span>
            <span className="text-amber-400">{BRAND_CONFIG.serviceName}</span>
            <span>•</span>
            <span className="font-mono text-slate-400">{BRAND_CONFIG.domain}</span>
          </div>

          {/* Razorpay Merchant Compliance Policies Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-400 font-medium">
            <button 
              type="button" 
              onClick={() => openPolicy('ABOUT')} 
              className="hover:text-amber-400 transition-colors"
            >
              About Us
            </button>
            <span className="text-slate-700">•</span>
            <button 
              type="button" 
              onClick={() => openPolicy('CONTACT')} 
              className="hover:text-amber-400 transition-colors"
            >
              Contact Us
            </button>
            <span className="text-slate-700">•</span>
            <button 
              type="button" 
              onClick={() => openPolicy('PRIVACY')} 
              className="hover:text-amber-400 transition-colors"
            >
              Privacy Policy
            </button>
            <span className="text-slate-700">•</span>
            <button 
              type="button" 
              onClick={() => openPolicy('TERMS')} 
              className="hover:text-amber-400 transition-colors"
            >
              Terms & Conditions
            </button>
            <span className="text-slate-700">•</span>
            <button 
              type="button" 
              onClick={() => openPolicy('REFUND')} 
              className="hover:text-amber-400 transition-colors text-amber-300 font-bold"
            >
              Cancellation & Refund Policy
            </button>
            <span className="text-slate-700">•</span>
            <button 
              type="button" 
              onClick={() => openPolicy('SHIPPING')} 
              className="hover:text-amber-400 transition-colors"
            >
              Shipping & Delivery Policy
            </button>
          </div>

          <p className="text-[11px] max-w-xl mx-auto text-slate-500">
            Commercial Self-Service Any Time Print (ATP) Kiosk Platform with HP LaserJet Pro MFP M126nw Spooler Integration, Automated Paper Cassette Deduction, Digital Out-of-Home (DOOH) Advertising CMS, and Hostinger Deployment Architecture.
          </p>
        </footer>

        {/* Global Razorpay Merchant Policies Modal */}
        <RazorpayPoliciesModal
          isOpen={policyModalOpen}
          initialTab={policyInitialTab}
          onClose={() => setPolicyModalOpen(false)}
        />
      </div>
    </KioskProvider>
  </ErrorBoundary>
  );
}
