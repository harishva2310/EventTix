// src/components/ProtectedRoute.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, loginWithRedirect, user, getAccessTokenSilently } = useAuth0();
  const token = getAccessTokenSilently();
  console.log("Token:", token);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    loginWithRedirect();
    return null;
  }

  // Check for admin role if required
  if (requireAdmin) {
    const userRoles = user?.[`https://ticketbookingapp.com/roles`] as string[];
    const isAdmin = userRoles?.includes('TicketBookingApp Admin');

    if (!isAdmin) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
