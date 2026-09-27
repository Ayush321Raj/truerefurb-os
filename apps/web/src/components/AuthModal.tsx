'use client';

import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SystemRole } from '@truerefurb/shared-types';
import { ROLE_CONFIGS } from '@truerefurb/config';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'LOGIN' | 'FORGOT_PASSWORD';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'LOGIN',
}) => {
  const { login, requestPasswordReset, resetPassword, switchDemoRole } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'FORGOT_PASSWORD' | 'RESET_CONFIRM'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to authenticate');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    const res = await requestPasswordReset(email);
    setIsSubmitting(false);

    if (res.success && res.token) {
      setResetToken(res.token);
      setSuccessMsg(`Simulated Reset Token Generated: ${res.token}`);
      setMode('RESET_CONFIRM');
    } else {
      setErrorMsg(res.error || 'Email not found');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    const res = await resetPassword(resetToken, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('Password updated successfully! You can now log in.');
      setMode('LOGIN');
      setPassword(newPassword);
    } else {
      setErrorMsg(res.error || 'Failed to reset password');
    }
  };

  const ROLES_LIST: Array<{ role: SystemRole; name: string; title: string; color: string }> = [
    { role: 'SUPER_ADMIN', name: 'Elizabeth Vance', title: 'Global Platform Admin (Full Scope)', color: '#f43f5e' },
    { role: 'TENANT_ADMIN', name: 'Alexa Vance', title: 'Tenant Admin (IMEI & Role Approval)', color: '#10b981' },
    { role: 'OPERATIONS_MANAGER', name: 'Carlos Mendoza', title: 'Operations Manager (Cross-Module)', color: '#00f2fe' },
    { role: 'QA_SUPERVISOR', name: 'Sarah Lin', title: 'QA Supervisor (Grade & Repair Approver)', color: '#8b5cf6' },
    { role: 'QA_INSPECTOR', name: 'Mei Chen', title: 'QA Inspector (Proposed Grading Maker)', color: '#a78bfa' },
    { role: 'REPAIR_TECHNICIAN', name: 'Marcus Vance', title: 'Repair Tech (Assigned Work Orders)', color: '#f59e0b' },
    { role: 'INVENTORY_MANAGER', name: 'Darius Cole', title: 'Inventory Manager (Stock Adjust Approver)', color: '#3b82f6' },
    { role: 'WAREHOUSE_CLERK', name: 'Jackson Price', title: 'Warehouse Clerk (Dock & Putaway Maker)', color: '#60a5fa' },
    { role: 'FINANCE_MANAGER', name: 'Rachel Adams', title: 'Finance Manager (GST Invoicing & Refunds)', color: '#10b981' },
    { role: 'SALES_MANAGER', name: 'Vikram Patel', title: 'Sales Manager (Discount & Price Approver)', color: '#fb923c' },
    { role: 'ECOMMERCE_MANAGER', name: 'Sophia Taylor', title: 'E-Com Manager (Channel Listing Engine)', color: '#ec4899' },
    { role: 'AUDITOR', name: 'Arthur Dent', title: 'Compliance Auditor (Read-Only)', color: '#94a3b8' },
  ];

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-auth-title"
    >
      <div 
        className="modal-dialog" 
        style={{ maxWidth: '640px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Lock size={20} color="var(--accent-cyan)" />
            <h2 className="modal-title" id="modal-auth-title">
              {mode === 'LOGIN' && 'Sign In to TrueRefurb OS'}
              {mode === 'FORGOT_PASSWORD' && 'Reset Work Password'}
              {mode === 'RESET_CONFIRM' && 'Set New Password'}
            </h2>
          </div>
          <button 
            id="btn-close-auth-modal"
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close authentication modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {errorMsg && (
            <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', color: '#fb7185', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', color: '#34d399', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Mode 1: LOGIN */}
          {mode === 'LOGIN' && (
            <div>
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="login-email">Facility Email</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      id="login-email"
                      type="email" 
                      className="form-input" 
                      style={{ width: '100%', paddingLeft: '2.4rem' }}
                      placeholder="technician@truerefurb.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" htmlFor="login-password">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setMode('FORGOT_PASSWORD')}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input 
                      id="login-password"
                      type={showPassword ? 'text' : 'password'} 
                      className="form-input" 
                      style={{ width: '100%', paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  id="btn-login-submit"
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? 'Authenticating...' : 'Sign In with JWT'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Demo Persona Quick Switcher */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  Quick RBAC & Scope Personas (Single Click)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
                  {ROLES_LIST.map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      id={`btn-demo-role-${r.role.toLowerCase()}`}
                      onClick={() => {
                        switchDemoRole(r.role);
                        onClose();
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.6rem 0.75rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = r.color;
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{r.name}</span>
                        <span style={{ fontSize: '0.62rem', color: r.color, fontWeight: 700 }}>{r.role.split('_')[0]}</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: FORGOT PASSWORD */}
          {mode === 'FORGOT_PASSWORD' && (
            <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Enter your TrueRefurb workstation email to receive a cryptographically signed password reset token.
              </p>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Account Email</label>
                <input 
                  id="forgot-email"
                  type="email" 
                  className="form-input" 
                  placeholder="alexa.vance@truerefurb.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setMode('LOGIN')}>
                  Back to Sign In
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Generate Reset Token
                </button>
              </div>
            </form>
          )}

          {/* Mode 3: RESET CONFIRM */}
          {mode === 'RESET_CONFIRM' && (
            <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Reset Verification Token</label>
                <input 
                  type="text" 
                  className="form-input font-mono" 
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Secure Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Min 8 characters with numbers & symbols"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setMode('LOGIN')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Update Password & Hash
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
