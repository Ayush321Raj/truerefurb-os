'use client';

import React from 'react';
import { 
  Package, 
  CheckCircle2, 
  PackageCheck, 
  Bookmark, 
  Wrench, 
  Layers
} from 'lucide-react';
import { OperationalDashboardData } from '../data/operational-data';

interface InventorySummaryProps {
  summary: OperationalDashboardData['inventorySummary'];
  onSelectBucket?: (bucketName: string) => void;
}

export const InventorySummary: React.FC<InventorySummaryProps> = ({ summary, onSelectBucket }) => {
  const { totalDevices, readyToSell, sold, reserved, repairRequired } = summary;

  const items = [
    {
      id: 'TOTAL',
      label: 'Total Devices',
      count: totalDevices,
      pct: 100,
      color: 'var(--accent-blue)',
      icon: <Package size={18} color="var(--accent-blue)" />,
      desc: 'All units received across facility docks',
      status: 'Fleet Total',
    },
    {
      id: 'READY',
      label: 'Ready to Sell',
      count: readyToSell,
      pct: Math.round((readyToSell / totalDevices) * 1000) / 10,
      color: '#10b981',
      icon: <CheckCircle2 size={18} color="#10b981)" />,
      desc: 'Certified, graded & boxed in warehouse bays',
      status: 'In Stock / Live',
    },
    {
      id: 'SOLD',
      label: 'Sold',
      count: sold,
      pct: Math.round((sold / totalDevices) * 1000) / 10,
      color: '#38bdf8',
      icon: <PackageCheck size={18} color="#38bdf8" />,
      desc: 'Dispatched to retail buyers & B2B accounts',
      status: 'Dispatched',
    },
    {
      id: 'RESERVED',
      label: 'Reserved',
      count: reserved,
      pct: Math.round((reserved / totalDevices) * 1000) / 10,
      color: '#f59e0b',
      icon: <Bookmark size={18} color="#f59e0b" />,
      desc: 'Allocated for pending B2B purchase orders',
      status: 'Staged for Pickup',
    },
    {
      id: 'REPAIR',
      label: 'Repair Required',
      count: repairRequired,
      pct: Math.round((repairRequired / totalDevices) * 1000) / 10,
      color: '#f43f5e',
      icon: <Wrench size={18} color="#f43f5e" />,
      desc: 'Undergoing soldering, screen or battery swap',
      status: 'Active on Bench',
    },
  ];

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>
              Inventory Operational Breakdown
            </h3>
          </div>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Physical asset allocation and workstation readiness distribution
          </p>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Total Catalog: <strong style={{ color: '#fff' }}>{totalDevices.toLocaleString()}</strong> units
        </div>
      </div>

      {/* Segmented Proportion Bar */}
      <div 
        style={{ 
          height: '10px', 
          width: '100%', 
          borderRadius: '5px', 
          overflow: 'hidden', 
          display: 'flex', 
          marginBottom: '1.5rem',
          background: 'rgba(255, 255, 255, 0.05)' 
        }}
        title="Inventory fleet distribution"
      >
        <div style={{ width: `${(readyToSell / totalDevices) * 100}%`, background: '#10b981' }} title={`Ready to Sell: ${readyToSell}`} />
        <div style={{ width: `${(sold / totalDevices) * 100}%`, background: '#38bdf8' }} title={`Sold: ${sold}`} />
        <div style={{ width: `${(reserved / totalDevices) * 100}%`, background: '#f59e0b' }} title={`Reserved: ${reserved}`} />
        <div style={{ width: `${(repairRequired / totalDevices) * 100}%`, background: '#f43f5e' }} title={`Repair Required: ${repairRequired}`} />
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {items.map((it) => (
          <div
            key={it.id}
            onClick={() => onSelectBucket && onSelectBucket(it.id)}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: onSelectBucket ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = it.color;
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {it.label}
                </span>
                {it.icon}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
                  {it.count.toLocaleString()}
                </span>
                {it.id !== 'TOTAL' && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: it.color }}>
                    {it.pct}%
                  </span>
                )}
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '0.5rem', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {it.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
