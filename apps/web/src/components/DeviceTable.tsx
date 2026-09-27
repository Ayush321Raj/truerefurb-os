'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Watch, 
  Headphones, 
  Monitor, 
  ChevronRight, 
  Eye, 
  Copy, 
  Check, 
  Lock,
  Fingerprint
} from 'lucide-react';
import { DeviceItem, ConditionGrade, WorkflowStage, DeviceCategory } from '@truerefurb/shared-types';
import { useAuth } from '../context/AuthContext';

interface DeviceTableProps {
  devices: DeviceItem[];
  onSelectDevice: (device: DeviceItem) => void;
  onOpenPassport: (device: DeviceItem) => void;
  onAdvanceStage: (deviceId: string) => void;
  selectedStageFilter: WorkflowStage | 'ALL';
  onFilterChange: (stage: WorkflowStage | 'ALL') => void;
}

export const DeviceTable: React.FC<DeviceTableProps> = ({
  devices,
  onSelectDevice,
  onOpenPassport,
  onAdvanceStage,
  selectedStageFilter,
  onFilterChange,
}) => {
  const { hasPermission } = useAuth();
  const canAdvanceStage = hasPermission('repair.complete') || hasPermission('qa.approve') || hasPermission('device.update');

  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getCategoryIcon = (cat: DeviceCategory) => {
    switch (cat) {
      case 'SMARTPHONE': return <Smartphone size={16} />;
      case 'LAPTOP': return <Laptop size={16} />;
      case 'TABLET': return <Tablet size={16} />;
      case 'SMARTWATCH': return <Watch size={16} />;
      case 'AUDIO': return <Headphones size={16} />;
      default: return <Monitor size={16} />;
    }
  };

  const getGradeBadge = (grade: ConditionGrade) => {
    switch (grade) {
      case 'GRADE_A_PLUS':
        return <span className="badge grade-badge-aplus">★ Grade A+</span>;
      case 'GRADE_A':
        return <span className="badge grade-badge-a">Grade A</span>;
      case 'GRADE_B':
        return <span className="badge grade-badge-b">Grade B</span>;
      case 'GRADE_C':
        return <span className="badge grade-badge-c">Grade C</span>;
      default:
        return <span className="badge grade-badge-parts">Parts / Salvage</span>;
    }
  };

  const getStageBadge = (stage: WorkflowStage) => {
    switch (stage) {
      case 'INTAKE': return <span className="stage-pill stage-pill-intake">1. Intake</span>;
      case 'DIAGNOSTICS': return <span className="stage-pill stage-pill-diagnostics">2. Diagnostics</span>;
      case 'REPAIR_BENCH': return <span className="stage-pill stage-pill-repair">3. Repair Bench</span>;
      case 'CLEANING_POLISH': return <span className="stage-pill stage-pill-qa">4. Detailing</span>;
      case 'QA_INSPECTION': return <span className="stage-pill stage-pill-qa">5. QA Audit</span>;
      case 'READY_FOR_SALE': return <span className="stage-pill stage-pill-ready">6. Ready / Stock</span>;
      default: return <span className="stage-pill stage-pill-intake">{stage}</span>;
    }
  };

  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const model = d.model || '';
      const make = d.make || d.brand || '';
      const serial = d.serialNumber || '';
      const imei = d.imei1 || d.imei || '';
      const matchesSearch = !searchQuery.trim() ||
        model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        serial.toLowerCase().includes(searchQuery.toLowerCase()) ||
        imei.includes(searchQuery);

      const matchesStage = selectedStageFilter === 'ALL' || d.stage === selectedStageFilter;
      const matchesGrade = gradeFilter === 'ALL' || (d.conditionGrade || d.grade) === gradeFilter;
      const matchesCategory = categoryFilter === 'ALL' || (d.category || 'SMARTPHONE') === categoryFilter;

      return matchesSearch && matchesStage && matchesGrade && matchesCategory;
    });
  }, [devices, searchQuery, selectedStageFilter, gradeFilter, categoryFilter]);

  return (
    <div className="table-wrapper">
      {/* Control Bar */}
      <div className="glass-card control-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            id="device-search-input"
            type="text"
            className="search-input"
            placeholder="Search by Model, Serial, IMEI, or Manufacturer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select 
            id="filter-category-select"
            className="filter-select" 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="SMARTPHONE">Smartphones</option>
            <option value="LAPTOP">Laptops</option>
            <option value="TABLET">Tablets</option>
            <option value="SMARTWATCH">Smartwatches</option>
          </select>

          <select 
            id="filter-grade-select"
            className="filter-select"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="ALL">All Cosmetic Grades</option>
            <option value="GRADE_A_PLUS">Grade A+ (Pristine)</option>
            <option value="GRADE_A">Grade A (Excellent)</option>
            <option value="GRADE_B">Grade B (Good)</option>
            <option value="GRADE_C">Grade C (Fair)</option>
            <option value="PARTS_ONLY">Parts / Harvest</option>
          </select>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredDevices.length}</strong> of {devices.length} units
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table" id="devices-data-table">
          <thead>
            <tr>
              <th>Device Details</th>
              <th>Serial / Identifiers</th>
              <th>Workflow Stage</th>
              <th>Cosmetic Grade</th>
              <th>Battery & Health</th>
              <th>Target Resale / Margin</th>
              <th style={{ textAlign: 'right' }}>Security Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No devices found matching your current filter criteria.
                </td>
              </tr>
            ) : (
              filteredDevices.map((device) => {
                const healthColor = 
                  device.batteryHealth >= 90 ? 'var(--accent-emerald)' :
                  device.batteryHealth >= 80 ? 'var(--accent-cyan)' :
                  device.batteryHealth >= 70 ? 'var(--accent-amber)' : 'var(--accent-rose)';

                return (
                  <tr 
                    key={device.id} 
                    id={`device-row-${device.id}`}
                    onClick={() => onSelectDevice(device)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div 
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-cyan)'
                          }}
                        >
                          {getCategoryIcon(device.category || 'SMARTPHONE')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff' }}>
                            {device.make || device.brand} {device.model}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {device.storage} &middot; {device.color}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span className="font-mono" style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>
                            {device.serialNumber}
                          </span>
                          <button
                            className="btn-copy"
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            onClick={(e) => handleCopy(device.serialNumber, `sn-${device.id}`, e)}
                            title="Copy Serial Number"
                          >
                            {copiedId === `sn-${device.id}` ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                          </button>
                        </div>
                        {device.imei && (
                          <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            IMEI: {device.imei}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      {getStageBadge(device.stage || 'INTAKE')}
                    </td>

                    <td>
                      {getGradeBadge(device.conditionGrade || device.grade || 'GRADE_B')}
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div className="health-meter">
                            <div 
                              className="health-fill" 
                              style={{ width: `${device.batteryHealth}%`, backgroundColor: healthColor }}
                            />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: healthColor }}>
                            {device.batteryHealth}%
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Score: {device.functionalScore}/100
                        </span>
                      </div>
                    </td>

                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff' }}>
                          ${device.targetResalePrice || device.sellingPrice || 0}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>
                          +${device.estimatedMargin || Math.max(0, (device.sellingPrice || 0) - (device.totalCost || device.purchaseCost || 0))} margin
                        </div>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {/* Device Passport Button */}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.725rem', borderColor: 'rgba(0, 242, 254, 0.3)', color: 'var(--accent-cyan)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPassport(device);
                          }}
                          title="View Device Passport & TrueScore"
                        >
                          <Fingerprint size={13} />
                          <span>Passport</span>
                        </button>

                        {/* Audit Details */}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.725rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDevice(device);
                          }}
                        >
                          <Eye size={13} />
                          <span>Audit</span>
                        </button>

                        {/* Advance Stage with RBAC restriction */}
                        {device.stage !== 'READY_FOR_SALE' && (
                          <button
                            className="btn btn-primary"
                            style={{ 
                              padding: '0.35rem 0.75rem', 
                              fontSize: '0.725rem',
                              opacity: canAdvanceStage ? 1 : 0.45,
                              cursor: canAdvanceStage ? 'pointer' : 'not-allowed'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (canAdvanceStage) {
                                onAdvanceStage(device.id);
                              }
                            }}
                            title={canAdvanceStage ? 'Advance to next workflow stage' : 'Restricted: Requires repair.complete, qa.approve, or device.update'}
                          >
                            <span>Next</span>
                            {canAdvanceStage ? <ChevronRight size={13} /> : <Lock size={12} color="#000" />}
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
    </div>
  );
};
