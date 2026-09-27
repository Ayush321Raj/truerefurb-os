'use client';

import React, { useState } from 'react';
import { Invoice, InvoiceItem } from '@truerefurb/shared-types';

interface ReferenceInvoiceViewProps {
  invoice: Invoice;
  onClose?: () => void;
  onRecordPayment?: (invoice: Invoice) => void;
  onCreateCreditNote?: (invoice: Invoice) => void;
  onCreateDebitNote?: (invoice: Invoice) => void;
  onViewCompliance?: (invoice: Invoice) => void;
}

export function ReferenceInvoiceView({
  invoice,
  onClose,
  onRecordPayment,
  onCreateCreditNote,
  onCreateDebitNote,
  onViewCompliance,
}: ReferenceInvoiceViewProps) {
  // Page selector: 'ALL' for continuous document (print-ready) or specific page '1', '2', '3', '4'
  const [activePage, setActivePage] = useState<'ALL' | 1 | 2 | 3 | 4>('ALL');
  const [searchImei, setSearchImei] = useState('');

  // Page distribution matching the reference PDF:
  // Page 1: Items 1 to 20
  // Page 2: Items 21 to 49
  // Page 3: Items 50 to 78
  // Page 4: Items 79 to 80 + Totals + Terms & Conditions + Signature
  const page1Items = invoice.items.slice(0, 20);
  const page2Items = invoice.items.slice(20, 49);
  const page3Items = invoice.items.slice(49, 78);
  const page4Items = invoice.items.slice(78, 80);

  const formatCurrencyOnly = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderTableRows = (items: InvoiceItem[]) => {
    return items
      .filter((item) => {
        if (!searchImei.trim()) return true;
        return (
          item.imei.toLowerCase().includes(searchImei.toLowerCase()) ||
          String(item.sNo).includes(searchImei)
        );
      })
      .map((item) => (
        <tr key={item.id} className="hover:bg-teal-50/40 text-[11px] leading-tight">
          <td className="py-1 px-1.5 border border-slate-300 text-center text-slate-800">
            {item.sNo}
          </td>
          <td className="py-1 px-2 border border-slate-300 text-slate-900 font-normal">
            {item.productName}
          </td>
          <td className="py-1 px-1.5 border border-slate-300 text-center text-slate-800">
            {item.storage}
          </td>
          <td className="py-1 px-2 border border-slate-300 font-mono text-slate-900 tracking-tight text-[10.5px]">
            {item.imei}
          </td>
          <td className="py-1 px-2 border border-slate-300 text-slate-800">
            {item.productType}
          </td>
          <td className="py-1 px-1.5 border border-slate-300 text-center text-slate-800 font-mono">
            {item.hsnCode}
          </td>
          <td className="py-1 px-1.5 border border-slate-300 text-center text-slate-900 font-medium">
            {item.quantity}
          </td>
          <td className="py-1 px-2 border border-slate-300 text-right text-slate-900">
            {formatCurrencyOnly(item.unitPrice)}
          </td>
          <td className="py-1 px-1.5 border border-slate-300 text-center text-slate-500">
            -
          </td>
          <td className="py-1 px-2 border border-slate-300 text-right text-slate-900">
            {formatCurrencyOnly(item.amount)}
          </td>
        </tr>
      ));
  };

  const renderTableHeader = () => (
    <thead className="bg-[#0b4845] text-white text-[11px] font-semibold print:table-header-group">
      <tr>
        <th className="py-1.5 px-1.5 border border-[#0b4845] w-8 text-center font-semibold">#</th>
        <th className="py-1.5 px-2 border border-[#0b4845] font-semibold text-left">Item</th>
        <th className="py-1.5 px-1.5 border border-[#0b4845] w-14 text-center font-semibold leading-tight">
          Storage
        </th>
        <th className="py-1.5 px-2 border border-[#0b4845] font-semibold text-center">IMEI</th>
        <th className="py-1.5 px-2 border border-[#0b4845] font-semibold text-left">Product Type</th>
        <th className="py-1.5 px-1.5 border border-[#0b4845] w-14 text-center font-semibold leading-tight">
          HSN/SAC
        </th>
        <th className="py-1.5 px-1.5 border border-[#0b4845] w-8 text-center font-semibold">Qty</th>
        <th className="py-1.5 px-2 border border-[#0b4845] text-right font-semibold">Unit Price</th>
        <th className="py-1.5 px-1.5 border border-[#0b4845] w-14 text-center font-semibold leading-tight">
          Discount
        </th>
        <th className="py-1.5 px-2 border border-[#0b4845] text-right font-semibold">Amount (Rs.)</th>
      </tr>
    </thead>
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col text-slate-100">
      {/* Top Application Bar (Hidden on Print) */}
      <div className="no-print bg-slate-950 border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-lg">
            TR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Demo Reference Bill: {invoice.invoiceNumber}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Rule 32(5) Margin Scheme
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PAID
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Exact 4-page reference bill replica • 80 serialized iPhone 13 units • Total: Rs. 2,168,000
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Page switch tabs */}
          <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setActivePage('ALL')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                activePage === 'ALL'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All 4 Pages
            </button>
            <button
              onClick={() => setActivePage(1)}
              className={`px-2 py-1 rounded font-semibold transition-colors ${
                activePage === 1 ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Page 1
            </button>
            <button
              onClick={() => setActivePage(2)}
              className={`px-2 py-1 rounded font-semibold transition-colors ${
                activePage === 2 ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Page 2
            </button>
            <button
              onClick={() => setActivePage(3)}
              className={`px-2 py-1 rounded font-semibold transition-colors ${
                activePage === 3 ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Page 3
            </button>
            <button
              onClick={() => setActivePage(4)}
              className={`px-2 py-1 rounded font-semibold transition-colors ${
                activePage === 4 ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Page 4 & Totals
            </button>
          </div>

          {/* Quick IMEI search */}
          <div className="relative w-44">
            <input
              type="text"
              placeholder="Search IMEI / S.No..."
              value={searchImei}
              onChange={(e) => setSearchImei(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / PDF
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors ml-1"
              title="Close Reference Bill"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Document Container (Rendered exactly like reference PDF pages) */}
      <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-140px)] bg-slate-800/60 invoice-sheet-wrapper space-y-8">
        {/* =========================================================================
            PAGE 1 (Items 1 to 20)
            ========================================================================= */}
        {(activePage === 'ALL' || activePage === 1) && (
          <div className="max-w-[850px] mx-auto bg-white text-slate-900 rounded shadow-xl p-8 md:p-10 border border-slate-300 font-sans print:p-0 print:border-0 print:shadow-none print:m-0 invoice-document invoice-page relative">
            {/* Header Block */}
            <div className="flex justify-between items-start pb-4">
              {/* Logo matching PDF */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 relative flex items-center justify-center">
                  <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none">
                    {/* Cyan leaf */}
                    <path
                      d="M20 70 C20 40, 45 20, 75 15 C60 40, 50 65, 20 70 Z"
                      fill="#0284c7"
                    />
                    {/* Green leaf */}
                    <path
                      d="M30 75 C45 35, 70 25, 85 20 C80 50, 60 75, 30 75 Z"
                      fill="#16a34a"
                    />
                    {/* Light green accent leaf */}
                    <path
                      d="M45 80 C55 50, 75 40, 90 30 C85 60, 70 80, 45 80 Z"
                      fill="#22c55e"
                      opacity="0.85"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight text-[#0a3835] leading-none">
                    NASS
                  </div>
                  <div className="text-[10px] font-bold text-[#16a34a] tracking-widest leading-none mt-1 uppercase">
                    GREEN TECH
                  </div>
                  <div className="text-[7.5px] font-semibold text-slate-600 tracking-wider leading-none mt-0.5 uppercase">
                    SOLUTIONS PVT. LTD.
                  </div>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="text-right">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase">
                  TAX INVOICE
                </h1>
                <div className="text-xs text-slate-700 mt-1 font-medium">
                  Invoice #: <strong className="text-slate-900 font-bold">{invoice.invoiceNumber}</strong>
                </div>
                <div className="text-xs text-slate-700 mt-0.5 font-medium">
                  Invoice Date: <strong className="text-slate-900 font-bold">{invoice.invoiceDate}</strong>
                </div>
              </div>
            </div>

            {/* Horizontal Line */}
            <div className="border-b border-[#0b4845] mb-5"></div>

            {/* Seller & Buyer Grid */}
            <div className="grid grid-cols-2 gap-6 mb-6 text-xs leading-normal">
              {/* Seller Details */}
              <div className="text-slate-800 space-y-0.5 pr-2">
                <div className="font-bold text-slate-950 text-[12.5px] uppercase">
                  {invoice.seller.legalName}
                </div>
                <div>1st-fr, Fl-2c, 28/10 Jay Narayan Banerjee Lane, Baranagar,</div>
                <div>Kolkata, West Bengal-700036</div>
                <div className="text-slate-700">{invoice.seller.contactEmail}</div>
                <div className="pt-1 font-semibold text-slate-900">
                  GSTIN: {invoice.seller.gstin} &nbsp;&nbsp; State Code: {invoice.seller.stateCode}
                </div>
              </div>

              {/* Bill To Box */}
              <div className="bg-[#f0f6f6] p-3.5 rounded border-t-2 border-[#0b4845] text-slate-800 space-y-0.5">
                <div className="font-extrabold text-[#0b4845] text-xs uppercase tracking-wide">
                  BILL TO
                </div>
                <div className="font-bold text-slate-950 text-[12px] pt-0.5">
                  {invoice.buyer.businessName}
                </div>
                <div className="text-[11px] leading-tight text-slate-700">
                  {invoice.buyer.address}
                </div>
                <div className="text-[11px] pt-1">
                  Phone: <span className="font-medium text-slate-900">{invoice.buyer.phone}</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-900">
                  GSTIN: {invoice.buyer.gstin}
                </div>
              </div>
            </div>

            {/* Table (Page 1: Items 1 to 20) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                {renderTableHeader()}
                <tbody>{renderTableRows(page1Items)}</tbody>
              </table>
            </div>

            {/* Page number footer */}
            <div className="mt-4 text-right text-[10px] text-slate-400">
              Page 1 of 4
            </div>
          </div>
        )}

        {/* =========================================================================
            PAGE 2 (Items 21 to 49)
            ========================================================================= */}
        {(activePage === 'ALL' || activePage === 2) && (
          <div className="max-w-[850px] mx-auto bg-white text-slate-900 rounded shadow-xl p-8 md:p-10 border border-slate-300 font-sans print:p-0 print:border-0 print:shadow-none print:m-0 invoice-document invoice-page relative">
            <div className="flex justify-between items-center mb-3 text-xs text-slate-600 border-b pb-2">
              <span className="font-bold text-[#0b4845]">NASSGREEN TECH SOLUTIONS PVT LTD</span>
              <span>Invoice #: {invoice.invoiceNumber} • Date: {invoice.invoiceDate}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                {renderTableHeader()}
                <tbody>{renderTableRows(page2Items)}</tbody>
              </table>
            </div>

            <div className="mt-4 text-right text-[10px] text-slate-400">
              Page 2 of 4
            </div>
          </div>
        )}

        {/* =========================================================================
            PAGE 3 (Items 50 to 78)
            ========================================================================= */}
        {(activePage === 'ALL' || activePage === 3) && (
          <div className="max-w-[850px] mx-auto bg-white text-slate-900 rounded shadow-xl p-8 md:p-10 border border-slate-300 font-sans print:p-0 print:border-0 print:shadow-none print:m-0 invoice-document invoice-page relative">
            <div className="flex justify-between items-center mb-3 text-xs text-slate-600 border-b pb-2">
              <span className="font-bold text-[#0b4845]">NASSGREEN TECH SOLUTIONS PVT LTD</span>
              <span>Invoice #: {invoice.invoiceNumber} • Date: {invoice.invoiceDate}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                {renderTableHeader()}
                <tbody>{renderTableRows(page3Items)}</tbody>
              </table>
            </div>

            <div className="mt-4 text-right text-[10px] text-slate-400">
              Page 3 of 4
            </div>
          </div>
        )}

        {/* =========================================================================
            PAGE 4 (Items 79 to 80 + Totals + Terms & Conditions + Signatures)
            ========================================================================= */}
        {(activePage === 'ALL' || activePage === 4) && (
          <div className="max-w-[850px] mx-auto bg-white text-slate-900 rounded shadow-xl p-8 md:p-10 border border-slate-300 font-sans print:p-0 print:border-0 print:shadow-none print:m-0 invoice-document invoice-page relative">
            <div className="flex justify-between items-center mb-3 text-xs text-slate-600 border-b pb-2">
              <span className="font-bold text-[#0b4845]">NASSGREEN TECH SOLUTIONS PVT LTD</span>
              <span>Invoice #: {invoice.invoiceNumber} • Date: {invoice.invoiceDate}</span>
            </div>

            {/* Items 79 & 80 */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                {renderTableHeader()}
                <tbody>{renderTableRows(page4Items)}</tbody>
              </table>
            </div>

            {/* Totals & Summary Block */}
            <div className="grid grid-cols-2 gap-8 mb-8 text-xs">
              {/* Left Column: Total Quantity */}
              <div className="pt-2">
                <div className="font-semibold text-slate-800 text-xs">
                  Total Quantity: <strong className="text-slate-950 font-bold">{invoice.totalQuantity} units</strong>
                </div>
              </div>

              {/* Right Column: Exact Reference Invoice Summary Table */}
              <div>
                <div className="space-y-1.5 text-xs text-slate-800">
                  <div className="flex justify-between py-0.5">
                    <span>Total Amount</span>
                    <span className="font-medium text-slate-900">
                      Rs. {formatCurrencyOnly(invoice.totalAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between py-0.5">
                    <span>Taxable Amount</span>
                    <span className="font-medium text-slate-900">
                      Rs. {formatCurrencyOnly(invoice.taxableAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between py-0.5">
                    <span>IGST</span>
                    <span className="font-medium text-slate-900">
                      Rs. {formatCurrencyOnly(invoice.igstAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between py-0.5 leading-tight">
                    <span>Exempted Amount (Margin Scheme)</span>
                    <span className="font-medium text-slate-900">
                      Rs. {formatCurrencyOnly(invoice.exemptedAmountMarginScheme)}
                    </span>
                  </div>

                  <div className="flex justify-between py-0.5">
                    <span>Discount</span>
                    <span className="font-medium text-slate-900">Rs. 0</span>
                  </div>

                  <div className="flex justify-between py-0.5">
                    <span>Deposit Received</span>
                    <span className="font-medium text-slate-900">
                      Rs. {formatCurrencyOnly(invoice.depositReceived)}
                    </span>
                  </div>

                  <div className="border-t-2 border-slate-900 pt-1.5 mt-1.5 flex justify-between font-bold text-sm text-slate-950">
                    <span>TOTAL</span>
                    <span>Rs. {formatCurrencyOnly(invoice.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions and Signature Section */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-[11px] leading-relaxed">
              {/* Left Column: Terms */}
              <div className="text-slate-800 space-y-1">
                <div className="font-bold text-slate-950 uppercase tracking-tight text-[11.5px]">
                  Terms &amp; Conditions
                </div>
                <div>1. All products come with limited warranty.</div>
                <div>2. Product will not be returned once the warranty has expired.</div>
                <div>3. If the product is tampered with, the warranty will be void.</div>
                <div className="italic text-slate-600 pt-1 text-[10.5px]">
                  *Terms &amp; Conditions apply. For details please visit www.truerefurb.com*
                </div>
              </div>

              {/* Right Column: Signature Block */}
              <div className="text-right flex flex-col justify-end items-end space-y-1">
                {/* Visual signature image/script */}
                <div className="h-10 flex items-center justify-end pr-2 select-none">
                  <span
                    style={{ fontFamily: 'cursive, "Brush Script MT", "Segoe Script"' }}
                    className="text-blue-700 text-lg font-bold italic tracking-wide"
                  >
                    Ashim Chakraborty
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-[11.5px] uppercase leading-tight">
                  For NASSGREEN TECH SOLUTIONS<br />PVT LTD
                </div>
                <div className="text-slate-600 text-[10.5px]">Authorized Signatory</div>
              </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10.5px] italic text-slate-600">
              *This is a computer generated invoice and no signature and stamp is required.*
            </div>

            <div className="mt-2 text-right text-[10px] text-slate-400">
              Page 4 of 4
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
