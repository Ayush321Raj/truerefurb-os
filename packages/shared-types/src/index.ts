/* =========================================================================
   TrueRefurb OS — Production RBAC, Data Scope, Approval & Audit Types
   ========================================================================= */

// 1. System-Level Roles (17 Enterprise Roles)
export type SystemRole =
  | 'SUPER_ADMIN'         // Full platform / company configuration
  | 'TENANT_ADMIN'        // Full tenant / organization administration
  | 'OPERATIONS_MANAGER'  // Cross-module daily operations
  | 'FINANCE_MANAGER'     // Billing, payments, GST, margin reconciliation
  | 'INVENTORY_MANAGER'   // Stock & warehouse authority
  | 'PROCUREMENT_MANAGER' // Purchasing & sourcing
  | 'DIAGNOSTICS_LEAD'    // Hardware testing templates & threshold authority
  | 'REPAIR_TECHNICIAN'   // Repair bench execution (Assigned WOs)
  | 'QA_SUPERVISOR'       // Quality approval, grade overrides & certification
  | 'QA_INSPECTOR'        // Inspection, checklist & optical grading
  | 'SALES_MANAGER'       // B2B/B2C sales, discounts & pricing approval
  | 'SALES_EXECUTIVE'     // Customer/order operations (Own customers)
  | 'ECOMMERCE_MANAGER'   // Marketplace listings (Amazon, Back Market, eBay)
  | 'WAREHOUSE_CLERK'     // Receiving, IMEI scanning, bin putaway, dispatch
  | 'CUSTOMER_SUPPORT'    // Customer RMA and ticket operations
  | 'SUPPLIER'            // External portal: Own purchase orders & lots
  | 'CUSTOMER_BUYER'      // External portal: Own orders & devices
  | 'AUDITOR';            // Read-only compliance & tamper verification

export type UserRole = SystemRole;

// 2. Controlled Device Status Enum (No arbitrary text allowed)
export type DeviceStatus =
  | 'PURCHASED'         // Inbound PO issued, awaiting dock receipt
  | 'RECEIVED'          // Physically docked & cataloged in receiving bay
  | 'REPAIR_REQUIRED'   // Hardware fault identified, staged on technician bench
  | 'READY_TO_SELL'     // Tested, cleaned, graded & available in warehouse stock
  | 'RESERVED'          // Allocated for pending B2B sales order or channel cart
  | 'SOLD'              // Invoice settled & dispatched to buyer
  | 'RETURNED'          // Customer RMA return awaiting re-inspection
  | 'SCRAPPED';         // Unviable repair; harvested for OEM spare components

export const CONTROLLED_DEVICE_STATUSES: Array<{
  status: DeviceStatus;
  label: string;
  badgeClass: string;
  color: string;
  description: string;
}> = [
  { status: 'PURCHASED', label: 'Purchased', badgeClass: 'stage-pill-intake', color: '#94a3b8', description: 'Inbound PO issued, awaiting dock delivery' },
  { status: 'RECEIVED', label: 'Received', badgeClass: 'stage-pill-diagnostics', color: '#38bdf8', description: 'Docked & checked into receiving area' },
  { status: 'REPAIR_REQUIRED', label: 'Repair Required', badgeClass: 'stage-pill-repair', color: '#f43f5e', description: 'Active on bench for component rework' },
  { status: 'READY_TO_SELL', label: 'Ready to Sell', badgeClass: 'stage-pill-ready', color: '#10b981', description: 'Certified & in-stock across warehouse bays' },
  { status: 'RESERVED', label: 'Reserved', badgeClass: 'stage-pill-repair', color: '#f59e0b', description: 'Locked for confirmed customer purchase order' },
  { status: 'SOLD', label: 'Sold', badgeClass: 'stage-pill-diagnostics', color: '#0284c7', description: 'Dispatched to retail buyer or B2B partner' },
  { status: 'RETURNED', label: 'Returned', badgeClass: 'stage-pill-repair', color: '#ec4899', description: 'Under RMA inspection & triage' },
  { status: 'SCRAPPED', label: 'Scrapped', badgeClass: 'grade-badge-parts', color: '#64748b', description: 'Harvested for OEM spare components' },
];

// 3. Brand, Model & Variant Master Entities
export interface Brand {
  id: string;
  name: string;
  code: string; // e.g. "APL", "SAM", "GOOG", "LEN"
  logoUrl?: string;
  isActive: boolean;
}

export interface DeviceModel {
  id: string;
  brandId: string;
  brandName: string;
  name: string; // e.g. "iPhone 15 Pro", "Galaxy S24 Ultra", "ThinkPad X1"
  category: DeviceCategory;
  releaseYear?: number;
}

export interface DeviceVariant {
  id: string;
  modelId: string;
  name: string; // e.g. "256GB / 8GB RAM / Natural Titanium"
  storage: string;
  ram: string;
  color: string;
  sku: string;
}

// 4. Core Device Master Entity
export interface DeviceMaster {
  id: string;                    // Internal UUID (NOT IMEI)
  organizationId: string;        // Multi-tenant organization

  imei1: string;                 // Validated 15-digit IMEI
  imei2?: string;                // Optional validated secondary 15-digit IMEI
  serialNumber: string;          // Manufacturer serial number (unique)

  brand: string;                 // Brand name (Apple, Samsung, etc.)
  brandId?: string;
  model: string;                 // Model name (iPhone 15 Pro, etc.)
  modelId?: string;
  variant?: string;              // Variant specs name
  variantId?: string;

  storage: string;               // e.g. 128GB, 256GB, 512GB, 1TB
  ram: string;                   // e.g. 8GB, 12GB, 16GB, 36GB
  color: string;                 // Finish / Color

  condition: string;             // e.g. "Original OEM", "Refurbished Bench Pass"
  grade: ConditionGrade;         // Grade A+, Grade A, Grade B, Grade C, Grade D, Parts

  batteryHealth: number;         // 0 - 100 percentage

  purchaseCost: number;          // Acquisition price
  repairCost: number;            // Parts & bench rework cost
  otherCost: number;             // Detailing, shipping, logistics cost
  totalCost: number;             // Purchase + Repair + Other
  sellingPrice: number;          // Target / Listed selling price

  status: DeviceStatus;          // Controlled DeviceStatus enum
  currentLocation: string;       // e.g. "Kolkata Main Warehouse - A01", "Bay 3 - Shelf A4"
  warehouseId?: string;          // Warehouse foreign key
  warehouseName?: string;        // e.g. "Kolkata Main Warehouse"
  locationId?: string;           // Location foreign key
  locationCode?: string;         // e.g. "A01", "A02", "B01", "B02"
  vendorId?: string;             // Sourcing vendor ID
  vendorName?: string;           // e.g. "ABC Mobiles"
  purchaseOrderId?: string;      // Inbound PO reference
  notes?: string;

  createdAt: string;
  updatedAt: string;

  // Optional legacy fields for backward compatibility with operational pipeline
  stage?: WorkflowStage;
  make?: string;
  category?: DeviceCategory;
  conditionGrade?: ConditionGrade;
  functionalScore?: number;
  acquisitionCost?: number;
  targetResalePrice?: number;
  sourceLot?: string;
  source?: string;
  warehouseBay?: string;
  warehouseLocation?: string;
  assignedTechnician?: string;
  repairs?: any[];
  estimatedMargin?: number;
  diagnosticReport?: any;
  intakeDate?: string;
  activeChannels?: string[];
  binNumber?: string;
  imei?: string;
}

// Backwards compatibility alias
export type DeviceItem = DeviceMaster;

// =========================================================================
// Multi-Warehouse & Inventory Location Architecture
// =========================================================================
export interface Warehouse {
  id: string;
  code: string;            // e.g. "WH-KOL-01", "WH-DEL-02"
  name: string;            // e.g. "Kolkata Main Warehouse"
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  totalLocations?: number;
  totalDevices?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLocation {
  id: string;
  warehouseId: string;
  warehouseName?: string;
  code: string;            // e.g. "A01", "A02", "B01", "B02"
  zone: string;            // e.g. "Zone A", "Zone B", "Intake Dock"
  aisle?: string;          // e.g. "Aisle 1"
  shelf?: string;          // e.g. "Shelf 2"
  bin?: string;            // e.g. "Bin 04"
  description?: string;    // e.g. "Fast-Moving Grade A Smartphones"
  isActive: boolean;
  deviceCount?: number;
  capacity?: number;
}

// =========================================================================
// Module 8: Vendor Management Entities
// =========================================================================
export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface Vendor {
  id: string;
  vendorName: string;      // Contact Person / Representative Name
  businessName: string;    // Registered Company / Trade Entity (e.g. "ABC Mobiles")
  phone: string;
  email: string;
  gstin: string;           // 15-character Indian GSTIN
  address: string;
  city: string;
  state: string;
  notes?: string;
  status: VendorStatus;
  totalPurchases: number;  // Aggregated purchase expenditure
  outstandingAmount: number; // Unsettled balance payable
  totalOrdersCount: number;
  createdAt: string;
  updatedAt: string;
}

// =========================================================================
// Module 9 & 10: Purchase Module & Purchase Workflow Entities
// =========================================================================
export type PurchaseStatus = 'DRAFT' | 'RECEIVED' | 'CANCELLED';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID';

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  brand: string;
  model: string;
  variant?: string;
  storage: string;
  ram?: string;
  color: string;
  imei1: string;           // 15-digit Luhn validated
  imei2?: string;          // Optional dual IMEI
  serialNumber?: string;
  cost: number;            // Acquisition price for this single device
  grade: ConditionGrade;
  condition: string;
  quantity: 1;             // Device-level entry (strictly 1 unit per IMEI)
  deviceId?: string;       // Linked DeviceMaster UUID
  isReceived: boolean;     // Receipt flag for warehouse dock entry
  receivedAt?: string;
  warehouseId?: string;    // Assigned warehouse upon receipt
  locationId?: string;     // Assigned bin/location (e.g. A01, A02)
  locationCode?: string;
}

export interface PurchaseOrder {
  id: string;
  vendorId: string;
  vendorName: string;
  businessName: string;
  purchaseDate: string;    // ISO Date string
  referenceNumber: string; // PO Number or Supplier Invoice Ref (e.g. "PO-2026-0084")
  paymentStatus: PaymentStatus;
  status: PurchaseStatus;  // DRAFT, RECEIVED, CANCELLED
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  items: PurchaseItem[];
  destinationWarehouseId?: string;
  destinationWarehouseName?: string;
  notes?: string;
  receivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// =========================================================================
// Module 11: Customer Management & Sales Entities
// =========================================================================
export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export interface Customer {
  id: string;
  name: string;            // Contact Person Name
  businessName: string;    // Business / Store / Entity Name (e.g. "Metro Refurb Store")
  phone: string;
  email: string;
  gstin?: string;          // GSTIN if B2B customer
  address: string;
  city: string;
  state: string;
  notes?: string;
  status: CustomerStatus;
  totalSales: number;      // Total lifetime sales generated
  outstandingAmount: number; // Balance due from customer
  invoicesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInvoiceItem {
  deviceId: string;
  imei: string;
  brand: string;
  model: string;
  storage: string;
  grade: string;
  sellingPrice: number;
  warrantyMonths: number;
}

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;   // e.g. "INV-2026-0042"
  customerId: string;
  customerName: string;
  businessName: string;
  invoiceDate: string;
  dueDate: string;
  paymentStatus: PaymentStatus;
  subtotal: number;
  taxAmount: number;       // GST (18%)
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  items: CustomerInvoiceItem[];
  notes?: string;
  createdAt: string;
}

export interface CustomerSaleRecord {
  id: string;
  customerId: string;
  invoiceId: string;
  invoiceNumber: string;
  deviceId: string;
  imei: string;
  brand: string;
  model: string;
  storage: string;
  grade: string;
  salePrice: number;
  saleDate: string;
  paymentStatus: PaymentStatus;
}

// =========================================================================
// Modules 12-15: Sales, Billing Engine, Margin Scheme & Payments
// =========================================================================

export type BillingMode = 'REGULAR_GST' | 'MARGIN_SCHEME';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CARD' | 'OTHER';
export type InvoiceStatus = 'DRAFT' | 'FINALIZED' | 'PAID' | 'PARTIAL' | 'CANCELLED';
export type SalesOrderStatus = 'DRAFT' | 'CONFIRMED' | 'INVOICED' | 'CANCELLED';

// Tax Policy for Margin Scheme (Rule 32(5) CGST)
export interface MarginTaxPolicy {
  policyVersion: string;             // e.g. "GST-RULE-32-5-v2"
  positiveMarginTaxable: boolean;    // true
  zeroMarginTaxable: boolean;        // false
  negativeMarginTaxable: boolean;    // false: Negative margin NOT converted to taxable profit
  taxRatePercent: number;            // Standard 18%
}

// Configurable Seller Info
export interface SellerProfile {
  legalName: string;
  businessName: string;
  address: string;
  gstin: string;
  state: string;
  stateCode: string;                 // e.g. "19" for West Bengal
  contactPhone: string;
  contactEmail: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
}

// Configurable Buyer Info
export interface BuyerProfile {
  name: string;
  businessName: string;
  address: string;
  gstin?: string;
  state: string;
  stateCode: string;                 // e.g. "07", "19", "27"
  phone?: string;
  email?: string;
}

// Serialized device within invoice item
export interface InvoiceItemDevice {
  id: string;
  invoiceItemId: string;
  deviceId: string;
  imei: string;
  imei2?: string;
  serialNumber?: string;
  brand: string;
  model: string;
  storage: string;
  color?: string;
  grade?: string;
  productType: string;               // "Refurbished"
  hsnCode: string;                   // "8517"
  
  // Financial & Margin Scheme Breakdown
  purchaseCost: number;              // Sourced from DeviceMaster.purchaseCost
  repairCost: number;                // DeviceMaster.repairCost
  otherCost: number;                 // DeviceMaster.otherCost
  totalCost: number;                 // purchaseCost + repairCost + otherCost
  sellingPrice: number;              // Sale value for this unit
  discount: number;                  // Item-level discount
  netSaleValue: number;              // sellingPrice - discount
  
  // Explicit device-level gross profit
  grossProfit: number;               // netSaleValue - totalCost (strictly Gross Profit)
  grossProfitMarginPercent: number;  // (grossProfit / netSaleValue) * 100

  // Margin Scheme Fields (Rule 32(5))
  marginValue: number;               // netSaleValue - purchaseCost
  taxableMargin: number;             // max(0, marginValue) if positive, 0 if negative
  taxAmount: number;                 // (taxableMargin * taxRate) / 100
  exemptedAmount: number;            // purchaseCost if margin scheme applied
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  sNo: number;
  productName: string;               // e.g. "iPhone 13"
  storage: string;                   // e.g. "128GB"
  imei: string;                      // Serialized primary IMEI
  productType: string;               // "Refurbished"
  hsnCode: string;                   // "8517"
  quantity: number;                  // Strictly 1 for serialized refurbished devices
  unitPrice: number;                 // Unit selling price
  discount: number;                  // Item-level discount
  taxableValue: number;              // Taxable base (unitPrice - discount in regular GST, or taxableMargin in margin scheme)
  cgstRate?: number;                 // Half of GST rate if intra-state
  cgstAmount?: number;
  sgstRate?: number;                 // Half of GST rate if intra-state
  sgstAmount?: number;
  igstRate?: number;                 // Full GST rate if inter-state
  igstAmount?: number;
  totalTax: number;
  amount: number;                    // Line total including tax
  devices?: InvoiceItemDevice[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;              // e.g. "TR/26-27/097"
  invoiceDate: string;
  dueDate: string;
  billingMode: BillingMode;           // REGULAR_GST or MARGIN_SCHEME (immutable once finalized)
  status: InvoiceStatus;
  isFinalized: boolean;               // Locked against arbitrary edits
  finalizedAt?: string;
  finalizedBy?: string;

  seller: SellerProfile;
  buyer: BuyerProfile;
  placeOfSupply: string;              // State name & code
  isInterState: boolean;              // seller.stateCode !== buyer.stateCode

  items: InvoiceItem[];
  totalQuantity: number;              // e.g. 80 units in reference invoice

  // Financial summary
  subtotal: number;
  itemDiscountsTotal: number;
  invoiceDiscount: number;            // Invoice-level discount
  totalDiscount: number;

  // Regular GST vs Margin Scheme Totals
  taxableAmount: number;              // Taxable turnover / margin
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;

  // Margin Scheme Specific Summary Fields (Demonstrated in Reference Invoice)
  exemptedAmountMarginScheme: number; // Sum of purchase costs exempted
  totalAmount: number;                // Total sale value (e.g. ₹21,68,000)
  depositReceived: number;            // Advance / deposit collected (e.g. ₹21,68,000)
  netPayableTotal: number;            // Final total after tax, discount, and deposit
  balanceDue: number;                 // Net balance pending

  // Policy & Reference
  taxPolicyVersion: string;
  notes?: string;
  templateId?: string;
  termsId?: string;
  termsAndConditions?: InvoiceTerms;

  // Payments log
  payments?: Payment[];

  // Compliance links
  salesOrderId?: string;
  creditNotes?: string[];
  debitNotes?: string[];
  eInvoice?: EInvoice;
  eWayBill?: EWayBill;

  createdAt: string;
  updatedAt: string;
}

export interface SalesOrderItem {
  id: string;
  salesOrderId: string;
  deviceId: string;
  imei: string;
  brand: string;
  model: string;
  storage: string;
  color: string;
  grade: ConditionGrade;
  purchaseCost: number;
  repairCost: number;
  otherCost: number;
  totalCost: number;
  sellingPrice: number;
  grossProfit: number;               // sellingPrice - totalCost
  grossProfitMarginPercent: number;  // (grossProfit / sellingPrice) * 100
}

export interface SalesOrder {
  id: string;
  orderNumber: string;               // e.g. "SO-2026-0045"
  customerId: string;
  customerName: string;
  businessName: string;
  orderDate: string;
  status: SalesOrderStatus;          // DRAFT, CONFIRMED, INVOICED, CANCELLED
  items: SalesOrderItem[];
  totalAmount: number;
  totalCost: number;
  totalGrossProfit: number;          // Cumulative device-level gross profit
  invoiceId?: string;
  invoiceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;             // CASH, BANK_TRANSFER, UPI, CARD, OTHER
  status: 'PENDING' | 'PARTIAL' | 'PAID';
  date: string;
  reference: string;                 // Bank transaction ref / UTR / Check #
  notes?: string;
  recordedBy?: string;
  createdAt: string;
}

export interface CreditNoteItem {
  id: string;
  creditNoteId: string;
  invoiceItemId?: string;
  deviceId?: string;
  imei?: string;
  productName: string;
  reason: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface CreditNote {
  id: string;
  noteNumber: string;                // e.g. "CN-2026-0012"
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  reason: 'SALES_RETURN' | 'PRICE_REDUCTION' | 'POST_SALE_DISCOUNT' | 'DEFICIENCY_OF_SERVICE';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  items: CreditNoteItem[];
  status: 'ISSUED' | 'APPLIED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

export interface DebitNoteItem {
  id: string;
  debitNoteId: string;
  invoiceItemId?: string;
  deviceId?: string;
  imei?: string;
  productName: string;
  reason: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface DebitNote {
  id: string;
  noteNumber: string;                // e.g. "DN-2026-0008"
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  reason: 'PRICE_REVISION_UP' | 'EXTRA_SERVICE' | 'SUPPLEMENTAL_EXPENSE';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  items: DebitNoteItem[];
  status: 'ISSUED' | 'APPLIED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

export interface EInvoice {
  irn: string;                       // Invoice Reference Number (64-char SHA256)
  ackNo: string;                     // Acknowledgement Number
  ackDate: string;
  signedQrCode: string;              // Signed cryptographic QR payload string
  status: 'GENERATED' | 'CANCELLED' | 'PENDING';
  errorDetails?: string;
}

export interface EWayBill {
  ewayBillNo: string;                // 12-digit e-way bill number
  validUpto: string;
  distanceKm: number;
  vehicleNumber: string;
  transporterId: string;
  transporterName: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

export interface InvoiceTerms {
  id: string;
  name: string;
  warrantyPeriodText: string;
  warrantyVoidConditions: string[];
  tamperingPolicy: string;
  liquidPhysicalDamagePolicy: string;
  computerGeneratedNotice: string;
  returnPolicy: string;
  isDefault: boolean;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  headerTitle: string;
  sellerDetails: SellerProfile;
  terms: InvoiceTerms;
  showHsnSummary: boolean;
  showMarginSchemeExemption: boolean;
  isDefault: boolean;
}

// 5. Data Scope Hierarchy
export type DataScopeType =
  | 'GLOBAL'      // Cross-tenant platform level (Super Admin)
  | 'TENANT'      // Entire organization/tenant (Tenant Admin, Ops)
  | 'REGION'      // Regional hubs
  | 'WAREHOUSE'   // Specific facility (e.g. Austin Hub #04)
  | 'DEPARTMENT'  // Specific functional dept (e.g. Repair Bench, QA)
  | 'TEAM'        // Specific squad/shift
  | 'ASSIGNED'    // Only records specifically assigned to user
  | 'OWN';        // Only records created by or belonging to user

export interface UserDataScope {
  scopeType: DataScopeType;
  tenantId: string;
  facilityId?: string;
  warehouseId?: string;
  departmentId?: string;
  assignedIds?: string[];
}

// 6. Granular Action Permissions
export type GranularPermission =
  // Device Master & Inventory
  | 'device.read'
  | 'device.create'
  | 'device.update'
  | 'device.delete'
  | 'device.change_status'
  | 'device.move_location'
  | 'device.sell'
  | 'device.imei.correct'
  | 'device.grade.assign'
  | 'device.grade.override'
  | 'device.passport.export'
  // TrueDiag
  | 'diagnostic.run'
  | 'diagnostic.create_template'
  | 'diagnostic.configure_threshold'
  | 'diagnostic.approve'
  // Repair
  | 'repair.read'
  | 'repair.create'
  | 'repair.update'
  | 'repair.complete'
  | 'repair.parts_consume'
  // QA & Grading
  | 'qa.inspect'
  | 'qa.approve'
  | 'qa.reject'
  | 'qa.certify'
  | 'qa.override_standard'
  // TrueScore
  | 'truescore.read'
  | 'truescore.recalculate'
  | 'truescore.finalize'
  // Inventory & Warehouse
  | 'inventory.read'
  | 'inventory.receive'
  | 'inventory.transfer'
  | 'inventory.adjust'
  | 'inventory.reserve'
  | 'inventory.valuation.read'
  // Procurement & TrueBid
  | 'procurement.read'
  | 'procurement.create_po'
  | 'procurement.approve_po'
  | 'truebid.participate'
  | 'truebid.manage'
  // Listings & E-Commerce
  | 'listing.read'
  | 'listing.create'
  | 'listing.update'
  | 'listing.sync_marketplace'
  | 'listing.price_override'
  // Orders & Sales
  | 'order.read'
  | 'order.create'
  | 'order.update'
  | 'order.cancel'
  | 'order.discount.approve'
  // Finance & GST
  | 'invoice.read'
  | 'invoice.create'
  | 'invoice.post'
  | 'invoice.cancel'
  | 'payment.create'
  | 'refund.create'
  | 'refund.approve'
  | 'finance.gst_report.read'
  // Warranty & RMA
  | 'rma.read'
  | 'rma.create'
  | 'rma.approve'
  | 'rma.reject'
  | 'warranty.validate'
  | 'warranty.exception.approve'
  // User & Roles
  | 'user.read'
  | 'user.create'
  | 'user.update'
  | 'user.role_change'
  | 'user.disable'
  | 'role.manage'
  // Approvals & Audit
  | 'approval.request'
  | 'approval.review'
  | 'audit.read'
  | 'audit.export'
  // AI Agents
  | 'ai.invoke'
  | 'ai.policy.configure'
  | 'ai.approve_action';

export type Permission = GranularPermission;

export const ROLE_PERMISSIONS: Record<SystemRole, GranularPermission[]> = {
  SUPER_ADMIN: [
    'device.read', 'device.create', 'device.update', 'device.delete', 'device.imei.correct', 'device.grade.assign', 'device.grade.override', 'device.passport.export',
    'diagnostic.run', 'diagnostic.create_template', 'diagnostic.configure_threshold', 'diagnostic.approve',
    'repair.read', 'repair.create', 'repair.update', 'repair.complete', 'repair.parts_consume',
    'qa.inspect', 'qa.approve', 'qa.reject', 'qa.certify', 'qa.override_standard',
    'truescore.read', 'truescore.recalculate', 'truescore.finalize',
    'inventory.read', 'inventory.receive', 'inventory.transfer', 'inventory.adjust', 'inventory.reserve', 'inventory.valuation.read',
    'procurement.read', 'procurement.create_po', 'procurement.approve_po', 'truebid.participate', 'truebid.manage',
    'listing.read', 'listing.create', 'listing.update', 'listing.sync_marketplace', 'listing.price_override',
    'order.read', 'order.create', 'order.update', 'order.cancel', 'order.discount.approve',
    'invoice.read', 'invoice.create', 'invoice.post', 'invoice.cancel', 'payment.create', 'refund.create', 'refund.approve', 'finance.gst_report.read',
    'rma.read', 'rma.create', 'rma.approve', 'rma.reject', 'warranty.validate', 'warranty.exception.approve',
    'user.read', 'user.create', 'user.update', 'user.role_change', 'user.disable', 'role.manage',
    'approval.request', 'approval.review', 'audit.read', 'audit.export',
    'ai.invoke', 'ai.policy.configure', 'ai.approve_action'
  ],
  TENANT_ADMIN: [
    'device.read', 'device.create', 'device.update', 'device.imei.correct', 'device.grade.assign', 'device.grade.override', 'device.passport.export',
    'diagnostic.run', 'diagnostic.create_template', 'diagnostic.configure_threshold', 'diagnostic.approve',
    'repair.read', 'repair.create', 'repair.update', 'repair.complete', 'repair.parts_consume',
    'qa.inspect', 'qa.approve', 'qa.reject', 'qa.certify', 'qa.override_standard',
    'truescore.read', 'truescore.recalculate', 'truescore.finalize',
    'inventory.read', 'inventory.receive', 'inventory.transfer', 'inventory.adjust', 'inventory.reserve', 'inventory.valuation.read',
    'procurement.read', 'procurement.create_po', 'procurement.approve_po', 'truebid.participate', 'truebid.manage',
    'listing.read', 'listing.create', 'listing.update', 'listing.sync_marketplace', 'listing.price_override',
    'order.read', 'order.create', 'order.update', 'order.cancel', 'order.discount.approve',
    'invoice.read', 'invoice.create', 'invoice.post', 'invoice.cancel', 'payment.create', 'refund.create', 'refund.approve', 'finance.gst_report.read',
    'rma.read', 'rma.create', 'rma.approve', 'rma.reject', 'warranty.validate', 'warranty.exception.approve',
    'user.read', 'user.create', 'user.update', 'user.disable',
    'approval.request', 'approval.review', 'audit.read', 'audit.export',
    'ai.invoke', 'ai.approve_action'
  ],
  OPERATIONS_MANAGER: [
    'device.read', 'device.create', 'device.update', 'device.passport.export',
    'diagnostic.run', 'diagnostic.approve',
    'repair.read', 'repair.create', 'repair.update',
    'qa.inspect', 'truescore.read', 'truescore.recalculate',
    'inventory.read', 'inventory.receive', 'inventory.transfer', 'inventory.adjust', 'inventory.valuation.read',
    'procurement.read', 'procurement.create_po', 'procurement.approve_po',
    'listing.read', 'listing.sync_marketplace',
    'order.read', 'order.update',
    'invoice.read', 'rma.read', 'rma.approve',
    'approval.request', 'approval.review', 'audit.read', 'ai.invoke'
  ],
  FINANCE_MANAGER: [
    'device.read', 'inventory.valuation.read', 'order.read',
    'invoice.read', 'invoice.create', 'invoice.post', 'invoice.cancel',
    'payment.create', 'refund.create', 'refund.approve', 'finance.gst_report.read',
    'approval.request', 'approval.review', 'audit.read'
  ],
  INVENTORY_MANAGER: [
    'device.read', 'device.create',
    'inventory.read', 'inventory.receive', 'inventory.transfer', 'inventory.adjust', 'inventory.reserve', 'inventory.valuation.read',
    'order.read', 'listing.read',
    'approval.request', 'approval.review', 'audit.read'
  ],
  PROCUREMENT_MANAGER: [
    'device.read', 'device.create',
    'procurement.read', 'procurement.create_po', 'procurement.approve_po',
    'truebid.participate', 'truebid.manage',
    'inventory.read', 'inventory.receive',
    'approval.request', 'approval.review', 'audit.read'
  ],
  DIAGNOSTICS_LEAD: [
    'device.read', 'device.create',
    'diagnostic.run', 'diagnostic.create_template', 'diagnostic.configure_threshold', 'diagnostic.approve',
    'truescore.read', 'truescore.recalculate',
    'repair.read', 'qa.inspect',
    'approval.request', 'audit.read'
  ],
  REPAIR_TECHNICIAN: [
    'device.read',
    'diagnostic.run',
    'repair.read', 'repair.create', 'repair.update', 'repair.complete', 'repair.parts_consume',
    'truescore.read',
    'approval.request', 'audit.read'
  ],
  QA_SUPERVISOR: [
    'device.read', 'device.grade.assign', 'device.grade.override', 'device.passport.export',
    'diagnostic.run', 'diagnostic.approve',
    'repair.read',
    'qa.inspect', 'qa.approve', 'qa.reject', 'qa.certify', 'qa.override_standard',
    'truescore.read', 'truescore.finalize',
    'approval.request', 'approval.review', 'audit.read'
  ],
  QA_INSPECTOR: [
    'device.read', 'device.grade.assign',
    'diagnostic.run',
    'qa.inspect', 'qa.reject',
    'truescore.read',
    'approval.request', 'audit.read'
  ],
  SALES_MANAGER: [
    'device.read', 'inventory.read',
    'listing.read', 'listing.price_override',
    'order.read', 'order.create', 'order.update', 'order.cancel', 'order.discount.approve',
    'invoice.read', 'truescore.read',
    'approval.request', 'approval.review', 'audit.read'
  ],
  SALES_EXECUTIVE: [
    'device.read', 'inventory.read',
    'order.read', 'order.create', 'order.update',
    'invoice.read', 'truescore.read',
    'approval.request'
  ],
  ECOMMERCE_MANAGER: [
    'device.read', 'inventory.read',
    'listing.read', 'listing.create', 'listing.update', 'listing.sync_marketplace',
    'order.read', 'order.update',
    'truescore.read',
    'approval.request', 'audit.read'
  ],
  WAREHOUSE_CLERK: [
    'device.read', 'device.create', 'device.update', 'device.move_location', 'device.change_status',
    'inventory.read', 'inventory.receive', 'inventory.transfer', 'inventory.adjust', 'inventory.reserve',
    'order.read', 'audit.read', 'approval.request'
  ],
  CUSTOMER_SUPPORT: [
    'device.read', 'order.read', 'rma.read', 'rma.create', 'warranty.validate', 'approval.request'
  ],
  SUPPLIER: [
    'device.read', 'procurement.read', 'procurement.create_po', 'order.read', 'audit.read'
  ],
  CUSTOMER_BUYER: [
    'device.read', 'order.read', 'order.create', 'order.update', 'invoice.read', 'approval.request'
  ],
  AUDITOR: [
    'device.read', 'inventory.read', 'order.read', 'invoice.read', 'audit.read', 'audit.export', 'approval.review'
  ]
};

// 7. Approval Engine
export type ApprovalTransactionType =
  | 'STOCK_ADJUSTMENT'
  | 'PURCHASE_ORDER'
  | 'HIGH_VALUE_PURCHASE'
  | 'REPAIR_COMPLETION'
  | 'GRADE_OVERRIDE'
  | 'PRICE_OVERRIDE'
  | 'HIGH_DISCOUNT'
  | 'REFUND_DISBURSEMENT'
  | 'CREDIT_NOTE'
  | 'WARRANTY_EXCEPTION'
  | 'USER_ROLE_CHANGE'
  | 'IMEI_CORRECTION'
  | 'INVOICE_CANCELLATION'
  | 'AI_AGENT_HIGH_RISK_ACTION';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface ApprovalRequest {
  id: string;
  transactionType: ApprovalTransactionType;
  title: string;
  entityType: 'DEVICE' | 'INVENTORY' | 'ORDER' | 'INVOICE' | 'USER' | 'REPAIR';
  entityId: string;
  makerId: string;
  makerName: string;
  makerRole: SystemRole;
  approverRole: SystemRole;
  approverId?: string;
  approverName?: string;
  status: ApprovalStatus;
  urgency: 'ROUTINE' | 'HIGH' | 'CRITICAL';
  oldValue?: string;
  newValue?: string;
  justification: string;
  reviewComment?: string;
  createdAt: string;
  reviewedAt?: string;
  metadata?: Record<string, any>;
}

// 8. Immutable Audit Event
export interface AuditLogEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: SystemRole;
  tenantId: string;
  facilityId: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  approvalId?: string;
  ipAddress: string;
  timestamp: string;
  tamperSealHash: string;
}

// 9. TrueScore Breakdown
export interface TrueScoreBreakdown {
  overallScore: number;
  diagnosticScore: number;
  cosmeticGradeScore: number;
  batteryHealthScore: number;
  repairIntegrityScore: number;
  partsOriginalityScore: number;
  lifecycleAgeScore: number;
  calculatedAt: string;
  finalizedBy: string;
  isLocked: boolean;
}

// 10. Device Passport
export interface DevicePassport {
  deviceId: string;
  imei: string;
  serialNumber: string;
  make: string;
  model: string;
  storage: string;
  color: string;
  lifecycleStage: string;
  trueScore: TrueScoreBreakdown;
  assignedTechnician?: string;
  qaSupervisor?: string;
  firstIntakeDate: string;
  warrantyStatus: 'ACTIVE' | 'EXPIRED' | 'CLAIM_PENDING' | 'VOIDED';
  chainOfCustody: Array<{
    stage: string;
    actor: string;
    timestamp: string;
    notes?: string;
  }>;
}

// 11. Auth Models
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: SystemRole;
  badgeId?: string;
  tenantId: string;
  facilityId: string;
  dataScope: UserDataScope;
  permissions: GranularPermission[];
  avatarUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

// 12. General Domain Types
export type DeviceCategory = 
  | 'SMARTPHONE'
  | 'LAPTOP'
  | 'TABLET'
  | 'SMARTWATCH'
  | 'AUDIO'
  | 'DESKTOP';

export type ConditionGrade = 
  | 'GRADE_A_PLUS'  // Pristine / Like New
  | 'GRADE_A'       // Excellent
  | 'GRADE_B'       // Good
  | 'GRADE_C'       // Fair
  | 'GRADE_D'       // Heavy wear
  | 'PARTS_ONLY';   // Harvest / Salvage

export type WorkflowStage =
  | 'INTAKE'
  | 'DIAGNOSTICS'
  | 'REPAIR_BENCH'
  | 'CLEANING_POLISH'
  | 'QA_INSPECTION'
  | 'PACKAGING'
  | 'READY_FOR_SALE'
  | 'LISTED'
  | 'SOLD'
  | 'RETURNED';

export type FunctionalStatus = 'PASSED' | 'FAILED' | 'ATTENTION_REQUIRED' | 'UNTESTED';

export interface DiagnosticCheckItem {
  id: string;
  name: string;
  category: 'DISPLAY' | 'BATTERY' | 'CAMERA' | 'CONNECTIVITY' | 'AUDIO' | 'SENSORS' | 'HOUSING';
  status: FunctionalStatus;
  score: number;
  notes?: string;
  measuredValue?: string;
}

export interface DiagnosticReport {
  id: string;
  deviceId: string;
  technicianId: string;
  technicianName: string;
  batteryHealthPercent: number;
  batteryCycleCount: number;
  screenCondition: 'FLAWLESS' | 'MICRO_SCRATCH' | 'DEEP_SCRATCH' | 'REPLACED_OEM';
  functionalScore: number;
  allPassed: boolean;
  checklist: DiagnosticCheckItem[];
  completedAt: string;
}

export interface RepairRecord {
  id: string;
  deviceId: string;
  technicianName: string;
  issueDescription: string;
  actionTaken: string;
  partsReplaced: Array<{
    partName: string;
    partSku: string;
    cost: number;
  }>;
  laborMinutes: number;
  totalRepairCost: number;
  completedAt: string;
}

export interface RefurbMetrics {
  totalUnitsInPipeline: number;
  avgTurnaroundHours: number;
  yieldRatePercent: number;
  readyInventoryValue: number;
  activeWorkOrders: number;
  reworkRatePercent: number;
  gradeDistribution: Record<ConditionGrade, number>;
  stageBreakdown: Record<WorkflowStage, number>;
}
