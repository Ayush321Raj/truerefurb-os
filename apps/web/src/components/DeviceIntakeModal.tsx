'use client';

import React, { useState } from 'react';
import { X, PlusCircle, Sparkles, Box, Check } from 'lucide-react';
import { DeviceItem, DeviceCategory, ConditionGrade } from '@truerefurb/shared-types';

interface DeviceIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDevice: (device: DeviceItem) => void;
}

export const DeviceIntakeModal: React.FC<DeviceIntakeModalProps> = ({
  isOpen,
  onClose,
  onAddDevice,
}) => {
  const [make, setMake] = useState('Apple');
  const [model, setModel] = useState('iPhone 15 Pro');
  const [category, setCategory] = useState<DeviceCategory>('SMARTPHONE');
  const [storage, setStorage] = useState('256GB');
  const [color, setColor] = useState('Natural Titanium');
  const [serialNumber, setSerialNumber] = useState('C02' + Math.random().toString(36).substring(2, 9).toUpperCase());
  const [imei, setImei] = useState('35' + Math.floor(1000000000000 + Math.random() * 9000000000000));
  const [source, setSource] = useState<'CARRIER_TRADE_IN' | 'ENTERPRISE_FLEET' | 'B2B_AUCTION' | 'CONSUMER_BUYBACK'>('CARRIER_TRADE_IN');
  const [grade, setGrade] = useState<ConditionGrade>('GRADE_A');
  const [acquisitionCost, setAcquisitionCost] = useState('550');
  const [targetResalePrice, setTargetResalePrice] = useState('850');

  if (!isOpen) return null;

  const handleGenerateSerial = () => {
    setSerialNumber('C02' + Math.random().toString(36).substring(2, 9).toUpperCase());
    setImei('35' + Math.floor(1000000000000 + Math.random() * 9000000000000));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const acq = parseFloat(acquisitionCost) || 0;
    const resale = parseFloat(targetResalePrice) || 0;

    const newDevice: DeviceItem = {
      id: `dev-${Date.now()}`,
      organizationId: 'org-truerefurb-main',
      imei1: imei || '356938051000017',
      serialNumber,
      brand: make,
      model,
      variant: `${storage} / 8GB / ${color}`,
      storage,
      ram: '8GB',
      color,
      condition: 'Dock Intake Verified',
      grade,
      batteryHealth: 90,
      purchaseCost: acq,
      repairCost: 0,
      otherCost: 0,
      totalCost: acq,
      sellingPrice: resale,
      status: 'RECEIVED',
      currentLocation: 'Intake Dock Area',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Legacy fields
      make,
      category,
      stage: 'INTAKE',
      conditionGrade: grade,
      functionalScore: 92,
      acquisitionCost: acq,
      targetResalePrice: resale,
      estimatedMargin: Math.max(0, resale - acq),
      intakeDate: new Date().toISOString().split('T')[0],
      source,
      warehouseLocation: 'Intake Dock Area',
      binNumber: `BIN-${Math.floor(1000 + Math.random() * 9000)}`,
      assignedTechnician: 'Auto-Assigned Station #1',
      activeChannels: ['AMAZON_RENEWED', 'BACK_MARKET'],
      repairs: [],
      diagnosticReport: {
        id: `diag-${Date.now()}`,
        deviceId: `dev-${Date.now()}`,
        technicianId: 'TECH-AUTO',
        technicianName: 'Automated Intake Scan',
        batteryHealthPercent: 90,
        batteryCycleCount: 140,
        screenCondition: 'FLAWLESS',
        functionalScore: 92,
        allPassed: true,
        completedAt: new Date().toISOString(),
        checklist: [
          { id: 'c1', name: 'Power-on & Boot Loop Check', category: 'HOUSING', status: 'PASSED', score: 100 },
          { id: 'c2', name: 'Carrier & Blacklist Verification', category: 'CONNECTIVITY', status: 'PASSED', score: 100 },
          { id: 'c3', name: 'Digitizer & Touch Grid', category: 'DISPLAY', status: 'PASSED', score: 95 }
        ]
      }
    };

    onAddDevice(newDevice);
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-intake-title"
    >
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Box size={20} color="var(--accent-cyan)" />
            <h2 className="modal-title" id="modal-intake-title">
              Device Intake & Cataloging
            </h2>
          </div>
          <button 
            id="btn-close-intake-modal"
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close intake dialog"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="intake-make">Manufacturer / Brand</label>
                <select 
                  id="intake-make"
                  className="form-input" 
                  value={make} 
                  onChange={(e) => setMake(e.target.value)}
                >
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Google">Google</option>
                  <option value="Lenovo">Lenovo</option>
                  <option value="Dell">Dell</option>
                  <option value="Sony">Sony</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="intake-model">Model Name</label>
                <input 
                  id="intake-model"
                  className="form-input" 
                  value={model} 
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. iPhone 15 Pro, Galaxy S24"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="intake-category">Device Category</label>
                <select 
                  id="intake-category"
                  className="form-input" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value as DeviceCategory)}
                >
                  <option value="SMARTPHONE">Smartphone</option>
                  <option value="LAPTOP">Laptop</option>
                  <option value="TABLET">Tablet</option>
                  <option value="SMARTWATCH">Smartwatch</option>
                  <option value="AUDIO">Audio / Headphones</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="intake-storage">Storage & Finish</label>
                <input 
                  id="intake-storage"
                  className="form-input" 
                  value={storage} 
                  onChange={(e) => setStorage(e.target.value)}
                  placeholder="e.g. 256GB / 512GB"
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="intake-serial">Serial Number</label>
                  <button 
                    type="button" 
                    onClick={handleGenerateSerial}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.725rem', cursor: 'pointer' }}
                  >
                    Auto-Generate
                  </button>
                </div>
                <input 
                  id="intake-serial"
                  className="form-input font-mono" 
                  value={serialNumber} 
                  onChange={(e) => setSerialNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="intake-imei">IMEI (Cellular Devices)</label>
                <input 
                  id="intake-imei"
                  className="form-input font-mono" 
                  value={imei} 
                  onChange={(e) => setImei(e.target.value)}
                  placeholder="15-digit IMEI"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="intake-source">Inbound Source Lot</label>
                <select 
                  id="intake-source"
                  className="form-input" 
                  value={source} 
                  onChange={(e) => setSource(e.target.value as any)}
                >
                  <option value="CARRIER_TRADE_IN">Carrier Trade-In Lot</option>
                  <option value="ENTERPRISE_FLEET">Enterprise Fleet Decommission</option>
                  <option value="B2B_AUCTION">B2B Wholesale Auction</option>
                  <option value="CONSUMER_BUYBACK">Consumer Direct Buyback</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="intake-grade">Initial Triage Grade</label>
                <select 
                  id="intake-grade"
                  className="form-input" 
                  value={grade} 
                  onChange={(e) => setGrade(e.target.value as ConditionGrade)}
                >
                  <option value="GRADE_A_PLUS">Grade A+ (Pristine)</option>
                  <option value="GRADE_A">Grade A (Excellent)</option>
                  <option value="GRADE_B">Grade B (Good)</option>
                  <option value="GRADE_C">Grade C (Fair)</option>
                  <option value="PARTS_ONLY">Parts / Harvest</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="intake-acq-cost">Acquisition Cost ($)</label>
                <input 
                  id="intake-acq-cost"
                  type="number" 
                  className="form-input" 
                  value={acquisitionCost} 
                  onChange={(e) => setAcquisitionCost(e.target.value)}
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="intake-target-resale">Target Resale Price ($)</label>
                <input 
                  id="intake-target-resale"
                  type="number" 
                  className="form-input" 
                  value={targetResalePrice} 
                  onChange={(e) => setTargetResalePrice(e.target.value)}
                  min="1"
                  step="1"
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" id="btn-submit-intake" className="btn btn-primary">
              <PlusCircle size={16} />
              <span>Log & Start Diagnostics</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
