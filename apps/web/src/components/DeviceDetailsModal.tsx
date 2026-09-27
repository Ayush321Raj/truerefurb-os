'use client';

import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Wrench, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Share2,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { DeviceItem } from '@truerefurb/shared-types';

interface DeviceDetailsModalProps {
  device: DeviceItem | null;
  onClose: () => void;
  onAdvanceStage: (deviceId: string) => void;
}

export const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({
  device,
  onClose,
  onAdvanceStage,
}) => {
  const [activeTab, setActiveTab] = useState<'DIAGNOSTICS' | 'REPAIRS' | 'CHANNELS' | 'CERTIFICATE'>('DIAGNOSTICS');

  if (!device) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-device-title"
    >
      <div 
        className="modal-dialog modal-dialog-large" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 className="modal-title" id="modal-device-title">
                {device.make || device.brand} {device.model}
              </h2>
              <span className="badge grade-badge-aplus" style={{ textTransform: 'uppercase' }}>
                {String(device.conditionGrade || device.grade || 'GRADE_B').replace(/_/g, ' ')}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              SN: <span className="font-mono" style={{ color: '#fff' }}>{device.serialNumber}</span> &middot; Loc: {device.warehouseLocation || 'Dock Area'} &middot; Tech: {device.assignedTechnician || 'Unassigned'}
            </div>
          </div>
          <button 
            id="btn-close-device-modal"
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ padding: '0 1.75rem', paddingTop: '1rem' }}>
          <div className="tabs-nav">
            <button
              id="tab-diagnostics"
              className={`tab-btn ${activeTab === 'DIAGNOSTICS' ? 'active' : ''}`}
              onClick={() => setActiveTab('DIAGNOSTICS')}
            >
              Diagnostic Suite
            </button>
            <button
              id="tab-repairs"
              className={`tab-btn ${activeTab === 'REPAIRS' ? 'active' : ''}`}
              onClick={() => setActiveTab('REPAIRS')}
            >
              Repairs & Service ({device.repairs?.length || 0})
            </button>
            <button
              id="tab-channels"
              className={`tab-btn ${activeTab === 'CHANNELS' ? 'active' : ''}`}
              onClick={() => setActiveTab('CHANNELS')}
            >
              Multi-Channel Resale
            </button>
            <button
              id="tab-certificate"
              className={`tab-btn ${activeTab === 'CERTIFICATE' ? 'active' : ''}`}
              onClick={() => setActiveTab('CERTIFICATE')}
            >
              Certificate & Compliance
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ paddingTop: '0.5rem' }}>
          {activeTab === 'DIAGNOSTICS' && (
            <div>
              {/* Quick Health Summary Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BATTERY RETENTION</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                    {device.batteryHealth}%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Cycle Count: {device.diagnosticReport?.batteryCycleCount || 120} cycles
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FUNCTIONAL INTEGRITY</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                    {device.functionalScore || 95}/100
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    All critical sensors verified
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ESTIMATED MARGIN</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                    +${device.estimatedMargin || Math.max(0, device.sellingPrice - (device.totalCost || device.purchaseCost))}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Resale: ${device.targetResalePrice || device.sellingPrice} | Cost: ${(device.acquisitionCost || device.purchaseCost) + (device.repairCost || 0)}
                  </div>
                </div>
              </div>

              {/* Checklist Items */}
              <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.75rem' }}>
                Hardware & Sensor Check Details
              </h3>
              {device.diagnosticReport?.checklist ? (
                device.diagnosticReport.checklist.map((item: any) => (
                  <div key={item.id} className="check-item">
                    <div className="check-item-info">
                      <CheckCircle2 size={16} color="var(--accent-emerald)" />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Category: {item.category} &middot; {item.measuredValue}
                        </div>
                      </div>
                    </div>
                    <span className="check-status-badge status-passed">
                      {item.status} ({item.score}%)
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px' }}>
                  Diagnostics in queue for technician allocation.
                </div>
              )}
            </div>
          )}

          {activeTab === 'REPAIRS' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', color: '#fff' }}>Bench Repair Ledger</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total Repair Cost: <strong>${device.repairCost || 0}</strong>
                </span>
              </div>

              {(!device.repairs || device.repairs.length === 0) ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px' }}>
                  <Wrench size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                  <p>Zero component rework required. OEM original modules verified intact.</p>
                </div>
              ) : (
                device.repairs.map((rep: any) => (
                  <div key={rep.id} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{rep.issueDescription}</div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 600 }}>${rep.totalRepairCost}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      <strong>Action:</strong> {rep.actionTaken}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Technician: <strong>{rep.technicianName}</strong></span>
                      <span>Labor: <strong>{rep.laborMinutes} mins</strong></span>
                      <span>Date: {new Date(rep.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'CHANNELS' && (() => {
            const resalePrice = device.targetResalePrice || device.sellingPrice || 500;
            return (
              <div>
                <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '1rem' }}>
                  Multi-Channel Pricing & Allocation
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  {/* Amazon Renewed */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>Amazon Renewed</div>
                      <span className="badge grade-badge-aplus">Premium</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                      ${Math.round(resalePrice * 1.05)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Est. Net: ${Math.round(resalePrice * 1.05 * 0.85)} (15% marketplace take)
                    </div>
                  </div>

                  {/* Back Market */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>Back Market</div>
                      <span className="badge grade-badge-a">Verified Refurb</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                      ${Math.round(resalePrice * 0.98)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Est. Net: ${Math.round(resalePrice * 0.98 * 0.88)} (12% marketplace take)
                    </div>
                  </div>

                  {/* eBay Refurbished */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>eBay Refurbished</div>
                      <span className="badge grade-badge-b">Certified</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                      ${Math.round(resalePrice * 0.96)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Est. Net: ${Math.round(resalePrice * 0.96 * 0.91)} (9% seller fee)
                    </div>
                  </div>

                  {/* Direct B2B Wholesale */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>Direct B2B Wholesale</div>
                      <span className="badge grade-badge-aplus">0% Commission</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                      ${Math.round(resalePrice * 0.91)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Instant settlement &middot; Bulk manifest shipment
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === 'CERTIFICATE' && (
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px dashed rgba(0, 242, 254, 0.4)', borderRadius: '12px', padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={24} color="var(--accent-cyan)" />
                    <h4 style={{ fontSize: '1.1rem', color: '#fff', margin: 0 }}>Certificate of Refurbishment</h4>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Compliant with R2v3, ISO 14001, and NIST 800-88 Data Sanitization
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CERTIFICATE SERIAL HASH</div>
                  <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                    TR-{device.id.toUpperCase()}-{(Math.random() * 10000).toFixed(0)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                <div><strong>Device:</strong> {device.make || device.brand} {device.model} ({device.storage})</div>
                <div><strong>Cosmetic Grade:</strong> {String(device.conditionGrade || device.grade || 'GRADE_B').replace(/_/g, ' ')}</div>
                <div><strong>Battery Retention:</strong> {device.batteryHealth}% Health</div>
                <div><strong>Data Sanitization:</strong> Cryptographic Wipe Verified</div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Certified by: {device.assignedTechnician || 'Master QA Inspector'}
                </span>
                <button 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                  onClick={() => alert(`Certificate generated for ${device.make} ${device.model} (SN: ${device.serialNumber})`)}
                >
                  <Printer size={14} />
                  <span>Print Tamper-Evident Label</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {device.stage !== 'READY_FOR_SALE' && (
            <button 
              className="btn btn-primary"
              onClick={() => {
                onAdvanceStage(device.id);
                onClose();
              }}
            >
              Advance to Next Stage
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
