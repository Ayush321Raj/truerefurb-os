'use client';

import React, { useState } from 'react';
import { Invoice, Payment, PaymentMethod } from '@truerefurb/shared-types';

interface PaymentRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  defaultInvoice?: Invoice | null;
  onSubmit: (payment: Payment) => void;
}

export function PaymentRecordModal({
  isOpen,
  onClose,
  invoices,
  defaultInvoice,
  onSubmit,
}: PaymentRecordModalProps) {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(
    defaultInvoice?.id || invoices[0]?.id || ''
  );

  const selectedInvoice =
    invoices.find((inv) => inv.id === selectedInvoiceId) || defaultInvoice || invoices[0];

  const [amount, setAmount] = useState<number>(
    selectedInvoice ? selectedInvoice.balanceDue || selectedInvoice.totalAmount : 0
  );
  const [method, setMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInvoiceChange = (invId: string) => {
    setSelectedInvoiceId(invId);
    const target = invoices.find((i) => i.id === invId);
    if (target) {
      setAmount(target.balanceDue > 0 ? target.balanceDue : target.totalAmount);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) {
      setError('Please select an invoice.');
      return;
    }
    if (amount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }
    if (!reference.trim()) {
      setError('Bank transaction reference / UTR / check number is required.');
      return;
    }

    const isFullSettlement = amount >= selectedInvoice.balanceDue;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      invoiceId: selectedInvoice.id,
      invoiceNumber: selectedInvoice.invoiceNumber,
      customerId: selectedInvoice.buyer.name, // or ID
      customerName: selectedInvoice.buyer.businessName,
      amount,
      method,
      status: isFullSettlement ? 'PAID' : 'PARTIAL',
      date: paymentDate,
      reference,
      notes,
      recordedBy: 'Current Authorized User',
      createdAt: new Date().toISOString(),
    };

    onSubmit(newPayment);
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h2 className="text-base font-bold text-white tracking-tight">Record Invoice Payment</h2>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Invoice Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Invoice <span className="text-emerald-400">*</span>
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} - {inv.buyer.businessName} (Balance: {formatCurrency(inv.balanceDue)})
                </option>
              ))}
            </select>
          </div>

          {selectedInvoice && (
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Invoice Amount:</span>
                <strong>{formatCurrency(selectedInvoice.totalAmount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deposit / Paid to Date:</span>
                <span className="text-emerald-400 font-medium">
                  {formatCurrency(selectedInvoice.depositReceived)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800 font-bold">
                <span className="text-amber-400">Current Outstanding Balance:</span>
                <span className="text-amber-400 font-mono">
                  {formatCurrency(selectedInvoice.balanceDue)}
                </span>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Payment Method <span className="text-emerald-400">*</span>
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="BANK_TRANSFER">BANK TRANSFER (NEFT/RTGS/IMPS)</option>
                <option value="UPI">UPI / QR CODE</option>
                <option value="CARD">DEBIT / CREDIT CARD</option>
                <option value="CASH">CASH RECEIPT</option>
                <option value="OTHER">OTHER ESCROW / CHEQUE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Payment Date <span className="text-emerald-400">*</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Amount & Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Amount Received (INR) <span className="text-emerald-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reference / UTR Number <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. HDFC260901928301"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared via corporate RTGS from Delhi account..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-emerald-900/20"
            >
              Confirm & Post Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
