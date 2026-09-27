'use client';

import React, { useState } from 'react';
import { DeviceMaster } from '@truerefurb/shared-types';

interface DeviceMoveLocationModalProps {
  device: DeviceMaster | null;
  isOpen: boolean;
  onClose: () => void;
  onMoveLocation: (deviceId: string, newLocation: string, reason?: string) => void;
}

const COMMON_LOCATIONS = [
  'Bay 1 - Shelf A1 (Apple High-Tier)',
  'Bay 1 - Shelf B2 (MacBook Staging)',
  'Bay 1 - Shelf D1 (Dell XPS Laptops)',
  'Bay 2 - Shelf A1 (Budget Smartphones)',
  'Bay 2 - Shelf C2 (Google Pixel)',
  'Bay 3 - Shelf A4 (Certified Ready Stock)',
  'Bay 3 - Shelf B1 (Samsung Galaxy Flagship)',
  'Bench 1 - Battery Replacement Station',
  'Bench 2 - Flex & Screen Rework Specialist',
  'Bench 4 - Rework Staging Bay',
  'Staging Cage B - Reserved B2B Orders',
  'Dock 1 - Receiving Quarantine Area',
  'RMA Intake Bay - Bin 03',
  'Scrap Harvesting Bin - Rack 9',
];

export function DeviceMoveLocationModal({
  device,
  isOpen,
  onClose,
  onMoveLocation,
}: DeviceMoveLocationModalProps) {
  const [targetLocation, setTargetLocation] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen || !device) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loc = targetLocation.trim();
    if (!loc) {
      alert('Please specify the destination warehouse bay, shelf, or bin.');
      return;
    }
    onMoveLocation(device.id, loc, reason);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Move Device Location</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {device.brand} {device.model} • IMEI: <span style={{ fontFamily: 'var(--font-mono)' }}>{device.imei1}</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Current Location Badge */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Current Position
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
                  📍 {device.currentLocation}
                </div>
              </div>
              <span className={`status-pill status-pill-${device.status}`}>
                {device.status}
              </span>
            </div>

            {/* Quick Pick Facilities */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">
                Quick Select Facility Zone / Warehouse Bay
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.3rem' }}>
                {COMMON_LOCATIONS.map((loc) => (
                  <button
                    type="button"
                    key={loc}
                    onClick={() => setTargetLocation(loc)}
                    style={{
                      textAlign: 'left',
                      padding: '0.55rem 0.75rem',
                      background: targetLocation === loc ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: targetLocation === loc ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: targetLocation === loc ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>📦</span>
                    <span>{loc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Location Input */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">
                Destination Warehouse Bay / Shelf / Bin *
              </label>
              <input
                type="text"
                className="form-input"
                value={targetLocation}
                onChange={(e) => setTargetLocation(e.target.value)}
                placeholder="e.g. Bay 3 - Shelf A4, Bench 2, Bin 104"
                required
              />
            </div>

            {/* Reason */}
            <div>
              <label className="form-label">Relocation Reason</label>
              <input
                type="text"
                className="form-input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Putaway from intake dock, allocated to B2B staging cage"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Confirm Move
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
