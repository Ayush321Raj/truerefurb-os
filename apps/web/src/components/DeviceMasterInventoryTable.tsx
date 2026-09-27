'use client';

import React, { useState, useMemo } from 'react';
import { DeviceMaster, DeviceStatus, ConditionGrade, CONTROLLED_DEVICE_STATUSES } from '@truerefurb/shared-types';

interface DeviceMasterInventoryTableProps {
  devices: DeviceMaster[];
  onViewDevice: (device: DeviceMaster) => void;
  onEditDevice: (device: DeviceMaster) => void;
  onChangeStatus: (device: DeviceMaster) => void;
  onMoveLocation: (device: DeviceMaster) => void;
  onSellDevice: (device: DeviceMaster) => void;
  onOpenCreate: () => void;
}

type SortField =
  | 'imei1'
  | 'brand'
  | 'model'
  | 'storage'
  | 'grade'
  | 'batteryHealth'
  | 'purchaseCost'
  | 'sellingPrice'
  | 'status'
  | 'currentLocation';

export function DeviceMasterInventoryTable({
  devices,
  onViewDevice,
  onEditDevice,
  onChangeStatus,
  onMoveLocation,
  onSellDevice,
  onOpenCreate,
}: DeviceMasterInventoryTableProps) {
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | 'ALL'>('ALL');
  const [gradeFilter, setGradeFilter] = useState<ConditionGrade | 'ALL'>('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('status');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [copiedImei, setCopiedImei] = useState<string | null>(null);

  // Distinct Brands & Locations for dynamic filters
  const distinctBrands = useMemo(() => {
    return Array.from(new Set(devices.map((d) => d.brand))).sort();
  }, [devices]);

  const distinctLocations = useMemo(() => {
    return Array.from(new Set(devices.map((d) => d.currentLocation))).sort();
  }, [devices]);

  // Filtering logic: Search across IMEI, Model, Brand, Grade, Status, Serial Number
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      // 1. Search Query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const imei1Match = d.imei1.toLowerCase().includes(query);
        const imei2Match = d.imei2 ? d.imei2.toLowerCase().includes(query) : false;
        const modelMatch = d.model.toLowerCase().includes(query);
        const brandMatch = d.brand.toLowerCase().includes(query);
        const gradeMatch = d.grade.toLowerCase().includes(query);
        const statusMatch = d.status.toLowerCase().includes(query);
        const serialMatch = d.serialNumber.toLowerCase().includes(query);

        if (!imei1Match && !imei2Match && !modelMatch && !brandMatch && !gradeMatch && !statusMatch && !serialMatch) {
          return false;
        }
      }

      // 2. Brand filter
      if (brandFilter !== 'ALL' && d.brand !== brandFilter) {
        return false;
      }

      // 3. Status filter
      if (statusFilter !== 'ALL' && d.status !== statusFilter) {
        return false;
      }

      // 4. Grade filter
      if (gradeFilter !== 'ALL' && d.grade !== gradeFilter) {
        return false;
      }

      // 5. Location filter
      if (locationFilter !== 'ALL' && d.currentLocation !== locationFilter) {
        return false;
      }

      return true;
    });
  }, [devices, searchTerm, brandFilter, statusFilter, gradeFilter, locationFilter]);

  // Sorting logic
  const sortedDevices = useMemo(() => {
    return [...filteredDevices].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'imei1':
          comparison = a.imei1.localeCompare(b.imei1);
          break;
        case 'brand':
          comparison = a.brand.localeCompare(b.brand);
          break;
        case 'model':
          comparison = a.model.localeCompare(b.model);
          break;
        case 'storage':
          comparison = a.storage.localeCompare(b.storage);
          break;
        case 'grade':
          comparison = a.grade.localeCompare(b.grade);
          break;
        case 'batteryHealth':
          comparison = a.batteryHealth - b.batteryHealth;
          break;
        case 'purchaseCost':
          comparison = a.purchaseCost - b.purchaseCost;
          break;
        case 'sellingPrice':
          comparison = a.sellingPrice - b.sellingPrice;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'currentLocation':
          comparison = a.currentLocation.localeCompare(b.currentLocation);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredDevices, sortField, sortOrder]);

  // Pagination slicing
  const totalItems = sortedDevices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedDevices = sortedDevices.slice(startIndex, endIndex);

  // Sorting header click handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Copy IMEI to clipboard
  const handleCopyImei = (imei: string) => {
    navigator.clipboard.writeText(imei);
    setCopiedImei(imei);
    setTimeout(() => setCopiedImei(null), 2000);
  };

  return (
    <div style={{ marginTop: '0.5rem' }}>
      {/* Control Bar: Search + Filters + Register Action */}
      <div className="card control-bar" style={{ borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', borderBottom: 'none', marginBottom: 0 }}>
        {/* Search Input */}
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by IMEI, Model, Brand, Grade, Status, Serial..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="filters-group">
          {/* Brand Filter */}
          <select
            className="filter-select"
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">All Brands</option>
            {distinctBrands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Controlled Status Filter */}
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as DeviceStatus | 'ALL');
              setCurrentPage(1);
            }}
          >
            <option value="ALL">All Statuses (8 Enums)</option>
            {CONTROLLED_DEVICE_STATUSES.map((s) => (
              <option key={s.status} value={s.status}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Grade Filter */}
          <select
            className="filter-select"
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value as ConditionGrade | 'ALL');
              setCurrentPage(1);
            }}
          >
            <option value="ALL">All Grades</option>
            <option value="GRADE_A_PLUS">Grade A+ (Pristine)</option>
            <option value="GRADE_A">Grade A (Excellent)</option>
            <option value="GRADE_B">Grade B (Good)</option>
            <option value="GRADE_C">Grade C (Fair)</option>
            <option value="GRADE_D">Grade D (Heavy Wear)</option>
            <option value="PARTS_ONLY">Parts Only</option>
          </select>

          {/* Location Filter */}
          <select
            className="filter-select"
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">All Locations</option>
            {distinctLocations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Register New Device Button */}
          <button className="btn-primary" onClick={onOpenCreate}>
            + Register Device
          </button>
        </div>
      </div>

      {/* Device Master Table */}
      <div className="table-container" style={{ borderTop: 'none', borderBottom: 'none', borderRadius: 0 }}>
        <table className="device-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('imei1')} style={{ cursor: 'pointer', minWidth: '170px' }}>
                IMEI {sortField === 'imei1' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('brand')} style={{ cursor: 'pointer' }}>
                Brand {sortField === 'brand' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('model')} style={{ cursor: 'pointer', minWidth: '180px' }}>
                Model {sortField === 'model' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('storage')} style={{ cursor: 'pointer' }}>
                Storage {sortField === 'storage' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('grade')} style={{ cursor: 'pointer' }}>
                Grade {sortField === 'grade' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('batteryHealth')} style={{ cursor: 'pointer', minWidth: '100px' }}>
                Battery {sortField === 'batteryHealth' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('purchaseCost')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                Purchase Cost {sortField === 'purchaseCost' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('sellingPrice')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                Selling Price {sortField === 'sellingPrice' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                Status {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('currentLocation')} style={{ cursor: 'pointer', minWidth: '140px' }}>
                Location {sortField === 'currentLocation' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th style={{ textAlign: 'center', minWidth: '220px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDevices.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📱</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>No Devices Found</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Try changing your search terms or clearing your status/brand filters.
                  </div>
                </td>
              </tr>
            ) : (
              paginatedDevices.map((device) => {
                const totalCost = device.totalCost || (device.purchaseCost + device.repairCost + device.otherCost);
                const marginDollar = device.sellingPrice - totalCost;
                const marginPercent = totalCost > 0 ? ((marginDollar / totalCost) * 100).toFixed(0) : '0';

                return (
                  <tr key={device.id}>
                    {/* 1. IMEI Column */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
                          {device.imei1}
                        </span>
                        <button
                          onClick={() => handleCopyImei(device.imei1)}
                          title="Copy IMEI 1"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: copiedImei === device.imei1 ? 'var(--accent-cyan)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          {copiedImei === device.imei1 ? '✓' : '📋'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          SN: {device.serialNumber}
                        </span>
                        {device.imei2 && (
                          <span
                            title={`IMEI 2: ${device.imei2}`}
                            style={{
                              fontSize: '0.62rem',
                              padding: '0.05rem 0.3rem',
                              borderRadius: '3px',
                              background: 'rgba(56, 189, 248, 0.12)',
                              color: '#38bdf8',
                              fontWeight: 700,
                            }}
                          >
                            Dual SIM
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 2. Brand Column */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{device.brand}</span>
                      </div>
                    </td>

                    {/* 3. Model Column */}
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{device.model}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {device.color}
                      </div>
                    </td>

                    {/* 4. Storage Column */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{device.storage}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{device.ram} RAM</div>
                    </td>

                    {/* 5. Grade Column */}
                    <td>
                      <span className={`grade-pill grade-pill-${device.grade}`}>
                        {device.grade.replace('GRADE_', 'Grade ').replace('_PLUS', '+').replace('_ONLY', ' Only')}
                      </span>
                    </td>

                    {/* 6. Battery Column */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{
                          flex: 1,
                          height: '6px',
                          background: 'rgba(255,255,255,0.08)',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${device.batteryHealth}%`,
                            height: '100%',
                            background: device.batteryHealth >= 90 ? '#10b981' : device.batteryHealth >= 80 ? '#f59e0b' : '#ef4444',
                            borderRadius: '3px'
                          }} />
                        </div>
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: device.batteryHealth >= 90 ? '#34d399' : device.batteryHealth >= 80 ? '#fbbf24' : '#f87171'
                        }}>
                          {device.batteryHealth > 0 ? `${device.batteryHealth}%` : '0%'}
                        </span>
                      </div>
                    </td>

                    {/* 7. Purchase Cost Column */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>
                        ${device.purchaseCost.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Total: ${totalCost.toFixed(2)}
                      </div>
                    </td>

                    {/* 8. Selling Price Column */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#34d399' }}>
                        ${device.sellingPrice.toFixed(2)}
                      </div>
                      <div style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: marginDollar >= 0 ? '#34d399' : '#f87171',
                        display: 'inline-block',
                      }}>
                        {marginDollar >= 0 ? `+${marginPercent}%` : `-${Math.abs(Number(marginPercent))}%`}
                      </div>
                    </td>

                    {/* 9. Status Column (Controlled) */}
                    <td>
                      <span className={`status-pill status-pill-${device.status}`}>
                        {device.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* 10. Location Column */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span>📍</span>
                        <span>{device.currentLocation}</span>
                      </div>
                    </td>

                    {/* 11. Actions Column: View, Edit, Change Status, Move Location, Sell */}
                    <td style={{ textAlign: 'center' }}>
                      <div className="action-btn-group" style={{ justifyContent: 'center' }}>
                        <button
                          className="inventory-act-btn btn-view"
                          onClick={() => onViewDevice(device)}
                          title="View Complete Specifications & Costs"
                        >
                          👁️ View
                        </button>
                        <button
                          className="inventory-act-btn btn-edit"
                          onClick={() => onEditDevice(device)}
                          title="Edit Specs & Costs"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="inventory-act-btn btn-status"
                          onClick={() => onChangeStatus(device)}
                          title="Change Controlled Status"
                        >
                          🔄 Status
                        </button>
                        <button
                          className="inventory-act-btn btn-move"
                          onClick={() => onMoveLocation(device)}
                          title="Move Warehouse Bay / Bin"
                        >
                          📦 Move
                        </button>
                        {device.status !== 'SOLD' && device.status !== 'SCRAPPED' && (
                          <button
                            className="inventory-act-btn btn-sell"
                            onClick={() => onSellDevice(device)}
                            title="Sell and Dispatch Device"
                          >
                            🏷️ Sell
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="pagination-container">
        {/* Total counts and page size selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <span>
            Showing <strong>{totalItems === 0 ? 0 : startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{totalItems}</strong> devices
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Per page:</span>
            <select
              className="filter-select"
              style={{ padding: '0.3rem 1.6rem 0.3rem 0.6rem', fontSize: '0.8rem' }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Page Nav Buttons */}
        <div className="pagination-pages">
          <button
            className="page-btn"
            disabled={validCurrentPage <= 1}
            onClick={() => setCurrentPage(1)}
            title="First Page"
          >
            «
          </button>
          <button
            className="page-btn"
            disabled={validCurrentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            title="Previous Page"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - validCurrentPage) <= 2)
            .map((page, idx, arr) => {
              const prev = arr[idx - 1];
              const showEllipsis = prev && page - prev > 1;
              return (
                <React.Fragment key={page}>
                  {showEllipsis && <span style={{ color: 'var(--text-muted)', padding: '0 0.2rem' }}>…</span>}
                  <button
                    className={`page-btn ${validCurrentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}

          <button
            className="page-btn"
            disabled={validCurrentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            title="Next Page"
          >
            ›
          </button>
          <button
            className="page-btn"
            disabled={validCurrentPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            title="Last Page"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
