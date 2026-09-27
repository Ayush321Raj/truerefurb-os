'use client';

import React, { useState } from 'react';
import { X, Calculator, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { ConditionGrade } from '@truerefurb/shared-types';

interface GradingCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GradingCalculatorModal: React.FC<GradingCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [screenCondition, setScreenCondition] = useState<number>(100);
  const [bodyCondition, setBodyCondition] = useState<number>(100);
  const [batteryPercent, setBatteryPercent] = useState<number>(92);
  const [allSensorsPassing, setAllSensorsPassing] = useState<boolean>(true);

  if (!isOpen) return null;

  // Grade calculation algorithm
  let calculatedGrade: ConditionGrade = 'GRADE_A_PLUS';
  let gradeReason = 'Flawless cosmetic finish, >90% battery, and 100% functional sensors.';
  let priceFactor = 1.15;

  if (!allSensorsPassing) {
    calculatedGrade = 'PARTS_ONLY';
    gradeReason = 'Functional sensor or motherboard failure. Requires bench repair or salvage.';
    priceFactor = 0.3;
  } else if (screenCondition < 50 || bodyCondition < 50) {
    calculatedGrade = 'GRADE_C';
    gradeReason = 'Noticeable scratches, deep casing scuffs, or minor dings. 100% functional.';
    priceFactor = 0.72;
  } else if (screenCondition < 85 || bodyCondition < 80 || batteryPercent < 85) {
    calculatedGrade = 'GRADE_B';
    gradeReason = 'Light cosmetic signs of wear or battery between 80-84%.';
    priceFactor = 0.88;
  } else if (screenCondition < 98 || bodyCondition < 95 || batteryPercent < 90) {
    calculatedGrade = 'GRADE_A';
    gradeReason = 'Minor micro-scratches not noticeable at arms length, battery >= 85%.';
    priceFactor = 1.0;
  }

  const getBadgeClass = (g: ConditionGrade) => {
    switch (g) {
      case 'GRADE_A_PLUS': return 'grade-badge-aplus';
      case 'GRADE_A': return 'grade-badge-a';
      case 'GRADE_B': return 'grade-badge-b';
      case 'GRADE_C': return 'grade-badge-c';
      default: return 'grade-badge-parts';
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-calc-title"
    >
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Calculator size={20} color="var(--accent-cyan)" />
            <h2 className="modal-title" id="modal-calc-title">
              Interactive Grading & Quality Calculator
            </h2>
          </div>
          <button 
            id="btn-close-calc-modal"
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close calculator"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Standardized optical and functional grading matrix adhering to CTA-2053 & R2v3 refurbished electronics standards.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Screen Glass */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Display & Screen Glass Integrity</label>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  {screenCondition === 100 ? 'Pristine / Zero Micro-scratches' :
                   screenCondition === 85 ? 'Minor Micro-scratches (Invisible screen-on)' :
                   screenCondition === 70 ? 'Light Visible Scuffs' : 'Noticeable Scratches / Chips'}
                </span>
              </div>
              <input 
                type="range" 
                min="40" 
                max="100" 
                step="15"
                value={screenCondition} 
                onChange={(e) => setScreenCondition(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
            </div>

            {/* Chassis / Housing */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Housing / Aluminum & Bezel Finish</label>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  {bodyCondition === 100 ? 'Like New (No rubs or dings)' :
                   bodyCondition === 85 ? 'Faint Bezel Rubbing' :
                   bodyCondition === 70 ? 'Minor Corner Scuffs' : 'Noticeable Dents / Deep Marks'}
                </span>
              </div>
              <input 
                type="range" 
                min="40" 
                max="100" 
                step="15"
                value={bodyCondition} 
                onChange={(e) => setBodyCondition(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
            </div>

            {/* Battery Retention */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Battery Capacity Retention: <strong>{batteryPercent}%</strong></label>
                <span style={{ fontSize: '0.8rem', color: batteryPercent >= 80 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                  {batteryPercent >= 80 ? 'Passes OEM Spec' : 'Requires Bench Battery Swap'}
                </span>
              </div>
              <input 
                type="range" 
                min="60" 
                max="100" 
                value={batteryPercent} 
                onChange={(e) => setBatteryPercent(Number(e.target.value))}
                style={{ width: '100%', accentColor: batteryPercent >= 80 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}
              />
            </div>

            {/* Functional sensors checkbox */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.9rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>All Functional Sensors & Logic Pass</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cameras, FaceID/Biometrics, Wi-Fi, Microphones, Audio, Charging Port</div>
              </div>
              <input 
                type="checkbox" 
                checked={allSensorsPassing} 
                onChange={(e) => setAllSensorsPassing(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--accent-emerald)', cursor: 'pointer' }}
              />
            </div>

            {/* Calculation Result Card */}
            <div style={{ background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)', border: '1px solid rgba(0, 242, 254, 0.3)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.05em' }}>
                Automated Quality Tier Result
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
                <span className={`badge ${getBadgeClass(calculatedGrade)}`} style={{ fontSize: '1.1rem', padding: '0.4rem 0.9rem' }}>
                  {calculatedGrade.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#fff' }}>
                  Market Valuation Multiplier: <strong>{(priceFactor * 100).toFixed(0)}% of Baseline</strong>
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {gradeReason}
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
