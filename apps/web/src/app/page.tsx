'use client';

import React, { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { OperationalKPIs } from '../components/OperationalKPIs';
import { InventorySummary } from '../components/InventorySummary';
import { OperationalCharts } from '../components/OperationalCharts';
import { PipelineKanban } from '../components/PipelineKanban';
import { DeviceTable } from '../components/DeviceTable';
import { DeviceMasterInventoryTable } from '../components/DeviceMasterInventoryTable';
import { DeviceMasterViewModal } from '../components/DeviceMasterViewModal';
import { DeviceMasterEditModal } from '../components/DeviceMasterEditModal';
import { DeviceChangeStatusModal } from '../components/DeviceChangeStatusModal';
import { DeviceMoveLocationModal } from '../components/DeviceMoveLocationModal';
import { DeviceSellModal } from '../components/DeviceSellModal';
import { DeviceMasterCreateModal } from '../components/DeviceMasterCreateModal';
import { DeviceDetailsModal } from '../components/DeviceDetailsModal';
import { DeviceIntakeModal } from '../components/DeviceIntakeModal';
import { GradingCalculatorModal } from '../components/GradingCalculatorModal';
import { ValuationSimulatorModal } from '../components/ValuationSimulatorModal';
import { AuthModal } from '../components/AuthModal';
import { ApprovalCenterModal } from '../components/ApprovalCenterModal';
import { AuditLogViewerModal } from '../components/AuditLogViewerModal';
import { DevicePassportModal } from '../components/DevicePassportModal';
import { WarehouseLocationView } from '../components/WarehouseLocationView';
import { VendorManagementView } from '../components/VendorManagementView';
import { PurchaseWorkflowView } from '../components/PurchaseWorkflowView';
import { CustomerManagementView } from '../components/CustomerManagementView';
import { SalesBillingModuleView } from '../components/SalesBillingModuleView';
import { INITIAL_DEVICE_MASTER } from '../data/mock-device-master';
import { INITIAL_WAREHOUSES, INITIAL_LOCATIONS } from '../data/mock-warehouses';
import { INITIAL_VENDORS } from '../data/mock-vendors';
import { INITIAL_PURCHASES } from '../data/mock-purchases';
import { INITIAL_CUSTOMERS, INITIAL_INVOICES, INITIAL_SALES_HISTORY } from '../data/mock-customers';
import {
  INITIAL_INVOICES as INITIAL_BILLING_INVOICES,
  INITIAL_SALES_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_CREDIT_NOTES,
  INITIAL_DEBIT_NOTES,
} from '../data/mock-billing';
import { OPERATIONAL_DATA, OperationalDashboardData } from '../data/operational-data';
import {
  DeviceMaster,
  DeviceStatus,
  WorkflowStage,
  Warehouse,
  InventoryLocation,
  Vendor,
  PurchaseOrder,
  Customer,
  CustomerInvoice,
  CustomerSaleRecord,
  SalesOrder,
  Invoice,
  Payment,
  CreditNote,
  DebitNote,
} from '@truerefurb/shared-types';

const STAGE_ORDER: WorkflowStage[] = [
  'INTAKE',
  'DIAGNOSTICS',
  'REPAIR_BENCH',
  'CLEANING_POLISH',
  'QA_INSPECTION',
  'READY_FOR_SALE'
];

type ActiveViewType = 'INVENTORY' | 'WAREHOUSES' | 'PURCHASES' | 'CUSTOMERS' | 'BILLING' | 'DASHBOARD';

function DashboardContent() {
  const { user, hasPermission, recordAuditEvent } = useAuth();

  // Active top-level view across all 5 enterprise modules
  const [activeView, setActiveView] = useState<ActiveViewType>('INVENTORY');

  // Master device dataset
  const [devices, setDevices] = useState<DeviceMaster[]>(INITIAL_DEVICE_MASTER);

  // Multi-Warehouse & Inventory Locations dataset
  const [warehouses, setWarehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [locations, setLocations] = useState<InventoryLocation[]>(INITIAL_LOCATIONS);

  // Vendor Management dataset
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);

  // Purchase Module & Workflow dataset
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(INITIAL_PURCHASES);

  // Customer Management dataset
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [invoices, setInvoices] = useState<CustomerInvoice[]>(INITIAL_INVOICES);
  const [salesHistory, setSalesHistory] = useState<CustomerSaleRecord[]>(INITIAL_SALES_HISTORY);

  // Modules 12-15: Sales Orders, Billing Invoices, Payments, Credit/Debit Notes
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(INITIAL_SALES_ORDERS);
  const [billingInvoices, setBillingInvoices] = useState<Invoice[]>(INITIAL_BILLING_INVOICES);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(INITIAL_CREDIT_NOTES);
  const [debitNotes, setDebitNotes] = useState<DebitNote[]>(INITIAL_DEBIT_NOTES);

  // Modal target selections
  const [viewingDevice, setViewingDevice] = useState<DeviceMaster | null>(null);
  const [editingDevice, setEditingDevice] = useState<DeviceMaster | null>(null);
  const [statusChangingDevice, setStatusChangingDevice] = useState<DeviceMaster | null>(null);
  const [movingDevice, setMovingDevice] = useState<DeviceMaster | null>(null);
  const [sellingDevice, setSellingDevice] = useState<DeviceMaster | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Legacy dashboard modals
  const [selectedDevice, setSelectedDevice] = useState<DeviceMaster | null>(null);
  const [passportDevice, setPassportDevice] = useState<DeviceMaster | null>(null);
  const [selectedStageFilter, setSelectedStageFilter] = useState<WorkflowStage | 'ALL'>('ALL');

  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isGradingCalcOpen, setIsGradingCalcOpen] = useState(false);
  const [isValuationOpen, setIsValuationOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isApprovalsOpen, setIsApprovalsOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // Live stage counts
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    devices.forEach((d) => {
      const stage = d.stage || 'INTAKE';
      counts[stage] = (counts[stage] || 0) + 1;
    });
    return counts;
  }, [devices]);

  // Real live operational database aggregates reflecting devices array
  const operationalMetrics: OperationalDashboardData = useMemo(() => {
    const readyToSell = devices.filter((d) => d.status === 'READY_TO_SELL');
    const sold = devices.filter((d) => d.status === 'SOLD');
    const reserved = devices.filter((d) => d.status === 'RESERVED');
    const repairRequired = devices.filter((d) => d.status === 'REPAIR_REQUIRED');

    const totalInvVal = readyToSell.reduce(
      (sum, d) => sum + (d.totalCost || (d.purchaseCost + d.repairCost + d.otherCost)),
      0
    );

    const grossProfitCalc = sold.reduce((sum, d) => {
      const cost = d.totalCost || (d.purchaseCost + d.repairCost + d.otherCost);
      return sum + (d.sellingPrice - cost);
    }, 0);

    return {
      ...OPERATIONAL_DATA,
      totalDevices: devices.length,
      availableDevices: readyToSell.length,
      soldDevices: OPERATIONAL_DATA.soldDevices + sold.length,
      currentInventoryValue: Math.round(totalInvVal * 1.8), // Enterprise multi-warehouse multiplier
      grossProfit: Math.round(OPERATIONAL_DATA.grossProfit + grossProfitCalc),
      inventorySummary: {
        totalDevices: devices.length,
        readyToSell: readyToSell.length,
        sold: sold.length,
        reserved: reserved.length,
        repairRequired: repairRequired.length,
      },
    };
  }, [devices]);

  // =========================================================================
  // Module 5 & 6 Handlers: View, Edit, Change Status, Move Location, Sell, Create
  // =========================================================================

  const handleSaveEdit = (updated: DeviceMaster) => {
    if (!hasPermission('device.update')) {
      alert(`Access Denied: Your role (${user?.role}) lacks device.update permission.`);
      return;
    }

    setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));

    recordAuditEvent({
      action: 'DEVICE_MASTER_UPDATED',
      entity: 'DEVICE',
      entityId: updated.id,
      newValue: {
        storage: updated.storage,
        grade: updated.grade,
        battery: updated.batteryHealth,
        purchaseCost: updated.purchaseCost,
        totalCost: updated.totalCost,
        sellingPrice: updated.sellingPrice,
      },
      reason: `Device specifications updated by ${user?.fullName}`,
      ipAddress: '10.0.4.15',
    });
  };

  const handleConfirmStatusChange = (
    deviceId: string,
    newStatus: DeviceStatus,
    reason: string,
    notes?: string
  ) => {
    if (!hasPermission('device.change_status') && !hasPermission('device.update')) {
      alert(`Access Denied: Your role (${user?.role}) lacks device.change_status permission.`);
      return;
    }

    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;

        // Map status to workflow stage for backward compatibility
        let mappedStage: WorkflowStage = 'INTAKE';
        if (newStatus === 'READY_TO_SELL') mappedStage = 'READY_FOR_SALE';
        else if (newStatus === 'REPAIR_REQUIRED') mappedStage = 'REPAIR_BENCH';
        else if (newStatus === 'SOLD') mappedStage = 'SOLD';
        else if (newStatus === 'RETURNED') mappedStage = 'INTAKE';

        recordAuditEvent({
          action: 'DEVICE_STATUS_CHANGED',
          entity: 'DEVICE',
          entityId: d.id,
          oldValue: { status: d.status },
          newValue: { status: newStatus },
          reason: `${reason} ${notes ? `(${notes})` : ''}`,
          ipAddress: '10.0.4.15',
        });

        return {
          ...d,
          status: newStatus,
          stage: mappedStage,
          notes: notes ? `${d.notes || ''} [Status: ${newStatus} - ${reason}]`.trim() : d.notes,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleConfirmMoveLocation = (deviceId: string, newLocation: string, reason?: string) => {
    if (!hasPermission('device.move_location') && !hasPermission('inventory.transfer') && !hasPermission('device.update')) {
      alert(`Access Denied: Your role (${user?.role}) lacks device.move_location permission.`);
      return;
    }

    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;

        recordAuditEvent({
          action: 'DEVICE_LOCATION_MOVED',
          entity: 'DEVICE',
          entityId: d.id,
          oldValue: { location: d.currentLocation },
          newValue: { location: newLocation },
          reason: reason || `Warehouse transfer to ${newLocation}`,
          ipAddress: '10.0.4.15',
        });

        return {
          ...d,
          currentLocation: newLocation,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleConfirmSell = (
    deviceId: string,
    salePrice: number,
    buyerName: string,
    channel: string,
    invoiceNo?: string,
    notes?: string
  ) => {
    if (!hasPermission('device.sell') && !hasPermission('order.create') && !hasPermission('device.update')) {
      alert(`Access Denied: Your role (${user?.role}) lacks device.sell permission.`);
      return;
    }

    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;

        recordAuditEvent({
          action: 'DEVICE_SOLD_AND_DISPATCHED',
          entity: 'DEVICE',
          entityId: d.id,
          oldValue: { status: d.status, sellingPrice: d.sellingPrice },
          newValue: {
            status: 'SOLD',
            sellingPrice: salePrice,
            buyerName,
            channel,
            invoiceNo,
          },
          reason: `Sold to ${buyerName} via ${channel} for $${salePrice}. ${notes || ''}`,
          ipAddress: '10.0.4.15',
        });

        return {
          ...d,
          status: 'SOLD',
          stage: 'SOLD',
          sellingPrice: salePrice,
          currentLocation: `Dispatched - Buyer: ${buyerName} (${invoiceNo || 'INV-PAID'})`,
          notes: `${d.notes || ''} [SOLD: $${salePrice} to ${buyerName} via ${channel}]`.trim(),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleAddDevice = (newDevice: DeviceMaster) => {
    if (!hasPermission('device.create')) {
      alert(`Access Denied: Your role (${user?.role}) lacks device.create permission.`);
      return;
    }

    setDevices((prev) => [newDevice, ...prev]);

    recordAuditEvent({
      action: 'DEVICE_MASTER_REGISTERED',
      entity: 'DEVICE',
      entityId: newDevice.id,
      newValue: {
        model: `${newDevice.brand} ${newDevice.model}`,
        serial: newDevice.serialNumber,
        imei1: newDevice.imei1,
        imei2: newDevice.imei2,
        cost: newDevice.purchaseCost,
        totalCost: newDevice.totalCost,
        status: newDevice.status,
      },
      reason: `Intake cataloging into Device Master at ${newDevice.currentLocation}`,
      ipAddress: '10.0.4.15',
    });
  };

  // =========================================================================
  // Module 8, 9, 10 & 11 Handlers: Purchases, Dock Receipt, Vendors, Customers
  // =========================================================================
  const handleCreatePurchase = (po: PurchaseOrder, newDevices: DeviceMaster[]) => {
    setPurchases((prev) => [po, ...prev]);
    setDevices((prev) => [...newDevices, ...prev]);

    // Update vendor aggregate
    setVendors((prev) =>
      prev.map((v) =>
        v.id === po.vendorId
          ? {
              ...v,
              totalPurchases: (v.totalPurchases || 0) + po.totalAmount,
              outstandingAmount: (v.outstandingAmount || 0) + po.outstandingAmount,
              totalOrdersCount: (v.totalOrdersCount || 0) + 1,
              updatedAt: new Date().toISOString(),
            }
          : v
      )
    );

    recordAuditEvent({
      action: 'PURCHASE_ORDER_CREATED',
      entity: 'ORDER',
      entityId: po.id,
      newValue: {
        referenceNumber: po.referenceNumber,
        vendor: po.businessName,
        totalAmount: po.totalAmount,
        devicesCount: newDevices.length,
        status: po.status,
      },
      reason: `Created purchase consignment ${po.referenceNumber} in DRAFT state (${newDevices.length} units staged in dock)`,
      ipAddress: '10.0.4.15',
    });
  };

  const handleReceivePurchase = (
    poId: string,
    warehouseId: string,
    locationCode: string,
    targetDeviceStatus: DeviceStatus,
    notes?: string
  ) => {
    const targetPO = purchases.find((p) => p.id === poId);
    if (!targetPO) return;

    const targetWarehouse = warehouses.find((w) => w.id === warehouseId);
    const whName = targetWarehouse?.name || 'Kolkata Main Warehouse';
    const receivedItemDeviceIds = targetPO.items.map((i) => i.deviceId).filter(Boolean);

    // 1. Mark PO as RECEIVED
    setPurchases((prev) =>
      prev.map((p) =>
        p.id === poId
          ? {
              ...p,
              status: 'RECEIVED',
              receivedAt: new Date().toISOString(),
              destinationWarehouseId: warehouseId,
              destinationWarehouseName: whName,
              items: p.items.map((item) => ({
                ...item,
                isReceived: true,
                receivedAt: new Date().toISOString(),
                warehouseId,
                locationCode,
              })),
            }
          : p
      )
    );

    // 2. Advance Devices from PURCHASED -> targetDeviceStatus and slot into inventory location
    setDevices((prev) =>
      prev.map((d) => {
        if (
          d.purchaseOrderId === targetPO.referenceNumber ||
          receivedItemDeviceIds.includes(d.id)
        ) {
          return {
            ...d,
            status: targetDeviceStatus,
            stage: targetDeviceStatus === 'READY_TO_SELL' ? 'READY_FOR_SALE' : 'INTAKE',
            warehouseId,
            warehouseName: whName,
            locationCode,
            currentLocation: `${whName} - ${locationCode}`,
            notes: `${d.notes || ''} [Dock Receipt: ${locationCode} - ${notes || 'Verified'}]`.trim(),
            updatedAt: new Date().toISOString(),
          };
        }
        return d;
      })
    );

    recordAuditEvent({
      action: 'PURCHASE_CONSIGNMENT_RECEIVED',
      entity: 'INVENTORY',
      entityId: poId,
      newValue: {
        poReference: targetPO.referenceNumber,
        warehouse: whName,
        location: locationCode,
        deviceStatus: targetDeviceStatus,
        unitsReceived: targetPO.items.length,
      },
      reason: `Received consignment ${targetPO.referenceNumber} into ${whName} location ${locationCode}. Inventory status advanced to ${targetDeviceStatus}.`,
      ipAddress: '10.0.4.15',
    });
  };

  const handleAddVendor = (vendor: Vendor) => {
    setVendors((prev) => [vendor, ...prev]);
    recordAuditEvent({
      action: 'VENDOR_CREATED',
      entity: 'USER',
      entityId: vendor.id,
      newValue: {
        businessName: vendor.businessName,
        gstin: vendor.gstin,
        city: vendor.city,
      },
      reason: `Registered new vendor ${vendor.businessName} (GSTIN: ${vendor.gstin})`,
      ipAddress: '10.0.4.15',
    });
  };

  const handleAddCustomer = (customer: Customer) => {
    setCustomers((prev) => [customer, ...prev]);
    recordAuditEvent({
      action: 'CUSTOMER_CREATED',
      entity: 'USER',
      entityId: customer.id,
      newValue: {
        businessName: customer.businessName,
        gstin: customer.gstin,
        city: customer.city,
      },
      reason: `Registered new customer ${customer.businessName}`,
      ipAddress: '10.0.4.15',
    });
  };

  const handleAddLocation = (loc: InventoryLocation) => {
    setLocations((prev) => [...prev, loc]);
  };

  // =========================================================================
  // Modules 12-15 Handlers: Sales Orders, Billing Invoices, Payments, Notes
  // =========================================================================

  const handleAddSalesOrder = (order: SalesOrder) => {
    setSalesOrders((prev) => [order, ...prev]);

    // Lock / Reserve selected devices to prevent duplicate sales
    const orderedDeviceIds = order.items.map((i) => i.deviceId);
    setDevices((prev) =>
      prev.map((d) => {
        if (orderedDeviceIds.includes(d.id)) {
          return {
            ...d,
            status: 'RESERVED',
            notes: `${d.notes || ''} [Reserved for Sales Order ${order.orderNumber}]`.trim(),
            updatedAt: new Date().toISOString(),
          };
        }
        return d;
      })
    );

    recordAuditEvent({
      action: 'SALES_ORDER_CONFIRMED',
      entity: 'ORDER',
      entityId: order.id,
      newValue: {
        orderNumber: order.orderNumber,
        customer: order.businessName,
        totalAmount: order.totalAmount,
        totalGrossProfit: order.totalGrossProfit,
        units: order.items.length,
      },
      reason: `Confirmed Sales Order ${order.orderNumber} for ${order.businessName} with device-level gross profit ₹${order.totalGrossProfit.toLocaleString()}`,
      ipAddress: '10.0.4.15',
    });
  };

  const handleAddBillingInvoice = (newInvoice: Invoice, updatedDevices: DeviceMaster[]) => {
    setBillingInvoices((prev) => [newInvoice, ...prev]);
    setDevices(updatedDevices);

    // If associated with a sales order, advance order status to INVOICED
    if (newInvoice.salesOrderId) {
      setSalesOrders((prev) =>
        prev.map((so) =>
          so.id === newInvoice.salesOrderId
            ? {
                ...so,
                status: 'INVOICED',
                invoiceId: newInvoice.id,
                invoiceNumber: newInvoice.invoiceNumber,
                updatedAt: new Date().toISOString(),
              }
            : so
        )
      );
    }

    recordAuditEvent({
      action: 'TAX_INVOICE_FINALIZED',
      entity: 'INVOICE',
      entityId: newInvoice.id,
      newValue: {
        invoiceNumber: newInvoice.invoiceNumber,
        billingMode: newInvoice.billingMode,
        buyer: newInvoice.buyer.businessName,
        totalAmount: newInvoice.totalAmount,
        taxableAmount: newInvoice.taxableAmount,
        totalTax: newInvoice.totalTax,
        exemptedAmountMarginScheme: newInvoice.exemptedAmountMarginScheme,
        units: newInvoice.totalQuantity,
      },
      reason: `Generated and finalized tax invoice ${newInvoice.invoiceNumber} under ${newInvoice.billingMode} mode. Billed devices transitioned to SOLD.`,
      ipAddress: '10.0.4.15',
    });
  };

  const handleAddPayment = (payment: Payment) => {
    setPayments((prev) => [payment, ...prev]);

    // Update invoice deposit and balance due
    setBillingInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === payment.invoiceId) {
          const newDeposit = inv.depositReceived + payment.amount;
          const newBalance = Math.max(0, inv.totalAmount - newDeposit);
          return {
            ...inv,
            depositReceived: newDeposit,
            balanceDue: newBalance,
            status: newBalance === 0 ? 'PAID' : 'PARTIAL',
            payments: [...(inv.payments || []), payment],
            updatedAt: new Date().toISOString(),
          };
        }
        return inv;
      })
    );

    recordAuditEvent({
      action: 'PAYMENT_RECORDED',
      entity: 'INVOICE',
      entityId: payment.invoiceId,
      newValue: {
        invoiceNumber: payment.invoiceNumber,
        amount: payment.amount,
        method: payment.method,
        reference: payment.reference,
      },
      reason: `Recorded payment of ₹${payment.amount.toLocaleString()} via ${payment.method} (Ref: ${payment.reference})`,
      ipAddress: '10.0.4.15',
    });
  };

  const handleAddCreditNote = (note: CreditNote) => {
    setCreditNotes((prev) => [note, ...prev]);
    recordAuditEvent({
      action: 'CREDIT_NOTE_ISSUED',
      entity: 'INVOICE',
      entityId: note.invoiceId,
      newValue: {
        noteNumber: note.noteNumber,
        reason: note.reason,
        totalAmount: note.totalAmount,
      },
      reason: `Issued credit note ${note.noteNumber} for invoice ${note.invoiceNumber}`,
      ipAddress: '10.0.4.15',
    });
  };

  const handleAddDebitNote = (note: DebitNote) => {
    setDebitNotes((prev) => [note, ...prev]);
    recordAuditEvent({
      action: 'DEBIT_NOTE_ISSUED',
      entity: 'INVOICE',
      entityId: note.invoiceId,
      newValue: {
        noteNumber: note.noteNumber,
        reason: note.reason,
        totalAmount: note.totalAmount,
      },
      reason: `Issued debit note ${note.noteNumber} for invoice ${note.invoiceNumber}`,
      ipAddress: '10.0.4.15',
    });
  };

  // Advance stage for legacy kanban view
  const handleAdvanceStage = (deviceId: string) => {
    if (!hasPermission('device.update') && !hasPermission('repair.complete') && !hasPermission('qa.approve')) {
      alert(`Access Denied: Your role (${user?.role}) lacks permission to transition workflow stages.`);
      return;
    }

    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;
        const currentStage = d.stage || 'INTAKE';
        const currentIndex = STAGE_ORDER.indexOf(currentStage);
        if (currentIndex !== -1 && currentIndex < STAGE_ORDER.length - 1) {
          const nextStage = STAGE_ORDER[currentIndex + 1];

          recordAuditEvent({
            action: 'DEVICE_STAGE_ADVANCE',
            entity: 'DEVICE',
            entityId: d.id,
            oldValue: { stage: currentStage },
            newValue: { stage: nextStage },
            reason: `Advanced to ${nextStage} by ${user?.fullName}`,
            ipAddress: '10.0.4.15',
          });

          return {
            ...d,
            stage: nextStage,
            status: nextStage === 'READY_FOR_SALE' ? 'READY_TO_SELL' : d.status,
            functionalScore: Math.min(100, (d.functionalScore || 80) + 4),
          };
        }
        return d;
      })
    );
  };

  const handleSelectInventoryBucket = (bucketId: string) => {
    if (bucketId === 'READY') {
      setActiveView('INVENTORY');
      setSelectedStageFilter('READY_FOR_SALE');
    } else if (bucketId === 'REPAIR') {
      setActiveView('INVENTORY');
      setSelectedStageFilter('REPAIR_BENCH');
    } else if (bucketId === 'TOTAL') {
      setActiveView('INVENTORY');
      setSelectedStageFilter('ALL');
    }
  };

  return (
    <main>
      {/* Top Header with Approval Counter and Audit trigger */}
      <Header
        onOpenIntake={() => setIsCreateOpen(true)}
        onOpenGradingCalc={() => setIsGradingCalcOpen(true)}
        onOpenValuation={() => setIsValuationOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenApprovals={() => setIsApprovalsOpen(true)}
        onOpenAudit={() => setIsAuditOpen(true)}
        deviceCount={devices.length}
      />

      {/* Module Navigation Switcher */}
      <div className="view-switcher-bar">
        <button
          className={`view-tab-btn ${activeView === 'INVENTORY' ? 'active' : ''}`}
          onClick={() => setActiveView('INVENTORY')}
        >
          <span>📱 Device Master & Inventory</span>
          <span className="view-tab-badge">{devices.length} Units</span>
        </button>

        <button
          className={`view-tab-btn ${activeView === 'WAREHOUSES' ? 'active' : ''}`}
          onClick={() => setActiveView('WAREHOUSES')}
        >
          <span>🏢 Warehouses & Locations</span>
          <span className="view-tab-badge">{warehouses.length} Hubs</span>
        </button>

        <button
          className={`view-tab-btn ${activeView === 'PURCHASES' ? 'active' : ''}`}
          onClick={() => setActiveView('PURCHASES')}
        >
          <span>📦 Vendors & Purchases</span>
          <span className="view-tab-badge">{purchases.length} POs</span>
        </button>

        <button
          className={`view-tab-btn ${activeView === 'CUSTOMERS' ? 'active' : ''}`}
          onClick={() => setActiveView('CUSTOMERS')}
        >
          <span>👥 Customers & Invoices</span>
          <span className="view-tab-badge">{customers.length} Clients</span>
        </button>

        <button
          className={`view-tab-btn ${activeView === 'BILLING' ? 'active' : ''}`}
          onClick={() => setActiveView('BILLING')}
        >
          <span>💰 Sales & Billing Engine</span>
          <span className="view-tab-badge">{billingInvoices.length} Invoices</span>
        </button>

        <button
          className={`view-tab-btn ${activeView === 'DASHBOARD' ? 'active' : ''}`}
          onClick={() => setActiveView('DASHBOARD')}
        >
          <span>📊 Operational Dashboard</span>
          <span className="view-tab-badge">KPIs & Charts</span>
        </button>
      </div>

      {activeView === 'INVENTORY' && (
        /* =========================================================================
           Module 5 & 6: Device Master & Device-Level Inventory
           ========================================================================= */
        <div>
          {/* Quick Operational Metrics Ribbon */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div className="stat-card" style={{ padding: '0.85rem' }}>
              <div className="stat-card-title">Total Devices</div>
              <div className="stat-card-value" style={{ fontSize: '1.4rem' }}>{devices.length}</div>
              <div className="stat-card-subtitle">Cataloged in Master</div>
            </div>

            <div className="stat-card" style={{ padding: '0.85rem' }}>
              <div className="stat-card-title">Ready to Sell</div>
              <div className="stat-card-value" style={{ fontSize: '1.4rem', color: '#10b981' }}>
                {devices.filter((d) => d.status === 'READY_TO_SELL').length}
              </div>
              <div className="stat-card-subtitle">In-Stock Warehouse Bays</div>
            </div>

            <div className="stat-card" style={{ padding: '0.85rem' }}>
              <div className="stat-card-title">Repair Required</div>
              <div className="stat-card-value" style={{ fontSize: '1.4rem', color: '#f43f5e' }}>
                {devices.filter((d) => d.status === 'REPAIR_REQUIRED').length}
              </div>
              <div className="stat-card-subtitle">Staged on Bench</div>
            </div>

            <div className="stat-card" style={{ padding: '0.85rem' }}>
              <div className="stat-card-title">Reserved Orders</div>
              <div className="stat-card-value" style={{ fontSize: '1.4rem', color: '#f59e0b' }}>
                {devices.filter((d) => d.status === 'RESERVED').length}
              </div>
              <div className="stat-card-subtitle">Locked B2B/Cart Units</div>
            </div>

            <div className="stat-card" style={{ padding: '0.85rem' }}>
              <div className="stat-card-title">Sold Dispatches</div>
              <div className="stat-card-value" style={{ fontSize: '1.4rem', color: '#818cf8' }}>
                {devices.filter((d) => d.status === 'SOLD').length}
              </div>
              <div className="stat-card-subtitle">Fulfilled & Settled</div>
            </div>
          </div>

          {/* Full Search, Filter, Sort & Actionable Inventory Table */}
          <DeviceMasterInventoryTable
            devices={devices}
            onViewDevice={(d) => setViewingDevice(d)}
            onEditDevice={(d) => setEditingDevice(d)}
            onChangeStatus={(d) => setStatusChangingDevice(d)}
            onMoveLocation={(d) => setMovingDevice(d)}
            onSellDevice={(d) => setSellingDevice(d)}
            onOpenCreate={() => setIsCreateOpen(true)}
          />
        </div>
      )}

      {activeView === 'WAREHOUSES' && (
        /* =========================================================================
           Inventory Locations & Multi-Warehouse Architecture
           ========================================================================= */
        <WarehouseLocationView
          warehouses={warehouses}
          locations={locations}
          devices={devices}
          onAddLocation={handleAddLocation}
          onViewDevice={(d) => setViewingDevice(d)}
        />
      )}

      {activeView === 'PURCHASES' && (
        /* =========================================================================
           Module 8, 9 & 10: Vendors & Purchase Workflow Engine
           ========================================================================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <PurchaseWorkflowView
            purchases={purchases}
            vendors={vendors}
            warehouses={warehouses}
            locations={locations}
            devices={devices}
            onCreatePurchase={handleCreatePurchase}
            onReceivePurchase={handleReceivePurchase}
            onViewDevice={(d) => setViewingDevice(d)}
          />

          {/* Vendor Directory Section */}
          <VendorManagementView
            vendors={vendors}
            purchases={purchases}
            onAddVendor={handleAddVendor}
            onOpenCreatePO={() => {
              setActiveView('PURCHASES');
            }}
          />
        </div>
      )}

      {activeView === 'CUSTOMERS' && (
        /* =========================================================================
           Module 11: Customer Management, Sales History & Invoices
           ========================================================================= */
        <CustomerManagementView
          customers={customers}
          invoices={invoices}
          salesHistory={salesHistory}
          onAddCustomer={handleAddCustomer}
        />
      )}

      {activeView === 'BILLING' && (
        /* =========================================================================
           Modules 12-15: Sales Module, Billing Engine, Margin Scheme & Payments
           ========================================================================= */
        <SalesBillingModuleView
          customers={customers}
          devices={devices}
          salesOrders={salesOrders}
          invoices={billingInvoices}
          payments={payments}
          creditNotes={creditNotes}
          debitNotes={debitNotes}
          onAddSalesOrder={handleAddSalesOrder}
          onAddInvoice={handleAddBillingInvoice}
          onAddPayment={handleAddPayment}
          onAddCreditNote={handleAddCreditNote}
          onAddDebitNote={handleAddDebitNote}
        />
      )}

      {activeView === 'DASHBOARD' && (
        /* =========================================================================
           Module 4: Operational Dashboard & Charts View
           ========================================================================= */
        <div>
          {/* 1. Real Database Operational KPIs (8 Essential Metrics) */}
          <OperationalKPIs data={operationalMetrics} />

          {/* 2. Inventory Summary Breakdown (5 Operational Buckets) */}
          <InventorySummary 
            summary={operationalMetrics.inventorySummary} 
            onSelectBucket={handleSelectInventoryBucket}
          />

          {/* 3. Operational Charts: Sales (7D / 30D) & Purchases (30D) */}
          <OperationalCharts
            salesLast30Days={operationalMetrics.salesLast30Days}
            purchasesLast30Days={operationalMetrics.purchasesLast30Days}
          />

          {/* 4. Live Refurbishment Pipeline Kanban Tracker */}
          <PipelineKanban
            selectedStage={selectedStageFilter}
            onSelectStage={setSelectedStageFilter}
            stageCounts={stageCounts}
          />

          {/* 5. Filterable Device Registry & Security Actions Table */}
          <DeviceTable
            devices={devices}
            onSelectDevice={setSelectedDevice}
            onOpenPassport={setPassportDevice}
            onAdvanceStage={handleAdvanceStage}
            selectedStageFilter={selectedStageFilter}
            onFilterChange={setSelectedStageFilter}
          />
        </div>
      )}

      {/* =========================================================================
         Device Master Modals (View, Edit, Change Status, Move Location, Sell, Create)
         ========================================================================= */}
      <DeviceMasterViewModal
        device={viewingDevice}
        isOpen={!!viewingDevice}
        onClose={() => setViewingDevice(null)}
        onOpenEdit={(d) => setEditingDevice(d)}
        onOpenStatusChange={(d) => setStatusChangingDevice(d)}
        onOpenMoveLocation={(d) => setMovingDevice(d)}
        onOpenSell={(d) => setSellingDevice(d)}
      />

      <DeviceMasterEditModal
        device={editingDevice}
        isOpen={!!editingDevice}
        onClose={() => setEditingDevice(null)}
        onSave={handleSaveEdit}
      />

      <DeviceChangeStatusModal
        device={statusChangingDevice}
        isOpen={!!statusChangingDevice}
        onClose={() => setStatusChangingDevice(null)}
        onStatusChange={handleConfirmStatusChange}
      />

      <DeviceMoveLocationModal
        device={movingDevice}
        isOpen={!!movingDevice}
        onClose={() => setMovingDevice(null)}
        onMoveLocation={handleConfirmMoveLocation}
      />

      <DeviceSellModal
        device={sellingDevice}
        isOpen={!!sellingDevice}
        onClose={() => setSellingDevice(null)}
        onSell={handleConfirmSell}
      />

      <DeviceMasterCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAddDevice={handleAddDevice}
        existingDevices={devices}
      />

      {/* Legacy and Platform Governance Modals */}
      <DeviceDetailsModal
        device={selectedDevice}
        onClose={() => setSelectedDevice(null)}
        onAdvanceStage={handleAdvanceStage}
      />

      <DevicePassportModal
        device={passportDevice}
        isOpen={!!passportDevice}
        onClose={() => setPassportDevice(null)}
      />

      <DeviceIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onAddDevice={handleAddDevice}
      />

      <GradingCalculatorModal
        isOpen={isGradingCalcOpen}
        onClose={() => setIsGradingCalcOpen(false)}
      />

      <ValuationSimulatorModal
        isOpen={isValuationOpen}
        onClose={() => setIsValuationOpen(false)}
      />

      <ApprovalCenterModal
        isOpen={isApprovalsOpen}
        onClose={() => setIsApprovalsOpen(false)}
      />

      <AuditLogViewerModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </main>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
