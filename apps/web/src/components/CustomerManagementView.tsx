'use client';

import React, { useState, useMemo } from 'react';
import { Customer, CustomerInvoice, CustomerSaleRecord } from '@truerefurb/shared-types';
import { CustomerProfileModal } from './CustomerProfileModal';

interface CustomerManagementViewProps {
  customers: Customer[];
  invoices: CustomerInvoice[];
  salesHistory: CustomerSaleRecord[];
  onAddCustomer?: (customer: Customer) => void;
}

export function CustomerManagementView({
  customers,
  invoices,
  salesHistory,
  onAddCustomer,
}: CustomerManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  // New Customer Form State
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('West Bengal');
  const [notes, setNotes] = useState('');

  // Aggregated Metrics
  const totalSales = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.totalSales || 0), 0);
  }, [customers]);

  const totalOutstanding = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.outstandingAmount || 0), 0);
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.businessName.toLowerCase().includes(term) ||
        (c.gstin && c.gstin.toLowerCase().includes(term)) ||
        c.city.toLowerCase().includes(term) ||
        c.phone.includes(term)
    );
  }, [customers, searchTerm]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !businessName.trim() || !phone.trim() || !email.trim()) {
      alert('Name, Business Name, Phone, and Email are required.');
      return;
    }

    const created: Customer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      businessName: businessName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      gstin: gstin.trim() ? gstin.trim().toUpperCase() : undefined,
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      notes: notes.trim() || undefined,
      status: 'ACTIVE',
      totalSales: 0,
      outstandingAmount: 0,
      invoicesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onAddCustomer) {
      onAddCustomer(created);
    }

    setIsAddCustomerOpen(false);
    setName('');
    setBusinessName('');
    setPhone('');
    setEmail('');
    setGstin('');
    setAddress('');
    setCity('');
    setNotes('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.85rem'
      }}>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Total Customer Sales</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem', color: '#10b981' }}>
            ₹{totalSales.toLocaleString('en-IN')}
          </div>
          <div className="stat-card-subtitle">Gross Refurbished Hardware Revenue</div>
        </div>

        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Total Outstanding Receivables</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem', color: '#f59e0b' }}>
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
          <div className="stat-card-subtitle">B2B Customer Invoices Pending</div>
        </div>

        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Active B2B / Retail Clients</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem', color: '#38bdf8' }}>
            {customers.filter((c) => c.status === 'ACTIVE').length} Accounts
          </div>
          <div className="stat-card-subtitle">Retail Outlets & Wholesalers</div>
        </div>

        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Invoices Issued</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem', color: '#818cf8' }}>
            {invoices.length} Invoices
          </div>
          <div className="stat-card-subtitle">GST Compliance Tax Invoices</div>
        </div>
      </div>

      {/* Customers Directory Card */}
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        padding: '1.25rem',
      }}>
        {/* Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}>
          <input
            type="text"
            placeholder="Search customers by Name, Business, GSTIN, City..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '0.55rem 0.85rem',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '0.85rem',
            }}
          />

          <button
            onClick={() => setIsAddCustomerOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.15rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span>+</span> Add Customer
          </button>
        </div>

        {/* Customers Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 0.85rem' }}>Business Name</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>Representative Name</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>Phone & Email</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>GSTIN</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>City & State</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>Total Sales</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>Outstanding</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((cust) => (
                <tr
                  key={cust.id}
                  style={{ borderBottom: '1px solid #1e293b', transition: 'background-color 0.1s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '0.75rem 0.85rem' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{cust.businessName}</div>
                    {cust.address && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cust.address}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', color: '#cbd5e1' }}>
                    {cust.name}
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem' }}>
                    <div style={{ color: '#e2e8f0' }}>{cust.phone}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{cust.email}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', fontFamily: 'monospace', color: cust.gstin ? '#38bdf8' : '#64748b' }}>
                    {cust.gstin || 'Retail / Unregistered'}
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', color: '#cbd5e1' }}>
                    {cust.city}, {cust.state}
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', fontWeight: 600, color: '#10b981' }}>
                    ₹{(cust.totalSales || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', fontWeight: 600, color: cust.outstandingAmount > 0 ? '#f59e0b' : '#10b981' }}>
                    ₹{(cust.outstandingAmount || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '10px',
                      backgroundColor: cust.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: cust.status === 'ACTIVE' ? '#10b981' : '#f43f5e',
                    }}>
                      {cust.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      style={{
                        padding: '0.3rem 0.75rem',
                        backgroundColor: '#334155',
                        color: '#f8fafc',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      History & Invoices
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Modal (Sales History, Outstanding Amount, Invoices) */}
      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          invoices={invoices}
          salesHistory={salesHistory}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
                Add New Customer
              </h3>
              <button className="modal-close-btn" onClick={() => setIsAddCustomerOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Representative Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Sen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Business / Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metro Refurb Store"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98310 11223"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. orders@metrorefurb.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  GSTIN (Optional if B2C retail buyer)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="e.g. 19BBBPV4321R1Z9"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
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
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  Billing Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Shop number, street, landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kolkata"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
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
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. West Bengal"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
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
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  style={{
                    padding: '0.55rem 0.95rem',
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
                    padding: '0.55rem 1.25rem',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
