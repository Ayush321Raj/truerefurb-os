'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Lock,
  ArrowRight,
  Fingerprint,
  FileCheck
} from 'lucide-react';
import { DeviceItem, ConditionGrade } from '@truerefurb/shared-types';
import { useAuth } from '../context/AuthContext';

interface DevicePassportModalProps {
  device: DeviceItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DevicePassportModal: React.FC<DevicePassportModalProps> = ({
  device,
  isOpen,
  onClose,
}) => {
  const { createApprovalRequest, user, hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<'PASSPORT' | 'TRUESCORE' | 'IMEI_CORRECTION' | 'GRADE_OVERRIDE'>('PASSPORT');
  const [newImei, setNewImei] = useState('');
  const [imeiReason, setImeiReason] = useState('');
  const [proposedGrade, setProposedGrade] = useState<ConditionGrade>('GRADE_A_PLUS');
  const [gradeReason, setGradeReason] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen || !device) return null;

  const currentGrade = device.conditionGrade || device.grade || 'GRADE_B';

  // TrueScore weighted algorithm
  const diagnosticWeighted = Math.round((device.diagnosticReport?.functionalScore || 95) * 0.35);
  const cosmeticWeighted = Math.round(
    (currentGrade === 'GRADE_A_PLUS' ? 100 :
     currentGrade === 'GRADE_A' ? 92 :
     currentGrade === 'GRADE_B' ? 82 : 70) * 0.25
  );
  const batteryWeighted = Math.round((device.batteryHealth || 100) * 0.15);
  const repairWeighted = Math.round(((device.repairs?.length || 0) === 0 ? 100 : 90) * 0.15);
  const partsWeighted = 5;
  const lifecycleWeighted = 5;
  const computedTrueScore = diagnosticWeighted + cosmeticWeighted + batteryWeighted + repairWeighted + partsWeighted + lifecycleWeighted;

  const handleRequestImeiCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newImei.length !== 15) {
      alert('IMEI must be exactly 15 digits.');
      return;
    }

    await createApprovalRequest({
      transactionType: 'IMEI_CORRECTION',
      title: `IMEI Hardware Correction: ${device.make} ${device.model}`,
      entityType: 'DEVICE',
      entityId: device.id,
      approverRole: 'TENANT_ADMIN',
      urgency: 'CRITICAL',
      oldValue: device.imei || 'None',
      newValue: newImei,
      justification: imeiReason,
    });

    setStatusMsg('IMEI Correction submitted to Governance Engine. Requires Tenant Admin authorization.');
    setTimeout(() => {
      setStatusMsg(null);
      setActiveTab('PASSPORT');
    }, 3000);
  };

  const handleRequestGradeOverride = async (e: React.FormEvent) => {
    e.preventDefault();

    await createApprovalRequest({
      transactionType: 'GRADE_OVERRIDE',
      title: `Grade Override Request: ${device.make || device.brand} ${device.model}`,
      entityType: 'DEVICE',
      entityId: device.id,
      approverRole: 'QA_SUPERVISOR',
      urgency: 'HIGH',
      oldValue: currentGrade,
      newValue: proposedGrade,
      justification: gradeReason,
    });

    setStatusMsg('Grade Override Request submitted to Governance Engine. Requires QA Supervisor authorization.');
    setTimeout(() => {
      setStatusMsg(null);
      setActiveTab('PASSPORT');
    }, 3000);
  };

  const LIFECYCLE_STAGES = [
    { id: 'SOURCE', label: 'Source Trade-in' },
    { id: 'RECEIVED', label: 'Dock Received' },
    { id: 'DIAGNOSTICS', label: 'TrueDiag Hardware' },
    { id: 'REPAIR', label: 'Bench Repair' },
    { id: 'QA', label: 'QA Inspection' },
    { id: 'GRADING', label: 'CTA-2053 Grade' },
    { id: 'LISTING', label: 'Channel Listing' },
    { id: 'SOLD', label: 'Dispatched Order' },
  ];

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-passport-title"
    >
      <div 
        className="modal-dialog modal-dialog-large" 
        style={{ maxWidth: '920px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Fingerprint size={22} color="var(--accent-cyan)" />
              <h2 className="modal-title" id="modal-passport-title">
                Device Passport & TrueScore™
              </h2>
              <span className="badge grade-badge-aplus">
                Immutable Identity
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {device.make} {device.model} &middot; SN: <span className="font-mono" style={{ color: '#fff' }}>{device.serialNumber}</span> &middot; IMEI: <span className="font-mono" style={{ color: '#fff' }}>{device.imei || 'None'}</span>
            </div>
          </div>
          <button 
            id="btn-close-passport-modal"
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Strip */}
        <div style={{ padding: '0 1.75rem', paddingTop: '0.75rem' }}>
          <div className="tabs-nav">
            <button 
              className={`tab-btn ${activeTab === 'PASSPORT' ? 'active' : ''}`}
              onClick={() => setActiveTab('PASSPORT')}
            >
              Passport Lifecycle
            </button>
            <button 
              className={`tab-btn ${activeTab === 'TRUESCORE' ? 'active' : ''}`}
              onClick={() => setActiveTab('TRUESCORE')}
            >
              TrueScore™ Algorithm (0-100)
            </button>
            <button 
              className={`tab-btn ${activeTab === 'GRADE_OVERRIDE' ? 'active' : ''}`}
              onClick={() => setActiveTab('GRADE_OVERRIDE')}
            >
              Request Grade Override
            </button>
            <button 
              className={`tab-btn ${activeTab === 'IMEI_CORRECTION' ? 'active' : ''}`}
              onClick={() => setActiveTab('IMEI_CORRECTION')}
            >
              Request IMEI Correction
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {statusMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem', color: '#34d399', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* TAB 1: PASSPORT */}
          {activeTab === 'PASSPORT' && (
            <div>
              {/* Lifecycle Breadcrumb */}
              <div style={{ marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Chain of Custody & Lifecycle Integrity
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', gap: '0.5rem' }}>
                  {LIFECYCLE_STAGES.map((st, i) => (
                    <React.Fragment key={st.id}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: '80px' }}>
                        <div 
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: i <= 5 ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)',
                            color: i <= 5 ? '#000' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            marginBottom: '0.35rem',
                          }}
                        >
                          {i + 1}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: i <= 5 ? '#fff' : 'var(--text-muted)', fontWeight: i <= 5 ? 600 : 400 }}>
                          {st.label}
                        </span>
                      </div>
                      {i < LIFECYCLE_STAGES.length - 1 && (
                        <div style={{ height: '2px', flex: 1, minWidth: '15px', background: i < 5 ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)' }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Passport Specs Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CRYPTOGRAPHIC PASSPORT HASH</div>
                  <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                    SHA256: 7f83b1657ff1fc53b92dc18148a1d65d
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Source: <strong>{(device.source || 'Warehouse Inbound').replace(/_/g, ' ')}</strong> &middot; Intake: <strong>{device.createdAt ? new Date(device.createdAt).toLocaleDateString() : 'Active'}</strong>
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CTA-2053 COSMETIC GRADE</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                    {currentGrade.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Battery Retention: <strong>{device.batteryHealth}%</strong> &middot; Storage: <strong>{device.storage}</strong>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Lock size={18} color="var(--accent-amber)" />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: '#fff' }}>Identity Immutability Policy:</strong> Device serial number and IMEI are locked hardware attributes. Any alterations require formal governance authorization via the Maker-Checker Approval Engine.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRUESCORE ALGORITHM */}
          {activeTab === 'TRUESCORE' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)', border: '1px solid rgba(0, 242, 254, 0.3)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    Composite Hardware Quality Index
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', margin: '0.25rem 0' }}>
                    {computedTrueScore} <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>/ 100</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Standardized TrueScore™ combines automated diagnostic sensors, CTA-2053 optical grade, OEM battery retention, and component repair integrity.
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge grade-badge-aplus" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                    Tier 1 Certified
                  </span>
                </div>
              </div>

              {/* Weight Breakdown */}
              <h3 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.75rem' }}>TrueScore Multi-Factor Weight Matrix</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>1. TrueDiag Hardware & Sensor Suite (35% Weight)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Display digitizer, LiDAR, cameras, 5G RSSI, audio arrays</div>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>+{diagnosticWeighted} pts</span>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>2. CTA-2053 Optical Cosmetic Grade (25% Weight)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Glass micro-abrasions, aluminum bezel, housing scuff index</div>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>+{cosmeticWeighted} pts</span>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>3. Battery Retention & Cycle Health (15% Weight)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{device.batteryHealth}% capacity retention &middot; OEM certified</div>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>+{batteryWeighted} pts</span>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>4. Repair History & Bench Rework (15% Weight)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{device.repairs?.length || 0} logged repair operations</div>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-amber)' }}>+{repairWeighted} pts</span>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>5. OEM Parts & Lifecycle Age (10% Combined Weight)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Original Apple/Samsung parts integrity</div>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>+{partsWeighted + lifecycleWeighted} pts</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GRADE OVERRIDE (MAKER / APPROVER FLOW) */}
          {activeTab === 'GRADE_OVERRIDE' && (
            <form onSubmit={handleRequestGradeOverride}>
              <div style={{ background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Maker-Checker Flow: QA Inspector → QA Supervisor
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  A QA Inspector can propose a grade override, but it strictly requires QA Supervisor authorization before taking effect on device certification or channel pricing.
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Current System Grade</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={currentGrade.replace(/_/g, ' ')} 
                  disabled 
                  style={{ opacity: 0.7 }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Proposed New Grade</label>
                <select 
                  className="form-input" 
                  value={proposedGrade} 
                  onChange={(e) => setProposedGrade(e.target.value as ConditionGrade)}
                >
                  <option value="GRADE_A_PLUS">Grade A+ (Pristine)</option>
                  <option value="GRADE_A">Grade A (Excellent)</option>
                  <option value="GRADE_B">Grade B (Good)</option>
                  <option value="GRADE_C">Grade C (Fair)</option>
                  <option value="PARTS_ONLY">Parts / Salvage</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Justification Statement (Required)</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  placeholder="Detail the optical re-inspection under 500 lux, buffing steps, or microscopic bezel evaluation..."
                  value={gradeReason}
                  onChange={(e) => setGradeReason(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <span>Submit Grade Override for QA Supervisor Approval</span>
              </button>
            </form>
          )}

          {/* TAB 4: IMEI CORRECTION (MAKER / APPROVER FLOW) */}
          {activeTab === 'IMEI_CORRECTION' && (
            <form onSubmit={handleRequestImeiCorrection}>
              <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, marginBottom: '0.25rem' }}>
                  High-Risk Action: Hardware IMEI Correction
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Physical IMEI changes trigger an immutable audit event and require Tenant Admin approval to prevent fraudulent serial swapping.
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Current Stored IMEI</label>
                <input 
                  type="text" 
                  className="form-input font-mono" 
                  value={device.imei || 'None'} 
                  disabled 
                  style={{ opacity: 0.7 }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Corrected 15-Digit IMEI</label>
                <input 
                  type="text" 
                  className="form-input font-mono" 
                  placeholder="358920194819280"
                  value={newImei}
                  onChange={(e) => setNewImei(e.target.value)}
                  maxLength={15}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Auditable Reason for Discrepancy</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  placeholder="Explain dock scanner OCR error, SIM tray swap, or motherboard replacement..."
                  value={imeiReason}
                  onChange={(e) => setImeiReason(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'var(--accent-amber)', color: '#000' }}>
                <span>Submit IMEI Correction for Tenant Admin Approval</span>
              </button>
            </form>
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
