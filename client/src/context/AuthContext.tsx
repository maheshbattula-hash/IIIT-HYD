import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { setApiRole } from '../api';

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userId: string;
  userName: string;
  permissions: {
    canViewAllCustomers: boolean;
    canViewUnmaskedPII: boolean;
    canApproveNBA: boolean;
    canAccessDataContracts: boolean;
    canAccessAuditLogs: boolean;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('COLLECTIONS_MANAGER');

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    setApiRole(newRole);
  };

  useEffect(() => {
    setApiRole(role);
  }, [role]);

  const permissions = {
    canViewAllCustomers: role !== 'COLLECTIONS_AGENT',
    canViewUnmaskedPII: role !== 'ANALYST',
    canApproveNBA: role === 'ADMIN' || role === 'COLLECTIONS_MANAGER',
    canAccessDataContracts: role === 'ADMIN' || role === 'COLLECTIONS_MANAGER' || role === 'ANALYST',
    canAccessAuditLogs: role === 'ADMIN' || role === 'COLLECTIONS_MANAGER',
  };

  const userMap = {
    ADMIN: { id: 'USER-ADMIN-01', name: 'Dev Sharma (Chief Risk Officer / Admin)' },
    COLLECTIONS_MANAGER: { id: 'USER-MGR-02', name: 'Vikram Seth (Collections Strategy Lead)' },
    COLLECTIONS_AGENT: { id: 'USER-AGENT-104', name: 'Pooja Nair (Field & Tele Agent)' },
    ANALYST: { id: 'USER-ANL-03', name: 'Ananya Roy (Collections Risk Modeler)' },
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        userId: userMap[role].id,
        userName: userMap[role].name,
        permissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
