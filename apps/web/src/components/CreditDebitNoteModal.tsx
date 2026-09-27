'use client';

import React, { useState } from 'react';
import { Invoice, CreditNote, DebitNote } from '@truerefurb/shared-types';

interface CreditDebitNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  type: 'CREDIT' | 'DEBIT';
  onSubmitCreditNote?: (note: CreditNote) => void;
  onSubmitDebitNote?: (note: DebitNote) => void;
}

export function CreditDebitNoteModal({
  isOpen,
  onClose,
  invoice,
  type,
  onSubmitCreditNote,
  onSubmitDebitNote,
}: CreditDebitNoteModalProps) {
  const isCredit = type === 'CREDIT';

  const [noteNumber] = useState(
    `${isCredit ? 'CN' : 'DN'}-${new Date().getFullYear()}-${String(
      Math.floor(1000 + Math.random() * 9000)
    )}`
  );
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [creditReason, setCreditReason] = useState<
    'SALES_RETURN' | 'PRICE_REDUCTION' | 'POST_SALE_DISCOUNT' | 'DEFICIENCY_OF_SERVICE'
  >('PRICE_REDUCTION');
  const [debitReason, setDebitReason] = useState<
    'PRICE_REVISION_UP' | 'EXTRA_SERVICE' | 'SUPPLEMENTAL_EXPENSE'
  >('EXTRA_SERVICE');
  const [selectedItemId, setSelectedItemId] = useState(invoice.items[0]?.id || '');
  const [amount, setAmount] = useState<number>(1000);
  const [itemReason, setItemReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedItem = invoice.items.find((item) => item.id === selectedItemId) || invoice.items[0];

  const taxRate = invoice.billingMode === 'MARGIN_SCHEME' ? 18 : 18;
  const taxAmount = Number(((amount * taxRate) / 100).toFixed(2));
  const totalAmount = amount + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }
    if (!itemReason.trim()) {
      setError('Please provide a specific reason for the adjustment line item.');
      return;
    }

    if (isCredit && onSubmitCreditNote) {
      const note: CreditNote = {
        id: `cn-${Date.now()}`,
        noteNumber,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.buyer.name,
        customerName: invoice.buyer.businessName,
        issueDate,
        reason: creditReason,
        subtotal: amount,
        taxAmount,
        totalAmount,
        status: 'ISSUED',
        notes,
        items: [
          {
            id: `cn-item-${Date.now()}`,
            creditNoteId: `cn-${Date.now()}`,
            invoiceItemId: selectedItem?.id,
            imei: selectedItem?.imei,
            productName: selectedItem ? `${selectedItem.productName} (${selectedItem.storage})` : 'General Adjustment',
            reason: itemReason,
            amount,
            taxAmount,
            totalAmount,
          },
        ],
        createdAt: new Date().toISOString(),
      };
      onSubmitCreditNote(note);
    } else if (!isCredit && onSubmitDebitNote) {
      const note: DebitNote = {
        id: `dn-${Date.now()}`,
        noteNumber,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.buyer.name,
        customerName: invoice.buyer.businessName,
        issueDate,
        reason: debitReason,
        subtotal: amount,
        taxAmount,
        totalAmount,
        status: 'ISSUED',
        notes,
        items: [
          {
            id: `dn-item-${Date.now()}`,
            debitNoteId: `dn-${Date.now()}`,
            invoiceItemId: selectedItem?.id,
            imei: selectedItem?.imei,
            productName: selectedItem ? `${selectedItem.productName} (${selectedItem.storage})` : 'General Adjustment',
            reason: itemReason,
            amount,
            taxAmount,
            totalAmount,
          },
        ],
        createdAt: new Date().toISOString(),
      };
      onSubmitDebitNote(note);
    }
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
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isCredit ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
              ></span>
              <h2 className="text-base font-bold text-white tracking-tight">
                Create {isCredit ? 'Credit Note' : 'Debit Note'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Original Invoice: <strong className="text-white font-mono">{invoice.invoiceNumber}</strong> (
              {invoice.buyer.businessName})
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Note Number <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                disabled
                value={noteNumber}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Issue Date <span className="text-indigo-400">*</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Statutory Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Statutory Reason Code <span className="text-indigo-400">*</span>
            </label>
            {isCredit ? (
              <select
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="PRICE_REDUCTION">01 - Price Reduction / Post-Sale Discount</option>
                <option value="SALES_RETURN">02 - Sales Return (Defective/DOA)</option>
                <option value="DEFICIENCY_OF_SERVICE">03 - Deficiency in Refurbishment Service</option>
                <option value="POST_SALE_DISCOUNT">04 - Post-Sale Commercial Incentive</option>
              </select>
            ) : (
              <select
                value={debitReason}
                onChange={(e) => setDebitReason(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="EXTRA_SERVICE">01 - Additional Logistics / Packaging Service</option>
                <option value="PRICE_REVISION_UP">02 - Post-Agreement Upward Price Revision</option>
                <option value="SUPPLEMENTAL_EXPENSE">03 - Supplemental Transit Insurance / Expense</option>
              </select>
            )}
          </div>

          {/* Target Invoice Item */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Serialized Invoice Item
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            >
              {invoice.items.slice(0, 20).map((it) => (
                <option key={it.id} value={it.id}>
                  #{it.sNo} {it.productName} ({it.storage}) - IMEI: {it.imei}
                </option>
              ))}
            </select>
            {invoice.items.length > 20 && (
              <p className="text-[10px] text-slate-500 mt-1">
                Showing top 20 serialized units from this invoice.
              </p>
            )}
          </div>

          {/* Amount & Tax */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Taxable Amount (INR) <span className="text-indigo-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Total Adjustment (with GST)
              </label>
              <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono font-bold">
                {formatCurrency(totalAmount)} (Tax: {formatCurrency(taxAmount)})
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Specific Commercial Reason <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              value={itemReason}
              onChange={(e) => setItemReason(e.target.value)}
              placeholder="e.g. Approved cosmetic allowance for rear bezel scratch..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal justification and reference ticket..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
              className={`px-5 py-2 text-white rounded-lg text-xs font-bold transition-colors shadow-lg ${
                isCredit
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'
              }`}
            >
              Issue {isCredit ? 'Credit Note' : 'Debit Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
