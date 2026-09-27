import {
  Invoice,
  InvoiceItem,
  InvoiceItemDevice,
  SalesOrder,
  Payment,
  CreditNote,
  DebitNote,
  SellerProfile,
  BuyerProfile,
  InvoiceTerms,
} from '@truerefurb/shared-types';

export const EXACT_80_IMEIS: string[] = [
  // Page 1 (1 to 20)
  '354326132032922',
  '358598522204255',
  '359189531159588',
  '359143400932351',
  '352100134984972',
  '356406546438358',
  '358047178767223',
  '351488256328867',
  '358471233006734',
  '354040284438551',
  '354190817742902',
  '359883646250726',
  '359746507272438',
  '359143407017214',
  '353487946493204',
  '359045485889424',
  '356378514739226',
  '359045481066050',
  '357106635135647',
  '358824687139817',

  // Page 2 (21 to 49)
  '358824682211736',
  '355160953207183',
  '355636353160973',
  '359045486507843',
  '355839998561387',
  '355657928781747',
  '353608679066236',
  '353272712716305',
  '354190811349688',
  '355240572794058',
  '355439673795838',
  '359045483878866',
  '353608679018385',
  '355439670195214',
  '359404249526055',
  '356192508342750',
  '358890142614504',
  '356129177690069',
  '358047175729762',
  '359404243529824',
  '357106634678092',
  '350244333689875',
  '355160952788258',
  '356274466578565',
  '355678759760626',
  '357247399724372',
  '357247399832662',
  '355958930802905',
  '353414862292899',

  // Page 3 (50 to 78)
  '353483510698518',
  '353640984014619',
  '359746503065505',
  '355678759388386',
  '354727238702948',
  '350488960256165',
  '355958936430735',
  '350488967196497',
  '355678756774109',
  '359143405563722',
  '352603143721962',
  '358564385833010',
  '355958938353794',
  '354040288329020',
  '352603145240284',
  '354826883091936',
  '359883646250726',
  '352100130799440',
  '354083346706060',
  '359404242709807',
  '355439674351458',
  '356378515941664',
  '356012711560735',
  '359622568421893',
  '354865251491682',
  '354326138429635',
  '354826882562846',
  '351359259207574',
  '356406547974286',

  // Page 4 (79 to 80)
  '354040283070454',
  '356378510593262',
];

export const DEFAULT_SELLER_PROFILE: SellerProfile = {
  legalName: 'NASSGREEN TECH SOLUTIONS PVT LTD',
  businessName: 'NASS GREEN TECH SOLUTIONS PVT. LTD.',
  address: '1st-fr, Fl-2c, 28/10 Jay Narayan Banerjee Lane, Baranagar, Kolkata, West Bengal-700036',
  gstin: '19AAKCN5564D1Z7',
  state: 'West Bengal',
  stateCode: '19',
  contactPhone: '+91 90731 39232',
  contactEmail: 'truerefurb@gmail.com',
  bankName: 'HDFC Bank Ltd',
  bankAccountNumber: '50200084920194',
  bankIfsc: 'HDFC0001234',
};

export const DEFAULT_BUYER_PROFILE: BuyerProfile = {
  name: 'Authorized Purchasing Lead',
  businessName: 'RADICAL AFTERMARKET SERVICES PRIVATE LIMITED',
  address: '1st Floor, Khasra No.34/22, NK Tower Kanhai Road, Sector 45, Gurugram, Haryana, PIN Code: 122003',
  phone: '9073139232',
  email: 'accounts@radicalaftermarket.com',
  gstin: '06AAJCR2110E1ZX',
  state: 'Haryana',
  stateCode: '06',
};

export const DEFAULT_INVOICE_TERMS: InvoiceTerms = {
  id: 'terms-std-001',
  name: 'Standard TrueRefurb Certified Device Terms & Warranty',
  warrantyPeriodText: 'All products come with limited warranty.',
  warrantyVoidConditions: [
    'Product will not be returned once the warranty has expired.',
    'If the product is tampered with, the warranty will be void.',
  ],
  tamperingPolicy: 'If the product is tampered with, the warranty will be void.',
  liquidPhysicalDamagePolicy: 'Damage, water ingress, and unauthorized servicing strictly void warranty.',
  computerGeneratedNotice: 'This is a computer generated invoice and no signature and stamp is required.',
  returnPolicy: 'Terms & Conditions apply. For details please visit www.truerefurb.com',
  isDefault: true,
};

// =========================================================================
// Authentic Reference Invoice TR/26-27/097
// 80 serialized iPhone 13 128GB units under Margin Scheme (Rule 32(5))
// Exactly matches:
// Total Amount: Rs. 2,168,000
// Taxable Amount: Rs. 8,000
// IGST: Rs. 1,440
// Exempted Amount (Margin Scheme): Rs. 2,160,000
// Discount: Rs. 0
// Deposit Received: Rs. 2,168,000
// TOTAL: Rs. 2,168,000
// =========================================================================

function generateReference80UnitsInvoice(): Invoice {
  const items: InvoiceItem[] = [];
  const unitSellingPrice = 27100;
  const unitPurchaseCost = 27000;
  const unitTaxableMargin = 100; // 27,100 - 27,000 = 100
  const unitIgstAmount = 18; // 18% of 100 = 18

  for (let i = 0; i < EXACT_80_IMEIS.length; i++) {
    const sNo = i + 1;
    const imei = EXACT_80_IMEIS[i];
    const deviceId = `refurb-dev-80-${String(sNo).padStart(3, '0')}`;

    const deviceRecord: InvoiceItemDevice = {
      id: `inv-dev-item-${sNo}`,
      invoiceItemId: `inv-item-ref-${sNo}`,
      deviceId,
      imei,
      serialNumber: `SN-APL13-${String(1000 + sNo)}`,
      brand: 'Apple',
      model: 'iPhone 13',
      storage: '128 GB',
      productType: 'Refurbished Mobiles',
      hsnCode: '8517',
      purchaseCost: unitPurchaseCost,
      repairCost: 0,
      otherCost: 0,
      totalCost: unitPurchaseCost,
      sellingPrice: unitSellingPrice,
      discount: 0,
      netSaleValue: unitSellingPrice,
      grossProfit: 100, // Strictly Device-Level Gross Profit (sellingPrice - totalCost)
      grossProfitMarginPercent: 0.37,
      marginValue: 100,
      taxableMargin: unitTaxableMargin,
      taxAmount: unitIgstAmount,
      exemptedAmount: unitPurchaseCost,
    };

    items.push({
      id: `inv-item-ref-${sNo}`,
      invoiceId: 'inv-ref-097',
      sNo,
      productName: 'Apple iPhone 13',
      storage: '128 GB',
      imei,
      productType: 'Refurbished Mobiles',
      hsnCode: '8517',
      quantity: 1,
      unitPrice: unitSellingPrice,
      discount: 0,
      taxableValue: unitTaxableMargin,
      igstRate: 18,
      igstAmount: unitIgstAmount,
      totalTax: unitIgstAmount,
      amount: unitSellingPrice,
      devices: [deviceRecord],
    });
  }

  return {
    id: 'inv-ref-097',
    invoiceNumber: 'TR/26-27/097',
    invoiceDate: '03-Sep-2026',
    dueDate: '03-Sep-2026',
    billingMode: 'MARGIN_SCHEME',
    status: 'PAID',
    isFinalized: true,
    finalizedAt: '2026-09-03T14:30:00Z',
    finalizedBy: 'Ashim Chakraborty (Authorized Signatory)',
    seller: DEFAULT_SELLER_PROFILE,
    buyer: DEFAULT_BUYER_PROFILE,
    placeOfSupply: 'Haryana (06)',
    isInterState: true,
    items,
    totalQuantity: 80,
    subtotal: 2168000,
    itemDiscountsTotal: 0,
    invoiceDiscount: 0,
    totalDiscount: 0,
    taxableAmount: 8000, // 80 units * Rs. 100
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 1440, // 18% of Rs. 8,000 = Rs. 1,440
    totalTax: 1440,
    exemptedAmountMarginScheme: 2160000, // 80 units * Rs. 27,000 purchase cost
    totalAmount: 2168000,
    depositReceived: 2168000,
    netPayableTotal: 2168000,
    balanceDue: 0,
    taxPolicyVersion: 'GST-RULE-32-5-v2',
    termsAndConditions: DEFAULT_INVOICE_TERMS,
    notes: 'Reference Demo Design Tax Invoice TR/26-27/097. 80 units Apple iPhone 13 128 GB Refurbished Mobiles billed under Margin Scheme Rule 32(5) CGST.',
    payments: [
      {
        id: 'pay-ref-001',
        invoiceId: 'inv-ref-097',
        invoiceNumber: 'TR/26-27/097',
        customerId: 'cust-radical-haryana',
        customerName: 'RADICAL AFTERMARKET SERVICES PRIVATE LIMITED',
        amount: 2168000,
        method: 'BANK_TRANSFER',
        status: 'PAID',
        date: '03-Sep-2026',
        reference: 'HDFCR98204928104',
        notes: 'Full payment received via RTGS into Nassgreen Tech Solutions account.',
        createdAt: '2026-09-03T14:45:00Z',
      },
    ],
    eInvoice: {
      irn: '4f29a0b1820498acde83019fba20384918e9a28b84931a89c0291e0a84931a89',
      ackNo: '1126108492019',
      ackDate: '03-Sep-2026 14:32:00',
      signedQrCode: 'TR-EINVOICE-QR:IRN=4f29a0b1820498acde83019fba20384918e9a28b84931a89c0291e0a84931a89:GSTIN=19AAKCN5564D1Z7:BUYER=06AAJCR2110E1ZX:VAL=2168000:TAX=1440',
      status: 'GENERATED',
    },
    eWayBill: {
      ewayBillNo: '241890284910',
      validUpto: '07-Sep-2026 23:59:59',
      distanceKm: 1480,
      vehicleNumber: 'WB 26 F 9821',
      transporterId: '19TRP1029481Z2',
      transporterName: 'BlueDart Surface Logistics',
      status: 'ACTIVE',
    },
    createdAt: '2026-09-03T14:10:00Z',
    updatedAt: '2026-09-03T14:45:00Z',
  };
}

export const REFERENCE_INVOICE_097: Invoice = generateReference80UnitsInvoice();

export const INITIAL_INVOICES: Invoice[] = [
  REFERENCE_INVOICE_097,
];

export const INITIAL_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'so-2026-0089',
    orderNumber: 'SO-2026-0089',
    customerId: 'cust-radical-haryana',
    customerName: 'Radical Aftermarket Lead',
    businessName: 'RADICAL AFTERMARKET SERVICES PRIVATE LIMITED',
    orderDate: '03-Sep-2026',
    status: 'INVOICED',
    totalAmount: 2168000,
    totalCost: 2160000,
    totalGrossProfit: 8000,
    invoiceId: 'inv-ref-097',
    invoiceNumber: 'TR/26-27/097',
    notes: '80 units of Apple iPhone 13 128 GB Refurbished Mobiles.',
    items: [
      {
        id: 'so-item-89-1',
        salesOrderId: 'so-2026-0089',
        deviceId: 'refurb-dev-80-001',
        imei: '354326132032922',
        brand: 'Apple',
        model: 'iPhone 13',
        storage: '128 GB',
        color: 'Midnight',
        grade: 'GRADE_A',
        purchaseCost: 27000,
        repairCost: 0,
        otherCost: 0,
        totalCost: 27000,
        sellingPrice: 27100,
        grossProfit: 100,
        grossProfitMarginPercent: 0.37,
      },
    ],
    createdAt: '2026-09-03T11:00:00Z',
    updatedAt: '2026-09-03T14:30:00Z',
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-2026-001',
    invoiceId: 'inv-ref-097',
    invoiceNumber: 'TR/26-27/097',
    customerId: 'cust-radical-haryana',
    customerName: 'RADICAL AFTERMARKET SERVICES PRIVATE LIMITED',
    amount: 2168000,
    method: 'BANK_TRANSFER',
    status: 'PAID',
    date: '03-Sep-2026',
    reference: 'HDFCR98204928104',
    notes: 'Full deposit received via RTGS into Nassgreen Tech Solutions account.',
    recordedBy: 'Ashim Chakraborty',
    createdAt: '2026-09-03T14:45:00Z',
  },
];

export const INITIAL_CREDIT_NOTES: CreditNote[] = [];
export const INITIAL_DEBIT_NOTES: DebitNote[] = [];
