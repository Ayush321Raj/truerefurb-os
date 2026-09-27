'use client';

import React, { useState } from 'react';
import {
  BillingMode,
  Customer,
  DeviceMaster,
  Invoice,
  InvoiceItem,
  InvoiceItemDevice,
  SalesOrder,
  SellerProfile,
  BuyerProfile,
} from '@truerefurb/shared-types';
import { DEFAULT_SELLER_PROFILE, DEFAULT_INVOICE_TERMS } from '../data/mock-billing';

interface CreateBillingInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  availableDevices: DeviceMaster[];
  salesOrders?: SalesOrder[];
  onSubmit: (invoice: Invoice, updatedDevices: DeviceMaster[]) => void;
}

export function CreateBillingInvoiceModal({
  isOpen,
  onClose,
  customers,
  availableDevices,
  salesOrders = [],
  onSubmit,
}: CreateBillingInvoiceModalProps) {
  // Step navigation
  const [step, setStep] = useState<'SETUP' | 'DEVICES' | 'REVIEW'>('SETUP');

  // Core Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [billingMode, setBillingMode] = useState<BillingMode>('MARGIN_SCHEME');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNumber, setInvoiceNumber] = useState(
    `TR/26-27/${String(Math.floor(100 + Math.random() * 900))}`
  );
  const [taxRatePercent, setTaxRatePercent] = useState<number>(18);
  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);
  const [depositReceived, setDepositReceived] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Device selections with selling price & item discount: { [deviceId]: { price: number, discount: number } }
  const [deviceRows, setDeviceRows] = useState<
    Record<string, { price: number; discount: number }>
  >({});

  if (!isOpen) return null;

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Eligible devices: Ready to sell (or if already selected)
  const eligibleDevices = availableDevices.filter((d) => d.status === 'READY_TO_SELL');

  const seller: SellerProfile = DEFAULT_SELLER_PROFILE;
  const buyer: BuyerProfile = {
    name: selectedCustomer?.name || 'Customer',
    businessName: selectedCustomer?.businessName || 'Business',
    address: selectedCustomer?.address || 'Kolkata, WB',
    gstin: selectedCustomer?.gstin || '',
    state: selectedCustomer?.state || 'West Bengal',
    stateCode: selectedCustomer?.state === 'West Bengal' ? '19' : '07',
    phone: selectedCustomer?.phone,
    email: selectedCustomer?.email,
  };

  const isInterState = seller.stateCode !== buyer.stateCode;
  const placeOfSupply = `${buyer.state} (${buyer.stateCode})`;

  const handleToggleDevice = (device: DeviceMaster) => {
    setDeviceRows((prev) => {
      const next = { ...prev };
      if (next[device.id] !== undefined) {
        delete next[device.id];
      } else {
        const defaultPrice =
          device.sellingPrice || (device.totalCost ? device.totalCost + 1000 : 25000);
        next[device.id] = { price: defaultPrice, discount: 0 };
      }
      return next;
    });
  };

  const handlePriceUpdate = (deviceId: string, price: number) => {
    setDeviceRows((prev) => ({
      ...prev,
      [deviceId]: { ...prev[deviceId], price },
    }));
  };

  const handleDiscountUpdate = (deviceId: string, discount: number) => {
    setDeviceRows((prev) => ({
      ...prev,
      [deviceId]: { ...prev[deviceId], discount },
    }));
  };

  // Compile individual serialized InvoiceItems and InvoiceItemDevices
  const compiledItems: InvoiceItem[] = [];
  let subtotal = 0;
  let itemDiscountsTotal = 0;
  let totalTaxableAmount = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;
  let totalExemptedAmount = 0;
  let grossAmount = 0;

  let sNo = 1;
  for (const [devId, values] of Object.entries(deviceRows)) {
    const dev = availableDevices.find((d) => d.id === devId);
    if (!dev) continue;

    const unitPrice = values.price;
    const discount = values.discount;
    const netSaleValue = Math.max(0, unitPrice - discount);
    const purchaseCost = dev.purchaseCost || 0;
    const repairCost = dev.repairCost || 0;
    const otherCost = dev.otherCost || 0;
    const totalCost = dev.totalCost || (purchaseCost + repairCost + otherCost);

    // Module 15: Device-Level Gross Profit (strictly Gross Profit, NOT Net Profit)
    const grossProfit = netSaleValue - totalCost;
    const grossProfitMarginPercent =
      netSaleValue > 0 ? Number(((grossProfit / netSaleValue) * 100).toFixed(2)) : 0;

    let taxableValue = 0;
    let cgstRate = 0;
    let cgstAmount = 0;
    let sgstRate = 0;
    let sgstAmount = 0;
    let igstRate = 0;
    let igstAmount = 0;
    let totalTax = 0;
    let lineAmount = 0;

    // Margin Scheme vs Regular GST Tax Engine
    let marginValue = netSaleValue - purchaseCost;
    let taxableMargin = 0;
    let exemptedAmount = 0;

    if (billingMode === 'MARGIN_SCHEME') {
      // Under Rule 32(5), tax is payable only on positive margin
      // Explicitly handle positive, zero, and negative margin:
      // If margin <= 0, taxable margin = 0, tax = 0 (do NOT convert negative margin to profit)
      taxableMargin = Math.max(0, marginValue);
      taxableValue = taxableMargin;
      exemptedAmount = purchaseCost; // Exempted turnover portion under margin scheme

      if (isInterState) {
        igstRate = taxRatePercent;
        igstAmount = Number(((taxableMargin * igstRate) / 100).toFixed(2));
        totalTax = igstAmount;
      } else {
        cgstRate = taxRatePercent / 2;
        sgstRate = taxRatePercent / 2;
        cgstAmount = Number(((taxableMargin * cgstRate) / 100).toFixed(2));
        sgstAmount = Number(((taxableMargin * sgstRate) / 100).toFixed(2));
        totalTax = cgstAmount + sgstAmount;
      }
      lineAmount = netSaleValue; // In margin scheme, line amount to buyer is the net sale value
    } else {
      // Regular GST: Taxable value is net sale value
      taxableValue = netSaleValue;
      if (isInterState) {
        igstRate = taxRatePercent;
        igstAmount = Number(((taxableValue * igstRate) / 100).toFixed(2));
        totalTax = igstAmount;
      } else {
        cgstRate = taxRatePercent / 2;
        sgstRate = taxRatePercent / 2;
        cgstAmount = Number(((taxableValue * cgstRate) / 100).toFixed(2));
        sgstAmount = Number(((taxableValue * sgstRate) / 100).toFixed(2));
        totalTax = cgstAmount + sgstAmount;
      }
      lineAmount = netSaleValue + totalTax;
    }

    subtotal += unitPrice;
    itemDiscountsTotal += discount;
    totalTaxableAmount += taxableValue;
    totalCgst += cgstAmount;
    totalSgst += sgstAmount;
    totalIgst += igstAmount;
    totalExemptedAmount += exemptedAmount;
    grossAmount += lineAmount;

    const deviceRecord: InvoiceItemDevice = {
      id: `inv-dev-${dev.id}`,
      invoiceItemId: `inv-item-${sNo}`,
      deviceId: dev.id,
      imei: dev.imei1,
      imei2: dev.imei2,
      serialNumber: dev.serialNumber,
      brand: dev.brand,
      model: dev.model,
      storage: dev.storage,
      color: dev.color,
      grade: dev.grade,
      productType: 'Refurbished',
      hsnCode: '8517',
      purchaseCost,
      repairCost,
      otherCost,
      totalCost,
      sellingPrice: unitPrice,
      discount,
      netSaleValue,
      grossProfit,
      grossProfitMarginPercent,
      marginValue,
      taxableMargin,
      taxAmount: totalTax,
      exemptedAmount,
    };

    compiledItems.push({
      id: `inv-item-${sNo}`,
      invoiceId: '',
      sNo,
      productName: `${dev.brand} ${dev.model}`,
      storage: dev.storage,
      imei: dev.imei1,
      productType: 'Refurbished',
      hsnCode: '8517',
      quantity: 1, // Strictly 1 for individual serialized refurbished devices
      unitPrice,
      discount,
      taxableValue,
      cgstRate: cgstRate > 0 ? cgstRate : undefined,
      cgstAmount: cgstAmount > 0 ? cgstAmount : undefined,
      sgstRate: sgstRate > 0 ? sgstRate : undefined,
      sgstAmount: sgstAmount > 0 ? sgstAmount : undefined,
      igstRate: igstRate > 0 ? igstRate : undefined,
      igstAmount: igstAmount > 0 ? igstAmount : undefined,
      totalTax,
      amount: lineAmount,
      devices: [deviceRecord],
    });

    sNo++;
  }

  const totalDiscount = itemDiscountsTotal + invoiceDiscount;
  const totalTax = totalCgst + totalSgst + totalIgst;
  const totalAmount = Math.max(0, grossAmount - invoiceDiscount);
  const balanceDue = Math.max(0, totalAmount - depositReceived);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleFinalize = () => {
    if (compiledItems.length === 0) {
      setError('Please select at least one serialized device for billing.');
      return;
    }
    if (!selectedCustomer) {
      setError('Customer selection is required.');
      return;
    }

    const finalizedInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      invoiceDate,
      dueDate,
      billingMode, // Becomes immutable upon finalization!
      status: balanceDue === 0 ? 'PAID' : depositReceived > 0 ? 'PARTIAL' : 'DRAFT',
      isFinalized: true,
      finalizedAt: new Date().toISOString(),
      finalizedBy: 'Current Authorized User',
      seller,
      buyer,
      placeOfSupply,
      isInterState,
      items: compiledItems,
      totalQuantity: compiledItems.length,
      subtotal,
      itemDiscountsTotal,
      invoiceDiscount,
      totalDiscount,
      taxableAmount: totalTaxableAmount,
      cgstAmount: totalCgst,
      sgstAmount: totalSgst,
      igstAmount: totalIgst,
      totalTax,
      exemptedAmountMarginScheme: billingMode === 'MARGIN_SCHEME' ? totalExemptedAmount : 0,
      totalAmount,
      depositReceived,
      netPayableTotal: totalAmount,
      balanceDue,
      taxPolicyVersion:
        billingMode === 'MARGIN_SCHEME' ? 'GST-RULE-32-5-v2' : 'GST-REGULAR-18-v1',
      termsAndConditions: DEFAULT_INVOICE_TERMS,
      notes,
      payments:
        depositReceived > 0
          ? [
              {
                id: `pay-${Date.now()}`,
                invoiceId: `inv-${Date.now()}`,
                invoiceNumber,
                customerId: selectedCustomer.id,
                customerName: selectedCustomer.name,
                amount: depositReceived,
                method: 'BANK_TRANSFER',
                status: balanceDue === 0 ? 'PAID' : 'PARTIAL',
                date: invoiceDate,
                reference: `ADV-DEP-${invoiceNumber.replace(/\//g, '-')}`,
                notes: 'Deposit / advance recorded during invoice finalization.',
                createdAt: new Date().toISOString(),
              },
            ]
          : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Mark billed devices as SOLD
    const updatedDevices: DeviceMaster[] = availableDevices.map((d) => {
      if (deviceRows[d.id] !== undefined) {
        return {
          ...d,
          status: 'SOLD',
          sellingPrice: deviceRows[d.id].price,
          updatedAt: new Date().toISOString(),
        };
      }
      return d;
    });

    onSubmit(finalizedInvoice, updatedDevices);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Create Tax Invoice (TrueRefurb Billing Engine)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Supports Regular GST and Rule 32(5) Refurbished Margin Scheme with individual IMEI serialization
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

        {/* Step Tabs */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-2 flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setStep('SETUP')}
            className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
              step === 'SETUP'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
              1
            </span>
            Mode & Parties
          </button>
          <button
            onClick={() => setStep('DEVICES')}
            className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
              step === 'DEVICES'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
              2
            </span>
            Serialized Device(s) ({Object.keys(deviceRows).length})
          </button>
          <button
            onClick={() => setStep('REVIEW')}
            className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
              step === 'REVIEW'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
              3
            </span>
            Tax Calculation & Finalize
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* STEP 1: SETUP */}
          {step === 'SETUP' && (
            <div className="space-y-6">
              {/* BILLING MODE SWITCHER */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
                  Billing Mode Selection (Immutable once finalized)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* MARGIN SCHEME */}
                  <div
                    onClick={() => setBillingMode('MARGIN_SCHEME')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      billingMode === 'MARGIN_SCHEME'
                        ? 'bg-purple-950/20 border-purple-500 text-white ring-1 ring-purple-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-purple-300 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                        MARGIN SCHEME (Rule 32(5))
                      </span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">
                        RECOMMENDED FOR REFURB
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      GST is calculated <strong>only on the positive margin</strong> (Selling Price minus Purchase Cost). If margin $\le 0$, taxable value is ₹0. Sourced directly from device acquisition records.
                    </p>
                  </div>

                  {/* REGULAR GST */}
                  <div
                    onClick={() => setBillingMode('REGULAR_GST')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      billingMode === 'REGULAR_GST'
                        ? 'bg-blue-950/20 border-blue-500 text-white ring-1 ring-blue-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-blue-300 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        REGULAR GST
                      </span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono font-bold">
                        STANDARD TURNOVER
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      GST is calculated on the <strong>entire taxable selling price</strong>. Applies CGST+SGST for intra-state (WB) or IGST for inter-state deliveries.
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Metadata & Customer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Invoice Number <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Invoice Date <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Due Date <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Customer & Tax Rate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Select Customer / Buyer <span className="text-indigo-400">*</span>
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.businessName} ({c.name} - {c.city}, {c.state})
                      </option>
                    ))}
                  </select>
                  {selectedCustomer && (
                    <div className="mt-2 p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
                      <div>
                        <strong>Buyer:</strong> {selectedCustomer.businessName} (Attn: {selectedCustomer.name})
                      </div>
                      <div>
                        <strong>GSTIN:</strong>{' '}
                        <span className="font-mono text-slate-200">
                          {selectedCustomer.gstin || 'Unregistered'}
                        </span>
                      </div>
                      <div>
                        <strong>Place of Supply:</strong> {selectedCustomer.state} (
                        {selectedCustomer.state === 'West Bengal' ? 'State Code 19 - Intra-State' : 'Inter-State'}
                        )
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Applicable GST Tax Rate (%)
                  </label>
                  <select
                    value={taxRatePercent}
                    onChange={(e) => setTaxRatePercent(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value={18}>18% (Standard Electronic / Mobile GST)</option>
                    <option value={12}>12% (Concessional / Component GST)</option>
                    <option value={5}>5% (Special Scheme)</option>
                    <option value={0}>0% (Exempt)</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Configurable structure. In Margin Scheme, this rate is multiplied against the taxable margin.
                  </p>

                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Initial Advance / Deposit Received (INR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={depositReceived}
                      onChange={(e) => setDepositReceived(Number(e.target.value))}
                      placeholder="e.g. 50000"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Recorded explicitly in invoice summary and automatically deducts from balance due.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep('DEVICES')}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Next: Select Devices →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SERIALIZED DEVICES */}
          {step === 'DEVICES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Select Inventory for Billing ({eligibleDevices.length} Ready to Sell)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Each device creates an independent serialized item row with its own IMEI and purchase cost.
                  </p>
                </div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/30">
                  {Object.keys(deviceRows).length} Selected
                </span>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/60 max-h-[420px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">Select</th>
                      <th className="py-2.5 px-3">Device / Storage</th>
                      <th className="py-2.5 px-3 font-mono">IMEI 1</th>
                      <th className="py-2.5 px-3 text-right">Purchase Cost</th>
                      <th className="py-2.5 px-3 text-right">Unit Selling Price</th>
                      <th className="py-2.5 px-3 text-right">Discount</th>
                      <th className="py-2.5 px-3 text-right">
                        {billingMode === 'MARGIN_SCHEME' ? 'Margin Value' : 'Net Taxable'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {eligibleDevices.map((dev) => {
                      const isSelected = deviceRows[dev.id] !== undefined;
                      const price = deviceRows[dev.id]?.price || dev.sellingPrice;
                      const discount = deviceRows[dev.id]?.discount || 0;
                      const netSale = Math.max(0, price - discount);
                      const purchaseCost = dev.purchaseCost || 0;
                      const margin = netSale - purchaseCost;

                      return (
                        <tr
                          key={dev.id}
                          className={`transition-colors ${
                            isSelected ? 'bg-indigo-950/20' : 'hover:bg-slate-900/60'
                          }`}
                        >
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleDevice(dev)}
                              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-3 font-medium text-white">
                            <div>{dev.brand} {dev.model}</div>
                            <div className="text-[10px] text-slate-400">
                              {dev.storage} • {dev.color} • Grade: {dev.grade}
                            </div>
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-300">
                            {dev.imei1}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-amber-400">
                            {formatCurrency(purchaseCost)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {isSelected ? (
                              <input
                                type="number"
                                min="1"
                                value={price}
                                onChange={(e) => handlePriceUpdate(dev.id, Number(e.target.value))}
                                className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                              />
                            ) : (
                              <span className="font-mono text-slate-500">{formatCurrency(price)}</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {isSelected ? (
                              <input
                                type="number"
                                min="0"
                                value={discount}
                                onChange={(e) => handleDiscountUpdate(dev.id, Number(e.target.value))}
                                className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                              />
                            ) : (
                              <span className="font-mono text-slate-500">₹0</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold">
                            {isSelected ? (
                              billingMode === 'MARGIN_SCHEME' ? (
                                <span className={margin >= 0 ? 'text-purple-400' : 'text-rose-400'}>
                                  {formatCurrency(margin)}
                                </span>
                              ) : (
                                <span className="text-blue-400">{formatCurrency(netSale)}</span>
                              )
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

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep('SETUP')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  ← Back to Setup
                </button>
                <button
                  type="button"
                  disabled={Object.keys(deviceRows).length === 0}
                  onClick={() => setStep('REVIEW')}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Review Tax Breakdown →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & FINALIZE */}
          {step === 'REVIEW' && (
            <div className="space-y-6">
              {/* Summary Banner */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Invoice Pre-Finalization Validation
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Verify tax calculations before generating immutable compliance records.
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      billingMode === 'MARGIN_SCHEME'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {billingMode === 'MARGIN_SCHEME' ? 'Margin Scheme (Rule 32(5))' : 'Regular GST'}
                  </span>
                </div>

                {/* Macro Financial Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs">Total Quantity</span>
                    <div className="text-lg font-bold text-white mt-1">
                      {compiledItems.length} Serialized Units
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs">Gross Subtotal</span>
                    <div className="text-lg font-bold text-white mt-1">{formatCurrency(subtotal)}</div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs">
                      {billingMode === 'MARGIN_SCHEME' ? 'Taxable Margin Base' : 'Taxable Turnover'}
                    </span>
                    <div className="text-lg font-bold text-purple-400 mt-1">
                      {formatCurrency(totalTaxableAmount)}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs">Total GST ({taxRatePercent}%)</span>
                    <div className="text-lg font-bold text-indigo-400 mt-1">
                      {formatCurrency(totalTax)}
                    </div>
                  </div>
                </div>

                {/* Reference Invoice Table Summary Format */}
                <div className="bg-slate-900/90 rounded-lg p-4 border border-slate-800 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Total Amount:</span>
                    <strong className="text-white">{formatCurrency(totalAmount)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Taxable Amount:</span>
                    <strong className="text-white">{formatCurrency(totalTaxableAmount)}</strong>
                  </div>
                  {isInterState ? (
                    <div className="flex justify-between text-indigo-400">
                      <span>IGST @ {taxRatePercent}%:</span>
                      <strong>{formatCurrency(totalIgst)}</strong>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-indigo-400">
                        <span>CGST @ {taxRatePercent / 2}%:</span>
                        <strong>{formatCurrency(totalCgst)}</strong>
                      </div>
                      <div className="flex justify-between text-indigo-400">
                        <span>SGST @ {taxRatePercent / 2}%:</span>
                        <strong>{formatCurrency(totalSgst)}</strong>
                      </div>
                    </>
                  )}
                  {billingMode === 'MARGIN_SCHEME' && (
                    <div className="flex justify-between text-purple-400">
                      <span>Exempted Amount — Margin Scheme:</span>
                      <strong>{formatCurrency(totalExemptedAmount)}</strong>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Discount:</span>
                    <span>{formatCurrency(totalDiscount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Deposit Received:</span>
                    <strong>{formatCurrency(depositReceived)}</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-700 flex justify-between text-sm font-bold text-white">
                    <span>TOTAL:</span>
                    <span className="text-indigo-400">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-amber-400">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(balanceDue)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Invoice Remarks</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Dispatched via BlueDart surface logistics, includes 6-month standard warranty..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep('DEVICES')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  ← Back to Devices
                </button>
                <button
                  type="button"
                  onClick={handleFinalize}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-emerald-900/30 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Finalize Invoice & Lock Mode
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
