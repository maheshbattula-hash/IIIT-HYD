import { Request, Response, NextFunction } from 'express';

export type UserRole = 'ADMIN' | 'COLLECTIONS_MANAGER' | 'COLLECTIONS_AGENT' | 'ANALYST';

export interface AuthenticatedUser {
  id: string;
  name: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  // Support role switching via header or query parameter for easy testing in UI
  const roleHeader = (req.headers['x-collectiq-role'] || req.query.role || 'COLLECTIONS_MANAGER') as string;
  const validRoles: UserRole[] = ['ADMIN', 'COLLECTIONS_MANAGER', 'COLLECTIONS_AGENT', 'ANALYST'];
  const activeRole: UserRole = validRoles.includes(roleHeader.toUpperCase() as UserRole)
    ? (roleHeader.toUpperCase() as UserRole)
    : 'COLLECTIONS_MANAGER';

  req.user = {
    id: req.headers['x-collectiq-user-id'] as string || `USER-${activeRole}-01`,
    name: req.headers['x-collectiq-user-name'] as string || `${activeRole.replace('_', ' ')} User`,
    role: activeRole,
  };

  next();
}

/**
 * Mask Sensitive PII for Analyst and Restricted Roles
 */
export function maskCustomerPII(customer: any, role: UserRole): any {
  if (role === 'ADMIN' || role === 'COLLECTIONS_MANAGER' || role === 'COLLECTIONS_AGENT') {
    return customer;
  }

  // Mask PII for Analyst role
  const masked = { ...customer };
  if (masked.primary_phone) {
    masked.primary_phone = masked.primary_phone.slice(0, 3) + '*****' + masked.primary_phone.slice(-3);
  }
  if (masked.secondary_phone) {
    masked.secondary_phone = '******' + masked.secondary_phone.slice(-4);
  }
  if (masked.email) {
    const parts = masked.email.split('@');
    if (parts.length === 2) {
      masked.email = parts[0].slice(0, 2) + '****@' + parts[1];
    }
  }
  if (masked.pan_number) {
    masked.pan_number = 'XXXXX' + masked.pan_number.slice(-4);
  }
  if (masked.address) {
    masked.address = masked.city ? `[Masked Residential Address], ${masked.city}` : '[Masked Residential Address]';
  }

  return masked;
}
