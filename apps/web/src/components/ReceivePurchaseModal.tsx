'use client';

import React, { useState } from 'react';
import { PurchaseOrder, Warehouse, InventoryLocation, DeviceStatus } from '@truerefurb/shared-types';

interface ReceivePurchaseModalProps {
  purchaseOrder: PurchaseOrder;
  warehouses: Warehouse[];
  locations: InventoryLocation[];
  onClose: () => void;
  onConfirmReceipt: (
    poId: string,
    warehouseId: string,
    locationCode: string,
    targetDeviceStatus: DeviceStatus,
    notes?: string
  ) => void;
}

export function ReceivePurchaseModal({
  purchaseOrder,
  warehouses,
  locations,
  onClose,
  onConfirmReceipt,
}: ReceivePurchaseModalProps) {
  const [targetWarehouseId, setTargetWarehouseId] = useState(
    purchaseOrder.destinationWarehouseId || warehouses[0]?.id || 'wh-kol-01'
  );

  // Filter locations for selected warehouse
  const availableLocations = locations.filter(
    (loc) => loc.warehouseId === targetWarehouseId
  );

  const [targetLocationCode, setTargetLocationCode] = useState(
    availableLocations[0]?.code || 'A01'
  );

  const [targetDeviceStatus, setTargetDeviceStatus] = useState<DeviceStatus>('RECEIVED');
  const [receivingNotes, setReceivingNotes] = useState(
    'Dock inspection complete. IMEI verification and physical condition confirmed.'
  );

  const selectedWarehouse = warehouses.find((w) => w.id === targetWarehouseId);

  const handleReceive = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReceipt(
      purchaseOrder.id,
      targetWarehouseId,
      targetLocationCode,
      targetDeviceStatus,
      receivingNotes
    );
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>
              Receive Inbound Consignment into Inventory
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              PO: <strong style={{ color: '#38bdf8' }}>{purchaseOrder.referenceNumber}</strong> • Vendor: {purchaseOrder.businessName}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Workflow Rule Callout */}
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          marginTop: '1rem',
          fontSize: '0.85rem',
          color: '#a7f3d0',
          display: 'flex',
          gap: '0.6rem',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '1.3rem' }}>📥</span>
          <div>
            <strong>Receiving Workflow Activation:</strong> Receiving this purchase order will advance all{' '}
            <strong>{purchaseOrder.items.length} devices</strong> from <span style={{ color: '#f59e0b' }}>PURCHASED</span> to{' '}
            <span style={{ color: '#10b981' }}>{targetDeviceStatus}</span> and slot them into the designated warehouse location.
          </div>
        </div>

        {/* Consignment Devices Preview */}
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '0.85rem',
          marginTop: '1rem'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
            Consignment Line Items ({purchaseOrder.items.length} Units)
          </div>
          <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155', textAlign: 'left' }}>
                  <th style={{ padding: '0.4rem' }}>Device</th>
                  <th style={{ padding: '0.4rem' }}>Specs</th>
                  <th style={{ padding: '0.4rem' }}>IMEI 1</th>
                  <th style={{ padding: '0.4rem', textAlign: 'right' }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrder.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #0f172a' }}>
                    <td style={{ padding: '0.4rem', color: '#f8fafc', fontWeight: 500 }}>
                      {item.brand} {item.model}
                    </td>
                    <td style={{ padding: '0.4rem', color: '#cbd5e1' }}>
                      {item.storage} • {item.color}
                    </td>
                    <td style={{ padding: '0.4rem', fontFamily: 'monospace', color: '#38bdf8' }}>
                      {item.imei1}
                    </td>
                    <td style={{ padding: '0.4rem', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                      ₹{item.cost.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Putaway Destination Form */}
        <form onSubmit={handleReceive} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                Receiving Warehouse *
              </label>
              <select
                value={targetWarehouseId}
                onChange={(e) => {
                  setTargetWarehouseId(e.target.value);
                  const nextLocs = locations.filter((loc) => loc.warehouseId === e.target.value);
                  setTargetLocationCode(nextLocs[0]?.code || 'A01');
                }}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#f8fafc',
                }}
              >
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({wh.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                Putaway Inventory Location * (e.g. A01, A02, B01, B02)
              </label>
              <select
                value={targetLocationCode}
                onChange={(e) => setTargetLocationCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
              >
                {availableLocations.map((loc) => (
                  <option key={loc.id} value={loc.code}>
                    {loc.code} — {loc.zone} ({loc.description || 'General'})
                  </option>
                ))}
                {/* Fallback option if warehouse has no custom location */}
                {availableLocations.length === 0 && (
                  <option value="A01">A01 (Default Bay)</option>
                )}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                Post-Intake Device Status *
              </label>
              <select
                value={targetDeviceStatus}
                onChange={(e) => setTargetDeviceStatus(e.target.value as DeviceStatus)}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#f8fafc',
                }}
              >
                <option value="RECEIVED">RECEIVED (Dock Checked-in)</option>
                <option value="READY_TO_SELL">READY_TO_SELL (Certified & In Stock)</option>
                <option value="REPAIR_REQUIRED">REPAIR_REQUIRED (Needs Technician Bench)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                Physical Putaway Label
              </label>
              <div style={{
                padding: '0.55rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#38bdf8',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}>
                📍 {selectedWarehouse?.name} - {targetLocationCode}
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
              Receiving Notes & Inspection Sign-off
            </label>
            <input
              type="text"
              value={receivingNotes}
              onChange={(e) => setReceivingNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f8fafc',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.85rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.55rem 1.15rem',
                backgroundColor: '#334155',
                color: '#cbd5e1',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.55rem 1.45rem',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ✓ Confirm Receipt & Stock into Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
