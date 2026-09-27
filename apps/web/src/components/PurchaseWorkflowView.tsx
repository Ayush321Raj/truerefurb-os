'use client';

import React, { useState, useMemo } from 'react';
import {
  PurchaseOrder,
  Vendor,
  Warehouse,
  InventoryLocation,
  DeviceMaster,
  DeviceStatus,
  PurchaseStatus,
} from '@truerefurb/shared-types';
import { CreatePurchaseModal } from './CreatePurchaseModal';
import { ReceivePurchaseModal } from './ReceivePurchaseModal';

interface PurchaseWorkflowViewProps {
  purchases: PurchaseOrder[];
  vendors: Vendor[];
  warehouses: Warehouse[];
  locations: InventoryLocation[];
  devices: DeviceMaster[];
  onCreatePurchase: (po: PurchaseOrder, newDevices: DeviceMaster[]) => void;
  onReceivePurchase: (
    poId: string,
    warehouseId: string,
    locationCode: string,
    targetDeviceStatus: DeviceStatus,
    notes?: string
  ) => void;
  onCancelPurchase?: (poId: string) => void;
  onViewDevice?: (device: DeviceMaster) => void;
}

export function PurchaseWorkflowView({
  purchases,
  vendors,
  warehouses,
  locations,
  devices,
  onCreatePurchase,
  onReceivePurchase,
  onCancelPurchase,
  onViewDevice,
}: PurchaseWorkflowViewProps) {
  const [activeStatusTab, setActiveStatusTab] = useState<PurchaseStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);
  const [inspectingPO, setInspectingPO] = useState<PurchaseOrder | null>(null);

  // Filtered purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((po) => {
      const matchTab = activeStatusTab === 'ALL' || po.status === activeStatusTab;
      const matchSearch =
        !searchTerm.trim() ||
        po.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [purchases, activeStatusTab, searchTerm]);

  // Aggregate Metrics
  const totalPOValue = useMemo(() => {
    return purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  }, [purchases]);

  const draftPOValue = useMemo(() => {
    return purchases
      .filter((p) => p.status === 'DRAFT')
      .reduce((sum, p) => sum + p.totalAmount, 0);
  }, [purchases]);

  const receivedPOValue = useMemo(() => {
    return purchases
      .filter((p) => p.status === 'RECEIVED')
      .reduce((sum, p) => sum + p.totalAmount, 0);
  }, [purchases]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Module 9 & 10 Header Banner */}
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        padding: '1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.4rem' }}>📦</span>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>
              Purchase Module & Workflow Engine
            </h2>
            <span style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              color: '#10b981',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
            }}>
              Module 9 & 10
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Workflow: <strong>Create Purchase</strong> &rarr; <strong>Add Device</strong> &rarr;{' '}
            <strong>Capture IMEI</strong> &rarr; <strong>Enter Cost</strong> &rarr;{' '}
            <strong>Receive Device</strong> &rarr; <strong>Device Enters Inventory</strong>.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.6rem 1.25rem',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <span>+</span> Create Purchase Order
        </button>
      </div>

      {/* Crucial Rule Highlight Card */}
      <div style={{
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '8px',
        padding: '0.85rem 1.15rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.85rem',
        color: '#fef3c7'
      }}>
        <span style={{ fontSize: '1.3rem' }}>🔒</span>
        <div>
          <strong>Operational Inventory Protection:</strong>{' '}
          <em>"Do not mark inventory available before receipt."</em> Devices created in a DRAFT purchase order are staged with status{' '}
          <strong style={{ color: '#f59e0b' }}>PURCHASED</strong> and cannot be sold, listed, or reserved until dock receipt is confirmed.
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.85rem'
      }}>
        <div className="stat-card" style={{ padding: '0.9rem' }}>
          <div className="stat-card-title">Total PO Value</div>
          <div className="stat-card-value" style={{ fontSize: '1.35rem', color: '#f8fafc' }}>
            ₹{totalPOValue.toLocaleString('en-IN')}
          </div>
          <div className="stat-card-subtitle">{purchases.length} Purchase Consignments</div>
        </div>

        <div className="stat-card" style={{ padding: '0.9rem' }}>
          <div className="stat-card-title">Pending Dock Receipt (Draft)</div>
          <div className="stat-card-value" style={{ fontSize: '1.35rem', color: '#f59e0b' }}>
            ₹{draftPOValue.toLocaleString('en-IN')}
          </div>
          <div className="stat-card-subtitle">
            {purchases.filter((p) => p.status === 'DRAFT').length} Inbound POs Staged
          </div>
        </div>

        <div className="stat-card" style={{ padding: '0.9rem' }}>
          <div className="stat-card-title">Received & Putaway</div>
          <div className="stat-card-value" style={{ fontSize: '1.35rem', color: '#10b981' }}>
            ₹{receivedPOValue.toLocaleString('en-IN')}
          </div>
          <div className="stat-card-subtitle">Active Warehouse Stock</div>
        </div>

        <div className="stat-card" style={{ padding: '0.9rem' }}>
          <div className="stat-card-title">Device Units Purchased</div>
          <div className="stat-card-value" style={{ fontSize: '1.35rem', color: '#38bdf8' }}>
            {purchases.reduce((sum, p) => sum + p.items.length, 0)} Units
          </div>
          <div className="stat-card-subtitle">Validated Device Master Records</div>
        </div>
      </div>

      {/* Purchase Orders Table Card */}
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        padding: '1.25rem'
      }}>
        {/* Filter Tabs & Search */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {(['ALL', 'DRAFT', 'RECEIVED', 'CANCELLED'] as const).map((tab) => {
              const count =
                tab === 'ALL'
                  ? purchases.length
                  : purchases.filter((p) => p.status === tab).length;
              const isActive = activeStatusTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveStatusTab(tab)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    border: isActive ? '1px solid #38bdf8' : '1px solid #334155',
                    backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
                    color: isActive ? '#38bdf8' : '#94a3b8',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {tab === 'ALL' ? 'All Purchases' : tab} ({count})
                </button>
              );
            })}
          </div>

          <input
            type="text"
            placeholder="Search PO reference, vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '0.8rem',
              minWidth: '240px'
            }}
          />
        </div>

        {/* PO Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '0.7rem 0.85rem' }}>Reference #</th>
                <th style={{ padding: '0.7rem 0.85rem' }}>Vendor</th>
                <th style={{ padding: '0.7rem 0.85rem' }}>Purchase Date</th>
                <th style={{ padding: '0.7rem 0.85rem' }}>Destination Warehouse</th>
                <th style={{ padding: '0.7rem 0.85rem' }}>Devices</th>
                <th style={{ padding: '0.7rem 0.85rem' }}>Total Cost</th>
                <th style={{ padding: '0.7rem 0.85rem' }}>Payment</th>
                <th style={{ padding: '0.7rem 0.85rem' }}>PO Status</th>
                <th style={{ padding: '0.7rem 0.85rem', textAlign: 'right' }}>Workflow Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((po) => (
                <tr
                  key={po.id}
                  style={{ borderBottom: '1px solid #1e293b', transition: 'background-color 0.1s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '0.7rem 0.85rem', fontFamily: 'monospace', fontWeight: 600, color: '#38bdf8' }}>
                    {po.referenceNumber}
                  </td>
                  <td style={{ padding: '0.7rem 0.85rem' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{po.businessName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{po.vendorName}</div>
                  </td>
                  <td style={{ padding: '0.7rem 0.85rem', color: '#cbd5e1' }}>
                    {po.purchaseDate}
                  </td>
                  <td style={{ padding: '0.7rem 0.85rem', color: '#e2e8f0' }}>
                    📍 {po.destinationWarehouseName || 'Kolkata Main Warehouse'}
                  </td>
                  <td style={{ padding: '0.7rem 0.85rem' }}>
                    <span style={{
                      backgroundColor: '#1e293b',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      color: '#f8fafc',
                      fontWeight: 600
                    }}>
                      {po.items.length} Units
                    </span>
                  </td>
                  <td style={{ padding: '0.7rem 0.85rem', fontWeight: 600, color: '#10b981' }}>
                    ₹{po.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '0.7rem 0.85rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '10px',
                      backgroundColor:
                        po.paymentStatus === 'PAID'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : po.paymentStatus === 'PARTIAL'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(239, 68, 68, 0.15)',
                      color:
                        po.paymentStatus === 'PAID'
                          ? '#10b981'
                          : po.paymentStatus === 'PARTIAL'
                          ? '#f59e0b'
                          : '#f43f5e',
                      border: `1px solid ${
                        po.paymentStatus === 'PAID'
                          ? '#10b981'
                          : po.paymentStatus === 'PARTIAL'
                          ? '#f59e0b'
                          : '#f43f5e'
                      }`,
                    }}>
                      {po.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '0.7rem 0.85rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '10px',
                      backgroundColor:
                        po.status === 'RECEIVED'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : po.status === 'DRAFT'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(239, 68, 68, 0.15)',
                      color:
                        po.status === 'RECEIVED'
                          ? '#10b981'
                          : po.status === 'DRAFT'
                          ? '#f59e0b'
                          : '#f43f5e',
                      border: `1px solid ${
                        po.status === 'RECEIVED'
                          ? '#10b981'
                          : po.status === 'DRAFT'
                          ? '#f59e0b'
                          : '#f43f5e'
                      }`,
                    }}>
                      {po.status === 'DRAFT' ? '⏳ DRAFT (Unreceived)' : po.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.7rem 0.85rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => setInspectingPO(po)}
                        style={{
                          padding: '0.3rem 0.65rem',
                          backgroundColor: '#334155',
                          color: '#f8fafc',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        Inspect Items
                      </button>

                      {po.status === 'DRAFT' && (
                        <button
                          onClick={() => setReceivingPO(po)}
                          style={{
                            padding: '0.3rem 0.75rem',
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          📥 Receive Devices
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Purchase Modal */}
      {isCreateOpen && (
        <CreatePurchaseModal
          vendors={vendors}
          warehouses={warehouses}
          existingDevices={devices}
          onClose={() => setIsCreateOpen(false)}
          onSubmitPurchase={onCreatePurchase}
        />
      )}

      {/* Receive Purchase Modal */}
      {receivingPO && (
        <ReceivePurchaseModal
          purchaseOrder={receivingPO}
          warehouses={warehouses}
          locations={locations}
          onClose={() => setReceivingPO(null)}
          onConfirmReceipt={onReceivePurchase}
        />
      )}

      {/* Inspect PO Modal */}
      {inspectingPO && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
                  PO Consignment: {inspectingPO.referenceNumber}
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                  Vendor: {inspectingPO.businessName} • Status: <strong>{inspectingPO.status}</strong>
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setInspectingPO(null)}>✕</button>
            </div>

            <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '0.55rem' }}>Device</th>
                    <th style={{ padding: '0.55rem' }}>Specs</th>
                    <th style={{ padding: '0.55rem' }}>Captured IMEI</th>
                    <th style={{ padding: '0.55rem' }}>Cost</th>
                    <th style={{ padding: '0.55rem' }}>Receipt State</th>
                    <th style={{ padding: '0.55rem' }}>Current Location</th>
                  </tr>
                </thead>
                <tbody>
                  {inspectingPO.items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '0.55rem', fontWeight: 600, color: '#f8fafc' }}>
                        {item.brand} {item.model}
                      </td>
                      <td style={{ padding: '0.55rem', color: '#cbd5e1' }}>
                        {item.storage} • {item.color}
                      </td>
                      <td style={{ padding: '0.55rem', fontFamily: 'monospace', color: '#38bdf8' }}>
                        {item.imei1}
                      </td>
                      <td style={{ padding: '0.55rem', fontWeight: 600, color: '#10b981' }}>
                        ₹{item.cost.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.55rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '10px',
                          backgroundColor: item.isReceived ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: item.isReceived ? '#10b981' : '#f59e0b',
                        }}>
                          {item.isReceived ? '✓ In Stock' : '⏳ Awaiting Dock'}
                        </span>
                      </td>
                      <td style={{ padding: '0.55rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                        📍 {item.locationCode || 'INTAKE-01'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button
                onClick={() => setInspectingPO(null)}
                style={{
                  padding: '0.55rem 1.25rem',
                  backgroundColor: '#334155',
                  color: '#f8fafc',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
