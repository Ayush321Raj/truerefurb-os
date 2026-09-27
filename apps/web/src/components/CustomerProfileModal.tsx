'use client';

import React, { useState } from 'react';
import { Customer, CustomerInvoice, CustomerSaleRecord } from '@truerefurb/shared-types';
import { CustomerInvoiceModal } from './CustomerInvoiceModal';

interface CustomerProfileModalProps {
  customer: Customer;
  invoices: CustomerInvoice[];
  salesHistory: CustomerSaleRecord[];
  onClose: () => void;
}

export function CustomerProfileModal({
  customer,
  invoices,
  salesHistory,
  onClose,
}: CustomerProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'SALES_HISTORY' | 'INVOICES'>('SALES_HISTORY');
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);

  const customerInvoices = invoices.filter((i) => i.customerId === customer.id);
  const customerSales = salesHistory.filter((s) => s.customerId === customer.id);

  const totalSalesVal = customerInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalOutstanding = customerInvoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0);

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc' }}>
                {customer.businessName}
              </h2>
              <span style={{
                backgroundColor: customer.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: customer.status === 'ACTIVE' ? '#10b981' : '#f43f5e',
                border: customer.status === 'ACTIVE' ? '1px solid #10b981' : '1px solid #f43f5e',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.15rem 0.5rem',
                borderRadius: '10px',
              }}>
                {customer.status}
              </span>
            </div>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Client Representative: <strong>{customer.name}</strong> • Phone: {customer.phone}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* 3 Metrics: Total Sales, Outstanding Amount, Invoices */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          marginTop: '1rem',
          marginBottom: '1.25rem',
        }}>
          <div className="stat-card" style={{ padding: '0.85rem' }}>
            <div className="stat-card-title">Lifetime Sales</div>
            <div className="stat-card-value" style={{ fontSize: '1.35rem', color: '#f8fafc' }}>
              ₹{(customer.totalSales || totalSalesVal).toLocaleString('en-IN')}
            </div>
            <div className="stat-card-subtitle">{customerSales.length} Total Units Dispatched</div>
          </div>

          <div className="stat-card" style={{ padding: '0.85rem' }}>
            <div className="stat-card-title">Outstanding Amount</div>
            <div className="stat-card-value" style={{ fontSize: '1.35rem', color: customer.outstandingAmount > 0 ? '#f59e0b' : '#10b981' }}>
              ₹{(customer.outstandingAmount || totalOutstanding).toLocaleString('en-IN')}
            </div>
            <div className="stat-card-subtitle">
              {customer.outstandingAmount > 0 ? 'Receivable balance pending' : 'All invoices fully settled'}
            </div>
          </div>

          <div className="stat-card" style={{ padding: '0.85rem' }}>
            <div className="stat-card-title">Billed Invoices</div>
            <div className="stat-card-value" style={{ fontSize: '1.35rem', color: '#38bdf8' }}>
              {customerInvoices.length} Invoices
            </div>
            <div className="stat-card-subtitle">GST Compliance Tax Invoices</div>
          </div>
        </div>

        {/* Customer Demographic & GSTIN Profile */}
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '0.9rem',
          marginBottom: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          fontSize: '0.85rem'
        }}>
          <div>
            <span style={{ color: '#94a3b8' }}>Contact Person:</span>
            <div style={{ color: '#f8fafc', fontWeight: 600 }}>{customer.name}</div>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Email:</span>
            <div style={{ color: '#f8fafc' }}>{customer.email}</div>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>GSTIN:</span>
            <div style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>
              {customer.gstin || 'Unregistered / Retail'}
            </div>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Location:</span>
            <div style={{ color: '#f8fafc' }}>{customer.city}, {customer.state}</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ color: '#94a3b8' }}>Billing Address:</span>
            <div style={{ color: '#cbd5e1' }}>{customer.address}</div>
          </div>
        </div>

        {/* Tab Switcher: Sales History vs Invoices */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <button
            onClick={() => setActiveTab('SALES_HISTORY')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: activeTab === 'SALES_HISTORY' ? '1px solid #38bdf8' : '1px solid #334155',
              backgroundColor: activeTab === 'SALES_HISTORY' ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
              color: activeTab === 'SALES_HISTORY' ? '#38bdf8' : '#94a3b8',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'SALES_HISTORY' ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            📋 Sales History ({customerSales.length} Units)
          </button>
          <button
            onClick={() => setActiveTab('INVOICES')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: activeTab === 'INVOICES' ? '1px solid #38bdf8' : '1px solid #334155',
              backgroundColor: activeTab === 'INVOICES' ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
              color: activeTab === 'INVOICES' ? '#38bdf8' : '#94a3b8',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'INVOICES' ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            🧾 Invoices ({customerInvoices.length})
          </button>
        </div>

        {/* Tab 1: Sales History */}
        {activeTab === 'SALES_HISTORY' && (
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '0.85rem',
            overflowX: 'auto',
          }}>
            {customerSales.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                No sales records logged yet for this customer.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '0.55rem' }}>Sale Date</th>
                    <th style={{ padding: '0.55rem' }}>Device Model</th>
                    <th style={{ padding: '0.55rem' }}>Specs</th>
                    <th style={{ padding: '0.55rem' }}>Grade</th>
                    <th style={{ padding: '0.55rem' }}>IMEI</th>
                    <th style={{ padding: '0.55rem' }}>Invoice Ref</th>
                    <th style={{ padding: '0.55rem', textAlign: 'right' }}>Sale Price</th>
                  </tr>
                </thead>
                <tbody>
                  {customerSales.map((sale) => (
                    <tr key={sale.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '0.55rem', color: '#cbd5e1' }}>{sale.saleDate}</td>
                      <td style={{ padding: '0.55rem', fontWeight: 600, color: '#f8fafc' }}>
                        {sale.brand} {sale.model}
                      </td>
                      <td style={{ padding: '0.55rem', color: '#cbd5e1' }}>{sale.storage}</td>
                      <td style={{ padding: '0.55rem' }}>
                        <span className={`grade-badge grade-badge-${sale.grade}`}>
                          {sale.grade.replace('GRADE_', 'Grade ').replace('_PLUS', '+')}
                        </span>
                      </td>
                      <td style={{ padding: '0.55rem', fontFamily: 'monospace', color: '#38bdf8' }}>
                        {sale.imei}
                      </td>
                      <td style={{ padding: '0.55rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                        {sale.invoiceNumber}
                      </td>
                      <td style={{ padding: '0.55rem', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>
                        ₹{sale.salePrice.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Invoices */}
        {activeTab === 'INVOICES' && (
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '0.85rem',
            overflowX: 'auto',
          }}>
            {customerInvoices.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                No invoices generated yet for this customer.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '0.55rem' }}>Invoice #</th>
                    <th style={{ padding: '0.55rem' }}>Date</th>
                    <th style={{ padding: '0.55rem' }}>Due Date</th>
                    <th style={{ padding: '0.55rem' }}>Total Amount</th>
                    <th style={{ padding: '0.55rem' }}>Outstanding</th>
                    <th style={{ padding: '0.55rem' }}>Payment Status</th>
                    <th style={{ padding: '0.55rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customerInvoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '0.55rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>
                        {inv.invoiceNumber}
                      </td>
                      <td style={{ padding: '0.55rem', color: '#cbd5e1' }}>{inv.invoiceDate}</td>
                      <td style={{ padding: '0.55rem', color: '#94a3b8' }}>{inv.dueDate}</td>
                      <td style={{ padding: '0.55rem', fontWeight: 600, color: '#f8fafc' }}>
                        ₹{inv.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.55rem', fontWeight: 600, color: inv.outstandingAmount > 0 ? '#f59e0b' : '#10b981' }}>
                        ₹{inv.outstandingAmount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.55rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '10px',
                          backgroundColor:
                            inv.paymentStatus === 'PAID'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : inv.paymentStatus === 'PARTIAL'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                          color:
                            inv.paymentStatus === 'PAID'
                              ? '#10b981'
                              : inv.paymentStatus === 'PARTIAL'
                              ? '#f59e0b'
                              : '#f43f5e',
                          border: `1px solid ${
                            inv.paymentStatus === 'PAID'
                              ? '#10b981'
                              : inv.paymentStatus === 'PARTIAL'
                              ? '#f59e0b'
                              : '#f43f5e'
                          }`,
                        }}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td style={{ padding: '0.55rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedInvoice(inv)}
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
                          View Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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

      {selectedInvoice && (
        <CustomerInvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
