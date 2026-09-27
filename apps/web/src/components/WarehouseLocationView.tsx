'use client';

import React, { useState, useMemo } from 'react';
import { Warehouse, InventoryLocation, DeviceMaster } from '@truerefurb/shared-types';

interface WarehouseLocationViewProps {
  warehouses: Warehouse[];
  locations: InventoryLocation[];
  devices: DeviceMaster[];
  onAddWarehouse?: (wh: Warehouse) => void;
  onAddLocation?: (loc: InventoryLocation) => void;
  onViewDevice?: (device: DeviceMaster) => void;
}

export function WarehouseLocationView({
  warehouses,
  locations,
  devices,
  onAddWarehouse,
  onAddLocation,
  onViewDevice,
}: WarehouseLocationViewProps) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(
    warehouses[0]?.id || 'wh-kol-01'
  );
  const [selectedLocationCode, setSelectedLocationCode] = useState<string | null>(null);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);

  // New location form state
  const [newLocCode, setNewLocCode] = useState('');
  const [newLocZone, setNewLocZone] = useState('Zone A');
  const [newLocShelf, setNewLocShelf] = useState('');
  const [newLocBin, setNewLocBin] = useState('');
  const [newLocDesc, setNewLocDesc] = useState('');
  const [newLocCapacity, setNewLocCapacity] = useState('40');

  // Currently selected warehouse
  const activeWarehouse = useMemo(() => {
    return warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0];
  }, [warehouses, selectedWarehouseId]);

  // Locations belonging to selected warehouse
  const warehouseLocations = useMemo(() => {
    return locations.filter((loc) => loc.warehouseId === selectedWarehouseId);
  }, [locations, selectedWarehouseId]);

  // Devices currently placed in the selected warehouse
  const warehouseDevices = useMemo(() => {
    return devices.filter((d) => {
      if (d.warehouseId) return d.warehouseId === selectedWarehouseId;
      // Fallback matching by name
      return d.currentLocation.toLowerCase().includes(activeWarehouse?.name.toLowerCase().split(' ')[0] || '');
    });
  }, [devices, selectedWarehouseId, activeWarehouse]);

  // Filtered devices if a specific location code is clicked (e.g. A01)
  const displayedDevices = useMemo(() => {
    if (!selectedLocationCode) return warehouseDevices;
    return warehouseDevices.filter((d) => {
      if (d.locationCode) return d.locationCode.toUpperCase() === selectedLocationCode.toUpperCase();
      return d.currentLocation.toUpperCase().includes(selectedLocationCode.toUpperCase());
    });
  }, [warehouseDevices, selectedLocationCode]);

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocCode.trim()) {
      alert('Location code is required (e.g. A01, A02, B01)');
      return;
    }

    const created: InventoryLocation = {
      id: `loc-${Date.now()}`,
      warehouseId: selectedWarehouseId,
      warehouseName: activeWarehouse?.name,
      code: newLocCode.trim().toUpperCase(),
      zone: newLocZone,
      shelf: newLocShelf.trim() || undefined,
      bin: newLocBin.trim() || undefined,
      description: newLocDesc.trim() || undefined,
      capacity: parseInt(newLocCapacity, 10) || 40,
      deviceCount: 0,
      isActive: true,
    };

    if (onAddLocation) {
      onAddLocation(created);
    }
    setIsAddLocationOpen(false);
    setNewLocCode('');
    setNewLocDesc('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Multi-Warehouse Navigation & Architecture Banner */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🏢</span>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>
              Multi-Warehouse Inventory Locations
            </h2>
            <span style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
            }}>
              Multi-Hub Ready
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Each device has exactly <strong>one current inventory location</strong> across warehouse hubs.
          </p>
        </div>

        {/* Warehouse Switcher Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {warehouses.map((wh) => {
            const isSelected = wh.id === selectedWarehouseId;
            const count = devices.filter((d) => d.warehouseId === wh.id || d.currentLocation.includes(wh.code)).length;
            return (
              <button
                key={wh.id}
                onClick={() => {
                  setSelectedWarehouseId(wh.id);
                  setSelectedLocationCode(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.95rem',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid #334155',
                  backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : '#1e293b',
                  color: isSelected ? '#38bdf8' : '#cbd5e1',
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>📍 {wh.name}</span>
                <span style={{
                  backgroundColor: isSelected ? '#0284c7' : '#0f172a',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px',
                }}>
                  {wh.code}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Warehouse Overview Card */}
      {activeWarehouse && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.85rem'
        }}>
          <div className="stat-card" style={{ padding: '1rem' }}>
            <div className="stat-card-title">Warehouse Facility</div>
            <div className="stat-card-value" style={{ fontSize: '1.25rem', color: '#f8fafc' }}>
              {activeWarehouse.name}
            </div>
            <div className="stat-card-subtitle" style={{ color: '#38bdf8' }}>
              {activeWarehouse.code} • {activeWarehouse.city}, {activeWarehouse.state}
            </div>
          </div>

          <div className="stat-card" style={{ padding: '1rem' }}>
            <div className="stat-card-title">Configured Locations</div>
            <div className="stat-card-value" style={{ fontSize: '1.25rem', color: '#38bdf8' }}>
              {warehouseLocations.length} Bins / Shelves
            </div>
            <div className="stat-card-subtitle">
              e.g. A01, A02, B01, B02
            </div>
          </div>

          <div className="stat-card" style={{ padding: '1rem' }}>
            <div className="stat-card-title">Current Stored Units</div>
            <div className="stat-card-value" style={{ fontSize: '1.25rem', color: '#10b981' }}>
              {warehouseDevices.length} Devices
            </div>
            <div className="stat-card-subtitle">
              Tracked across floor locations
            </div>
          </div>

          <div className="stat-card" style={{ padding: '1rem' }}>
            <div className="stat-card-title">Facility Contact</div>
            <div className="stat-card-value" style={{ fontSize: '0.95rem', color: '#e2e8f0', marginTop: '0.2rem' }}>
              {activeWarehouse.phone || '+91 33 2357 8890'}
            </div>
            <div className="stat-card-subtitle">
              {activeWarehouse.address}
            </div>
          </div>
        </div>
      )}

      {/* Location Codes Grid (A01, A02, B01, B02, etc.) */}
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        padding: '1.25rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc' }}>
              Inventory Locations in {activeWarehouse?.name}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              Click any location to filter devices placed in that specific bay or bin.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {selectedLocationCode && (
              <button
                onClick={() => setSelectedLocationCode(null)}
                style={{
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.8rem',
                  backgroundColor: '#334155',
                  color: '#f8fafc',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Clear Location Filter ({selectedLocationCode})
              </button>
            )}
            <button
              onClick={() => setIsAddLocationOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.95rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <span>+</span> Add Location (e.g. C01)
            </button>
          </div>
        </div>

        {/* Location Visual Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.85rem',
        }}>
          {warehouseLocations.map((loc) => {
            const isSelected = selectedLocationCode === loc.code;
            // Count devices currently matching this location
            const count = devices.filter((d) => {
              if (d.locationCode) return d.locationCode.toUpperCase() === loc.code.toUpperCase();
              return d.currentLocation.toUpperCase().includes(loc.code.toUpperCase());
            }).length;

            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLocationCode(isSelected ? null : loc.code)}
                style={{
                  backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : '#1e293b',
                  border: isSelected ? '2px solid #38bdf8' : '1px solid #334155',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: isSelected ? '#38bdf8' : '#f8fafc',
                    letterSpacing: '0.05em'
                  }}>
                    {loc.code}
                  </div>
                  <span style={{
                    backgroundColor: count > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.15)',
                    color: count > 0 ? '#10b981' : '#94a3b8',
                    border: count > 0 ? '1px solid #10b981' : '1px solid #475569',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px'
                  }}>
                    {count} Units
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem', fontWeight: 500 }}>
                  {loc.zone}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  {loc.shelf && `${loc.shelf} • `}{loc.bin || 'Standard Slot'}
                </div>

                {loc.description && (
                  <div style={{
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    marginTop: '0.4rem',
                    borderTop: '1px dashed #334155',
                    paddingTop: '0.35rem',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}>
                    {loc.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Devices in Selected Location or Entire Warehouse */}
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc' }}>
            {selectedLocationCode
              ? `Devices in Location: ${selectedLocationCode} (${displayedDevices.length} units)`
              : `All Devices in ${activeWarehouse?.name} (${displayedDevices.length} units)`}
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Showing 1 current inventory location per device
          </span>
        </div>

        {displayedDevices.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
            No devices currently placed in location {selectedLocationCode || activeWarehouse?.name}.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '0.65rem 0.85rem' }}>IMEI 1</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Brand & Model</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Specs</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Grade</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Status</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Assigned Location</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedDevices.map((d) => (
                  <tr
                    key={d.id}
                    style={{
                      borderBottom: '1px solid #1e293b',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.65rem 0.85rem', fontFamily: 'monospace', color: '#38bdf8' }}>
                      {d.imei1}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                      {d.brand} {d.model}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#cbd5e1' }}>
                      {d.storage} • {d.color}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span className={`grade-badge grade-badge-${d.grade}`}>
                        {d.grade.replace('GRADE_', 'Grade ').replace('_PLUS', '+')}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span className={`status-pill status-pill-${d.status}`}>
                        {d.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #38bdf8',
                        color: '#38bdf8',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                      }}>
                        📍 {d.locationCode || d.currentLocation}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                      {onViewDevice && (
                        <button
                          onClick={() => onViewDevice(d)}
                          style={{
                            padding: '0.3rem 0.65rem',
                            backgroundColor: '#334155',
                            color: '#f8fafc',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          View Specs
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

      {/* Add Location Modal */}
      {isAddLocationOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
                Add Location to {activeWarehouse?.name}
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsAddLocationOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLocation} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  Location Code * (e.g. A01, A02, B01, B02, C01)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C01"
                  value={newLocCode}
                  onChange={(e) => setNewLocCode(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  Zone / Area *
                </label>
                <select
                  value={newLocZone}
                  onChange={(e) => setNewLocZone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#f8fafc',
                  }}
                >
                  <option value="Zone A - Flagship iPhones">Zone A - Flagship iPhones</option>
                  <option value="Zone B - Android Flagships">Zone B - Android Flagships</option>
                  <option value="Zone C - Laptops & MacBooks">Zone C - Laptops & MacBooks</option>
                  <option value="Zone D - Ready to Sell Stock">Zone D - Ready to Sell Stock</option>
                  <option value="Intake Dock & Receiving">Intake Dock & Receiving</option>
                  <option value="Repair Bench Rework">Repair Bench Rework</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Shelf / Tier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shelf 1"
                    value={newLocShelf}
                    onChange={(e) => setNewLocShelf(e.target.value)}
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
                    Unit Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newLocCapacity}
                    onChange={(e) => setNewLocCapacity(e.target.value)}
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
                  Description / Operational Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fast moving Grade A refurbished smartphones"
                  value={newLocDesc}
                  onChange={(e) => setNewLocDesc(e.target.value)}
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
                  onClick={() => setIsAddLocationOpen(false)}
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
                  Create Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
