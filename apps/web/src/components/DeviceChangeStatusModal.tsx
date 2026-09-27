'use client';

import React, { useState } from 'react';
import { DeviceMaster, DeviceStatus, CONTROLLED_DEVICE_STATUSES } from '@truerefurb/shared-types';

interface DeviceChangeStatusModalProps {
  device: DeviceMaster | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (deviceId: string, newStatus: DeviceStatus, reason: string, notes?: string) => void;
}

export function DeviceChangeStatusModal({
  device,
  isOpen,
  onClose,
  onStatusChange,
}: DeviceChangeStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<DeviceStatus>('READY_TO_SELL');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !device) return null;

  const currentMeta = CONTROLLED_DEVICE_STATUSES.find((s) => s.status === device.status);
  const targetMeta = CONTROLLED_DEVICE_STATUSES.find((s) => s.status === selectedStatus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('A valid operational reason is required for status transition.');
      return;
    }
    onStatusChange(device.id, selectedStatus, reason, notes);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Change Controlled Device Status</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {device.brand} {device.model} • IMEI: <span style={{ fontFamily: 'var(--font-mono)' }}>{device.imei1}</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Current vs Target Comparison */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Current Status
                </div>
                <span className={`status-pill status-pill-${device.status}`}>
                  {currentMeta?.label || device.status}
                </span>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  {currentMeta?.description}
                </div>
              </div>

              <div style={{ fontSize: '1.4rem', color: 'var(--text-muted)' }}>➔</div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Target Transition
                </div>
                <span className={`status-pill status-pill-${selectedStatus}`}>
                  {targetMeta?.label || selectedStatus}
                </span>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  {targetMeta?.description}
                </div>
              </div>
            </div>

            {/* Controlled Status Selection */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Select Controlled Status (Enum Restricted) *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                {CONTROLLED_DEVICE_STATUSES.map((s) => {
                  const isCurrent = s.status === device.status;
                  const isSelected = s.status === selectedStatus;
                  return (
                    <button
                      type="button"
                      key={s.status}
                      onClick={() => setSelectedStatus(s.status)}
                      style={{
                        textAlign: 'left',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected
                          ? 'rgba(0, 242, 254, 0.12)'
                          : isCurrent
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected
                          ? '1px solid var(--accent-cyan)'
                          : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: isSelected ? 'var(--accent-cyan)' : '#fff' }}>
                          {s.label}
                        </span>
                        {isCurrent && (
                          <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px', color: '#cbd5e1' }}>
                            Current
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                        {s.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Operational Reason (Mandatory for audit trail) */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">
                Operational Justification / Reason *
              </label>
              <input
                type="text"
                className="form-input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Completed bench testing pass, ready for retail listing"
                required
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="form-label">Additional Audit Notes</label>
              <textarea
                className="form-input"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Technician badge, test station id, or packaging container ref..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Confirm Status Transition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
