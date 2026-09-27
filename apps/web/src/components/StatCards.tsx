'use client';

import React from 'react';
import { 
  Package, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { RefurbMetrics } from '@truerefurb/shared-types';

interface StatCardsProps {
  metrics: RefurbMetrics;
  totalDevices: number;
}

export const StatCards: React.FC<StatCardsProps> = ({ metrics, totalDevices }) => {
  return (
    <div className="metrics-grid" id="dashboard-metrics-grid">
      {/* Total in Pipeline */}
      <div className="glass-card metric-card" style={{ '--card-accent': 'var(--accent-cyan)' } as React.CSSProperties}>
        <div className="metric-header">
          <span className="metric-title">Pipeline Throughput</span>
          <div className="metric-icon-wrap">
            <Package size={20} />
          </div>
        </div>
        <div className="metric-value-row">
          <span className="metric-value">{metrics.totalUnitsInPipeline.toLocaleString()}</span>
          <span className="metric-trend trend-up">
            <ArrowUpRight size={14} /> +14.2%
          </span>
        </div>
        <span className="metric-subtitle">
          {totalDevices} active on facility floor &middot; 8 Stations
        </span>
      </div>

      {/* Yield Rate */}
      <div className="glass-card metric-card" style={{ '--card-accent': 'var(--accent-emerald)' } as React.CSSProperties}>
        <div className="metric-header">
          <span className="metric-title">Refurb Yield Rate</span>
          <div className="metric-icon-wrap" style={{ color: 'var(--accent-emerald)' }}>
            <ShieldCheck size={20} />
          </div>
        </div>
        <div className="metric-value-row">
          <span className="metric-value">{metrics.yieldRatePercent}%</span>
          <span className="metric-trend trend-up">
            <ArrowUpRight size={14} /> +2.8%
          </span>
        </div>
        <span className="metric-subtitle">
          Grade A+/A/B qualifying target &ge; 92.0%
        </span>
      </div>

      {/* Avg Turnaround Time */}
      <div className="glass-card metric-card" style={{ '--card-accent': 'var(--accent-amber)' } as React.CSSProperties}>
        <div className="metric-header">
          <span className="metric-title">Avg Turnaround Time</span>
          <div className="metric-icon-wrap" style={{ color: 'var(--accent-amber)' }}>
            <Clock size={20} />
          </div>
        </div>
        <div className="metric-value-row">
          <span className="metric-value">{metrics.avgTurnaroundHours}h</span>
          <span className="metric-trend trend-up" style={{ color: 'var(--accent-emerald)' }}>
            <ArrowDownRight size={14} /> -2.4h faster
          </span>
        </div>
        <span className="metric-subtitle">
          Dock intake to Ready-for-Sale stocking
        </span>
      </div>

      {/* Ready Inventory Value */}
      <div className="glass-card metric-card" style={{ '--card-accent': 'var(--accent-violet)' } as React.CSSProperties}>
        <div className="metric-header">
          <span className="metric-title">Ready Stock Asset Value</span>
          <div className="metric-icon-wrap" style={{ color: 'var(--accent-violet)' }}>
            <DollarSign size={20} />
          </div>
        </div>
        <div className="metric-value-row">
          <span className="metric-value">${(metrics.readyInventoryValue / 1000).toFixed(1)}k</span>
          <span className="metric-trend trend-up">
            <ArrowUpRight size={14} /> +18.5%
          </span>
        </div>
        <span className="metric-subtitle">
          576 certified units across warehouse bays
        </span>
      </div>
    </div>
  );
};
