'use client';

import React, { useState } from 'react';
import { Customer, DeviceMaster, SalesOrder, SalesOrderItem } from '@truerefurb/shared-types';

interface CreateSalesOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  availableDevices: DeviceMaster[];
  onSubmit: (order: SalesOrder) => void;
}

export function CreateSalesOrderModal({
  isOpen,
  onClose,
  customers,
  availableDevices,
  onSubmit,
}: CreateSalesOrderModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  
  // Selected items with custom selling price
  const [selectedDeviceMap, setSelectedDeviceMap] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Only devices that are READY_TO_SELL are eligible for selection
  const eligibleDevices = availableDevices.filter((d) => d.status === 'READY_TO_SELL');

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const handleToggleDevice = (device: DeviceMaster) => {
    setSelectedDeviceMap((prev) => {
      const next = { ...prev };
      if (next[device.id] !== undefined) {
        delete next[device.id];
      } else {
        // Default to target selling price
        next[device.id] = device.sellingPrice || (device.totalCost ? device.totalCost * 1.2 : 30000);
      }
      return next;
    });
  };

  const handlePriceChange = (deviceId: string, price: number) => {
    setSelectedDeviceMap((prev) => ({
      ...prev,
      [deviceId]: price,
    }));
  };

  // Compile items with device-level Gross Profit calculation
  const orderItems: SalesOrderItem[] = Object.entries(selectedDeviceMap).map(([devId, price]) => {
    const dev = availableDevices.find((d) => d.id === devId)!;
    const purchaseCost = dev.purchaseCost || 0;
    const repairCost = dev.repairCost || 0;
    const otherCost = dev.otherCost || 0;
    const totalCost = dev.totalCost || (purchaseCost + repairCost + otherCost);
    const sellingPrice = price;
    
    // Formula: Selling Price - Total Cost = Gross Profit (strictly Gross Profit, NOT Net Profit)
    const grossProfit = sellingPrice - totalCost;
    const grossProfitMarginPercent = sellingPrice > 0 ? Number(((grossProfit / sellingPrice) * 100).toFixed(2)) : 0;

    return {
      id: `so-item-${Date.now()}-${dev.id}`,
      salesOrderId: '',
      deviceId: dev.id,
      imei: dev.imei1,
      brand: dev.brand,
      model: dev.model,
      storage: dev.storage,
      color: dev.color,
      grade: dev.grade,
      purchaseCost,
      repairCost,
      otherCost,
      totalCost,
      sellingPrice,
      grossProfit,
      grossProfitMarginPercent,
    };
  });

  const totalAmount = orderItems.reduce((acc, item) => acc + item.sellingPrice, 0);
  const totalCost = orderItems.reduce((acc, item) => acc + item.totalCost, 0);
  const totalGrossProfit = totalAmount - totalCost;
  const overallGrossMargin = totalAmount > 0 ? ((totalGrossProfit / totalAmount) * 100).toFixed(1) : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setError('Please select a valid customer.');
      return;
    }
    if (orderItems.length === 0) {
      setError('Please select at least one available device for the sales order.');
      return;
    }

    const orderNumber = `SO-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newOrder: SalesOrder = {
      id: `so-${Date.now()}`,
      orderNumber,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      businessName: selectedCustomer.businessName,
      orderDate,
      status: 'CONFIRMED',
      items: orderItems,
      totalAmount,
      totalCost,
      totalGrossProfit,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(newOrder);
    onClose();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h2 className="text-lg font-bold text-white tracking-tight">Create Sales Order</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Workflow: Customer → Select Device(s) → Set Price → Verify Gross Profit → Confirm Sale
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Customer Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Customer <span className="text-emerald-400">*</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.businessName} ({c.name} - {c.city})
                  </option>
                ))}
              </select>
              {selectedCustomer && (
                <div className="mt-1 text-[11px] text-slate-400">
                  GSTIN: <span className="font-mono text-slate-300">{selectedCustomer.gstin || 'Unregistered'}</span> • {selectedCustomer.city}, {selectedCustomer.state}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Order Date <span className="text-emerald-400">*</span>
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Device Selection (Ready to Sell Only) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Select Devices (Only READY_TO_SELL units available)
              </label>
              <span className="text-xs text-emerald-400 font-medium">
                {eligibleDevices.length} Available in Inventory
              </span>
            </div>

            {eligibleDevices.length === 0 ? (
              <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-lg text-center text-xs text-slate-400">
                No devices currently have status <code className="text-emerald-400 font-bold">READY_TO_SELL</code>. Complete QC or intake first.
              </div>
            ) : (
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/50">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">Select</th>
                      <th className="py-2.5 px-3">Device / Model</th>
                      <th className="py-2.5 px-3 font-mono">IMEI</th>
                      <th className="py-2.5 px-3 text-center">Grade</th>
                      <th className="py-2.5 px-3 text-right">Total Cost</th>
                      <th className="py-2.5 px-3 text-right">Selling Price (INR)</th>
                      <th className="py-2.5 px-3 text-right">Gross Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {eligibleDevices.map((dev) => {
                      const isSelected = selectedDeviceMap[dev.id] !== undefined;
                      const price = selectedDeviceMap[dev.id] || dev.sellingPrice;
                      const purchaseCost = dev.purchaseCost || 0;
                      const repairCost = dev.repairCost || 0;
                      const otherCost = dev.otherCost || 0;
                      const totalCost = dev.totalCost || (purchaseCost + repairCost + otherCost);
                      const grossProfit = price - totalCost;
                      const marginPercent = price > 0 ? ((grossProfit / price) * 100).toFixed(1) : '0';

                      return (
                        <tr
                          key={dev.id}
                          className={`transition-colors ${
                            isSelected ? 'bg-emerald-950/20' : 'hover:bg-slate-900/60'
                          }`}
                        >
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleDevice(dev)}
                              className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-3 font-medium text-white">
                            <div>{dev.brand} {dev.model}</div>
                            <div className="text-[10px] text-slate-400">{dev.storage} • {dev.color}</div>
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-300">
                            {dev.imei1}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                              {dev.grade}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400">
                            <div>{formatCurrency(totalCost)}</div>
                            <div className="text-[9px] text-slate-500">
                              (P: {formatCurrency(purchaseCost)} + R: {formatCurrency(repairCost)})
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right">
                            {isSelected ? (
                              <input
                                type="number"
                                min="1"
                                value={price}
                                onChange={(e) => handlePriceChange(dev.id, Number(e.target.value))}
                                className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                              />
                            ) : (
                              <span className="font-mono text-slate-500">{formatCurrency(price)}</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {isSelected ? (
                              <div>
                                <span
                                  className={`font-mono font-bold text-xs ${
                                    grossProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                >
                                  {formatCurrency(grossProfit)}
                                </span>
                                <div className="text-[10px] text-slate-400">
                                  {marginPercent}% margin
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Module 15: Device-Level Gross Profit Calculation Summary */}
          {orderItems.length > 0 && (
            <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Financial Summary (Device-Level Gross Profit Engine)
                </span>
                <span className="text-xs text-slate-400">
                  {orderItems.length} Device{orderItems.length > 1 ? 's' : ''} Selected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Total Selling Value</div>
                  <div className="text-base font-bold text-white mt-0.5">{formatCurrency(totalAmount)}</div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Total Cost (P + R + O)</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">{formatCurrency(totalCost)}</div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Total Gross Profit</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    {formatCurrency(totalGrossProfit)}
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
                    Selling Price - Total Cost
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Gross Margin %</div>
                  <div className="text-base font-bold text-indigo-400 mt-0.5">{overallGrossMargin}%</div>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 mt-2 italic text-center">
                * Note: In accordance with TrueRefurb OS finance specification, this is strictly labeled Device-Level Gross Profit (not Net Profit).
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Order Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Pre-booked for Delhi store delivery, urgent battery test clearance..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={orderItems.length === 0}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-emerald-900/20"
            >
              Confirm Sale & Reserve Devices
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
