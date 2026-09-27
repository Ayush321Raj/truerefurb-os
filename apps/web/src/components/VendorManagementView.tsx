'use client';

import React, { useState, useMemo } from 'react';
import { Vendor, PurchaseOrder } from '@truerefurb/shared-types';
import { VendorProfileModal } from './VendorProfileModal';

interface VendorManagementViewProps {
  vendors: Vendor[];
  purchases: PurchaseOrder[];
  onAddVendor?: (vendor: Vendor) => void;
  onOpenCreatePO?: (vendor?: Vendor) => void;
  onViewPO?: (po: PurchaseOrder) => void;
}

export function VendorManagementView({
  vendors,
  purchases,
  onAddVendor,
  onOpenCreatePO,
  onViewPO,
}: VendorManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendorForProfile, setSelectedVendorForProfile] = useState<Vendor | null>(null);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);

  // New Vendor Form State
  const [vendorName, setVendorName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('West Bengal');
  const [notes, setNotes] = useState('');

  // Aggregated totals
  const totalPurchases = useMemo(() => {
    return vendors.reduce((sum, v) => sum + (v.totalPurchases || 0), 0);
  }, [vendors]);

  const totalOutstanding = useMemo(() => {
    return vendors.reduce((sum, v) => sum + (v.outstandingAmount || 0), 0);
  }, [vendors]);

  // Filtered vendors
  const filteredVendors = useMemo(() => {
    if (!searchTerm.trim()) return vendors;
    const term = searchTerm.toLowerCase();
    return vendors.filter(
      (v) =>
        v.vendorName.toLowerCase().includes(term) ||
        v.businessName.toLowerCase().includes(term) ||
        v.gstin.toLowerCase().includes(term) ||
        v.city.toLowerCase().includes(term) ||
        v.phone.includes(term)
    );
  }, [vendors, searchTerm]);

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || !businessName.trim() || !gstin.trim()) {
      alert('Vendor Name, Business Name, and GSTIN are required.');
      return;
    }

    const created: Vendor = {
      id: `ven-${Date.now()}`,
      vendorName: vendorName.trim(),
      businessName: businessName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      gstin: gstin.trim().toUpperCase(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      notes: notes.trim() || undefined,
      status: 'ACTIVE',
      totalPurchases: 0,
      outstandingAmount: 0,
      totalOrdersCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onAddVendor) {
      onAddVendor(created);
    }

    setIsAddVendorOpen(false);
    setVendorName('');
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
      {/* Metrics Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.85rem'
      }}>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Total Vendor Purchases</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem', color: '#f8fafc' }}>
            ₹{totalPurchases.toLocaleString('en-IN')}
          </div>
          <div className="stat-card-subtitle">Lifetime Procurement Expenditure</div>
        </div>

        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Total Outstanding Balance</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem', color: '#f59e0b' }}>
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
          <div className="stat-card-subtitle">Payables Pending Settlement</div>
        </div>

        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Active Sourcing Partners</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem', color: '#10b981' }}>
            {vendors.filter((v) => v.status === 'ACTIVE').length} Vendors
          </div>
          <div className="stat-card-subtitle">Certified Trade Partners with GSTIN</div>
        </div>

        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Procurement POs</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem', color: '#38bdf8' }}>
            {purchases.length} Consignments
          </div>
          <div className="stat-card-subtitle">Tracked in Purchase Workflow</div>
        </div>
      </div>

      {/* Main Vendor Directory Card */}
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        padding: '1.25rem',
      }}>
        {/* Controls Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
            <input
              type="text"
              placeholder="Search vendors by Business, Contact, GSTIN, City..."
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
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {onOpenCreatePO && (
              <button
                onClick={() => onOpenCreatePO()}
                style={{
                  padding: '0.55rem 0.95rem',
                  backgroundColor: '#1e293b',
                  color: '#38bdf8',
                  border: '1px solid #38bdf8',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                📦 + New Purchase Order
              </button>
            )}

            <button
              onClick={() => setIsAddVendorOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
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
              <span>+</span> Add Vendor
            </button>
          </div>
        </div>

        {/* Vendors Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 0.85rem' }}>Business Name</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>Contact Person</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>Phone & Email</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>GSTIN</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>Location</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>Total Purchases</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>Outstanding</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  style={{ borderBottom: '1px solid #1e293b', transition: 'background-color 0.1s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '0.75rem 0.85rem' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{vendor.businessName}</div>
                    {vendor.notes && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {vendor.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', color: '#cbd5e1' }}>
                    {vendor.vendorName}
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem' }}>
                    <div style={{ color: '#e2e8f0' }}>{vendor.phone}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{vendor.email}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>
                    {vendor.gstin}
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', color: '#cbd5e1' }}>
                    {vendor.city}, {vendor.state}
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                    ₹{(vendor.totalPurchases || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', fontWeight: 600, color: vendor.outstandingAmount > 0 ? '#f59e0b' : '#10b981' }}>
                    ₹{(vendor.outstandingAmount || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '10px',
                      backgroundColor: vendor.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: vendor.status === 'ACTIVE' ? '#10b981' : '#f43f5e',
                      border: vendor.status === 'ACTIVE' ? '1px solid #10b981' : '1px solid #f43f5e',
                    }}>
                      {vendor.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => setSelectedVendorForProfile(vendor)}
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
                        Profile & History
                      </button>
                      {onOpenCreatePO && (
                        <button
                          onClick={() => onOpenCreatePO(vendor)}
                          style={{
                            padding: '0.3rem 0.65rem',
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          + PO
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

      {/* Vendor Profile & Purchase History Modal */}
      {selectedVendorForProfile && (
        <VendorProfileModal
          vendor={selectedVendorForProfile}
          purchases={purchases}
          onClose={() => setSelectedVendorForProfile(null)}
          onOpenCreatePO={(v) => {
            setSelectedVendorForProfile(null);
            if (onOpenCreatePO) onOpenCreatePO(v);
          }}
          onViewPO={onViewPO}
        />
      )}

      {/* Add Vendor Modal */}
      {isAddVendorOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
                Add New Vendor
              </h3>
              <button className="modal-close-btn" onClick={() => setIsAddVendorOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateVendor} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Business / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABC Mobiles"
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
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
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
                    placeholder="e.g. +91 98301 22450"
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
                    placeholder="e.g. sales@abcmobiles.in"
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
                  GSTIN (15 Digits) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 19ABCDE1234F1Z5"
                  maxLength={15}
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
                  Commercial Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street address, building, floor"
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

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  Procurement Notes
                </label>
                <input
                  type="text"
                  placeholder="Supply categories, commercial terms, remarks"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddVendorOpen(false)}
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
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
