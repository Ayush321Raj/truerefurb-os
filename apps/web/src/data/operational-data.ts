export interface DailyMetricPoint {
  date: string;     // YYYY-MM-DD
  label: string;    // e.g. "Sep 19"
  amount: number;   // $ value
  units: number;    // device count
}

export interface OperationalDashboardData {
  todaySales: number;
  todaySalesUnits: number;
  todayPurchases: number;
  todayPurchasesUnits: number;
  currentInventoryValue: number;
  totalDevices: number;
  availableDevices: number;
  soldDevices: number;
  outstandingPayments: number;
  grossProfit: number;
  grossProfitMarginPercent: number;

  inventorySummary: {
    totalDevices: number;
    readyToSell: number;
    sold: number;
    reserved: number;
    repairRequired: number;
  };

  salesLast30Days: DailyMetricPoint[];
  purchasesLast30Days: DailyMetricPoint[];
}

// Generate realistic daily sequence leading up to Sep 25, 2026
const generateSalesData = (): DailyMetricPoint[] => {
  const points: DailyMetricPoint[] = [];
  const baseRevenue = 22000;
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(2026, 8, 25 - i); // Sep is month 8 (0-indexed)
    const dayStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    
    // Variance with positive weekend e-commerce surge
    const factor = isWeekend ? 1.25 : 0.95 + (Math.sin(i * 0.8) * 0.18);
    const amount = Math.round(baseRevenue * factor + (i * 240));
    const units = Math.round(amount / 820);

    points.push({ date: dayStr, label, amount, units });
  }

  // Exact value for today (Sep 25)
  points[points.length - 1].amount = 28450;
  points[points.length - 1].units = 34;

  return points;
};

const generatePurchaseData = (): DailyMetricPoint[] => {
  const points: DailyMetricPoint[] = [];
  const baseProcure = 16500;

  for (let i = 29; i >= 0; i--) {
    const d = new Date(2026, 8, 25 - i);
    const dayStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Lots arrive in batched deliveries
    const isDeliveryDay = i % 3 === 0 || i % 7 === 0;
    const factor = isDeliveryDay ? 1.35 : 0.75 + (Math.cos(i * 0.5) * 0.15);
    const amount = Math.round(baseProcure * factor);
    const units = Math.round(amount / 470);

    points.push({ date: dayStr, label, amount, units });
  }

  // Exact value for today (Sep 25)
  points[points.length - 1].amount = 19200;
  points[points.length - 1].units = 42;

  return points;
};

export const OPERATIONAL_DATA: OperationalDashboardData = {
  todaySales: 28450,
  todaySalesUnits: 34,
  todayPurchases: 19200,
  todayPurchasesUnits: 42,
  currentInventoryValue: 428950,
  totalDevices: 1428,
  availableDevices: 576,
  soldDevices: 624,
  outstandingPayments: 41200,
  grossProfit: 118650,
  grossProfitMarginPercent: 37.4,

  inventorySummary: {
    totalDevices: 1428,
    readyToSell: 576,
    sold: 624,
    reserved: 86,
    repairRequired: 142,
  },

  salesLast30Days: generateSalesData(),
  purchasesLast30Days: generatePurchaseData(),
};
