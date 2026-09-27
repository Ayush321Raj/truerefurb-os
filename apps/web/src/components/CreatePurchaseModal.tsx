'use client';

import React, { useState } from 'react';
import {
  Vendor,
  Warehouse,
  PurchaseOrder,
  PurchaseItem,
  DeviceMaster,
  ConditionGrade,
} from '@truerefurb/shared-types';
import { isValidImei, calculateImeiCheckDigit } from '@truerefurb/validation';

interface CreatePurchaseModalProps {
  vendors: Vendor[];
  warehouses: Warehouse[];
  defaultVendor?: Vendor;
  existingDevices: DeviceMaster[];
  onClose: () => void;
  onSubmitPurchase: (
    po: PurchaseOrder,
    createdDevices: DeviceMaster[]
  ) => void;
}

export function CreatePurchaseModal({
  vendors,
  warehouses,
  defaultVendor,
  existingDevices,
  onClose,
  onSubmitPurchase,
}: CreatePurchaseModalProps) {
  // PO Level Fields
  const [vendorId, setVendorId] = useState(defaultVendor?.id || vendors[0]?.id || '');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState(
    `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [destinationWarehouseId, setDestinationWarehouseId] = useState(
    warehouses[0]?.id || 'wh-kol-01'
  );
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PARTIAL' | 'UNPAID'>('UNPAID');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Device Line Item Form State (Workflow: Add Device -> Capture IMEI -> Enter Cost)
  const [itemBrand, setItemBrand] = useState('Apple');
  const [itemModel, setItemModel] = useState('iPhone 13');
  const [itemStorage, setItemStorage] = useState('128GB');
  const [itemRam, setItemRam] = useState('4GB');
  const [itemColor, setItemColor] = useState('Midnight');
  const [itemGrade, setItemGrade] = useState<ConditionGrade>('GRADE_A');
  const [itemImei, setItemImei] = useState('');
  const [itemCost, setItemCost] = useState('28500');

  // List of added device items for this PO
  const [poItems, setPoItems] = useState<
    Array<{
      brand: string;
      model: string;
      storage: string;
      ram: string;
      color: string;
      grade: ConditionGrade;
      imei1: string;
      cost: number;
    }>
  >([
    // Seed with requested prompt example: ABC Mobiles, iPhone 13, IMEI, Cost, Qty=1
    {
      brand: 'Apple',
      model: 'iPhone 13',
      storage: '128GB',
      ram: '4GB',
      color: 'Midnight',
      grade: 'GRADE_A',
      imei1: '356938051234563',
      cost: 28500,
    },
  ]);

  const [imeiError, setImeiError] = useState<string | null>(null);

  const selectedVendor = vendors.find((v) => v.id === vendorId);
  const selectedWarehouse = warehouses.find((w) => w.id === destinationWarehouseId);

  const totalAmount = poItems.reduce((sum, item) => sum + item.cost, 0);

  // Auto-fill Luhn check digit helper
  const handleAutoFixCheckDigit = () => {
    const raw = itemImei.replace(/\D/g, '');
    if (raw.length === 14) {
      try {
        const cd = calculateImeiCheckDigit(raw);
        setItemImei(`${raw}${cd}`);
        setImeiError(null);
      } catch (err) {
        setImeiError('Could not calculate check digit');
      }
    } else {
      setImeiError('Enter 14 digits first to calculate the 15th Luhn check digit');
    }
  };

  const handleAddDeviceItem = (e: React.FormEvent) => {
    e.preventDefault();
    setImeiError(null);

    const cleanImei = itemImei.trim();
    if (!cleanImei || cleanImei.length !== 15) {
      setImeiError('IMEI must be exactly 15 numeric digits');
      return;
    }

    if (!isValidImei(cleanImei)) {
      setImeiError('IMEI failed official Luhn algorithm (Mod-10) checksum');
      return;
    }

    // Check duplicate in current PO items
    if (poItems.some((i) => i.imei1 === cleanImei)) {
      setImeiError('This IMEI is already added to this purchase consignment');
      return;
    }

    // Check duplicate in active devices database
    const duplicate = existingDevices.find(
      (d) =>
        (d.imei1 === cleanImei || d.imei2 === cleanImei) &&
        d.status !== 'SCRAPPED' &&
        d.status !== 'SOLD'
    );

    if (duplicate) {
      setImeiError(
        `Active duplicate detected: IMEI is already registered to Device ID ${duplicate.id} (${duplicate.brand} ${duplicate.model})`
      );
      return;
    }

    const costNum = parseFloat(itemCost);
    if (isNaN(costNum) || costNum <= 0) {
      setImeiError('Please enter a valid acquisition cost');
      return;
    }

    setPoItems((prev) => [
      ...prev,
      {
        brand: itemBrand,
        model: itemModel,
        storage: itemStorage,
        ram: itemRam,
        color: itemColor,
        grade: itemGrade,
        imei1: cleanImei,
        cost: costNum,
      },
    ]);

    // Reset line item fields for next entry
    setItemImei('');
    setImeiError(null);
  };

  const handleRemoveItem = (index: number) => {
    setPoItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (poItems.length === 0) {
      alert('You must add at least one device line item to this purchase order.');
      return;
    }

    const poId = `po-${Date.now()}`;
    const whName = selectedWarehouse?.name || 'Kolkata Main Warehouse';
    const vName = selectedVendor?.vendorName || 'Rajesh Sharma';
    const bName = selectedVendor?.businessName || 'ABC Mobiles';

    // 1. Create Purchase Items & Corresponding Device Records
    const createdPurchaseItems: PurchaseItem[] = [];
    const createdDevices: DeviceMaster[] = [];

    poItems.forEach((item, idx) => {
      const deviceId = `dev-${Date.now()}-${idx + 1}`;
      const itemId = `poi-${Date.now()}-${idx + 1}`;

      // In accordance with workflow rule: "Do not mark inventory available before receipt."
      // When Purchase is DRAFT, device status is PURCHASED, location is Dock/Intake
      const deviceRecord: DeviceMaster = {
        id: deviceId,
        organizationId: 'org-truerefurb-main',
        imei1: item.imei1,
        serialNumber: `SN-${item.brand.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}-${idx + 1}`,
        brand: item.brand,
        model: item.model,
        storage: item.storage,
        ram: item.ram,
        color: item.color,
        condition: 'Intake Consignment - Awaiting Dock Receipt',
        grade: item.grade,
        batteryHealth: 88,
        purchaseCost: item.cost,
        repairCost: 0,
        otherCost: 0,
        totalCost: item.cost,
        sellingPrice: Math.round(item.cost * 1.3),
        status: 'PURCHASED', // STRICT: Not marked available before receipt!
        currentLocation: `${whName} - INTAKE-01 (Inbound PO: ${referenceNumber})`,
        warehouseId: destinationWarehouseId,
        warehouseName: whName,
        locationCode: 'INTAKE-01',
        vendorId,
        vendorName: bName,
        purchaseOrderId: referenceNumber,
        notes: `Sourced from ${bName} via ${referenceNumber}. Unreceived dock staging.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      createdDevices.push(deviceRecord);

      createdPurchaseItems.push({
        id: itemId,
        purchaseId: poId,
        brand: item.brand,
        model: item.model,
        storage: item.storage,
        ram: item.ram,
        color: item.color,
        imei1: item.imei1,
        cost: item.cost,
        grade: item.grade,
        condition: 'Original OEM',
        quantity: 1, // Strictly single unit
        deviceId,
        isReceived: false, // NOT RECEIVED YET in DRAFT
        warehouseId: destinationWarehouseId,
        locationCode: 'INTAKE-01',
      });
    });

    // 2. Construct Purchase Order Record
    const newPO: PurchaseOrder = {
      id: poId,
      vendorId,
      vendorName: vName,
      businessName: bName,
      purchaseDate,
      referenceNumber,
      paymentStatus,
      status: 'DRAFT', // Starts in DRAFT per workflow spec
      totalAmount,
      paidAmount,
      outstandingAmount: Math.max(0, totalAmount - paidAmount),
      destinationWarehouseId,
      destinationWarehouseName: whName,
      notes: notes || `Inbound consignment of ${poItems.length} units from ${bName}`,
      items: createdPurchaseItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmitPurchase(newPO, createdDevices);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '850px', maxHeight: '92vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc' }}>
              Create Purchase Order & Device Intake
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Module 9 & 10: Device-level purchase intake with real-time Luhn IMEI validation
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Workflow Guidance Banner */}
        <div style={{
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginTop: '0.85rem',
          fontSize: '0.8rem',
          color: '#bae6fd',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <div>
            <strong>Purchase Workflow Rule:</strong> Inbound PO creates devices in{' '}
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>PURCHASED (DRAFT)</span> status.
            Devices will <strong>NOT</strong> enter available inventory until physically received at warehouse dock.
          </div>
        </div>

        {/* Purchase Header Form */}
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '1rem',
          marginTop: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
              Vendor *
            </label>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.businessName} ({v.vendorName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
              PO Reference Number *
            </label>
            <input
              type="text"
              required
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#38bdf8',
                fontFamily: 'monospace',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
              Purchase Date *
            </label>
            <input
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
              Destination Warehouse *
            </label>
            <select
              value={destinationWarehouseId}
              onChange={(e) => setDestinationWarehouseId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '0.85rem'
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
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              style={{
                width: '100%',
                padding: '0.55rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            >
              <option value="UNPAID">UNPAID</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="PAID">PAID</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
              Paid Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '0.55rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        {/* Device-Level Item Entry Section */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '1.1rem',
          marginTop: '1.25rem'
        }}>
          <h3 style={{ margin: '0 0 0.85rem 0', fontSize: '1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>📱</span> Device-Level Line Item Entry (Quantity = 1)
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.65rem'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Brand *
              </label>
              <select
                value={itemBrand}
                onChange={(e) => setItemBrand(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  fontSize: '0.8rem'
                }}
              >
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="Google">Google</option>
                <option value="Lenovo">Lenovo</option>
                <option value="Dell">Dell</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Model *
              </label>
              <input
                type="text"
                value={itemModel}
                onChange={(e) => setItemModel(e.target.value)}
                placeholder="e.g. iPhone 13"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  fontSize: '0.8rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Storage *
              </label>
              <input
                type="text"
                value={itemStorage}
                onChange={(e) => setItemStorage(e.target.value)}
                placeholder="128GB"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  fontSize: '0.8rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Color / Finish *
              </label>
              <input
                type="text"
                value={itemColor}
                onChange={(e) => setItemColor(e.target.value)}
                placeholder="Midnight"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  fontSize: '0.8rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Intake Grade *
              </label>
              <select
                value={itemGrade}
                onChange={(e) => setItemGrade(e.target.value as ConditionGrade)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  fontSize: '0.8rem'
                }}
              >
                <option value="GRADE_A_PLUS">Grade A+ (Like New)</option>
                <option value="GRADE_A">Grade A (Excellent)</option>
                <option value="GRADE_B">Grade B (Good)</option>
                <option value="GRADE_C">Grade C (Fair)</option>
                <option value="GRADE_D">Grade D (Heavy Wear)</option>
                <option value="PARTS_ONLY">Parts Only</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Acquisition Cost (₹) *
              </label>
              <input
                type="number"
                value={itemCost}
                onChange={(e) => setItemCost(e.target.value)}
                placeholder="28500"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#10b981',
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}
              />
            </div>
          </div>

          {/* Capture IMEI input with real-time Luhn validator & Check-Digit button */}
          <div style={{ marginTop: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
              Capture IMEI (15 Numeric Digits with Luhn Mod-10 Check) *
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                maxLength={15}
                value={itemImei}
                onChange={(e) => {
                  setItemImei(e.target.value.replace(/\D/g, ''));
                  setImeiError(null);
                }}
                placeholder="Enter 15-digit Luhn IMEI (e.g. 356938051234563)"
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  backgroundColor: '#1e293b',
                  border: itemImei.length === 15 && isValidImei(itemImei)
                    ? '1px solid #10b981'
                    : '1px solid #334155',
                  borderRadius: '6px',
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  letterSpacing: '0.05em'
                }}
              />
              <button
                type="button"
                onClick={handleAutoFixCheckDigit}
                style={{
                  padding: '0.55rem 0.85rem',
                  backgroundColor: '#334155',
                  color: '#cbd5e1',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Auto-Calc 15th Check Digit
              </button>
              <button
                type="button"
                onClick={handleAddDeviceItem}
                style={{
                  padding: '0.55rem 1.15rem',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                + Add Device to PO
              </button>
            </div>

            {imeiError && (
              <div style={{ color: '#f43f5e', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                ⚠️ {imeiError}
              </div>
            )}
            {itemImei.length === 15 && isValidImei(itemImei) && (
              <div style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                ✓ Valid 15-digit IMEI (Luhn Algorithm Verified)
              </div>
            )}
          </div>
        </div>

        {/* PO Line Items Summary Table */}
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc' }}>
              Consignment Items ({poItems.length} Devices)
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
              Total Consignment Cost: <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>₹{totalAmount.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {poItems.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', border: '1px dashed #334155', borderRadius: '6px' }}>
              No devices added yet. Enter specifications and capture IMEI above.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid #334155', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', backgroundColor: '#1e293b', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '0.55rem' }}>#</th>
                    <th style={{ padding: '0.55rem' }}>Device Model</th>
                    <th style={{ padding: '0.55rem' }}>Specs</th>
                    <th style={{ padding: '0.55rem' }}>Grade</th>
                    <th style={{ padding: '0.55rem' }}>Captured IMEI</th>
                    <th style={{ padding: '0.55rem' }}>Unit Cost</th>
                    <th style={{ padding: '0.55rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {poItems.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '0.55rem', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '0.55rem', fontWeight: 600, color: '#f8fafc' }}>
                        {item.brand} {item.model}
                      </td>
                      <td style={{ padding: '0.55rem', color: '#cbd5e1' }}>
                        {item.storage} • {item.color}
                      </td>
                      <td style={{ padding: '0.55rem' }}>
                        <span className={`grade-badge grade-badge-${item.grade}`}>
                          {item.grade.replace('GRADE_', 'Grade ').replace('_PLUS', '+')}
                        </span>
                      </td>
                      <td style={{ padding: '0.55rem', fontFamily: 'monospace', color: '#38bdf8' }}>
                        {item.imei1}
                      </td>
                      <td style={{ padding: '0.55rem', fontWeight: 600, color: '#10b981' }}>
                        ₹{item.cost.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.55rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          style={{
                            padding: '0.2rem 0.5rem',
                            backgroundColor: 'transparent',
                            color: '#f43f5e',
                            border: '1px solid #f43f5e',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid #334155'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.55rem 1.25rem',
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
            type="button"
            onClick={handleSubmit}
            style={{
              padding: '0.65rem 1.75rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Create Purchase Order (DRAFT)
          </button>
        </div>
      </div>
    </div>
  );
}
