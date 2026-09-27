'use client';

import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  CheckCircle2, 
  PackageCheck, 
  Clock, 
  Percent,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { OperationalDashboardData } from '../data/operational-data';

interface OperationalKPIsProps {
  data: OperationalDashboardData;
}

export const OperationalKPIs: React.FC<OperationalKPIsProps> = ({ data }) => {
  return (
    <div className="operational-kpi-section" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>
            Operational Performance KPIs
          </h2>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            Real-time financial and warehouse throughput metrics
          </p>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', background: 'rgba(0, 242, 254, 0.08)', padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
          Active Sync: Live Facility DB
        </div>
      </div>

      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '1rem' 
        }}
      >
        {/* 1. Today's Sales */}
        <div className="glass-card metric-card" style={{ '--card-accent': 'var(--accent-emerald)' } as React.CSSProperties}>
          <div className="metric-header">
            <span className="metric-title">Today's Sales</span>
            <div className="metric-icon-wrap" style={{ color: 'var(--accent-emerald)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">${data.todaySales.toLocaleString()}</span>
            <span className="metric-trend trend-up">
              <ArrowUpRight size={14} /> +12.4%
            </span>
          </div>
          <span className="metric-subtitle">
            {data.todaySalesUnits} devices dispatched today
          </span>
        </div>

        {/* 2. Today's Purchases */}
        <div className="glass-card metric-card" style={{ '--card-accent': 'var(--accent-cyan)' } as React.CSSProperties}>
          <div className="metric-header">
            <span className="metric-title">Today's Purchases</span>
            <div className="metric-icon-wrap" style={{ color: 'var(--accent-cyan)' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">${data.todayPurchases.toLocaleString()}</span>
            <span className="metric-trend" style={{ color: 'var(--accent-cyan)' }}>
              Trade-in lot
            </span>
          </div>
          <span className="metric-subtitle">
            {data.todayPurchasesUnits} devices docked & receiving
          </span>
        </div>

        {/* 3. Current Inventory Value */}
        <div className="glass-card metric-card" style={{ '--card-accent': 'var(--accent-violet)' } as React.CSSProperties}>
          <div className="metric-header">
            <span className="metric-title">Current Inventory Value</span>
            <div className="metric-icon-wrap" style={{ color: 'var(--accent-violet)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">${data.currentInventoryValue.toLocaleString()}</span>
          </div>
          <span className="metric-subtitle">
            Across {data.availableDevices} ready-for-sale units
          </span>
        </div>

        {/* 4. Total Devices */}
        <div className="glass-card metric-card" style={{ '--card-accent': 'var(--accent-blue)' } as React.CSSProperties}>
          <div className="metric-header">
            <span className="metric-title">Total Devices</span>
            <div className="metric-icon-wrap" style={{ color: 'var(--accent-blue)' }}>
              <Package size={18} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{data.totalDevices.toLocaleString()}</span>
          </div>
          <span className="metric-subtitle">
            Lifetime tracked unit catalog
          </span>
        </div>

        {/* 5. Available Devices */}
        <div className="glass-card metric-card" style={{ '--card-accent': '#10b981' } as React.CSSProperties}>
          <div className="metric-header">
            <span className="metric-title">Available Devices</span>
            <div className="metric-icon-wrap" style={{ color: '#10b981' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{data.availableDevices.toLocaleString()}</span>
            <span className="metric-trend trend-up">
              Ready
            </span>
          </div>
          <span className="metric-subtitle">
            In warehouse bays ready to sell
          </span>
        </div>

        {/* 6. Sold Devices */}
        <div className="glass-card metric-card" style={{ '--card-accent': '#38bdf8' } as React.CSSProperties}>
          <div className="metric-header">
            <span className="metric-title">Sold Devices</span>
            <div className="metric-icon-wrap" style={{ color: '#38bdf8' }}>
              <PackageCheck size={18} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{data.soldDevices.toLocaleString()}</span>
          </div>
          <span className="metric-subtitle">
            Dispatched via B2B & marketplaces
          </span>
        </div>

        {/* 7. Outstanding Payments */}
        <div className="glass-card metric-card" style={{ '--card-accent': 'var(--accent-amber)' } as React.CSSProperties}>
          <div className="metric-header">
            <span className="metric-title">Outstanding Payments</span>
            <div className="metric-icon-wrap" style={{ color: 'var(--accent-amber)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">${data.outstandingPayments.toLocaleString()}</span>
          </div>
          <span className="metric-subtitle">
            B2B wholesale receivables pending
          </span>
        </div>

        {/* 8. Gross Profit */}
        <div className="glass-card metric-card" style={{ '--card-accent': '#34d399' } as React.CSSProperties}>
          <div className="metric-header">
            <span className="metric-title">Gross Profit</span>
            <div className="metric-icon-wrap" style={{ color: '#34d399' }}>
              <Percent size={18} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">${data.grossProfit.toLocaleString()}</span>
            <span className="metric-trend trend-up">
              {data.grossProfitMarginPercent}%
            </span>
          </div>
          <span className="metric-subtitle">
            Realized margin after parts & labor
          </span>
        </div>
      </div>
    </div>
  );
};
