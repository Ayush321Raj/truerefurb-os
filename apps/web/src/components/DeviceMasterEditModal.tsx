'use client';

import React, { useState, useEffect } from 'react';
import { DeviceMaster, ConditionGrade } from '@truerefurb/shared-types';

interface DeviceMasterEditModalProps {
  device: DeviceMaster | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: DeviceMaster) => void;
}

const CONDITION_GRADES: Array<{ value: ConditionGrade; label: string }> = [
  { value: 'GRADE_A_PLUS', label: 'Grade A+ (Pristine / Like New)' },
  { value: 'GRADE_A', label: 'Grade A (Excellent)' },
  { value: 'GRADE_B', label: 'Grade B (Good / Light Wear)' },
  { value: 'GRADE_C', label: 'Grade C (Fair / Minor Scratch)' },
  { value: 'GRADE_D', label: 'Grade D (Heavy Wear / Ding)' },
  { value: 'PARTS_ONLY', label: 'Parts Only (Harvest / Scrap)' },
];

export function DeviceMasterEditModal({
  device,
  isOpen,
  onClose,
  onSave,
}: DeviceMasterEditModalProps) {
  const [formData, setFormData] = useState<Partial<DeviceMaster>>({});

  useEffect(() => {
    if (device) {
      setFormData({
        storage: device.storage,
        ram: device.ram,
        color: device.color,
        condition: device.condition,
        grade: device.grade,
        batteryHealth: device.batteryHealth,
        purchaseCost: device.purchaseCost,
        repairCost: device.repairCost,
        otherCost: device.otherCost,
        sellingPrice: device.sellingPrice,
        currentLocation: device.currentLocation,
        notes: device.notes || '',
      });
    }
  }, [device]);

  if (!isOpen || !device) return null;

  const purchase = Number(formData.purchaseCost ?? device.purchaseCost);
  const repair = Number(formData.repairCost ?? device.repairCost);
  const other = Number(formData.otherCost ?? device.otherCost);
  const calculatedTotal = purchase + repair + other;
  const selling = Number(formData.sellingPrice ?? device.sellingPrice);
  const marginDollar = selling - calculatedTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DeviceMaster = {
      ...device,
      ...formData,
      storage: formData.storage || device.storage,
      ram: formData.ram || device.ram,
      color: formData.color || device.color,
      condition: formData.condition || device.condition,
      grade: formData.grade || device.grade,
      batteryHealth: Number(formData.batteryHealth ?? device.batteryHealth),
      purchaseCost: purchase,
      repairCost: repair,
      otherCost: other,
      totalCost: calculatedTotal,
      sellingPrice: selling,
      currentLocation: formData.currentLocation || device.currentLocation,
      notes: formData.notes,
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Edit Device Specifications</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {device.brand} {device.model} • IMEI: <span style={{ fontFamily: 'var(--font-mono)' }}>{device.imei1}</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Specs row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Storage Capacity *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.storage || ''}
                  onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                  placeholder="e.g. 256GB"
                  required
                />
              </div>

              <div>
                <label className="form-label">RAM Specification *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.ram || ''}
                  onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                  placeholder="e.g. 8GB"
                  required
                />
              </div>

              <div>
                <label className="form-label">Color / Finish *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.color || ''}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="e.g. Natural Titanium"
                  required
                />
              </div>
            </div>

            {/* Condition & Grade */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Condition Description *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.condition || ''}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="e.g. Refurbished OEM Pristine"
                  required
                />
              </div>

              <div>
                <label className="form-label">Condition Grade *</label>
                <select
                  className="form-input"
                  value={formData.grade || 'GRADE_B'}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value as ConditionGrade })}
                  required
                >
                  {CONDITION_GRADES.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Battery & Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Battery Health (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  value={formData.batteryHealth ?? 100}
                  onChange={(e) => setFormData({ ...formData, batteryHealth: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Current Warehouse Location *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.currentLocation || ''}
                  onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                  placeholder="e.g. Bay 3 - Shelf A4"
                  required
                />
              </div>
            </div>

            {/* Financial Costs Section */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Cost & Financial Engine (Auto-calculates Total Cost)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Purchase Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={formData.purchaseCost ?? 0}
                    onChange={(e) => setFormData({ ...formData, purchaseCost: Number(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Repair Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={formData.repairCost ?? 0}
                    onChange={(e) => setFormData({ ...formData, repairCost: Number(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Other Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={formData.otherCost ?? 0}
                    onChange={(e) => setFormData({ ...formData, otherCost: Number(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ color: 'var(--accent-cyan)' }}>Total Cost ($)</label>
                  <div style={{
                    background: 'rgba(0, 242, 254, 0.1)',
                    border: '1px solid rgba(0, 242, 254, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: 'var(--accent-cyan)',
                    textAlign: 'center'
                  }}>
                    ${calculatedTotal.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Selling Price & Margin Preview */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label className="form-label" style={{ color: '#34d399' }}>Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={formData.sellingPrice ?? 0}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projected Gross Margin</div>
                  <div style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: marginDollar >= 0 ? '#34d399' : '#f87171'
                  }}>
                    {marginDollar >= 0 ? `+$${marginDollar.toFixed(2)}` : `-$${Math.abs(marginDollar).toFixed(2)}`}
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>
                      ({calculatedTotal > 0 ? ((marginDollar / calculatedTotal) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="form-label">Notes</label>
              <textarea
                className="form-input"
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Rework history, sensor condition, carrier lock remarks..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
