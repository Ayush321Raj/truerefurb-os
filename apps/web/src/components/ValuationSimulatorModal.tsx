'use client';

import React, { useState } from 'react';
import { X, TrendingUp, DollarSign, Store, ShoppingBag, Truck, Building2 } from 'lucide-react';

interface ValuationSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ValuationSimulatorModal: React.FC<ValuationSimulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [acquisitionCost, setAcquisitionCost] = useState<number>(550);
  const [repairPartsCost, setRepairPartsCost] = useState<number>(45);
  const [targetMSRP, setTargetMSRP] = useState<number>(949);

  if (!isOpen) return null;

  const totalCostBasis = acquisitionCost + repairPartsCost;

  const channels = [
    {
      name: 'Amazon Renewed',
      icon: <Store size={18} color="var(--accent-amber)" />,
      badge: 'Highest ASP',
      retailPrice: targetMSRP,
      feeRate: 0.15,
      netPayout: Math.round(targetMSRP * 0.85),
      netMargin: Math.round(targetMSRP * 0.85 - totalCostBasis),
      roi: Math.round(((targetMSRP * 0.85 - totalCostBasis) / totalCostBasis) * 100),
    },
    {
      name: 'Back Market',
      icon: <ShoppingBag size={18} color="var(--accent-cyan)" />,
      badge: 'Fastest Velocity',
      retailPrice: Math.round(targetMSRP * 0.95),
      feeRate: 0.10,
      netPayout: Math.round(targetMSRP * 0.95 * 0.90),
      netMargin: Math.round(targetMSRP * 0.95 * 0.90 - totalCostBasis),
      roi: Math.round(((targetMSRP * 0.95 * 0.90 - totalCostBasis) / totalCostBasis) * 100),
    },
    {
      name: 'eBay Refurbished',
      icon: <Truck size={18} color="var(--accent-rose)" />,
      badge: 'Broad Consumer Reach',
      retailPrice: Math.round(targetMSRP * 0.92),
      feeRate: 0.09,
      netPayout: Math.round(targetMSRP * 0.92 * 0.91),
      netMargin: Math.round(targetMSRP * 0.92 * 0.91 - totalCostBasis),
      roi: Math.round(((targetMSRP * 0.92 * 0.91 - totalCostBasis) / totalCostBasis) * 100),
    },
    {
      name: 'Direct B2B Wholesale Lot',
      icon: <Building2 size={18} color="var(--accent-emerald)" />,
      badge: 'Zero Commissions',
      retailPrice: Math.round(targetMSRP * 0.88),
      feeRate: 0.0,
      netPayout: Math.round(targetMSRP * 0.88),
      netMargin: Math.round(targetMSRP * 0.88 - totalCostBasis),
      roi: Math.round(((targetMSRP * 0.88 - totalCostBasis) / totalCostBasis) * 100),
    },
  ];

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-valuation-title"
    >
      <div 
        className="modal-dialog modal-dialog-large" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <TrendingUp size={20} color="var(--accent-cyan)" />
            <h2 className="modal-title" id="modal-valuation-title">
              Multi-Channel Valuation & Margin Engine
            </h2>
          </div>
          <button 
            id="btn-close-val-modal"
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close valuation dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Inputs row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div>
              <label className="form-label">Acquisition Cost ($)</label>
              <input 
                type="number" 
                className="form-input" 
                value={acquisitionCost}
                onChange={(e) => setAcquisitionCost(Number(e.target.value))}
                min="0"
              />
            </div>
            <div>
              <label className="form-label">Parts & Bench Rework ($)</label>
              <input 
                type="number" 
                className="form-input" 
                value={repairPartsCost}
                onChange={(e) => setRepairPartsCost(Number(e.target.value))}
                min="0"
              />
            </div>
            <div>
              <label className="form-label">Baseline Retail Target ($)</label>
              <input 
                type="number" 
                className="form-input" 
                value={targetMSRP}
                onChange={(e) => setTargetMSRP(Number(e.target.value))}
                min="10"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Total Cost Basis: <strong style={{ color: '#fff' }}>${totalCostBasis}</strong> &middot; Real-Time Marketplace Yield Comparison:
          </div>

          {/* Channel Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {channels.map((ch) => (
              <div 
                key={ch.name}
                style={{
                  background: 'rgba(19, 26, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#fff' }}>
                    {ch.icon}
                    {ch.name}
                  </div>
                  <span className="badge grade-badge-aplus" style={{ fontSize: '0.7rem' }}>{ch.badge}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>RETAIL LIST PRICE</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>${ch.retailPrice}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>NET PROFIT MARGIN</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      +${ch.netMargin}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Platform Fee: <strong>{(ch.feeRate * 100).toFixed(0)}%</strong></span>
                  <span>ROI: <strong style={{ color: 'var(--accent-cyan)' }}>+{ch.roi}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
