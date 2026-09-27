'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Calendar, 
  DollarSign, 
  Package, 
  ArrowUpRight,
  BarChart2
} from 'lucide-react';
import { DailyMetricPoint } from '../data/operational-data';

interface OperationalChartsProps {
  salesLast30Days: DailyMetricPoint[];
  purchasesLast30Days: DailyMetricPoint[];
}

export const OperationalCharts: React.FC<OperationalChartsProps> = ({
  salesLast30Days,
  purchasesLast30Days,
}) => {
  const [salesTimeframe, setSalesTimeframe] = useState<'7D' | '30D'>('7D');
  const [hoveredSalesPoint, setHoveredSalesPoint] = useState<DailyMetricPoint | null>(null);
  const [hoveredPurchasePoint, setHoveredPurchasePoint] = useState<DailyMetricPoint | null>(null);

  // Filter sales points
  const activeSalesPoints = salesTimeframe === '7D' ? salesLast30Days.slice(-7) : salesLast30Days;

  // Chart dimensions
  const svgWidth = 650;
  const svgHeight = 220;
  const padding = { top: 20, right: 25, bottom: 35, left: 55 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Compute Scales for Sales
  const maxSales = Math.max(...activeSalesPoints.map((p) => p.amount), 35000);
  const salesYScale = (val: number) => padding.top + graphHeight - (val / maxSales) * graphHeight;
  const salesXScale = (index: number) => padding.left + (index / (activeSalesPoints.length - 1)) * graphWidth;

  const salesLinePoints = activeSalesPoints
    .map((p, i) => `${salesXScale(i)},${salesYScale(p.amount)}`)
    .join(' ');

  const salesAreaPoints = `${padding.left},${padding.top + graphHeight} ${salesLinePoints} ${padding.left + graphWidth},${padding.top + graphHeight}`;

  // Sales aggregates
  const totalSalesRevenue = activeSalesPoints.reduce((acc, p) => acc + p.amount, 0);
  const totalSalesUnits = activeSalesPoints.reduce((acc, p) => acc + p.units, 0);
  const avgDailySales = Math.round(totalSalesRevenue / activeSalesPoints.length);

  // Compute Scales for Purchases (30D)
  const maxPurchase = Math.max(...purchasesLast30Days.map((p) => p.amount), 30000);
  const purchaseYScale = (val: number) => padding.top + graphHeight - (val / maxPurchase) * graphHeight;
  const purchaseXScale = (index: number) => padding.left + (index / (purchasesLast30Days.length - 1)) * graphWidth;

  const purchaseLinePoints = purchasesLast30Days
    .map((p, i) => `${purchaseXScale(i)},${purchaseYScale(p.amount)}`)
    .join(' ');

  const purchaseAreaPoints = `${padding.left},${padding.top + graphHeight} ${purchaseLinePoints} ${padding.left + graphWidth},${padding.top + graphHeight}`;

  // Purchase aggregates
  const totalPurchaseSpend = purchasesLast30Days.reduce((acc, p) => acc + p.amount, 0);
  const totalPurchaseUnits = purchasesLast30Days.reduce((acc, p) => acc + p.units, 0);
  const avgCostPerUnit = Math.round(totalPurchaseSpend / totalPurchaseUnits);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem', marginBottom: '2.25rem' }}>
      
      {/* 1. SALES CHART */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>
                Dispatched Sales Trend
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Realized revenue & outbound device volume
            </p>
          </div>

          {/* 7D vs 30D Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '0.25rem', border: '1px solid var(--border-subtle)' }}>
            <button
              id="btn-sales-7d"
              onClick={() => { setSalesTimeframe('7D'); setHoveredSalesPoint(null); }}
              style={{
                background: salesTimeframe === '7D' ? 'var(--accent-cyan)' : 'transparent',
                color: salesTimeframe === '7D' ? '#000' : 'var(--text-muted)',
                fontWeight: 700,
                border: 'none',
                borderRadius: '6px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Last 7 Days
            </button>
            <button
              id="btn-sales-30d"
              onClick={() => { setSalesTimeframe('30D'); setHoveredSalesPoint(null); }}
              style={{
                background: salesTimeframe === '30D' ? 'var(--accent-cyan)' : 'transparent',
                color: salesTimeframe === '30D' ? '#000' : 'var(--text-muted)',
                fontWeight: 700,
                border: 'none',
                borderRadius: '6px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        {/* Hover Inspector Card */}
        <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem', marginBottom: '0.5rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '6px', fontSize: '0.8rem' }}>
          {hoveredSalesPoint ? (
            <>
              <span style={{ color: '#fff', fontWeight: 600 }}>{hoveredSalesPoint.label}, 2026:</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
                ${hoveredSalesPoint.amount.toLocaleString()} Revenue
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {hoveredSalesPoint.units} units sold
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                ASP: ${Math.round(hoveredSalesPoint.amount / hoveredSalesPoint.units)}
              </span>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              Hover over data points to inspect daily transaction details
            </span>
          )}
        </div>

        {/* Pure SVG Graph */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 10000, 20000, 30000].map((val) => {
              const y = salesYScale(val);
              return (
                <g key={val}>
                  <line 
                    x1={padding.left} 
                    y1={y} 
                    x2={padding.left + graphWidth} 
                    y2={y} 
                    stroke="rgba(255, 255, 255, 0.07)" 
                    strokeDasharray="4 4" 
                  />
                  <text 
                    x={padding.left - 8} 
                    y={y + 4} 
                    textAnchor="end" 
                    fill="#64748b" 
                    fontSize="10" 
                    fontFamily="JetBrains Mono, monospace"
                  >
                    ${val / 1000}k
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <polygon points={salesAreaPoints} fill="url(#salesGradient)" />

            {/* Line Path */}
            <polyline 
              fill="none" 
              stroke="#00f2fe" 
              strokeWidth="2.5" 
              points={salesLinePoints} 
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {activeSalesPoints.map((p, i) => {
              const cx = salesXScale(i);
              const cy = salesYScale(p.amount);
              const isHovered = hoveredSalesPoint?.date === p.date;

              return (
                <g 
                  key={p.date} 
                  onMouseEnter={() => setHoveredSalesPoint(p)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={isHovered ? 6 : salesTimeframe === '7D' ? 4.5 : 3} 
                    fill={isHovered ? '#fff' : '#00f2fe'} 
                    stroke="#0a0d14" 
                    strokeWidth="2" 
                  />
                  {/* Date labels on X-axis */}
                  {(salesTimeframe === '7D' || i % 5 === 0 || i === activeSalesPoints.length - 1) && (
                    <text 
                      x={cx} 
                      y={padding.top + graphHeight + 18} 
                      textAnchor="middle" 
                      fill={isHovered ? '#fff' : '#94a3b8'} 
                      fontSize="10" 
                      fontWeight={isHovered ? 700 : 500}
                    >
                      {p.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Operational Stats Footer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PERIOD SALES</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>${totalSalesRevenue.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DAILY RUN RATE</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>${avgDailySales.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DISPATCHED UNITS</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{totalSalesUnits} units</div>
          </div>
        </div>
      </div>

      {/* 2. PURCHASE CHART (LAST 30 DAYS) */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={20} color="var(--accent-emerald)" />
              <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>
                Procurement & Inbound Intake (Last 30 Days)
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Lot acquisition expenditure & incoming batch shipments
            </p>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.05)', padding: '0.3rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            30-Day Intake Log
          </div>
        </div>

        {/* Hover Inspector Card */}
        <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem', marginBottom: '0.5rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '6px', fontSize: '0.8rem' }}>
          {hoveredPurchasePoint ? (
            <>
              <span style={{ color: '#fff', fontWeight: 600 }}>{hoveredPurchasePoint.label}, 2026:</span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                ${hoveredPurchasePoint.amount.toLocaleString()} Inbound Cost
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {hoveredPurchasePoint.units} devices received
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                Avg: ${Math.round(hoveredPurchasePoint.amount / hoveredPurchasePoint.units)}/unit
              </span>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              Hover over data points to inspect inbound lot deliveries
            </span>
          )}
        </div>

        {/* Pure SVG Graph */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            <defs>
              <linearGradient id="purchaseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 10000, 20000, 30000].map((val) => {
              const y = purchaseYScale(val);
              return (
                <g key={val}>
                  <line 
                    x1={padding.left} 
                    y1={y} 
                    x2={padding.left + graphWidth} 
                    y2={y} 
                    stroke="rgba(255, 255, 255, 0.07)" 
                    strokeDasharray="4 4" 
                  />
                  <text 
                    x={padding.left - 8} 
                    y={y + 4} 
                    textAnchor="end" 
                    fill="#64748b" 
                    fontSize="10" 
                    fontFamily="JetBrains Mono, monospace"
                  >
                    ${val / 1000}k
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <polygon points={purchaseAreaPoints} fill="url(#purchaseGradient)" />

            {/* Line Path */}
            <polyline 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="2.5" 
              points={purchaseLinePoints} 
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {purchasesLast30Days.map((p, i) => {
              const cx = purchaseXScale(i);
              const cy = purchaseYScale(p.amount);
              const isHovered = hoveredPurchasePoint?.date === p.date;

              return (
                <g 
                  key={p.date} 
                  onMouseEnter={() => setHoveredPurchasePoint(p)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={isHovered ? 6 : 3} 
                    fill={isHovered ? '#fff' : '#10b981'} 
                    stroke="#0a0d14" 
                    strokeWidth="2" 
                  />
                  {/* Date labels on X-axis */}
                  {(i % 5 === 0 || i === purchasesLast30Days.length - 1) && (
                    <text 
                      x={cx} 
                      y={padding.top + graphHeight + 18} 
                      textAnchor="middle" 
                      fill={isHovered ? '#fff' : '#94a3b8'} 
                      fontSize="10" 
                      fontWeight={isHovered ? 700 : 500}
                    >
                      {p.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Operational Stats Footer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>30D TOTAL SPEND</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>${totalPurchaseSpend.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>UNITS DOCKED</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{totalPurchaseUnits.toLocaleString()} units</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AVG ACQUISITION / UNIT</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>${avgCostPerUnit}</div>
          </div>
        </div>
      </div>

    </div>
  );
};
