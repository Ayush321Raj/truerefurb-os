import { SystemRole, GranularPermission, DataScopeType, ApprovalTransactionType } from '@truerefurb/shared-types';

export interface RoleConfig {
  role: SystemRole;
  title: string;
  defaultScope: DataScopeType;
  primaryResponsibility: string;
  permissions: GranularPermission[];
}

export const ROLE_CONFIGS: Record<SystemRole, RoleConfig> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    title: 'Super Admin',
    defaultScope: 'GLOBAL',
    primaryResponsibility: 'Full platform & global company configuration',
    permissions: [
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
  },

  TENANT_ADMIN: {
    role: 'TENANT_ADMIN',
    title: 'Tenant Admin',
    defaultScope: 'TENANT',
    primaryResponsibility: 'Full organization administration & IMEI/role approvals',
    permissions: [
      'device.read', 'device.create', 'device.update', 'device.imei.correct', 'device.grade.assign', 'device.grade.override', 'device.passport.export',
      'diagnostic.run', 'diagnostic.create_template', 'diagnostic.configure_threshold', 'diagnostic.approve',
      'repair.read', 'repair.create', 'repair.update', 'repair.complete', 'repair.parts_consume',
      'qa.inspect', 'qa.approve', 'qa.reject', 'qa.certify',
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
  },

  OPERATIONS_MANAGER: {
    role: 'OPERATIONS_MANAGER',
    title: 'Operations Manager',
    defaultScope: 'TENANT',
    primaryResponsibility: 'Cross-module daily refurbishment operations & yield optimization',
    permissions: [
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
  },

  FINANCE_MANAGER: {
    role: 'FINANCE_MANAGER',
    title: 'Finance Manager',
    defaultScope: 'TENANT',
    primaryResponsibility: 'Invoicing, credit notes, refunds, GST and margin reconciliation',
    permissions: [
      'device.read', 'inventory.valuation.read', 'order.read',
      'invoice.read', 'invoice.create', 'invoice.post', 'invoice.cancel',
      'payment.create', 'refund.create', 'refund.approve', 'finance.gst_report.read',
      'approval.request', 'approval.review', 'audit.read'
    ],
  },

  INVENTORY_MANAGER: {
    role: 'INVENTORY_MANAGER',
    title: 'Inventory Manager',
    defaultScope: 'WAREHOUSE',
    primaryResponsibility: 'Stock reconciliation, bin management, and adjustment approval',
    permissions: [
      'device.read', 'device.create',
      'inventory.read', 'inventory.receive', 'inventory.transfer', 'inventory.adjust', 'inventory.reserve', 'inventory.valuation.read',
      'order.read', 'listing.read',
      'approval.request', 'approval.review', 'audit.read'
    ],
  },

  PROCUREMENT_MANAGER: {
    role: 'PROCUREMENT_MANAGER',
    title: 'Procurement Manager',
    defaultScope: 'TENANT',
    primaryResponsibility: 'Device lot sourcing, PO approvals, and supplier auctions',
    permissions: [
      'device.read', 'device.create',
      'procurement.read', 'procurement.create_po', 'procurement.approve_po',
      'truebid.participate', 'truebid.manage',
      'inventory.read', 'inventory.receive',
      'approval.request', 'approval.review', 'audit.read'
    ],
  },

  DIAGNOSTICS_LEAD: {
    role: 'DIAGNOSTICS_LEAD',
    title: 'Diagnostics Lead',
    defaultScope: 'DEPARTMENT',
    primaryResponsibility: 'Testing templates, hardware thresholds, and diagnostic verification',
    permissions: [
      'device.read', 'device.create',
      'diagnostic.run', 'diagnostic.create_template', 'diagnostic.configure_threshold', 'diagnostic.approve',
      'truescore.read', 'truescore.recalculate',
      'repair.read', 'qa.inspect',
      'approval.request', 'audit.read'
    ],
  },

  REPAIR_TECHNICIAN: {
    role: 'REPAIR_TECHNICIAN',
    title: 'Repair Technician',
    defaultScope: 'ASSIGNED',
    primaryResponsibility: 'Repair execution on assigned work orders (Cannot approve QA or alter cost)',
    permissions: [
      'device.read',
      'diagnostic.run',
      'repair.read', 'repair.create', 'repair.update', 'repair.complete', 'repair.parts_consume',
      'truescore.read',
      'approval.request', 'audit.read'
    ],
  },

  QA_SUPERVISOR: {
    role: 'QA_SUPERVISOR',
    title: 'QA Supervisor',
    defaultScope: 'DEPARTMENT',
    primaryResponsibility: 'Grade overrides, final certification approval, and quality audit',
    permissions: [
      'device.read', 'device.grade.assign', 'device.grade.override', 'device.passport.export',
      'diagnostic.run', 'diagnostic.approve',
      'repair.read',
      'qa.inspect', 'qa.approve', 'qa.reject', 'qa.certify', 'qa.override_standard',
      'truescore.read', 'truescore.finalize',
      'approval.request', 'approval.review', 'audit.read'
    ],
  },

  QA_INSPECTOR: {
    role: 'QA_INSPECTOR',
    title: 'QA Inspector',
    defaultScope: 'DEPARTMENT',
    primaryResponsibility: 'Checklist completion and proposed grading (Cannot approve own repairs)',
    permissions: [
      'device.read', 'device.grade.assign',
      'diagnostic.run',
      'qa.inspect', 'qa.reject',
      'truescore.read',
      'approval.request', 'audit.read'
    ],
  },

  SALES_MANAGER: {
    role: 'SALES_MANAGER',
    title: 'Sales Manager',
    defaultScope: 'TENANT',
    primaryResponsibility: 'Sales team management, high discount approval, and wholesale deals',
    permissions: [
      'device.read', 'inventory.read',
      'listing.read', 'listing.price_override',
      'order.read', 'order.create', 'order.update', 'order.cancel', 'order.discount.approve',
      'invoice.read', 'truescore.read',
      'approval.request', 'approval.review', 'audit.read'
    ],
  },

  SALES_EXECUTIVE: {
    role: 'SALES_EXECUTIVE',
    title: 'Sales Executive',
    defaultScope: 'OWN',
    primaryResponsibility: 'Order creation, quotations, and customer tracking (Own customers)',
    permissions: [
      'device.read', 'inventory.read',
      'order.read', 'order.create', 'order.update',
      'invoice.read', 'truescore.read',
      'approval.request'
    ],
  },

  ECOMMERCE_MANAGER: {
    role: 'ECOMMERCE_MANAGER',
    title: 'E-Commerce Manager',
    defaultScope: 'TENANT',
    primaryResponsibility: 'Marketplace sync (Amazon, Back Market, eBay) & channel listings',
    permissions: [
      'device.read', 'inventory.read',
      'listing.read', 'listing.create', 'listing.update', 'listing.sync_marketplace',
      'order.read', 'order.update',
      'truescore.read',
      'approval.request', 'audit.read'
    ],
  },

  WAREHOUSE_CLERK: {
    role: 'WAREHOUSE_CLERK',
    title: 'Warehouse Clerk',
    defaultScope: 'WAREHOUSE',
    primaryResponsibility: 'Dock receiving, IMEI scanning, bin putaway, pick/pack/dispatch',
    permissions: [
      'device.read', 'device.create',
      'inventory.read', 'inventory.receive', 'inventory.transfer',
      'order.read',
      'approval.request'
    ],
  },

  CUSTOMER_SUPPORT: {
    role: 'CUSTOMER_SUPPORT',
    title: 'Customer Support',
    defaultScope: 'ASSIGNED',
    primaryResponsibility: 'RMA ticket creation, warranty checks, customer communication',
    permissions: [
      'device.read', 'order.read', 'warranty.validate',
      'rma.read', 'rma.create',
      'approval.request'
    ],
  },

  SUPPLIER: {
    role: 'SUPPLIER',
    title: 'Supplier Portal',
    defaultScope: 'OWN',
    primaryResponsibility: 'View own lots, purchase orders, shipments & remittances only',
    permissions: [
      'procurement.read'
    ],
  },

  CUSTOMER_BUYER: {
    role: 'CUSTOMER_BUYER',
    title: 'Customer Buyer Portal',
    defaultScope: 'OWN',
    primaryResponsibility: 'View own orders, registered devices, warranty & RMA status only',
    permissions: [
      'order.read', 'device.read', 'warranty.validate', 'rma.read', 'rma.create'
    ],
  },

  AUDITOR: {
    role: 'AUDITOR',
    title: 'Independent Compliance Auditor',
    defaultScope: 'TENANT',
    primaryResponsibility: 'Read-only regulatory compliance, tamper verification & audit exports',
    permissions: [
      'device.read', 'diagnostic.run', 'repair.read', 'qa.inspect', 'truescore.read',
      'inventory.read', 'procurement.read', 'listing.read', 'order.read', 'invoice.read',
      'rma.read', 'audit.read', 'audit.export'
    ],
  },
};

// Approval Engine Pairing Matrix
export const APPROVAL_MATRIX: Record<ApprovalTransactionType, { makerRoles: SystemRole[]; approverRole: SystemRole; description: string }> = {
  STOCK_ADJUSTMENT: {
    makerRoles: ['WAREHOUSE_CLERK', 'INVENTORY_MANAGER'],
    approverRole: 'INVENTORY_MANAGER',
    description: 'Requires Inventory Manager authorization for physical count discrepancies.'
  },
  PURCHASE_ORDER: {
    makerRoles: ['PROCUREMENT_MANAGER'],
    approverRole: 'PROCUREMENT_MANAGER',
    description: 'Procurement lot sign-off.'
  },
  HIGH_VALUE_PURCHASE: {
    makerRoles: ['PROCUREMENT_MANAGER', 'OPERATIONS_MANAGER'],
    approverRole: 'TENANT_ADMIN',
    description: 'Purchases exceeding $25,000 require Tenant Admin sign-off.'
  },
  REPAIR_COMPLETION: {
    makerRoles: ['REPAIR_TECHNICIAN'],
    approverRole: 'QA_SUPERVISOR',
    description: 'Repaired units must be verified by QA before entering inventory.'
  },
  GRADE_OVERRIDE: {
    makerRoles: ['QA_INSPECTOR'],
    approverRole: 'QA_SUPERVISOR',
    description: 'Any manual change to automated CTA-2053 grade requires QA Supervisor justification.'
  },
  PRICE_OVERRIDE: {
    makerRoles: ['SALES_EXECUTIVE', 'ECOMMERCE_MANAGER'],
    approverRole: 'SALES_MANAGER',
    description: 'Changes below baseline MSRP require Sales Manager approval.'
  },
  HIGH_DISCOUNT: {
    makerRoles: ['SALES_EXECUTIVE'],
    approverRole: 'SALES_MANAGER',
    description: 'Discounts exceeding 10% require Sales Manager approval.'
  },
  REFUND_DISBURSEMENT: {
    makerRoles: ['CUSTOMER_SUPPORT', 'SALES_EXECUTIVE'],
    approverRole: 'FINANCE_MANAGER',
    description: 'Customer refunds require Finance Manager payment authorization.'
  },
  CREDIT_NOTE: {
    makerRoles: ['SALES_EXECUTIVE', 'FINANCE_MANAGER'],
    approverRole: 'FINANCE_MANAGER',
    description: 'Credit note adjustments must be approved by Finance.'
  },
  WARRANTY_EXCEPTION: {
    makerRoles: ['CUSTOMER_SUPPORT'],
    approverRole: 'QA_SUPERVISOR',
    description: 'Out-of-warranty RMA exceptions require QA Supervisor approval.'
  },
  USER_ROLE_CHANGE: {
    makerRoles: ['TENANT_ADMIN'],
    approverRole: 'SUPER_ADMIN',
    description: 'Elevation of tenant privileges requires Super Admin authorization.'
  },
  IMEI_CORRECTION: {
    makerRoles: ['WAREHOUSE_CLERK', 'DIAGNOSTICS_LEAD', 'REPAIR_TECHNICIAN'],
    approverRole: 'TENANT_ADMIN',
    description: 'Hardware IMEI corrections are high-risk and require Tenant Admin sign-off.'
  },
  INVOICE_CANCELLATION: {
    makerRoles: ['FINANCE_MANAGER', 'SALES_MANAGER'],
    approverRole: 'FINANCE_MANAGER',
    description: 'Posted GST invoice cancellations require formal audit authorization.'
  },
  AI_AGENT_HIGH_RISK_ACTION: {
    makerRoles: ['SUPER_ADMIN', 'OPERATIONS_MANAGER'],
    approverRole: 'OPERATIONS_MANAGER',
    description: 'Autonomous AI batch adjustments exceeding $5,000 threshold require human-in-the-loop approval.'
  },
};
