'use client';

import React, { useState } from 'react';
import { DeviceMaster } from '@truerefurb/shared-types';

interface DeviceSellModalProps {
  device: DeviceMaster | null;
  isOpen: boolean;
  onClose: () => void;
  onSell: (
    deviceId: string,
    salePrice: number,
    buyerName: string,
    channel: string,
    invoiceNo?: string,
    notes?: string
  ) => void;
}

export function DeviceSellModal({
  device,
  isOpen,
  onClose,
  onSell,
}: DeviceSellModalProps) {
  const [salePrice, setSalePrice] = useState<number>(0);
  const [buyerName, setBuyerName] = useState('');
  const [channel, setChannel] = useState('DIRECT_PORTAL');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (device) {
      setSalePrice(device.sellingPrice);
      setInvoiceNo(`INV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setBuyerName('');
      setNotes('');
    }
  }, [device]);

  if (!isOpen || !device) return null;

  const totalCost = device.totalCost || (device.purchaseCost + device.repairCost + device.otherCost);
  const realizedProfit = salePrice - totalCost;
  const marginPercent = totalCost > 0 ? ((realizedProfit / totalCost) * 100).toFixed(1) : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) {
      alert('Buyer / Customer name is required to process sale dispatch.');
      return;
    }
    if (salePrice <= 0) {
      alert('Sale price must be greater than zero.');
      return;
    }
    onSell(device.id, salePrice, buyerName, channel, invoiceNo, notes);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Sell & Dispatch Device</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {device.brand} {device.model} ({device.storage}) • IMEI: <span style={{ fontFamily: 'var(--font-mono)' }}>{device.imei1}</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Margin & Financial Analysis Box */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(0, 242, 254, 0.04) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Acquisition Cost</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                    ${totalCost.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                    (Purch: ${device.purchaseCost} + Rep: ${device.repairCost} + Oth: ${device.otherCost})
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Agreed Sale Price</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    ${salePrice.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Realized Profit Margin</div>
                  <div style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: realizedProfit >= 0 ? '#34d399' : '#f87171'
                  }}>
                    {realizedProfit >= 0 ? `+$${realizedProfit.toFixed(2)}` : `-$${Math.abs(realizedProfit).toFixed(2)}`}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: realizedProfit >= 0 ? '#34d399' : '#f87171' }}>
                    {marginPercent}% ROI
                  </div>
                </div>
              </div>
            </div>

            {/* Sale details input */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label" style={{ color: 'var(--accent-cyan)' }}>
                  Final Sale Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  className="form-input"
                  value={salePrice}
                  onChange={(e) => setSalePrice(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="form-label">Sales Channel *</label>
                <select
                  className="form-input"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  required
                >
                  <option value="DIRECT_PORTAL">Direct Customer Portal</option>
                  <option value="B2B_BULK">B2B Wholesale / Corporate Order</option>
                  <option value="RETAIL_STORE">Retail Walk-in POS</option>
                  <option value="BACK_MARKET">Back Market</option>
                  <option value="AMAZON">Amazon Renewed</option>
                  <option value="EBAY">eBay Refurbished</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Buyer / Customer Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Apex Tech Solutions LLC"
                  required
                />
              </div>

              <div>
                <label className="form-label">Invoice / Order Reference #</label>
                <input
                  type="text"
                  className="form-input"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="e.g. INV-2026-9011"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Dispatch & Tracking Notes</label>
              <textarea
                className="form-input"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Courier tracking number, warranty certificate, packaging seal ID..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="inventory-act-btn btn-sell" style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}>
              Confirm Sale & Set Status to SOLD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
