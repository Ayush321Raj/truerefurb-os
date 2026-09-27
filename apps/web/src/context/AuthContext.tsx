'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  SystemRole, 
  GranularPermission, 
  DataScopeType,
  UserDataScope,
  AuthUser, 
  AuthTokens,
  ApprovalRequest,
  AuditLogEvent,
  ApprovalStatus
} from '@truerefurb/shared-types';
import { ROLE_CONFIGS, APPROVAL_MATRIX } from '@truerefurb/config';

interface AuthContextType {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  approvalRequests: ApprovalRequest[];
  auditLogs: AuditLogEvent[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchDemoRole: (role: SystemRole) => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; token?: string; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  hasPermission: (permission: GranularPermission) => boolean;
  hasRole: (roles: SystemRole | SystemRole[]) => boolean;
  canAccessScope: (scope: DataScopeType, targetFacilityId?: string, assignedToId?: string) => boolean;
  createApprovalRequest: (req: Omit<ApprovalRequest, 'id' | 'createdAt' | 'status' | 'makerId' | 'makerName' | 'makerRole'>) => Promise<ApprovalRequest>;
  reviewApprovalRequest: (requestId: string, action: 'APPROVED' | 'REJECTED', comment: string) => Promise<{ success: boolean; error?: string }>;
  canApprove: (request: ApprovalRequest) => boolean;
  recordAuditEvent: (event: Omit<AuditLogEvent, 'id' | 'timestamp' | 'tamperSealHash' | 'actorId' | 'actorName' | 'actorRole' | 'tenantId' | 'facilityId'>) => void;
}

// Enterprise Seeding for Operational Personas
const DEMO_USERS: Record<SystemRole, AuthUser> = {
  SUPER_ADMIN: {
    id: 'usr-super-00',
    email: 'elizabeth.vance@truerefurb.com',
    fullName: 'Elizabeth Vance',
    role: 'SUPER_ADMIN',
    badgeId: 'BADGE-HQ-001',
    tenantId: 'TEN-GLOBAL',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'GLOBAL', tenantId: 'TEN-GLOBAL' },
    permissions: ROLE_CONFIGS.SUPER_ADMIN.permissions,
  },
  TENANT_ADMIN: {
    id: 'usr-tenant-01',
    email: 'alexa.vance@truerefurb.com',
    fullName: 'Alexa Vance',
    role: 'TENANT_ADMIN',
    badgeId: 'BADGE-ADM-001',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'TENANT', tenantId: 'TEN-001', facilityId: 'AUS-HUB-04' },
    permissions: ROLE_CONFIGS.TENANT_ADMIN.permissions,
  },
  OPERATIONS_MANAGER: {
    id: 'usr-ops-02',
    email: 'carlos.m@truerefurb.com',
    fullName: 'Carlos Mendoza',
    role: 'OPERATIONS_MANAGER',
    badgeId: 'BADGE-OPS-042',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'TENANT', tenantId: 'TEN-001', facilityId: 'AUS-HUB-04' },
    permissions: ROLE_CONFIGS.OPERATIONS_MANAGER.permissions,
  },
  QA_SUPERVISOR: {
    id: 'usr-qasup-03',
    email: 'sarah.lin@truerefurb.com',
    fullName: 'Sarah Lin',
    role: 'QA_SUPERVISOR',
    badgeId: 'BADGE-QA-088',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'DEPARTMENT', tenantId: 'TEN-001', departmentId: 'QA' },
    permissions: ROLE_CONFIGS.QA_SUPERVISOR.permissions,
  },
  QA_INSPECTOR: {
    id: 'usr-qainsp-04',
    email: 'mei.chen@truerefurb.com',
    fullName: 'Mei Chen',
    role: 'QA_INSPECTOR',
    badgeId: 'BADGE-QA-012',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'DEPARTMENT', tenantId: 'TEN-001', departmentId: 'QA' },
    permissions: ROLE_CONFIGS.QA_INSPECTOR.permissions,
  },
  REPAIR_TECHNICIAN: {
    id: 'usr-tech-05',
    email: 'marcus.v@truerefurb.com',
    fullName: 'Marcus Vance',
    role: 'REPAIR_TECHNICIAN',
    badgeId: 'BADGE-BCH-109',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'ASSIGNED', tenantId: 'TEN-001', assignedIds: ['dev-001', 'dev-002'] },
    permissions: ROLE_CONFIGS.REPAIR_TECHNICIAN.permissions,
  },
  INVENTORY_MANAGER: {
    id: 'usr-invmgr-06',
    email: 'darius.c@truerefurb.com',
    fullName: 'Darius Cole',
    role: 'INVENTORY_MANAGER',
    badgeId: 'BADGE-WH-021',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'WAREHOUSE', tenantId: 'TEN-001', warehouseId: 'AUS-WH-01' },
    permissions: ROLE_CONFIGS.INVENTORY_MANAGER.permissions,
  },
  WAREHOUSE_CLERK: {
    id: 'usr-whclerk-07',
    email: 'jackson.p@truerefurb.com',
    fullName: 'Jackson Price',
    role: 'WAREHOUSE_CLERK',
    badgeId: 'BADGE-WH-104',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'WAREHOUSE', tenantId: 'TEN-001', warehouseId: 'AUS-WH-01' },
    permissions: ROLE_CONFIGS.WAREHOUSE_CLERK.permissions,
  },
  FINANCE_MANAGER: {
    id: 'usr-finmgr-08',
    email: 'rachel.adams@truerefurb.com',
    fullName: 'Rachel Adams',
    role: 'FINANCE_MANAGER',
    badgeId: 'BADGE-FIN-003',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'TENANT', tenantId: 'TEN-001' },
    permissions: ROLE_CONFIGS.FINANCE_MANAGER.permissions,
  },
  SALES_MANAGER: {
    id: 'usr-slsmgr-09',
    email: 'vikram.patel@truerefurb.com',
    fullName: 'Vikram Patel',
    role: 'SALES_MANAGER',
    badgeId: 'BADGE-SLS-001',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'TENANT', tenantId: 'TEN-001' },
    permissions: ROLE_CONFIGS.SALES_MANAGER.permissions,
  },
  SALES_EXECUTIVE: {
    id: 'usr-slsexec-10',
    email: 'elena.r@truerefurb.com',
    fullName: 'Elena Rostova',
    role: 'SALES_EXECUTIVE',
    badgeId: 'BADGE-SLS-015',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'OWN', tenantId: 'TEN-001' },
    permissions: ROLE_CONFIGS.SALES_EXECUTIVE.permissions,
  },
  ECOMMERCE_MANAGER: {
    id: 'usr-ecom-11',
    email: 'sophia.taylor@truerefurb.com',
    fullName: 'Sophia Taylor',
    role: 'ECOMMERCE_MANAGER',
    badgeId: 'BADGE-ECM-007',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'TENANT', tenantId: 'TEN-001' },
    permissions: ROLE_CONFIGS.ECOMMERCE_MANAGER.permissions,
  },
  DIAGNOSTICS_LEAD: {
    id: 'usr-diag-12',
    email: 'kevin.zhao@truerefurb.com',
    fullName: 'Kevin Zhao',
    role: 'DIAGNOSTICS_LEAD',
    badgeId: 'BADGE-DLD-005',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'DEPARTMENT', tenantId: 'TEN-001', departmentId: 'DIAG' },
    permissions: ROLE_CONFIGS.DIAGNOSTICS_LEAD.permissions,
  },
  PROCUREMENT_MANAGER: {
    id: 'usr-proc-13',
    email: 'lucas.morales@truerefurb.com',
    fullName: 'Lucas Morales',
    role: 'PROCUREMENT_MANAGER',
    badgeId: 'BADGE-PRC-002',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'TENANT', tenantId: 'TEN-001' },
    permissions: ROLE_CONFIGS.PROCUREMENT_MANAGER.permissions,
  },
  CUSTOMER_SUPPORT: {
    id: 'usr-cs-14',
    email: 'chloe.martin@truerefurb.com',
    fullName: 'Chloe Martin',
    role: 'CUSTOMER_SUPPORT',
    badgeId: 'BADGE-SUP-019',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'ASSIGNED', tenantId: 'TEN-001' },
    permissions: ROLE_CONFIGS.CUSTOMER_SUPPORT.permissions,
  },
  SUPPLIER: {
    id: 'usr-supp-15',
    email: 'partner@nordicrefurb.com',
    fullName: 'Nordic Electronics Wholesalers',
    role: 'SUPPLIER',
    badgeId: 'PORTAL-SUPP-901',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'OWN', tenantId: 'TEN-001' },
    permissions: ROLE_CONFIGS.SUPPLIER.permissions,
  },
  CUSTOMER_BUYER: {
    id: 'usr-buyer-16',
    email: 'david.miller@enterprisefleet.com',
    fullName: 'David Miller',
    role: 'CUSTOMER_BUYER',
    badgeId: 'PORTAL-BUY-410',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'OWN', tenantId: 'TEN-001' },
    permissions: ROLE_CONFIGS.CUSTOMER_BUYER.permissions,
  },
  AUDITOR: {
    id: 'usr-audit-17',
    email: 'arthur.dent@bsi-assurance.org',
    fullName: 'Arthur Dent',
    role: 'AUDITOR',
    badgeId: 'AUDIT-ISO-14001',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    dataScope: { scopeType: 'TENANT', tenantId: 'TEN-001' },
    permissions: ROLE_CONFIGS.AUDITOR.permissions,
  },
};

// Initial Seed Approvals
const INITIAL_APPROVAL_REQUESTS: ApprovalRequest[] = [
  {
    id: 'apr-001',
    transactionType: 'GRADE_OVERRIDE',
    title: 'Grade Override: iPhone 15 Pro Max (Grade B → Grade A)',
    entityType: 'DEVICE',
    entityId: 'dev-001',
    makerId: 'usr-qainsp-04',
    makerName: 'Mei Chen',
    makerRole: 'QA_INSPECTOR',
    approverRole: 'QA_SUPERVISOR',
    status: 'PENDING',
    urgency: 'HIGH',
    oldValue: 'GRADE_B',
    newValue: 'GRADE_A',
    justification: 'Chassis micro-scratches polished with OEM diamond compound. Flawless under 500 lux reinspection.',
    createdAt: '2026-09-25T11:15:00Z',
  },
  {
    id: 'apr-002',
    transactionType: 'STOCK_ADJUSTMENT',
    title: 'Stock Adjustment: ThinkPad X1 Carbon Gen 11 (+1 count)',
    entityType: 'INVENTORY',
    entityId: 'dev-004',
    makerId: 'usr-whclerk-07',
    makerName: 'Jackson Price',
    makerRole: 'WAREHOUSE_CLERK',
    approverRole: 'INVENTORY_MANAGER',
    status: 'PENDING',
    urgency: 'ROUTINE',
    oldValue: '14 Units in Bay 2',
    newValue: '15 Units in Bay 2',
    justification: 'Physical inventory audit identified mis-shelved sealed carton from Lot #4092.',
    createdAt: '2026-09-25T10:45:00Z',
  },
  {
    id: 'apr-003',
    transactionType: 'IMEI_CORRECTION',
    title: 'Hardware IMEI Typo Correction: Galaxy S24 Ultra',
    entityType: 'DEVICE',
    entityId: 'dev-003',
    makerId: 'usr-tech-05',
    makerName: 'Marcus Vance',
    makerRole: 'REPAIR_TECHNICIAN',
    approverRole: 'TENANT_ADMIN',
    status: 'PENDING',
    urgency: 'CRITICAL',
    oldValue: '359102948201920',
    newValue: '359102948201928',
    justification: 'Dock barcode scanner misread digit 8 as 0 due to optical glare on sticker.',
    createdAt: '2026-09-25T09:30:00Z',
  },
  {
    id: 'apr-004',
    transactionType: 'REPAIR_COMPLETION',
    title: 'Repair Completion Sign-off: MacBook Pro 16" M3 Max',
    entityType: 'REPAIR',
    entityId: 'dev-002',
    makerId: 'usr-tech-05',
    makerName: 'Marcus Vance',
    makerRole: 'REPAIR_TECHNICIAN',
    approverRole: 'QA_SUPERVISOR',
    status: 'PENDING',
    urgency: 'ROUTINE',
    oldValue: 'Bench Repair Active',
    newValue: 'QA Sign-off Required',
    justification: 'Replaced spacebar scissor clips & thermal thermal paste applied. Ready for QA.',
    createdAt: '2026-09-25T11:40:00Z',
  },
];

// Initial Immutable Audit Logs
const INITIAL_AUDIT_LOGS: AuditLogEvent[] = [
  {
    id: 'aud-9801',
    actorId: 'usr-qasup-03',
    actorName: 'Sarah Lin',
    actorRole: 'QA_SUPERVISOR',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    action: 'DEVICE_GRADE_CERTIFY',
    entity: 'DEVICE',
    entityId: 'dev-001',
    oldValue: { status: 'UNGRADED' },
    newValue: { grade: 'GRADE_A_PLUS', trueScore: 98 },
    reason: 'Final optical inspection passed CTA-2053 standards',
    approvalId: 'apr-001',
    ipAddress: '10.0.4.120',
    timestamp: '2026-09-25T11:20:00Z',
    tamperSealHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'aud-9800',
    actorId: 'usr-tenant-01',
    actorName: 'Alexa Vance',
    actorRole: 'TENANT_ADMIN',
    tenantId: 'TEN-001',
    facilityId: 'AUS-HUB-04',
    action: 'POLICY_UPDATE_ENFORCED',
    entity: 'POLICY_ENGINE',
    entityId: 'POL-RBAC-04',
    oldValue: 'Simple CRUD',
    newValue: 'Granular RBAC + Data Scope + Approval + Audit',
    reason: 'Migration to Production Security Matrix',
    ipAddress: '10.0.1.15',
    timestamp: '2026-09-25T09:00:00Z',
    tamperSealHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(DEMO_USERS.QA_SUPERVISOR);
  const [tokens, setTokens] = useState<AuthTokens | null>({
    accessToken: 'demo-jwt-access-token-qasup',
    refreshToken: 'demo-jwt-refresh-token-qasup',
    expiresIn: 3600,
    tokenType: 'Bearer',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(INITIAL_APPROVAL_REQUESTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEvent[]>(INITIAL_AUDIT_LOGS);

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('truerefurb_system_role') as SystemRole;
      if (storedRole && DEMO_USERS[storedRole]) {
        setUser(DEMO_USERS[storedRole]);
      }
    } catch {}
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsLoading(false);

    if (password.length < 6) {
      return { success: false, error: 'Invalid credentials. Password must be >= 6 characters.' };
    }

    const foundUser = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === email.toLowerCase());
    const targetUser = foundUser || {
      ...DEMO_USERS.REPAIR_TECHNICIAN,
      email,
      fullName: email.split('@')[0],
    };

    setUser(targetUser);
    setTokens({
      accessToken: `jwt-access-${Date.now()}`,
      refreshToken: `jwt-refresh-${Date.now()}`,
      expiresIn: 3600,
      tokenType: 'Bearer',
    });

    try {
      localStorage.setItem('truerefurb_system_role', targetUser.role);
    } catch {}

    recordAuditEvent({
      action: 'USER_LOGIN_SUCCESS',
      entity: 'SESSION',
      entityId: targetUser.id,
      ipAddress: '10.0.4.15',
      reason: 'Standard credentials authentication',
    });

    return { success: true };
  };

  const logout = () => {
    if (user) {
      recordAuditEvent({
        action: 'USER_LOGOUT',
        entity: 'SESSION',
        entityId: user.id,
        ipAddress: '10.0.4.15',
        reason: 'User initiated sign-out',
      });
    }
    setUser(null);
    setTokens(null);
    try {
      localStorage.removeItem('truerefurb_system_role');
    } catch {}
  };

  const switchDemoRole = (role: SystemRole) => {
    const selected = DEMO_USERS[role];
    if (selected) {
      setUser(selected);
      setTokens({
        accessToken: `jwt-access-${role.toLowerCase()}-${Date.now()}`,
        refreshToken: `jwt-refresh-${role.toLowerCase()}-${Date.now()}`,
        expiresIn: 3600,
        tokenType: 'Bearer',
      });
      try {
        localStorage.setItem('truerefurb_system_role', role);
      } catch {}

      recordAuditEvent({
        action: 'ROLE_SWITCH_DEMO',
        entity: 'USER',
        entityId: selected.id,
        oldValue: user?.role,
        newValue: role,
        reason: `Testing Persona: ${ROLE_CONFIGS[role].title}`,
        ipAddress: '10.0.4.15',
      });
    }
  };

  const requestPasswordReset = async (email: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const token = 'RST-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    return { success: true, token };
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await new Promise((r) => setTimeout(r, 400));
    if (!token || newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }
    return { success: true };
  };

  const hasPermission = (permission: GranularPermission): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (roles: SystemRole | SystemRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const canAccessScope = (scope: DataScopeType, targetFacilityId?: string, assignedToId?: string): boolean => {
    if (!user) return false;
    if (user.dataScope.scopeType === 'GLOBAL') return true;
    if (user.dataScope.scopeType === 'TENANT') return true;
    if (user.dataScope.scopeType === 'WAREHOUSE') {
      return !targetFacilityId || user.facilityId === targetFacilityId;
    }
    if (user.dataScope.scopeType === 'ASSIGNED') {
      return !assignedToId || (user.dataScope.assignedIds?.includes(assignedToId) ?? false);
    }
    return true;
  };

  const createApprovalRequest = async (
    req: Omit<ApprovalRequest, 'id' | 'createdAt' | 'status' | 'makerId' | 'makerName' | 'makerRole'>
  ): Promise<ApprovalRequest> => {
    if (!user) throw new Error('Unauthenticated user');

    const newRequest: ApprovalRequest = {
      ...req,
      id: `apr-${Date.now()}`,
      makerId: user.id,
      makerName: user.fullName,
      makerRole: user.role,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    setApprovalRequests((prev) => [newRequest, ...prev]);

    recordAuditEvent({
      action: 'APPROVAL_REQUEST_CREATED',
      entity: 'APPROVAL',
      entityId: newRequest.id,
      newValue: { type: newRequest.transactionType, entityId: newRequest.entityId },
      reason: newRequest.justification,
      ipAddress: '10.0.4.15',
    });

    return newRequest;
  };

  const canApprove = (request: ApprovalRequest): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    if (user.role === 'TENANT_ADMIN' && request.approverRole !== 'SUPER_ADMIN') return true;
    return user.role === request.approverRole;
  };

  const reviewApprovalRequest = async (
    requestId: string,
    action: 'APPROVED' | 'REJECTED',
    comment: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Unauthenticated' };

    const target = approvalRequests.find((r) => r.id === requestId);
    if (!target) return { success: false, error: 'Approval request not found' };

    if (!canApprove(target)) {
      return { 
        success: false, 
        error: `Access Denied: Requires [${target.approverRole}] approval authority. Current role is ${user.role}.` 
      };
    }

    setApprovalRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          status: action,
          approverId: user.id,
          approverName: user.fullName,
          reviewComment: comment,
          reviewedAt: new Date().toISOString(),
        };
      })
    );

    recordAuditEvent({
      action: `APPROVAL_${action}`,
      entity: target.entityType,
      entityId: target.entityId,
      oldValue: target.oldValue,
      newValue: target.newValue,
      reason: comment,
      approvalId: target.id,
      ipAddress: '10.0.4.15',
    });

    return { success: true };
  };

  const recordAuditEvent = (
    event: Omit<AuditLogEvent, 'id' | 'timestamp' | 'tamperSealHash' | 'actorId' | 'actorName' | 'actorRole' | 'tenantId' | 'facilityId'>
  ) => {
    const actor = user || DEMO_USERS.SUPER_ADMIN;
    const newLog: AuditLogEvent = {
      ...event,
      id: `aud-${Math.floor(1000 + Math.random() * 9000)}`,
      actorId: actor.id,
      actorName: actor.fullName,
      actorRole: actor.role,
      tenantId: actor.tenantId,
      facilityId: actor.facilityId,
      timestamp: new Date().toISOString(),
      tamperSealHash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!user,
        isLoading,
        approvalRequests,
        auditLogs,
        login,
        logout,
        switchDemoRole,
        requestPasswordReset,
        resetPassword,
        hasPermission,
        hasRole,
        canAccessScope,
        createApprovalRequest,
        reviewApprovalRequest,
        canApprove,
        recordAuditEvent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
