'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  UserCheck, 
  ArrowRight,
  Filter,
  Check,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApprovalRequest, ApprovalStatus } from '@truerefurb/shared-types';

interface ApprovalCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApprovalCenterModal: React.FC<ApprovalCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { approvalRequests, reviewApprovalRequest, canApprove, user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | 'ALL'>('ALL');
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ id: string; text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleReview = async (requestId: string, action: 'APPROVED' | 'REJECTED') => {
    const comment = commentMap[requestId] || (action === 'APPROVED' ? 'Approved in accordance with compliance standards.' : 'Rejected due to insufficient verification.');
    setProcessingId(requestId);
    const res = await reviewApprovalRequest(requestId, action, comment);
    setProcessingId(null);

    if (res.success) {
      setFeedbackMsg({ id: requestId, text: `Transaction successfully marked as ${action}!` });
      setTimeout(() => setFeedbackMsg(null), 3500);
    } else {
      setFeedbackMsg({ id: requestId, text: res.error || 'Failed to review', isError: true });
    }
  };

  const filteredRequests = approvalRequests.filter((req) => {
    if (filterStatus === 'ALL') return true;
    return req.status === filterStatus;
  });

  const pendingCount = approvalRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-approval-title"
    >
      <div 
        className="modal-dialog modal-dialog-large" 
        style={{ maxWidth: '880px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldAlert size={22} color="var(--accent-amber)" />
              <h2 className="modal-title" id="modal-approval-title">
                Governance & Approval Engine
              </h2>
              {pendingCount > 0 && (
                <span className="badge grade-badge-b" style={{ fontSize: '0.75rem' }}>
                  {pendingCount} Pending Action
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Maker-Checker Authorization Matrix &middot; Enforcing Separation of Duties
            </p>
          </div>
          <button 
            id="btn-close-approval-modal"
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ padding: '0.85rem 1.75rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.015)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  background: filterStatus === st ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                  border: filterStatus === st ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                  color: filterStatus === st ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {st} {st === 'PENDING' && `(${pendingCount})`}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Active Signer: <strong style={{ color: '#fff' }}>{user?.fullName}</strong> ({user?.role})
          </div>
        </div>

        {/* Requests List */}
        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={36} color="var(--accent-emerald)" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 600, color: '#fff' }}>Zero Pending Approval Requests</div>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>All operational discrepancies and override requests have been settled.</p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const userCanApprove = canApprove(req);
              const isPending = req.status === 'PENDING';

              const urgencyColor = 
                req.urgency === 'CRITICAL' ? 'var(--accent-rose)' :
                req.urgency === 'HIGH' ? 'var(--accent-amber)' : 'var(--accent-cyan)';

              return (
                <div 
                  key={req.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginBottom: '1rem',
                    borderLeft: `4px solid ${urgencyColor}`,
                  }}
                >
                  {/* Top line */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: urgencyColor, textTransform: 'uppercase' }}>
                          {req.urgency} Urgency
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>&middot;</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                          {req.transactionType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginTop: '0.2rem' }}>
                        {req.title}
                      </h3>
                    </div>

                    <span 
                      className={`badge ${
                        req.status === 'APPROVED' ? 'grade-badge-aplus' :
                        req.status === 'REJECTED' ? 'grade-badge-c' : 'grade-badge-b'
                      }`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {req.status}
                    </span>
                  </div>

                  {/* Maker & Approver pairing */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', background: 'rgba(0, 0, 0, 0.25)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.775rem', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Maker (Requester):</span>{' '}
                      <strong style={{ color: '#fff' }}>{req.makerName}</strong>{' '}
                      <span style={{ color: 'var(--text-highlight)' }}>({req.makerRole})</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Mandatory Approver:</span>{' '}
                      <strong style={{ color: 'var(--accent-amber)' }}>{req.approverRole.replace(/_/g, ' ')}</strong>
                    </div>
                  </div>

                  {/* Value Delta comparison */}
                  {(req.oldValue || req.newValue) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', marginBottom: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Proposed State Delta:</span>
                      <span className="font-mono" style={{ color: 'var(--accent-rose)' }}>{req.oldValue}</span>
                      <ArrowRight size={14} color="var(--text-muted)" />
                      <span className="font-mono" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{req.newValue}</span>
                    </div>
                  )}

                  {/* Justification */}
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '0.75rem' }}>
                    <strong>Business Justification:</strong> {req.justification}
                  </p>

                  {/* Feedback Message if any */}
                  {feedbackMsg && feedbackMsg.id === req.id && (
                    <div style={{ fontSize: '0.75rem', color: feedbackMsg.isError ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {feedbackMsg.text}
                    </div>
                  )}

                  {/* Review / Approval Controls */}
                  {isPending && (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                      {userCanApprove ? (
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.75rem' }}
                            placeholder="Optional inspection or sign-off comment..."
                            value={commentMap[req.id] || ''}
                            onChange={(e) => setCommentMap({ ...commentMap, [req.id]: e.target.value })}
                          />
                          <button
                            id={`btn-approve-${req.id}`}
                            className="btn btn-primary"
                            style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem', background: 'var(--accent-emerald)', color: '#000' }}
                            onClick={() => handleReview(req.id, 'APPROVED')}
                            disabled={processingId === req.id}
                          >
                            <Check size={14} strokeWidth={2.5} />
                            <span>Authorize & Audit</span>
                          </button>
                          <button
                            id={`btn-reject-${req.id}`}
                            className="btn btn-secondary"
                            style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem', borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)' }}
                            onClick={() => handleReview(req.id, 'REJECTED')}
                            disabled={processingId === req.id}
                          >
                            <X size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <Lock size={14} color="var(--accent-amber)" />
                          <span>
                            You are signed in as <strong>{user?.role}</strong>. Only <strong>{req.approverRole}</strong> or <strong>SUPER_ADMIN</strong> can authorize this transaction.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Settled state review info */}
                  {!isPending && req.reviewedAt && (
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Authorized by: <strong>{req.approverName || 'Authorized Approver'}</strong></span>
                      <span>Decision: <em>"{req.reviewComment}"</em> &middot; {new Date(req.reviewedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
