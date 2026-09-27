# TrueRefurb OS — Production RBAC, Data Scope, Approval & Audit Matrix

## Architectural Principle

Every operation in TrueRefurb OS strictly satisfies:

$$\text{ROLE} \longrightarrow \text{MODULE} \longrightarrow \text{ACTION} \longrightarrow \text{DATA SCOPE} \longrightarrow \text{APPROVAL} \longrightarrow \text{AUDIT}$$

- **RBAC**: Determines *what* action a user can perform.
- **Data Scope**: Restricts *which records* are visible or mutable (`GLOBAL`, `TENANT`, `REGION`, `WAREHOUSE`, `DEPARTMENT`, `TEAM`, `ASSIGNED`, `OWN`).
- **Approval Engine**: Mandates Maker-Checker dual authorization for high-risk, irreversible, or financial transactions.
- **Audit Engine**: Commits an immutable, cryptographically sealed record of every sensitive mutation.

---

## 1. System Roles (17 Enterprise Personas)

1. **Super Admin**: Global cross-tenant platform configuration.
2. **Tenant Admin**: Organization administration, role assignments, IMEI overrides.
3. **Operations Manager**: Cross-module throughput, bottleneck triage, facility yield.
4. **Finance Manager**: Billing, payments, GST, margin reconciliation, credit notes.
5. **Inventory Manager**: Warehouse inventory, stock reconciliation, adjustment approvals.
6. **Procurement Manager**: Device lot purchasing, PO creation, supplier auctions.
7. **Diagnostics Lead**: TrueDiag testing templates, hardware threshold authority.
8. **Repair Technician**: Bench repair execution on assigned work orders.
9. **QA Supervisor**: Final certification, grade overrides, quality approvals.
10. **QA Inspector**: Visual checklist completion, proposed CTA-2053 grading.
11. **Sales Manager**: B2B/B2C sales, discount approvals, price overrides.
12. **Sales Executive**: Quotations, order creation for own customer accounts.
13. **E-Commerce Manager**: Marketplace listings (Amazon Renewed, Back Market, eBay).
14. **Warehouse Clerk**: Dock receiving, IMEI barcode scanning, bin putaway, dispatch.
15. **Customer Support**: Customer complaints, RMA ticket creation, warranty checks.
16. **Supplier**: External portal view of own lots, purchase orders & remittances.
17. **Customer / Buyer**: External portal view of own orders, devices & warranty.
18. **Auditor**: Read-only regulatory compliance, tamper-proof audit log exports.

---

## 2. Maker-Checker Approval Matrix

| Transaction Type | Maker Roles | Approver Role | Justification Requirement |
|---|---|---|---|
| **Stock Adjustment** | Warehouse Clerk, Inventory Manager | `INVENTORY_MANAGER` | Physical recount variance explanation |
| **Purchase Order** | Procurement Manager | `PROCUREMENT_MANAGER` | Lot valuation sign-off |
| **High-Value Purchase (>$25k)** | Procurement Manager, Ops Manager | `TENANT_ADMIN` | Executive capital allocation approval |
| **Repair Completion** | Repair Technician | `QA_SUPERVISOR` | Independent verification before stock release |
| **Grade Override** | QA Inspector | `QA_SUPERVISOR` | Microscopic optical reinspection justification |
| **Price Override** | Sales Executive, E-Com Manager | `SALES_MANAGER` | Sub-MSRP discounting approval |
| **High Discount (>10%)** | Sales Executive | `SALES_MANAGER` | Margin protection authorization |
| **Refund Disbursement** | Customer Support, Sales | `FINANCE_MANAGER` | Banking payout & fund authorization |
| **Credit Note** | Sales Executive, Finance | `FINANCE_MANAGER` | Tax & GST reconciliation sign-off |
| **Warranty Exception** | Customer Support | `QA_SUPERVISOR` | Out-of-warranty coverage sign-off |
| **User Role Change** | Tenant Admin | `SUPER_ADMIN` | Elevation of tenant privileges |
| **IMEI Correction** | Warehouse Clerk, Tech, Diagnostics | `TENANT_ADMIN` | Prevention of serial swapping / fraud |
| **Invoice Cancellation** | Sales Manager, Finance | `FINANCE_MANAGER` | Formal audit justification for GST cancellation |
| **AI Agent High-Risk (> $5k)** | AI Agent, Ops Manager | `OPERATIONS_MANAGER` | Human-in-the-loop autonomous guardrail |

---

## 3. Immutable Audit Log Event Structure

```json
{
  "actor_id": "usr-qasup-03",
  "actor_name": "Sarah Lin",
  "actor_role": "QA_SUPERVISOR",
  "tenant_id": "TEN-001",
  "facility_id": "AUS-HUB-04",
  "action": "DEVICE_GRADE_OVERRIDE",
  "entity": "DEVICE",
  "entity_id": "dev-001",
  "old_value": "GRADE_B",
  "new_value": "GRADE_A",
  "reason": "Chassis micro-scratches polished with OEM diamond compound.",
  "approval_id": "apr-001",
  "ip_address": "10.0.4.120",
  "timestamp": "2026-09-25T11:20:00Z",
  "tamper_seal_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```
