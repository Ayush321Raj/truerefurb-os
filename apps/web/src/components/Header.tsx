'use client';

import React from 'react';
import { 
  PlusCircle, 
  Calculator, 
  TrendingUp, 
  RefreshCw,
  Lock,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { UserMenu } from './UserMenu';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenIntake: () => void;
  onOpenGradingCalc: () => void;
  onOpenValuation: () => void;
  onOpenAuth: () => void;
  onOpenApprovals: () => void;
  onOpenAudit: () => void;
  deviceCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenIntake,
  onOpenGradingCalc,
  onOpenValuation,
  onOpenAuth,
  onOpenApprovals,
  onOpenAudit,
  deviceCount,
}) => {
  const { hasPermission, approvalRequests, user } = useAuth();

  const canIntake = hasPermission('device.create');
  const canGrade = hasPermission('diagnostic.run') || hasPermission('qa.inspect');
  const canViewPricing = hasPermission('listing.read') || hasPermission('order.read');

  const pendingApprovalsCount = approvalRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <header className="top-nav">
      <div className="brand-section">
        <div className="brand-logo" title="TrueRefurb OS Core">
          <RefreshCw size={24} strokeWidth={2.5} />
        </div>
        <div className="brand-text">
          <h1>
            TrueRefurb <span style={{ color: 'var(--accent-cyan)' }}>OS</span>
            <span className="brand-tag">v3.0 Enterprise</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Granular RBAC &middot; Data Scope &middot; Maker-Checker Approvals &middot; Audit
          </p>
        </div>
      </div>

      <div className="nav-actions">
        {/* Governance & Approval Center Trigger */}
        <button
          id="btn-open-approvals"
          className="btn btn-secondary"
          onClick={onOpenApprovals}
          title="Open Maker-Checker Approval Governance Center"
          style={{ position: 'relative' }}
        >
          <ShieldAlert size={16} color="var(--accent-amber)" />
          <span>Approvals</span>
          {pendingApprovalsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--accent-rose)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(244, 63, 94, 0.6)',
              }}
            >
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        {/* Audit Stream Trigger */}
        <button
          id="btn-open-audit"
          className="btn btn-secondary"
          onClick={onOpenAudit}
          title="View Immutable Audit Event Stream & Non-Repudiation Logs"
        >
          <FileText size={16} color="var(--accent-cyan)" />
          <span>Audit Log</span>
        </button>

        {/* Grading Calculator Button */}
        <button 
          id="btn-open-grading-calc"
          className="btn btn-secondary" 
          onClick={canGrade ? onOpenGradingCalc : undefined}
          title={canGrade ? 'Open Cosmetic & Functional Grading Calculator' : 'Restricted: Requires qa.inspect or diagnostic.run'}
          style={{ opacity: canGrade ? 1 : 0.45, cursor: canGrade ? 'pointer' : 'not-allowed' }}
        >
          {canGrade ? <Calculator size={16} /> : <Lock size={14} color="var(--accent-amber)" />}
          <span>Grading Calc</span>
        </button>

        {/* Valuation Engine Button */}
        <button 
          id="btn-open-valuation"
          className="btn btn-secondary" 
          onClick={canViewPricing ? onOpenValuation : undefined}
          title={canViewPricing ? 'Channel Resale & Margin Simulator' : 'Restricted: Requires listing.read or order.read'}
          style={{ opacity: canViewPricing ? 1 : 0.45, cursor: canViewPricing ? 'pointer' : 'not-allowed' }}
        >
          {canViewPricing ? <TrendingUp size={16} /> : <Lock size={14} color="var(--accent-amber)" />}
          <span>Valuation Engine</span>
        </button>

        {/* Intake Device Button */}
        <button 
          id="btn-open-intake"
          className="btn btn-primary" 
          onClick={canIntake ? onOpenIntake : undefined}
          title={canIntake ? 'Intake and catalog incoming device' : 'Restricted: Requires device.create permission'}
          style={{ opacity: canIntake ? 1 : 0.45, cursor: canIntake ? 'pointer' : 'not-allowed' }}
        >
          {canIntake ? <PlusCircle size={16} /> : <Lock size={14} color="#000" />}
          <span>Intake Device</span>
        </button>

        {/* User Profile & RBAC Dropdown */}
        <UserMenu onOpenAuthModal={onOpenAuth} />
      </div>
    </header>
  );
};
