'use client';

import React from 'react';
import { Vendor, PurchaseOrder } from '@truerefurb/shared-types';

interface VendorProfileModalProps {
  vendor: Vendor;
  purchases: PurchaseOrder[];
  onClose: () => void;
  onOpenCreatePO?: (vendor: Vendor) => void;
  onViewPO?: (po: PurchaseOrder) => void;
}

export function VendorProfileModal({
  vendor,
  purchases,
  onClose,
  onOpenCreatePO,
  onViewPO,
}: VendorProfileModalProps) {
  const vendorPurchases = purchases.filter(
    (p) => p.vendorId === vendor.id || p.businessName === vendor.businessName
  );

  const totalSpent = vendorPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalOutstanding = vendorPurchases.reduce((sum, p) => sum + p.outstandingAmount, 0);

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc' }}>
                {vendor.businessName}
              </h2>
              <span style={{
                backgroundColor: vendor.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: vendor.status === 'ACTIVE' ? '#10b981' : '#f43f5e',
                border: vendor.status === 'ACTIVE' ? '1px solid #10b981' : '1px solid #f43f5e',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.15rem 0.5rem',
                borderRadius: '10px',
              }}>
                {vendor.status}
              </span>
            </div>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Contact: {vendor.vendorName} • GSTIN: <strong style={{ color: '#38bdf8' }}>{vendor.gstin}</strong>
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* 3 Metric Cards for Vendor */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          marginTop: '1rem',
          marginBottom: '1.25rem',
        }}>
          <div className="stat-card" style={{ padding: '0.85rem' }}>
            <div className="stat-card-title">Total Purchases</div>
            <div className="stat-card-value" style={{ fontSize: '1.35rem', color: '#f8fafc' }}>
              ₹{(vendor.totalPurchases || totalSpent).toLocaleString('en-IN')}
            </div>
            <div className="stat-card-subtitle">{vendorPurchases.length} Purchase Consignments</div>
          </div>

          <div className="stat-card" style={{ padding: '0.85rem' }}>
            <div className="stat-card-title">Outstanding Amount</div>
            <div className="stat-card-value" style={{ fontSize: '1.35rem', color: vendor.outstandingAmount > 0 ? '#f59e0b' : '#10b981' }}>
              ₹{(vendor.outstandingAmount || totalOutstanding).toLocaleString('en-IN')}
            </div>
            <div className="stat-card-subtitle">
              {vendor.outstandingAmount > 0 ? 'Payable balance pending' : 'Zero unsettled balance'}
            </div>
          </div>

          <div className="stat-card" style={{ padding: '0.85rem' }}>
            <div className="stat-card-title">Settled Expenditure</div>
            <div className="stat-card-value" style={{ fontSize: '1.35rem', color: '#38bdf8' }}>
              ₹{((vendor.totalPurchases || totalSpent) - (vendor.outstandingAmount || totalOutstanding)).toLocaleString('en-IN')}
            </div>
            <div className="stat-card-subtitle">Paid via RTGS / Bank Wire</div>
          </div>
        </div>

        {/* Vendor Contact & Tax Info Card */}
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.25rem'
        }}>
          <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.95rem', color: '#f8fafc' }}>
            Business & Tax Profile
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: '#94a3b8' }}>Contact Person:</span>
              <div style={{ color: '#f8fafc', fontWeight: 600 }}>{vendor.vendorName}</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>Phone:</span>
              <div style={{ color: '#f8fafc' }}>{vendor.phone}</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>Work Email:</span>
              <div style={{ color: '#f8fafc' }}>{vendor.email}</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>Registered GSTIN:</span>
              <div style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>{vendor.gstin}</div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: '#94a3b8' }}>Commercial Address:</span>
              <div style={{ color: '#f8fafc' }}>{vendor.address}, {vendor.city}, {vendor.state}</div>
            </div>
            {vendor.notes && (
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#94a3b8' }}>Procurement Notes:</span>
                <div style={{ color: '#cbd5e1', fontStyle: 'italic', marginTop: '0.2rem' }}>"{vendor.notes}"</div>
              </div>
            )}
          </div>
        </div>

        {/* Purchase History Table */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>
              Purchase History ({vendorPurchases.length} Orders)
            </h4>
            {onOpenCreatePO && (
              <button
                onClick={() => onOpenCreatePO(vendor)}
                style={{
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                + New Purchase Order
              </button>
            )}
          </div>

          {vendorPurchases.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              No purchase orders recorded yet for {vendor.businessName}.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '0.55rem' }}>PO Reference</th>
                    <th style={{ padding: '0.55rem' }}>Purchase Date</th>
                    <th style={{ padding: '0.55rem' }}>Units</th>
                    <th style={{ padding: '0.55rem' }}>Total Amount</th>
                    <th style={{ padding: '0.55rem' }}>Payment Status</th>
                    <th style={{ padding: '0.55rem' }}>Order Status</th>
                    <th style={{ padding: '0.55rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorPurchases.map((po) => (
                    <tr key={po.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '0.55rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>
                        {po.referenceNumber}
                      </td>
                      <td style={{ padding: '0.55rem', color: '#e2e8f0' }}>
                        {po.purchaseDate}
                      </td>
                      <td style={{ padding: '0.55rem', color: '#f8fafc' }}>
                        {po.items.length} Units
                      </td>
                      <td style={{ padding: '0.55rem', fontWeight: 600, color: '#f8fafc' }}>
                        ₹{po.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.55rem' }}>
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
                      <td style={{ padding: '0.55rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '10px',
                          backgroundColor:
                            po.status === 'RECEIVED'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : po.status === 'DRAFT'
                              ? 'rgba(148, 163, 184, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                          color:
                            po.status === 'RECEIVED'
                              ? '#10b981'
                              : po.status === 'DRAFT'
                              ? '#cbd5e1'
                              : '#f43f5e',
                        }}>
                          {po.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.55rem', textAlign: 'right' }}>
                        {onViewPO && (
                          <button
                            onClick={() => onViewPO(po)}
                            style={{
                              padding: '0.25rem 0.6rem',
                              backgroundColor: '#1e293b',
                              color: '#38bdf8',
                              border: '1px solid #38bdf8',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            View PO Items
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button
            onClick={onClose}
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
  );
}
