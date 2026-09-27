'use client';

import React from 'react';
import { CustomerInvoice } from '@truerefurb/shared-types';

interface CustomerInvoiceModalProps {
  invoice: CustomerInvoice;
  onClose: () => void;
}

export function CustomerInvoiceModal({ invoice, onClose }: CustomerInvoiceModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '720px' }}>
        {/* Invoice Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc' }}>
                Tax Invoice: {invoice.invoiceNumber}
              </h2>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.15rem 0.5rem',
                borderRadius: '10px',
                backgroundColor:
                  invoice.paymentStatus === 'PAID'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : invoice.paymentStatus === 'PARTIAL'
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                color:
                  invoice.paymentStatus === 'PAID'
                    ? '#10b981'
                    : invoice.paymentStatus === 'PARTIAL'
                    ? '#f59e0b'
                    : '#f43f5e',
                border: `1px solid ${
                  invoice.paymentStatus === 'PAID'
                    ? '#10b981'
                    : invoice.paymentStatus === 'PARTIAL'
                    ? '#f59e0b'
                    : '#f43f5e'
                }`,
              }}>
                {invoice.paymentStatus}
              </span>
            </div>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Billed to: <strong style={{ color: '#f8fafc' }}>{invoice.businessName}</strong> ({invoice.customerName})
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Invoice Meta Grid */}
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '0.9rem',
          marginTop: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          fontSize: '0.85rem'
        }}>
          <div>
            <span style={{ color: '#94a3b8' }}>Invoice Date:</span>
            <div style={{ color: '#f8fafc', fontWeight: 600 }}>{invoice.invoiceDate}</div>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Payment Due:</span>
            <div style={{ color: '#f8fafc', fontWeight: 600 }}>{invoice.dueDate}</div>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Subtotal:</span>
            <div style={{ color: '#cbd5e1' }}>₹{invoice.subtotal.toLocaleString('en-IN')}</div>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>GST (18%):</span>
            <div style={{ color: '#cbd5e1' }}>₹{invoice.taxAmount.toLocaleString('en-IN')}</div>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Total Amount:</span>
            <div style={{ color: '#10b981', fontWeight: 700, fontSize: '1rem' }}>
              ₹{invoice.totalAmount.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Outstanding Due:</span>
            <div style={{ color: invoice.outstandingAmount > 0 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
              ₹{invoice.outstandingAmount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Invoice Line Items */}
        <div style={{ marginTop: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#f8fafc' }}>
            Line Items & Hardware Serial Assignment
          </h4>
          <div style={{ overflowX: 'auto', border: '1px solid #334155', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.55rem' }}>Device Model</th>
                  <th style={{ padding: '0.55rem' }}>Specs</th>
                  <th style={{ padding: '0.55rem' }}>Grade</th>
                  <th style={{ padding: '0.55rem' }}>Validated IMEI</th>
                  <th style={{ padding: '0.55rem' }}>Warranty</th>
                  <th style={{ padding: '0.55rem', textAlign: 'right' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.55rem', fontWeight: 600, color: '#f8fafc' }}>
                      {item.brand} {item.model}
                    </td>
                    <td style={{ padding: '0.55rem', color: '#cbd5e1' }}>
                      {item.storage}
                    </td>
                    <td style={{ padding: '0.55rem' }}>
                      <span className={`grade-badge grade-badge-${item.grade}`}>
                        {item.grade.replace('GRADE_', 'Grade ').replace('_PLUS', '+')}
                      </span>
                    </td>
                    <td style={{ padding: '0.55rem', fontFamily: 'monospace', color: '#38bdf8' }}>
                      {item.imei}
                    </td>
                    <td style={{ padding: '0.55rem', color: '#a7f3d0' }}>
                      {item.warrantyMonths} Months TrueRefurb
                    </td>
                    <td style={{ padding: '0.55rem', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>
                      ₹{item.sellingPrice.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {invoice.notes && (
          <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
            Terms & Conditions: {invoice.notes}
          </div>
        )}

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
