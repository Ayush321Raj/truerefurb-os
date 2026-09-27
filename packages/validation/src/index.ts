import { z } from 'zod';

export const SystemRoleEnum = z.enum([
  'SUPER_ADMIN',
  'TENANT_ADMIN',
  'OPERATIONS_MANAGER',
  'FINANCE_MANAGER',
  'INVENTORY_MANAGER',
  'PROCUREMENT_MANAGER',
  'DIAGNOSTICS_LEAD',
  'REPAIR_TECHNICIAN',
  'QA_SUPERVISOR',
  'QA_INSPECTOR',
  'SALES_MANAGER',
  'SALES_EXECUTIVE',
  'ECOMMERCE_MANAGER',
  'WAREHOUSE_CLERK',
  'CUSTOMER_SUPPORT',
  'SUPPLIER',
  'CUSTOMER_BUYER',
  'AUDITOR',
]);

export const DataScopeEnum = z.enum([
  'GLOBAL',
  'TENANT',
  'REGION',
  'WAREHOUSE',
  'DEPARTMENT',
  'TEAM',
  'ASSIGNED',
  'OWN',
]);

export const ApprovalTransactionTypeEnum = z.enum([
  'STOCK_ADJUSTMENT',
  'PURCHASE_ORDER',
  'HIGH_VALUE_PURCHASE',
  'REPAIR_COMPLETION',
  'GRADE_OVERRIDE',
  'PRICE_OVERRIDE',
  'HIGH_DISCOUNT',
  'REFUND_DISBURSEMENT',
  'CREDIT_NOTE',
  'WARRANTY_EXCEPTION',
  'USER_ROLE_CHANGE',
  'IMEI_CORRECTION',
  'INVOICE_CANCELLATION',
  'AI_AGENT_HIGH_RISK_ACTION',
]);

export const CreateApprovalRequestSchema = z.object({
  transactionType: ApprovalTransactionTypeEnum,
  title: z.string().min(5, 'Title must be at least 5 characters'),
  entityType: z.enum(['DEVICE', 'INVENTORY', 'ORDER', 'INVOICE', 'USER', 'REPAIR']),
  entityId: z.string().min(1, 'Entity ID is required'),
  justification: z.string().min(10, 'A clear business justification is mandatory for approvals'),
  urgency: z.enum(['ROUTINE', 'HIGH', 'CRITICAL']).default('ROUTINE'),
  oldValue: z.string().optional(),
  newValue: z.string().optional(),
});

export const ReviewApprovalSchema = z.object({
  action: z.enum(['APPROVED', 'REJECTED']),
  comment: z.string().min(3, 'Review comment or reason is required'),
});

export const ImeiCorrectionSchema = z.object({
  deviceId: z.string().min(1),
  currentImei: z.string().length(15, 'IMEI must be 15 digits'),
  correctedImei: z.string().length(15, 'Corrected IMEI must be 15 digits'),
  justification: z.string().min(15, 'Must provide detailed reason for physical IMEI correction'),
});

export const GradeOverrideSchema = z.object({
  deviceId: z.string().min(1),
  currentGrade: z.enum(['GRADE_A_PLUS', 'GRADE_A', 'GRADE_B', 'GRADE_C', 'GRADE_D', 'PARTS_ONLY']),
  proposedGrade: z.enum(['GRADE_A_PLUS', 'GRADE_A', 'GRADE_B', 'GRADE_C', 'GRADE_D', 'PARTS_ONLY']),
  justification: z.string().min(10, 'Optical justification required (e.g. microscratches polished or deep bezel ding)'),
});

export const StockAdjustmentSchema = z.object({
  sku: z.string().min(1),
  warehouseLocation: z.string().min(1),
  deltaQuantity: z.number().int().refine((val) => val !== 0, 'Adjustment delta cannot be zero'),
  reason: z.string().min(10, 'Discrepancy count explanation is required'),
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
  password: z.string().min(8),
  fullName: z.string().min(2),
  role: SystemRoleEnum.default('REPAIR_TECHNICIAN'),
  badgeId: z.string().optional(),
  facilityId: z.string().default('AUS-HUB-04'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a registered email address'),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Controlled Device Status Enum
export const DeviceStatusEnum = z.enum([
  'PURCHASED',
  'RECEIVED',
  'REPAIR_REQUIRED',
  'READY_TO_SELL',
  'RESERVED',
  'SOLD',
  'RETURNED',
  'SCRAPPED',
]);

export const ConditionGradeEnum = z.enum([
  'GRADE_A_PLUS',
  'GRADE_A',
  'GRADE_B',
  'GRADE_C',
  'GRADE_D',
  'PARTS_ONLY',
]);

/**
 * Validates a 15-digit International Mobile Station Equipment Identity (IMEI)
 * using the official Luhn algorithm (modulus 10).
 * 
 * Rules:
 * 1. Must be exact 15 numeric digits
 * 2. Every second digit from the left (odd indexes: 1, 3, 5, 7, 9, 11, 13) is doubled
 * 3. If doubling results in a two-digit number, add the digits together (e.g. 16 -> 1+6 = 7)
 * 4. Sum all processed digits; total sum modulo 10 must equal 0.
 */
export function isValidImei(imei: string): boolean {
  if (!imei || typeof imei !== 'string') return false;
  const clean = imei.trim();
  if (!/^\d{15}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(clean.charAt(i), 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit = (digit % 10) + Math.floor(digit / 10);
      }
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/**
 * Calculates the Luhn check digit for a 14-digit IMEI prefix.
 */
export function calculateImeiCheckDigit(first14Digits: string): string {
  if (!/^\d{14}$/.test(first14Digits)) {
    throw new Error('IMEI prefix must be exactly 14 digits');
  }
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(first14Digits.charAt(i), 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit = (digit % 10) + Math.floor(digit / 10);
      }
    }
    sum += digit;
  }
  const remainder = sum % 10;
  const checkDigit = remainder === 0 ? 0 : 10 - remainder;
  return checkDigit.toString();
}

/**
 * Generates a valid 15-digit Luhn IMEI given a 14-digit prefix or random prefix.
 */
export function generateValidImei(prefix: string = '35693805123456'): string {
  const p = prefix.slice(0, 14).padEnd(14, '0');
  return `${p}${calculateImeiCheckDigit(p)}`;
}

// Device Master Zod Validation Schemas
export const CreateDeviceMasterSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  imei1: z
    .string()
    .length(15, 'IMEI 1 must be exactly 15 digits')
    .refine(isValidImei, {
      message: 'IMEI 1 failed Luhn algorithm checksum validation',
    }),
  imei2: z
    .string()
    .length(15, 'IMEI 2 must be exactly 15 digits')
    .refine(isValidImei, {
      message: 'IMEI 2 failed Luhn algorithm checksum validation',
    })
    .optional()
    .or(z.literal('')),
  serialNumber: z.string().min(3, 'Serial Number must be at least 3 characters'),
  brand: z.string().min(2, 'Brand name is required'),
  brandId: z.string().optional(),
  model: z.string().min(2, 'Model name is required'),
  modelId: z.string().optional(),
  variant: z.string().optional(),
  variantId: z.string().optional(),
  storage: z.string().min(2, 'Storage capacity is required (e.g. 128GB, 256GB)'),
  ram: z.string().min(2, 'RAM specification is required (e.g. 8GB, 12GB)'),
  color: z.string().min(2, 'Device finish/color is required'),
  condition: z.string().min(2, 'Condition description is required'),
  grade: ConditionGradeEnum.default('GRADE_B'),
  batteryHealth: z.number().int().min(0).max(100, 'Battery health must be 0-100%'),
  purchaseCost: z.number().min(0, 'Purchase cost cannot be negative'),
  repairCost: z.number().min(0, 'Repair cost cannot be negative').default(0),
  otherCost: z.number().min(0, 'Other cost cannot be negative').default(0),
  totalCost: z.number().min(0).optional(),
  sellingPrice: z.number().min(0, 'Selling price cannot be negative'),
  status: DeviceStatusEnum.default('PURCHASED'),
  currentLocation: z.string().min(2, 'Current location / warehouse bay is required'),
  notes: z.string().optional(),
});

export const UpdateDeviceMasterSchema = CreateDeviceMasterSchema.partial().extend({
  id: z.string().min(1, 'Device UUID is required'),
});

export const ChangeDeviceStatusSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  newStatus: DeviceStatusEnum,
  reason: z.string().min(5, 'Reason for status change is required'),
  notes: z.string().optional(),
});

export const MoveDeviceLocationSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  newLocation: z.string().min(2, 'New warehouse location/bay is required'),
  notes: z.string().optional(),
});

export const SellDeviceSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  sellingPrice: z.number().positive('Selling price must be greater than 0'),
  buyerName: z.string().min(2, 'Buyer or customer name is required'),
  salesChannel: z.enum(['B2B_BULK', 'RETAIL_STORE', 'AMAZON', 'BACK_MARKET', 'EBAY', 'DIRECT_PORTAL']),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateDeviceMasterInput = z.infer<typeof CreateDeviceMasterSchema>;
export type UpdateDeviceMasterInput = z.infer<typeof UpdateDeviceMasterSchema>;
export type ChangeDeviceStatusInput = z.infer<typeof ChangeDeviceStatusSchema>;
export type MoveDeviceLocationInput = z.infer<typeof MoveDeviceLocationSchema>;
export type SellDeviceInput = z.infer<typeof SellDeviceSchema>;
export type CreateApprovalRequestInput = z.infer<typeof CreateApprovalRequestSchema>;
export type ReviewApprovalInput = z.infer<typeof ReviewApprovalSchema>;
export type ImeiCorrectionInput = z.infer<typeof ImeiCorrectionSchema>;
export type GradeOverrideInput = z.infer<typeof GradeOverrideSchema>;
export type StockAdjustmentInput = z.infer<typeof StockAdjustmentSchema>;

// =========================================================================
// Multi-Warehouse & Location Validation Schemas
// =========================================================================
export const CreateWarehouseSchema = z.object({
  code: z.string().min(2, 'Warehouse code is required (e.g. WH-KOL-01)'),
  name: z.string().min(3, 'Warehouse name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(5, 'Valid postal code is required'),
  country: z.string().default('India'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const CreateLocationSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
  code: z.string().min(2, 'Location code is required (e.g. A01, A02, B01, B02)'),
  zone: z.string().min(1, 'Zone is required (e.g. Zone A, Intake Dock)'),
  aisle: z.string().optional(),
  shelf: z.string().optional(),
  bin: z.string().optional(),
  description: z.string().optional(),
  capacity: z.number().int().positive().default(50),
  isActive: z.boolean().default(true),
});

// =========================================================================
// Vendor Management Schemas
// =========================================================================
export const VendorStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']);

export const CreateVendorSchema = z.object({
  vendorName: z.string().min(2, 'Contact person name is required'),
  businessName: z.string().min(2, 'Registered business name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  email: z.string().email('Valid work email address is required'),
  gstin: z
    .string()
    .length(15, 'GSTIN must be exactly 15 characters')
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i, 'Invalid GSTIN format (e.g. 19ABCDE1234F1Z5)')
    .transform((val) => val.toUpperCase()),
  address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  notes: z.string().optional(),
  status: VendorStatusEnum.default('ACTIVE'),
});

export const UpdateVendorSchema = CreateVendorSchema.partial().extend({
  id: z.string().min(1, 'Vendor ID is required'),
});

// =========================================================================
// Purchase Module & Workflow Schemas
// =========================================================================
export const PurchaseStatusEnum = z.enum(['DRAFT', 'RECEIVED', 'CANCELLED']);
export const PaymentStatusEnum = z.enum(['PAID', 'PARTIAL', 'UNPAID']);

export const AddPurchaseItemSchema = z.object({
  brand: z.string().min(2, 'Brand is required'),
  model: z.string().min(2, 'Model is required'),
  storage: z.string().min(2, 'Storage is required'),
  ram: z.string().optional(),
  color: z.string().min(2, 'Color is required'),
  imei1: z
    .string()
    .length(15, 'IMEI 1 must be 15 digits')
    .refine(isValidImei, { message: 'IMEI 1 failed Luhn algorithm checksum' }),
  imei2: z
    .string()
    .length(15, 'IMEI 2 must be 15 digits')
    .refine(isValidImei, { message: 'IMEI 2 failed Luhn algorithm checksum' })
    .optional()
    .or(z.literal('')),
  cost: z.number().positive('Unit cost must be greater than 0'),
  grade: ConditionGradeEnum.default('GRADE_B'),
  condition: z.string().default('Original OEM'),
  serialNumber: z.string().optional(),
});

export const CreatePurchaseOrderSchema = z.object({
  vendorId: z.string().min(1, 'Vendor must be selected'),
  purchaseDate: z.string().min(10, 'Valid purchase date is required'),
  referenceNumber: z.string().min(2, 'Reference / PO Number is required'),
  paymentStatus: PaymentStatusEnum.default('UNPAID'),
  paidAmount: z.number().min(0).default(0),
  destinationWarehouseId: z.string().min(1, 'Destination warehouse is required'),
  notes: z.string().optional(),
  items: z.array(AddPurchaseItemSchema).min(1, 'At least one device item is required in a purchase order'),
});

export const ReceivePurchaseOrderSchema = z.object({
  purchaseOrderId: z.string().min(1, 'Purchase Order ID is required'),
  destinationWarehouseId: z.string().min(1, 'Warehouse ID is required'),
  destinationLocationCode: z.string().min(1, 'Location code (e.g. A01) is required'),
  notes: z.string().optional(),
});

// =========================================================================
// Customer Management Schemas
// =========================================================================
export const CustomerStatusEnum = z.enum(['ACTIVE', 'INACTIVE']);

export const CreateCustomerSchema = z.object({
  name: z.string().min(2, 'Contact person name is required'),
  businessName: z.string().min(2, 'Business or store name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  email: z.string().email('Valid email address is required'),
  gstin: z
    .string()
    .length(15, 'GSTIN must be 15 characters')
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i, 'Invalid GSTIN format')
    .transform((val) => val.toUpperCase())
    .optional()
    .or(z.literal('')),
  address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  notes: z.string().optional(),
  status: CustomerStatusEnum.default('ACTIVE'),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial().extend({
  id: z.string().min(1, 'Customer ID is required'),
});

export type CreateWarehouseInput = z.infer<typeof CreateWarehouseSchema>;
export type CreateLocationInput = z.infer<typeof CreateLocationSchema>;
export type CreateVendorInput = z.infer<typeof CreateVendorSchema>;
export type UpdateVendorInput = z.infer<typeof UpdateVendorSchema>;
export type AddPurchaseItemInput = z.infer<typeof AddPurchaseItemSchema>;
export type CreatePurchaseOrderInput = z.infer<typeof CreatePurchaseOrderSchema>;
export type ReceivePurchaseOrderInput = z.infer<typeof ReceivePurchaseOrderSchema>;
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;

// =========================================================================
// Modules 12-15: Sales Orders, Billing Engine, Payments & Notes Schemas
// =========================================================================

export const BillingModeEnum = z.enum(['REGULAR_GST', 'MARGIN_SCHEME']);
export const PaymentMethodEnum = z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CARD', 'OTHER']);
export const InvoiceStatusEnum = z.enum(['DRAFT', 'FINALIZED', 'PAID', 'PARTIAL', 'CANCELLED']);
export const SalesOrderStatusEnum = z.enum(['DRAFT', 'CONFIRMED', 'INVOICED', 'CANCELLED']);

export const SellerProfileSchema = z.object({
  legalName: z.string().min(2, 'Seller legal name is required'),
  businessName: z.string().min(2, 'Business trading name is required'),
  address: z.string().min(5, 'Full registered address is required'),
  gstin: z
    .string()
    .length(15, 'GSTIN must be 15 characters')
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i, 'Invalid GSTIN format')
    .transform((val) => val.toUpperCase()),
  state: z.string().min(2, 'State is required'),
  stateCode: z.string().min(2).max(2, '2-digit state code is required (e.g. 19)'),
  contactPhone: z.string().min(10, 'Contact phone is required'),
  contactEmail: z.string().email('Contact email is required'),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIfsc: z.string().optional(),
});

export const BuyerProfileSchema = z.object({
  name: z.string().min(2, 'Buyer contact name is required'),
  businessName: z.string().min(2, 'Buyer business name is required'),
  address: z.string().min(5, 'Buyer address is required'),
  gstin: z
    .string()
    .length(15, 'GSTIN must be 15 characters')
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i, 'Invalid GSTIN format')
    .transform((val) => val.toUpperCase())
    .optional()
    .or(z.literal('')),
  state: z.string().min(2, 'State is required'),
  stateCode: z.string().min(2).max(2, '2-digit state code is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

export const InvoiceTermsSchema = z.object({
  name: z.string().min(2, 'Terms name is required'),
  warrantyPeriodText: z.string().min(5, 'Warranty period text is required'),
  warrantyVoidConditions: z.array(z.string()).min(1, 'At least one void condition is required'),
  tamperingPolicy: z.string().min(5, 'Tampering policy is required'),
  liquidPhysicalDamagePolicy: z.string().min(5, 'Damage exclusion policy is required'),
  computerGeneratedNotice: z.string().min(5, 'Computer generated notice statement is required'),
  returnPolicy: z.string().min(5, 'Return policy is required'),
  isDefault: z.boolean().default(true),
});

export const AddSalesOrderItemSchema = z.object({
  deviceId: z.string().min(1, 'Device selection is required'),
  imei: z.string().length(15, 'IMEI must be 15 digits'),
  brand: z.string().min(1),
  model: z.string().min(1),
  storage: z.string().min(1),
  color: z.string().min(1),
  grade: ConditionGradeEnum,
  purchaseCost: z.number().min(0),
  repairCost: z.number().min(0).default(0),
  otherCost: z.number().min(0).default(0),
  totalCost: z.number().min(0),
  sellingPrice: z.number().positive('Selling price must be greater than zero'),
});

export const CreateSalesOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer selection is required'),
  customerName: z.string().min(2),
  businessName: z.string().min(2),
  orderDate: z.string().min(10),
  notes: z.string().optional(),
  items: z.array(AddSalesOrderItemSchema).min(1, 'At least one device must be added to the order'),
});

export const CreateInvoiceItemDeviceSchema = z.object({
  deviceId: z.string().min(1),
  imei: z.string().length(15),
  imei2: z.string().optional(),
  serialNumber: z.string().optional(),
  brand: z.string().min(1),
  model: z.string().min(1),
  storage: z.string().min(1),
  color: z.string().optional(),
  grade: z.string().optional(),
  productType: z.string().default('Refurbished'),
  hsnCode: z.string().default('8517'),
  purchaseCost: z.number().min(0),
  repairCost: z.number().min(0).default(0),
  otherCost: z.number().min(0).default(0),
  totalCost: z.number().min(0),
  sellingPrice: z.number().positive(),
  discount: z.number().min(0).default(0),
});

export const CreateInvoiceItemSchema = z.object({
  sNo: z.number().int().positive(),
  productName: z.string().min(2),
  storage: z.string().min(2),
  imei: z.string().length(15),
  productType: z.string().default('Refurbished'),
  hsnCode: z.string().default('8517'),
  quantity: z.literal(1), // Strictly 1 for individual serialized refurbished devices
  unitPrice: z.number().positive(),
  discount: z.number().min(0).default(0),
  deviceId: z.string().min(1),
  purchaseCost: z.number().min(0),
  repairCost: z.number().min(0).default(0),
  otherCost: z.number().min(0).default(0),
});

export const CreateInvoiceSchema = z.object({
  salesOrderId: z.string().optional(),
  invoiceNumber: z.string().min(3, 'Invoice number is required (e.g. TR/26-27/097)'),
  invoiceDate: z.string().min(10, 'Invoice date is required'),
  dueDate: z.string().min(10, 'Due date is required'),
  billingMode: BillingModeEnum,
  seller: SellerProfileSchema,
  buyer: BuyerProfileSchema,
  placeOfSupply: z.string().min(2, 'Place of supply is required'),
  isInterState: z.boolean(),
  taxRatePercent: z.number().min(0).default(18),
  invoiceDiscount: z.number().min(0).default(0),
  depositReceived: z.number().min(0).default(0),
  items: z.array(CreateInvoiceItemSchema).min(1, 'At least one serialized device item is required'),
  notes: z.string().optional(),
});

export const FinalizeInvoiceSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  finalizedBy: z.string().min(1, 'Finalizing user ID is required'),
});

export const CreatePaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice selection is required'),
  invoiceNumber: z.string().min(1),
  customerId: z.string().min(1),
  customerName: z.string().min(1),
  amount: z.number().positive('Payment amount must be greater than zero'),
  method: PaymentMethodEnum,
  date: z.string().min(10, 'Payment date is required'),
  reference: z.string().min(2, 'Payment reference / transaction ID is required'),
  notes: z.string().optional(),
});

export const CreateCreditNoteSchema = z.object({
  invoiceId: z.string().min(1, 'Original invoice ID is required'),
  reason: z.enum(['SALES_RETURN', 'PRICE_REDUCTION', 'POST_SALE_DISCOUNT', 'DEFICIENCY_OF_SERVICE']),
  issueDate: z.string().min(10),
  items: z.array(z.object({
    invoiceItemId: z.string().optional(),
    deviceId: z.string().optional(),
    imei: z.string().optional(),
    productName: z.string().min(1),
    reason: z.string().min(3),
    amount: z.number().positive(),
    taxAmount: z.number().min(0),
  })).min(1, 'At least one credit note line item is required'),
  notes: z.string().optional(),
});

export const CreateDebitNoteSchema = z.object({
  invoiceId: z.string().min(1, 'Original invoice ID is required'),
  reason: z.enum(['PRICE_REVISION_UP', 'EXTRA_SERVICE', 'SUPPLEMENTAL_EXPENSE']),
  issueDate: z.string().min(10),
  items: z.array(z.object({
    invoiceItemId: z.string().optional(),
    deviceId: z.string().optional(),
    imei: z.string().optional(),
    productName: z.string().min(1),
    reason: z.string().min(3),
    amount: z.number().positive(),
    taxAmount: z.number().min(0),
  })).min(1, 'At least one debit note line item is required'),
  notes: z.string().optional(),
});

export type SellerProfileInput = z.infer<typeof SellerProfileSchema>;
export type BuyerProfileInput = z.infer<typeof BuyerProfileSchema>;
export type InvoiceTermsInput = z.infer<typeof InvoiceTermsSchema>;
export type AddSalesOrderItemInput = z.infer<typeof AddSalesOrderItemSchema>;
export type CreateSalesOrderInput = z.infer<typeof CreateSalesOrderSchema>;
export type CreateInvoiceItemInput = z.infer<typeof CreateInvoiceItemSchema>;
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
export type FinalizeInvoiceInput = z.infer<typeof FinalizeInvoiceSchema>;
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type CreateCreditNoteInput = z.infer<typeof CreateCreditNoteSchema>;
export type CreateDebitNoteInput = z.infer<typeof CreateDebitNoteSchema>;


