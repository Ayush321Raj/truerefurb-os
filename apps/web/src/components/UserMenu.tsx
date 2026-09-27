'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  ChevronDown, 
  LogOut, 
  Check, 
  ShieldCheck, 
  Layers,
  MapPin,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SystemRole } from '@truerefurb/shared-types';

interface UserMenuProps {
  onOpenAuthModal: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onOpenAuthModal }) => {
  const { user, isAuthenticated, logout, switchDemoRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <button 
        id="btn-open-login"
        className="btn btn-secondary" 
        onClick={onOpenAuthModal}
      >
        <User size={16} />
        <span>Sign In</span>
      </button>
    );
  }

  const getRoleColor = (role: SystemRole) => {
    switch (role) {
      case 'SUPER_ADMIN': return '#f43f5e';
      case 'TENANT_ADMIN': return '#10b981';
      case 'OPERATIONS_MANAGER': return '#00f2fe';
      case 'QA_SUPERVISOR': return '#8b5cf6';
      case 'QA_INSPECTOR': return '#a78bfa';
      case 'REPAIR_TECHNICIAN': return '#f59e0b';
      case 'INVENTORY_MANAGER': return '#3b82f6';
      case 'WAREHOUSE_CLERK': return '#60a5fa';
      case 'FINANCE_MANAGER': return '#10b981';
      case 'SALES_MANAGER': return '#fb923c';
      case 'ECOMMERCE_MANAGER': return '#ec4899';
      case 'AUDITOR': return '#94a3b8';
      default: return '#38bdf8';
    }
  };

  const KEY_PERSONAS: Array<{ role: SystemRole; title: string; scope: string }> = [
    { role: 'SUPER_ADMIN', title: 'Elizabeth Vance', scope: 'GLOBAL' },
    { role: 'TENANT_ADMIN', title: 'Alexa Vance', scope: 'TENANT' },
    { role: 'OPERATIONS_MANAGER', title: 'Carlos Mendoza', scope: 'TENANT' },
    { role: 'QA_SUPERVISOR', title: 'Sarah Lin', scope: 'DEPARTMENT' },
    { role: 'QA_INSPECTOR', title: 'Mei Chen', scope: 'DEPARTMENT' },
    { role: 'REPAIR_TECHNICIAN', title: 'Marcus Vance', scope: 'ASSIGNED' },
    { role: 'INVENTORY_MANAGER', title: 'Darius Cole', scope: 'WAREHOUSE' },
    { role: 'WAREHOUSE_CLERK', title: 'Jackson Price', scope: 'WAREHOUSE' },
    { role: 'FINANCE_MANAGER', title: 'Rachel Adams', scope: 'TENANT' },
    { role: 'SALES_MANAGER', title: 'Vikram Patel', scope: 'TENANT' },
    { role: 'ECOMMERCE_MANAGER', title: 'Sophia Taylor', scope: 'TENANT' },
    { role: 'AUDITOR', title: 'Arthur Dent', scope: 'READ-ONLY' },
  ];

  return (
    <div className="user-menu-container" style={{ position: 'relative' }} ref={menuRef}>
      <button
        id="user-profile-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '0.4rem 0.75rem',
          cursor: 'pointer',
          color: '#fff',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: getRoleColor(user.role),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontWeight: 800,
            fontSize: '0.75rem',
          }}
        >
          {user.fullName.charAt(0)}
        </div>

        <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
            {user.fullName}
          </div>
          <div style={{ fontSize: '0.65rem', color: getRoleColor(user.role), fontWeight: 700 }}>
            {user.role.replace(/_/g, ' ')}
          </div>
        </div>

        <ChevronDown size={14} color="var(--text-muted)" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="user-profile-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '320px',
            background: '#131a2a',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            padding: '1rem',
            zIndex: 100,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* User & Scope info */}
          <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>{user.fullName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', fontSize: '0.7rem' }}>
              <span className="badge" style={{ background: 'rgba(0, 242, 254, 0.12)', color: 'var(--accent-cyan)', padding: '0.15rem 0.45rem' }}>
                <Layers size={10} style={{ marginRight: '0.2rem' }} /> Scope: {user.dataScope.scopeType}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                {user.facilityId}
              </span>
            </div>
          </div>

          {/* Granular Permissions overview */}
          <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Granular Permissions
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                {user.permissions.length} Active
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {user.permissions.slice(0, 4).map((p) => (
                <span key={p} className="font-mono" style={{ fontSize: '0.62rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.15rem 0.35rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                  {p}
                </span>
              ))}
              {user.permissions.length > 4 && (
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', padding: '0.15rem' }}>
                  +{user.permissions.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Persona Switcher */}
          <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.4rem' }}>
              Switch Persona (Test Production Matrix)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.35rem', maxHeight: '180px', overflowY: 'auto' }}>
              {KEY_PERSONAS.map((p) => {
                const isCurrent = user.role === p.role;
                return (
                  <button
                    key={p.role}
                    onClick={() => {
                      switchDemoRole(p.role);
                      setIsOpen(false);
                    }}
                    style={{
                      background: isCurrent ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: isCurrent ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '0.4rem 0.5rem',
                      fontSize: '0.675rem',
                      fontWeight: 600,
                      color: isCurrent ? 'var(--accent-cyan)' : '#cbd5e1',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ lineHeight: '1.1' }}>
                      <div style={{ fontWeight: 600 }}>{p.role.split('_')[0]}</div>
                      <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>{p.scope}</div>
                    </div>
                    {isCurrent && <Check size={11} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logout */}
          <div style={{ paddingTop: '0.75rem' }}>
            <button
              id="btn-sign-out"
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'none',
                border: 'none',
                color: 'var(--accent-rose)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '0.4rem 0',
              }}
            >
              <LogOut size={16} />
              <span>Sign Out Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
