'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Download, 
  Search, 
  CheckCircle2, 
  Hash, 
  Clock, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuditLogEvent } from '@truerefurb/shared-types';

interface AuditLogViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogViewerModal: React.FC<AuditLogViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { auditLogs } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEvent | null>(null);

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter((log) => {
    const q = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actorName.toLowerCase().includes(q) ||
      log.actorRole.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q) ||
      log.tamperSealHash.toLowerCase().includes(q)
    );
  });

  const exportAuditManifest = () => {
    const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truerefurb-audit-manifest-${Date.now()}.json`;
    a.click();
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-audit-title"
    >
      <div 
        className="modal-dialog modal-dialog-large" 
        style={{ maxWidth: '960px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={22} color="var(--accent-cyan)" />
              <h2 className="modal-title" id="modal-audit-title">
                Immutable Compliance & Security Audit Stream
              </h2>
              <span className="badge grade-badge-aplus" style={{ fontSize: '0.725rem' }}>
                Cryptographically Sealed
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              CTA-2053 & R2v3 Non-Repudiation Audit Ledger &middot; {auditLogs.length} Events Logged
            </p>
          </div>
          <button 
            id="btn-close-audit-modal"
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div style={{ padding: '0.75rem 1.75rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              className="search-input"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem 0.45rem 2.2rem' }}
              placeholder="Search by Actor, Action, Device ID, or Cryptographic Hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            className="btn btn-secondary" 
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
            onClick={exportAuditManifest}
            title="Export full JSON audit trail for ISO/R2 compliance auditors"
          >
            <Download size={14} />
            <span>Export Compliance Manifest</span>
          </button>
        </div>

        {/* Audit Log Table */}
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '1rem 1.75rem' }}>
          <table className="data-table" style={{ fontSize: '0.8rem' }}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor & Role</th>
                <th>Security Action</th>
                <th>Entity Target</th>
                <th>Tamper Seal Hash</th>
                <th style={{ textAlign: 'right' }}>Inspection</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr 
                  key={log.id} 
                  onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                  style={{ cursor: 'pointer', background: selectedLog?.id === log.id ? 'rgba(0, 242, 254, 0.06)' : undefined }}
                >
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{log.actorName}</div>
                    <div style={{ fontSize: '0.675rem', color: 'var(--accent-cyan)' }}>{log.actorRole}</div>
                  </td>

                  <td>
                    <span 
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: log.action.includes('REJECT') ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.12)',
                        color: log.action.includes('REJECT') ? '#fb7185' : '#34d399',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{log.entity}</div>
                    <div className="font-mono" style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>{log.entityId}</div>
                  </td>

                  <td>
                    <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }} title={log.tamperSealHash}>
                      {log.tamperSealHash.substring(0, 10)}...
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                    >
                      {selectedLog?.id === log.id ? 'Hide' : 'Inspect'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Expanded Event Detail Card */}
          {selectedLog && (
            <div style={{ marginTop: '1.25rem', background: '#0c101a', border: '1px solid rgba(0, 242, 254, 0.3)', borderRadius: '10px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                  Audit Event Payload: {selectedLog.id}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  IP: <strong>{selectedLog.ipAddress}</strong> &middot; Hub: <strong>{selectedLog.facilityId}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>PREVIOUS STATE (OLD VALUE)</div>
                  <pre className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(selectedLog.oldValue || 'None / Initial Creation', null, 2)}
                  </pre>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>COMMITTED STATE (NEW VALUE)</div>
                  <pre className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(selectedLog.newValue || selectedLog.action, null, 2)}
                  </pre>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <strong>Justification / Reason:</strong> {selectedLog.reason || 'Standard operational transaction'}
                {selectedLog.approvalId && (
                  <span style={{ marginLeft: '1rem', color: 'var(--accent-cyan)' }}>
                    Linked Approval ID: <strong>{selectedLog.approvalId}</strong>
                  </span>
                )}
              </div>
            </div>
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
