import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

type ProtectedRouteProps = {
  children: ReactNode;
};

// Reads the JWT payload (no verification). The server still verifies every request,
// so this is only a UI guard to keep non-admin or expired tokens out of the admin pages.
const readPayload = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

const isAdminToken = (token: string | null) => {
  if (!token) return false;
  const payload = readPayload(token);
  if (!payload || payload.role !== 'admin') return false;
  return !payload.exp || payload.exp * 1000 > Date.now();
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('adminToken');

  if (!isAdminToken(token)) {
    localStorage.removeItem('adminToken');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}