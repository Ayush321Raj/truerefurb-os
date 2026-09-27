'use client';

import React, { useState } from 'react';
import {
  Customer,
  DeviceMaster,
  Invoice,
  SalesOrder,
  Payment,
  CreditNote,
  DebitNote,
} from '@truerefurb/shared-types';
import { ReferenceInvoiceView } from './ReferenceInvoiceView';
import { CreateSalesOrderModal } from './CreateSalesOrderModal';
import { CreateBillingInvoiceModal } from './CreateBillingInvoiceModal';
import { PaymentRecordModal } from './PaymentRecordModal';
import { CreditDebitNoteModal } from './CreditDebitNoteModal';
import { EInvoiceEWayBillModal } from './EInvoiceEWayBillModal';

interface SalesBillingModuleViewProps {
  customers: Customer[];
  devices: DeviceMaster[];
  salesOrders: SalesOrder[];
  invoices: Invoice[];
  payments: Payment[];
  creditNotes: CreditNote[];
  debitNotes: DebitNote[];
  onAddSalesOrder: (order: SalesOrder) => void;
  onAddInvoice: (invoice: Invoice, updatedDevices: DeviceMaster[]) => void;
  onAddPayment: (payment: Payment) => void;
  onAddCreditNote: (note: CreditNote) => void;
  onAddDebitNote: (note: DebitNote) => void;
}

export function SalesBillingModuleView({
  customers,
  devices,
  salesOrders,
  invoices,
  payments,
  creditNotes,
  debitNotes,
  onAddSalesOrder,
  onAddInvoice,
  onAddPayment,
  onAddCreditNote,
  onAddDebitNote,
}: SalesBillingModuleViewProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'INVOICES' | 'SALES_ORDERS' | 'PAYMENTS' | 'NOTES' | 'TAX_POLICY'
  >('INVOICES');

  // Modals state
  const [isSalesOrderModalOpen, setIsSalesOrderModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCreditDebitModalOpen, setIsCreditDebitModalOpen] = useState(false);
  const [creditDebitType, setCreditDebitType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);

  // Active items for detailed view
  const [activeInvoiceForView, setActiveInvoiceForView] = useState<Invoice | null>(
    invoices[0] || null
  );
  const [activeInvoiceForPayment, setActiveInvoiceForPayment] = useState<Invoice | null>(null);
  const [activeInvoiceForNote, setActiveInvoiceForNote] = useState<Invoice | null>(null);
  const [activeInvoiceForCompliance, setActiveInvoiceForCompliance] = useState<Invoice | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Financial calculations
  const totalInvoicedSales = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalDepositsReceived = invoices.reduce((acc, inv) => acc + inv.depositReceived, 0);
  const totalOutstandingReceivables = invoices.reduce((acc, inv) => acc + inv.balanceDue, 0);
  
  // Total device-level gross profit calculated across all invoice items
  const totalDeviceGrossProfit = invoices.reduce((acc, inv) => {
    const invProfit = inv.items.reduce((iAcc, it) => {
      const devProfit = (it.devices || []).reduce((dAcc, dev) => dAcc + dev.grossProfit, 0);
      return iAcc + devProfit;
    }, 0);
    return acc + invProfit;
  }, 0);

  const marginSchemeTurnover = invoices
    .filter((inv) => inv.billingMode === 'MARGIN_SCHEME')
    .reduce((acc, inv) => acc + inv.totalAmount, 0);

  const regularGstTurnover = invoices
    .filter((inv) => inv.billingMode === 'REGULAR_GST')
    .reduce((acc, inv) => acc + inv.totalAmount, 0);

  const totalSoldUnits = invoices.reduce((acc, inv) => acc + inv.totalQuantity, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleOpenPaymentForInvoice = (inv: Invoice) => {
    setActiveInvoiceForPayment(inv);
    setIsPaymentModalOpen(true);
  };

  const handleOpenCreditNoteForInvoice = (inv: Invoice) => {
    setActiveInvoiceForNote(inv);
    setCreditDebitType('CREDIT');
    setIsCreditDebitModalOpen(true);
  };

  const handleOpenDebitNoteForInvoice = (inv: Invoice) => {
    setActiveInvoiceForNote(inv);
    setCreditDebitType('DEBIT');
    setIsCreditDebitModalOpen(true);
  };

  const handleOpenComplianceForInvoice = (inv: Invoice) => {
    setActiveInvoiceForCompliance(inv);
    setIsComplianceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              TrueRefurb OS — Sales & Billing Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Phase 1 Certified
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Enterprise serialized billing supporting Rule 32(5) Margin Scheme and Regular GST. Binds every IMEI to purchase acquisition costs, computes device-level gross profit, and enforces immutable post-finalization audit trails.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              const refInv = invoices.find((i) => i.invoiceNumber === 'TR/26-27/097') || invoices[0];
              setActiveInvoiceForView(refInv);
            }}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Inspect Ref Invoice (80 Units)
          </button>

          <button
            onClick={() => setIsSalesOrderModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Sales Order
          </button>

          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-950 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
            Generate Tax Invoice
          </button>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-[11px] text-slate-400 font-medium block">Total Invoiced</span>
          <div className="text-lg font-bold text-white mt-1">{formatCurrency(totalInvoicedSales)}</div>
          <span className="text-[10px] text-slate-500">{invoices.length} Invoices Issued</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-[11px] text-slate-400 font-medium block">Device Gross Profit</span>
          <div className="text-lg font-bold text-emerald-400 mt-1">
            {formatCurrency(totalDeviceGrossProfit)}
          </div>
          <span className="text-[10px] text-emerald-500/80">Selling - Total Cost</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-[11px] text-slate-400 font-medium block">Margin Scheme Turn.</span>
          <div className="text-lg font-bold text-purple-400 mt-1">
            {formatCurrency(marginSchemeTurnover)}
          </div>
          <span className="text-[10px] text-purple-400/80">Rule 32(5) CGST</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-[11px] text-slate-400 font-medium block">Regular GST Turn.</span>
          <div className="text-lg font-bold text-blue-400 mt-1">
            {formatCurrency(regularGstTurnover)}
          </div>
          <span className="text-[10px] text-blue-400/80">Standard Intra/Inter</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-[11px] text-slate-400 font-medium block">Outstanding Due</span>
          <div className="text-lg font-bold text-amber-400 mt-1">
            {formatCurrency(totalOutstandingReceivables)}
          </div>
          <span className="text-[10px] text-slate-500">Collected: {formatCurrency(totalDepositsReceived)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-[11px] text-slate-400 font-medium block">Total Sold Units</span>
          <div className="text-lg font-bold text-white mt-1">{totalSoldUnits} Units</div>
          <span className="text-[10px] text-emerald-400">100% Serialized IMEIs</span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('INVOICES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'INVOICES'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              📄 Invoices & Reference Engine ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('SALES_ORDERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'SALES_ORDERS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              🛒 Sales Orders ({salesOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('PAYMENTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'PAYMENTS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              💳 Payments Log ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab('NOTES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'NOTES'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              ⚖️ Credit & Debit Notes ({creditNotes.length + debitNotes.length})
            </button>
            <button
              onClick={() => setActiveTab('TAX_POLICY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'TAX_POLICY'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              🛡️ Tax Policy & Terms
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search invoice #, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Tab 1: INVOICES LIST */}
        {activeTab === 'INVOICES' && (
          <div className="p-6">
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Invoice No / Date</th>
                    <th className="py-3 px-4 font-semibold">Buyer / Customer</th>
                    <th className="py-3 px-3 font-semibold text-center">Billing Mode</th>
                    <th className="py-3 px-3 font-semibold text-center">Units</th>
                    <th className="py-3 px-4 font-semibold text-right">Taxable Turnover</th>
                    <th className="py-3 px-4 font-semibold text-right">Total Amount</th>
                    <th className="py-3 px-4 font-semibold text-right">Balance Due</th>
                    <th className="py-3 px-3 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {invoices
                    .filter(
                      (inv) =>
                        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        inv.buyer.businessName.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-white">{inv.invoiceNumber}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{inv.invoiceDate}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{inv.buyer.businessName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            GSTIN: {inv.buyer.gstin || 'Unregistered'} • {inv.buyer.state}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.billingMode === 'MARGIN_SCHEME'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {inv.billingMode === 'MARGIN_SCHEME' ? 'Margin Scheme' : 'Regular GST'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-200">
                          {inv.totalQuantity}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-purple-300">
                          {formatCurrency(inv.taxableAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          {formatCurrency(inv.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {inv.balanceDue > 0 ? (
                            <span className="text-amber-400 font-bold">{formatCurrency(inv.balanceDue)}</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">₹0 (Settled)</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : inv.status === 'PARTIAL'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => setActiveInvoiceForView(inv)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold transition-colors"
                          >
                            View / Print
                          </button>
                          {inv.balanceDue > 0 && (
                            <button
                              onClick={() => handleOpenPaymentForInvoice(inv)}
                              className="px-2 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded text-[11px] font-semibold transition-colors"
                              title="Record Payment"
                            >
                              + Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: SALES ORDERS */}
        {activeTab === 'SALES_ORDERS' && (
          <div className="p-6">
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Order No / Date</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-3 font-semibold text-center">Devices</th>
                    <th className="py-3 px-4 font-semibold text-right">Selling Total</th>
                    <th className="py-3 px-4 font-semibold text-right">Total Cost</th>
                    <th className="py-3 px-4 font-semibold text-right">Device-Level Gross Profit</th>
                    <th className="py-3 px-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {salesOrders.map((so) => (
                    <tr key={so.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white">{so.orderNumber}</div>
                        <div className="text-[10px] text-slate-400">{so.orderDate}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{so.businessName}</div>
                        <div className="text-[10px] text-slate-400">Attn: {so.customerName}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-300">
                        {so.items.length} Units
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {formatCurrency(so.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-400">
                        {formatCurrency(so.totalCost)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(so.totalGrossProfit)}
                        <span className="text-[10px] text-slate-400 block">
                          ({so.totalAmount > 0 ? ((so.totalGrossProfit / so.totalAmount) * 100).toFixed(1) : 0}%)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            so.status === 'INVOICED'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : so.status === 'CONFIRMED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {so.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: PAYMENTS LOG */}
        {activeTab === 'PAYMENTS' && (
          <div className="p-6">
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Date / Ref</th>
                    <th className="py-3 px-4 font-semibold">Invoice Number</th>
                    <th className="py-3 px-4 font-semibold">Customer / Buyer</th>
                    <th className="py-3 px-3 font-semibold text-center">Method</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount Paid</th>
                    <th className="py-3 px-3 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{p.date}</div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">{p.reference}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                        {p.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        {p.customerName}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {p.method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {p.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: CREDIT & DEBIT NOTES */}
        {activeTab === 'NOTES' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Issued Credit Notes (Post-Sale Reduction)</h3>
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Note No / Date</th>
                      <th className="py-2.5 px-4 font-semibold">Original Invoice</th>
                      <th className="py-2.5 px-4 font-semibold">Reason</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Taxable</th>
                      <th className="py-2.5 px-4 font-semibold text-right">GST</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Total Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {creditNotes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-slate-500">No credit notes issued.</td>
                      </tr>
                    ) : (
                      creditNotes.map((cn) => (
                        <tr key={cn.id}>
                          <td className="py-2.5 px-4 font-mono font-bold text-amber-400">{cn.noteNumber}</td>
                          <td className="py-2.5 px-4 font-mono text-white">{cn.invoiceNumber}</td>
                          <td className="py-2.5 px-4 text-slate-300">{cn.reason}</td>
                          <td className="py-2.5 px-4 text-right font-mono">{formatCurrency(cn.subtotal)}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-400">{formatCurrency(cn.taxAmount)}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-400">{formatCurrency(cn.totalAmount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-2">Issued Debit Notes (Supplemental / Revision)</h3>
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Note No / Date</th>
                      <th className="py-2.5 px-4 font-semibold">Original Invoice</th>
                      <th className="py-2.5 px-4 font-semibold">Reason</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Taxable</th>
                      <th className="py-2.5 px-4 font-semibold text-right">GST</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Total Debit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {debitNotes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-slate-500">No debit notes issued.</td>
                      </tr>
                    ) : (
                      debitNotes.map((dn) => (
                        <tr key={dn.id}>
                          <td className="py-2.5 px-4 font-mono font-bold text-indigo-400">{dn.noteNumber}</td>
                          <td className="py-2.5 px-4 font-mono text-white">{dn.invoiceNumber}</td>
                          <td className="py-2.5 px-4 text-slate-300">{dn.reason}</td>
                          <td className="py-2.5 px-4 text-right font-mono">{formatCurrency(dn.subtotal)}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-400">{formatCurrency(dn.taxAmount)}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-indigo-400">{formatCurrency(dn.totalAmount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: TAX POLICY & TERMS */}
        {activeTab === 'TAX_POLICY' && (
          <div className="p-6 space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Statutory Margin GST Tax Policy Configuration (Rule 32(5))
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Controls the statutory treatment of second-hand and refurbished electronic goods under Central Goods and Services Tax Act.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block font-semibold mb-1">Active Policy Version:</span>
                  <span className="font-mono text-indigo-400 font-bold text-sm">GST-RULE-32-5-v2</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block font-semibold mb-1">Negative Margin Treatment:</span>
                  <span className="text-emerald-400 font-bold">Taxable Margin = ₹0 (Exempt)</span>
                  <p className="text-[10px] text-slate-500 mt-1">Never converted into taxable profit</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block font-semibold mb-1">Standard Margin GST Rate:</span>
                  <span className="text-white font-mono font-bold text-sm">18.00%</span>
                  <p className="text-[10px] text-slate-500 mt-1">9% CGST + 9% SGST / 18% IGST</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Standard Certified Warranty Terms (Configurable)
              </h3>
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-2">
                <div>
                  <strong className="text-white">Warranty Period:</strong> 6 Months Comprehensive Hardware Warranty on Certified Refurbished Units.
                </div>
                <div>
                  <strong className="text-white">Tamper Seal Policy:</strong> Removal, scratching, or alteration of the tamper seal immediately voids warranty.
                </div>
                <div>
                  <strong className="text-white">Physical & Liquid Damage:</strong> Dropped displays, water ingress, and corrosion are strictly excluded.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Printable Reference / Invoice Modal View */}
      {activeInvoiceForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-5xl max-h-[96vh] overflow-y-auto">
            <ReferenceInvoiceView
              invoice={activeInvoiceForView}
              onClose={() => setActiveInvoiceForView(null)}
              onRecordPayment={handleOpenPaymentForInvoice}
              onCreateCreditNote={handleOpenCreditNoteForInvoice}
              onCreateDebitNote={handleOpenDebitNoteForInvoice}
              onViewCompliance={handleOpenComplianceForInvoice}
            />
          </div>
        </div>
      )}

      {/* Sales Order Modal */}
      <CreateSalesOrderModal
        isOpen={isSalesOrderModalOpen}
        onClose={() => setIsSalesOrderModalOpen(false)}
        customers={customers}
        availableDevices={devices}
        onSubmit={onAddSalesOrder}
      />

      {/* Billing Invoice Modal */}
      <CreateBillingInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        customers={customers}
        availableDevices={devices}
        salesOrders={salesOrders}
        onSubmit={onAddInvoice}
      />

      {/* Payment Record Modal */}
      <PaymentRecordModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoices={invoices}
        defaultInvoice={activeInvoiceForPayment}
        onSubmit={onAddPayment}
      />

      {/* Credit / Debit Note Modal */}
      {activeInvoiceForNote && (
        <CreditDebitNoteModal
          isOpen={isCreditDebitModalOpen}
          onClose={() => setIsCreditDebitModalOpen(false)}
          invoice={activeInvoiceForNote}
          type={creditDebitType}
          onSubmitCreditNote={onAddCreditNote}
          onSubmitDebitNote={onAddDebitNote}
        />
      )}

      {/* E-Invoice / E-Way Bill Modal */}
      {activeInvoiceForCompliance && (
        <EInvoiceEWayBillModal
          isOpen={isComplianceModalOpen}
          onClose={() => setIsComplianceModalOpen(false)}
          invoice={activeInvoiceForCompliance}
        />
      )}
    </div>
  );
}
