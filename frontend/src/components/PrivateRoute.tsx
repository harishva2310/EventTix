import { useAuth0 } from '@auth0/auth0-react'
import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading ,loginWithRedirect } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    loginWithRedirect()
    return null
  }

  return children;
};

export default ProtectedRoute;
