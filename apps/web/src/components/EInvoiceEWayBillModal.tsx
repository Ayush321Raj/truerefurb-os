'use client';

import React from 'react';
import { Invoice } from '@truerefurb/shared-types';

interface EInvoiceEWayBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

export function EInvoiceEWayBillModal({
  isOpen,
  onClose,
  invoice,
}: EInvoiceEWayBillModalProps) {
  if (!isOpen) return null;

  // Synthesize or use existing e-invoice data
  const eInvoice = invoice.eInvoice || {
    irn: '4f29a0b1820498acde83019fba20384918e9a28b84931a89c0291e0a84931a89',
    ackNo: '1126108492019',
    ackDate: `${invoice.invoiceDate} 14:32:00`,
    signedQrCode: `TR-EINVOICE-QR:IRN=4f29a0b1820498acde83019fba20384918e9a28b84931a89c0291e0a84931a89:GSTIN=${invoice.seller.gstin}:BUYER=${invoice.buyer.gstin || 'URP'}:VAL=${invoice.totalAmount}:TAX=${invoice.totalTax}`,
    status: 'GENERATED',
  };

  const eWayBill = invoice.eWayBill || {
    ewayBillNo: '241890284910',
    validUpto: '2026-09-28 23:59:59',
    distanceKm: invoice.isInterState ? 1480 : 35,
    vehicleNumber: 'WB 26 F 9821',
    transporterId: '19TRP1029481Z2',
    transporterName: 'BlueDart Surface Logistics / SpeedPost',
    status: 'ACTIVE',
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h2 className="text-base font-bold text-white tracking-tight">
                Government Compliance (E-Invoice & E-Way Bill)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Invoice Reference: <strong className="text-white font-mono">{invoice.invoiceNumber}</strong>
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

        <div className="p-6 space-y-6">
          {/* E-INVOICE SECTION */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  E-Invoice (IRN Portal Integration)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {eInvoice.status}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">NIC / GSTN Portal Spec v1.03</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Simulated QR Code box */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-white p-1 rounded border border-slate-300 flex items-center justify-center text-slate-950 font-mono text-[9px] break-all leading-none select-none">
                  <div className="grid grid-cols-4 gap-0.5 w-full h-full p-1 bg-slate-900 rounded">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-sm ${
                          i % 2 === 0 || i % 5 === 0 ? 'bg-emerald-400' : 'bg-slate-800'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-mono">B2B Signed QR</span>
              </div>

              {/* Data points */}
              <div className="md:col-span-2 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Invoice Reference Number (IRN - SHA-256):</span>
                  <span className="font-mono text-emerald-400 font-bold break-all text-[11px] block bg-slate-900 p-2 rounded border border-slate-800 mt-0.5">
                    {eInvoice.irn}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Ack No:</span>
                    <strong className="text-white font-mono">{eInvoice.ackNo}</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Ack Date:</span>
                    <strong className="text-white font-mono">{eInvoice.ackDate}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* E-WAY BILL SECTION */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  E-Way Bill (Part A & Part B)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {eWayBill.status}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Road Movement Validated</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">E-Way Bill No</span>
                <strong className="text-white font-mono text-sm block mt-0.5">
                  {eWayBill.ewayBillNo}
                </strong>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Valid Until</span>
                <strong className="text-amber-400 font-mono text-xs block mt-0.5">
                  {eWayBill.validUpto}
                </strong>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Distance</span>
                <strong className="text-white font-mono text-sm block mt-0.5">
                  {eWayBill.distanceKm} KM
                </strong>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Vehicle Number</span>
                <strong className="text-indigo-400 font-mono text-sm block mt-0.5">
                  {eWayBill.vehicleNumber}
                </strong>
              </div>
            </div>

            <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Transporter:</span>
                <strong className="text-white">{eWayBill.transporterName}</strong>
              </div>
              <div className="flex justify-between mt-1">
                <span>Transporter ID:</span>
                <span className="font-mono text-slate-400">{eWayBill.transporterId}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-800 flex justify-end bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Close Compliance Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
