'use client';

import React from 'react';
import { DeviceMaster, CONTROLLED_DEVICE_STATUSES } from '@truerefurb/shared-types';
import { isValidImei } from '@truerefurb/validation';

interface DeviceMasterViewModalProps {
  device: DeviceMaster | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit: (device: DeviceMaster) => void;
  onOpenStatusChange: (device: DeviceMaster) => void;
  onOpenMoveLocation: (device: DeviceMaster) => void;
  onOpenSell: (device: DeviceMaster) => void;
}

export function DeviceMasterViewModal({
  device,
  isOpen,
  onClose,
  onOpenEdit,
  onOpenStatusChange,
  onOpenMoveLocation,
  onOpenSell,
}: DeviceMasterViewModalProps) {
  if (!isOpen || !device) return null;

  const isImei1Valid = isValidImei(device.imei1);
  const isImei2Valid = device.imei2 ? isValidImei(device.imei2) : true;
  const statusMeta = CONTROLLED_DEVICE_STATUSES.find((s) => s.status === device.status);

  // Financial calculations
  const totalCost = device.totalCost || (device.purchaseCost + device.repairCost + device.otherCost);
  const marginDollar = device.sellingPrice - totalCost;
  const marginPercent = totalCost > 0 ? ((marginDollar / totalCost) * 100).toFixed(1) : '0';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <span className={`status-pill status-pill-${device.status}`}>
                {statusMeta?.label || device.status}
              </span>
              <span className={`grade-pill grade-pill-${device.grade}`}>
                {device.grade.replace('GRADE_', 'Grade ').replace('_PLUS', '+').replace('_ONLY', ' Only')}
              </span>
            </div>
            <h2 className="modal-title" style={{ fontSize: '1.4rem' }}>
              {device.brand} {device.model}
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Variant: {device.variant || `${device.storage} / ${device.ram} / ${device.color}`}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Identity & Hardware Banner */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>
              Hardware Identifiers & Database Keys
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Internal UUID (Primary Key)</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                  {device.id}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Serial Number</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
                  {device.serialNumber}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Organization ID</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {device.organizationId}
                </div>
              </div>
            </div>

            {/* IMEI Validation Status */}
            <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>IMEI 1 (Primary)</span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: isImei1Valid ? '#34d399' : '#f87171',
                    background: isImei1Valid ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px'
                  }}>
                    {isImei1Valid ? '✓ 15-Digit Luhn Verified' : '✕ Invalid Checksum'}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#fff', letterSpacing: '0.05em' }}>
                  {device.imei1}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>IMEI 2 (Secondary eSIM/Slot)</span>
                  {device.imei2 ? (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: isImei2Valid ? '#34d399' : '#f87171',
                      background: isImei2Valid ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px'
                    }}>
                      {isImei2Valid ? '✓ 15-Digit Luhn Verified' : '✕ Invalid Checksum'}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Single SIM Model</span>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: device.imei2 ? '#fff' : 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  {device.imei2 || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Physical Specifications Grid */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: 700 }}>
              Physical Specifications & Health
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              <div className="spec-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Storage</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{device.storage}</div>
              </div>
              <div className="spec-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>RAM</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{device.ram}</div>
              </div>
              <div className="spec-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Color / Finish</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{device.color}</div>
              </div>
              <div className="spec-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Battery Health</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: device.batteryHealth >= 90 ? '#34d399' : device.batteryHealth >= 80 ? '#fbbf24' : '#f87171' }}>
                  {device.batteryHealth > 0 ? `${device.batteryHealth}%` : 'Depleted'}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Cost Engine Breakdown */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(0, 242, 254, 0.03) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '1.1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#34d399', fontWeight: 700 }}>
                Financial Cost Engine & Margins
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Formula: Total Cost = Purchase + Repair + Other
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Purchase Cost</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>${device.purchaseCost.toFixed(2)}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Repair Cost</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fb7185' }}>${device.repairCost.toFixed(2)}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Other Cost</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#94a3b8' }}>${device.otherCost.toFixed(2)}</div>
              </div>
              <div style={{ background: 'rgba(0, 242, 254, 0.08)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>Total Cost</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>${totalCost.toFixed(2)}</div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ fontSize: '0.7rem', color: '#34d399' }}>Selling Price</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>${device.sellingPrice.toFixed(2)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Net Margin: <strong style={{ color: marginDollar >= 0 ? '#34d399' : '#f87171' }}>+${marginDollar.toFixed(2)}</strong> ({marginPercent}%)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Condition: <strong style={{ color: '#fff' }}>{device.condition}</strong>
              </span>
            </div>
          </div>

          {/* Location & Logistics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.35rem' }}>
                Warehouse Location
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                📍 {device.currentLocation}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.35rem' }}>
                Timestamps
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Created: {new Date(device.createdAt).toLocaleString()}<br />
                Updated: {new Date(device.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Notes */}
          {device.notes && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.35rem' }}>
                Technical & Diagnostic Notes
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {device.notes}
              </p>
            </div>
          )}
        </div>

        {/* Modal Actions Footer with all 4 row transitions */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="inventory-act-btn btn-edit"
              onClick={() => {
                onClose();
                onOpenEdit(device);
              }}
            >
              ✏️ Edit Specs
            </button>
            <button
              className="inventory-act-btn btn-status"
              onClick={() => {
                onClose();
                onOpenStatusChange(device);
              }}
            >
              🔄 Change Status
            </button>
            <button
              className="inventory-act-btn btn-move"
              onClick={() => {
                onClose();
                onOpenMoveLocation(device);
              }}
            >
              📦 Move Location
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {device.status !== 'SOLD' && device.status !== 'SCRAPPED' && (
              <button
                className="inventory-act-btn btn-sell"
                style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
                onClick={() => {
                  onClose();
                  onOpenSell(device);
                }}
              >
                🏷️ Sell Device
              </button>
            )}
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
