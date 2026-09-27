'use client';

import React, { useState } from 'react';
import { DeviceMaster, DeviceStatus, ConditionGrade, CONTROLLED_DEVICE_STATUSES } from '@truerefurb/shared-types';
import { isValidImei, calculateImeiCheckDigit } from '@truerefurb/validation';

interface DeviceMasterCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDevice: (device: DeviceMaster) => void;
  existingDevices: DeviceMaster[];
}

const BRANDS = ['Apple', 'Samsung', 'Google', 'Dell', 'Lenovo', 'HP', 'Other'];

export function DeviceMasterCreateModal({
  isOpen,
  onClose,
  onAddDevice,
  existingDevices,
}: DeviceMasterCreateModalProps) {
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [storage, setStorage] = useState('256GB');
  const [ram, setRam] = useState('8GB');
  const [color, setColor] = useState('');
  const [condition, setCondition] = useState('Factory Recertified - Flawless');
  const [grade, setGrade] = useState<ConditionGrade>('GRADE_A');
  const [batteryHealth, setBatteryHealth] = useState(100);
  const [purchaseCost, setPurchaseCost] = useState(0);
  const [repairCost, setRepairCost] = useState(0);
  const [otherCost, setOtherCost] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [status, setStatus] = useState<DeviceStatus>('PURCHASED');
  const [currentLocation, setCurrentLocation] = useState('Dock 1 - Receiving Area');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Live Luhn validation
  const isImei1Valid = imei1.length === 15 && isValidImei(imei1);
  const isImei2Valid = !imei2 || (imei2.length === 15 && isValidImei(imei2));

  // Check duplicate active devices
  const activeDuplicateImei1 = existingDevices.find(
    (d) =>
      d.status !== 'SCRAPPED' &&
      d.status !== 'SOLD' &&
      (d.imei1 === imei1.trim() || (d.imei2 && d.imei2 === imei1.trim()))
  );

  const activeDuplicateImei2 = imei2.trim()
    ? existingDevices.find(
        (d) =>
          d.status !== 'SCRAPPED' &&
          d.status !== 'SOLD' &&
          (d.imei1 === imei2.trim() || (d.imei2 && d.imei2 === imei2.trim()))
      )
    : null;

  // Total cost derivation
  const totalCost = Number(purchaseCost || 0) + Number(repairCost || 0) + Number(otherCost || 0);

  // Helper to generate a valid check digit
  const handleAutoFixImei1 = () => {
    const clean = imei1.replace(/\D/g, '');
    if (clean.length >= 14) {
      const prefix14 = clean.slice(0, 14);
      try {
        const check = calculateImeiCheckDigit(prefix14);
        setImei1(`${prefix14}${check}`);
        setErrorMsg('');
      } catch (err) {
        setErrorMsg('Please enter at least 14 digits to compute check digit');
      }
    } else {
      setErrorMsg('Enter at least 14 digits to calculate Luhn check digit');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!model.trim()) {
      setErrorMsg('Device Model is required');
      return;
    }
    if (!serialNumber.trim()) {
      setErrorMsg('Serial Number is required');
      return;
    }

    // IMEI 1 check
    if (imei1.length !== 15 || !isValidImei(imei1)) {
      setErrorMsg('IMEI 1 must be exactly 15 digits and pass the Luhn algorithm checksum');
      return;
    }

    // IMEI 2 check (if supplied)
    if (imei2 && (imei2.length !== 15 || !isValidImei(imei2))) {
      setErrorMsg('IMEI 2 must be exactly 15 digits and pass the Luhn algorithm checksum');
      return;
    }

    // Duplicate prevention
    if (activeDuplicateImei1) {
      setErrorMsg(`Active device duplicate error: IMEI 1 already exists on active device ${activeDuplicateImei1.brand} ${activeDuplicateImei1.model} (Status: ${activeDuplicateImei1.status}).`);
      return;
    }

    if (activeDuplicateImei2) {
      setErrorMsg(`Active device duplicate error: IMEI 2 already exists on active device ${activeDuplicateImei2.brand} ${activeDuplicateImei2.model} (Status: ${activeDuplicateImei2.status}).`);
      return;
    }

    // Internal UUID generation (UUID != IMEI)
    const newId = `dev-uuid-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const newDevice: DeviceMaster = {
      id: newId,
      organizationId: 'org-truerefurb-main',
      imei1: imei1.trim(),
      imei2: imei2.trim() || undefined,
      serialNumber: serialNumber.trim().toUpperCase(),
      brand,
      model: model.trim(),
      variant: variant.trim() || `${storage} / ${ram} / ${color}`,
      storage,
      ram,
      color: color.trim() || 'Standard Finish',
      condition,
      grade,
      batteryHealth: Number(batteryHealth),
      purchaseCost: Number(purchaseCost),
      repairCost: Number(repairCost),
      otherCost: Number(otherCost),
      totalCost,
      sellingPrice: Number(sellingPrice),
      status,
      currentLocation: currentLocation.trim(),
      notes: notes.trim(),
      createdAt: now,
      updatedAt: now,
      stage: 'INTAKE',
      conditionGrade: grade,
      functionalScore: 90,
    };

    onAddDevice(newDevice);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Register New Device (Device Master)</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Internal UUID Primary Key • 15-Digit Luhn IMEI Check • Duplicate Active Guard
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Brand, Model, Variant */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Brand *</label>
                <select
                  className="form-input"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                >
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Model Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. iPhone 15 Pro Max"
                  required
                />
              </div>

              <div>
                <label className="form-label">Variant Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  placeholder="e.g. 256GB / 8GB / Natural Titanium"
                />
              </div>
            </div>

            {/* Serial Number & Dual IMEI Section with Luhn Verification */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Hardware Identity & Dual IMEI Validation
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Serial Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. C39DN0YMP0G1"
                    required
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">IMEI 1 (Primary) *</label>
                    {imei1 && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isImei1Valid ? '#34d399' : '#f87171' }}>
                        {isImei1Valid ? '✓ Valid Luhn' : '✕ Invalid Checksum'}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={15}
                    className="form-input"
                    value={imei1}
                    onChange={(e) => setImei1(e.target.value.replace(/\D/g, ''))}
                    placeholder="15 numeric digits"
                    style={{
                      borderColor: imei1.length === 15 ? (isImei1Valid ? '#10b981' : '#f43f5e') : undefined
                    }}
                    required
                  />
                  {imei1.length >= 14 && !isImei1Valid && (
                    <button
                      type="button"
                      onClick={handleAutoFixImei1}
                      style={{
                        marginTop: '0.25rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.68rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Compute Luhn check digit
                    </button>
                  )}
                  {activeDuplicateImei1 && (
                    <div style={{ fontSize: '0.68rem', color: '#f87171', marginTop: '0.2rem' }}>
                      ⚠️ Active duplicate detected!
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">IMEI 2 (Secondary / eSIM)</label>
                    {imei2 && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isImei2Valid ? '#34d399' : '#f87171' }}>
                        {isImei2Valid ? '✓ Valid Luhn' : '✕ Invalid Checksum'}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={15}
                    className="form-input"
                    value={imei2}
                    onChange={(e) => setImei2(e.target.value.replace(/\D/g, ''))}
                    placeholder="Optional 15 numeric digits"
                    style={{
                      borderColor: imei2.length === 15 ? (isImei2Valid ? '#10b981' : '#f43f5e') : undefined
                    }}
                  />
                  {activeDuplicateImei2 && (
                    <div style={{ fontSize: '0.68rem', color: '#f87171', marginTop: '0.2rem' }}>
                      ⚠️ Active duplicate detected!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Specifications Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Storage *</label>
                <input
                  type="text"
                  className="form-input"
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  placeholder="e.g. 256GB"
                  required
                />
              </div>

              <div>
                <label className="form-label">RAM *</label>
                <input
                  type="text"
                  className="form-input"
                  value={ram}
                  onChange={(e) => setRam(e.target.value)}
                  placeholder="e.g. 8GB"
                  required
                />
              </div>

              <div>
                <label className="form-label">Color / Finish *</label>
                <input
                  type="text"
                  className="form-input"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Space Black"
                  required
                />
              </div>

              <div>
                <label className="form-label">Battery Health (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  value={batteryHealth}
                  onChange={(e) => setBatteryHealth(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Condition, Grade & Controlled Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Condition Description *</label>
                <input
                  type="text"
                  className="form-input"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="e.g. Original OEM - Minor Bezel Ding"
                  required
                />
              </div>

              <div>
                <label className="form-label">Grade *</label>
                <select
                  className="form-input"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as ConditionGrade)}
                  required
                >
                  <option value="GRADE_A_PLUS">Grade A+ (Pristine)</option>
                  <option value="GRADE_A">Grade A (Excellent)</option>
                  <option value="GRADE_B">Grade B (Good)</option>
                  <option value="GRADE_C">Grade C (Fair)</option>
                  <option value="GRADE_D">Grade D (Heavy Wear)</option>
                  <option value="PARTS_ONLY">Parts Only</option>
                </select>
              </div>

              <div>
                <label className="form-label">Status (Controlled) *</label>
                <select
                  className="form-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DeviceStatus)}
                  required
                >
                  {CONTROLLED_DEVICE_STATUSES.map((s) => (
                    <option key={s.status} value={s.status}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Financial Cost Engine */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Cost Breakdown & Target Price (Formula: Total Cost = Purchase + Repair + Other)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Purchase Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(Number(e.target.value))}
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
                    value={repairCost}
                    onChange={(e) => setRepairCost(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="form-label">Other Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={otherCost}
                    onChange={(e) => setOtherCost(Number(e.target.value))}
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
                    fontSize: '1rem',
                    color: 'var(--accent-cyan)',
                    textAlign: 'center'
                  }}>
                    ${totalCost.toFixed(2)}
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ color: '#34d399' }}>Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location & Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Current Location *</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  placeholder="e.g. Bay 3 - Shelf A4"
                  required
                />
              </div>

              <div>
                <label className="form-label">Diagnostic Notes</label>
                <input
                  type="text"
                  className="form-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sealed box, dock verified"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Register Device in Master
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
