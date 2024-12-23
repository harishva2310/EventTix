// src/auth/Auth0ProviderWithHistory.tsx
import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';

interface Auth0ProviderProps {
  children: ReactNode;
}

const Auth0ProviderWithHistory = ({ children }: Auth0ProviderProps) => {
    const domain = import.meta.env.VITE_AUTH0_DOMAIN;
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID_TICKETAPP;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin+"/profile",
        audience: "https://ticketbookingapp.auth0/api",
        scope: "openid profile email read:profile update:profile"
      }}
      cacheLocation="localstorage"
      
    >
      {children}
    </Auth0Provider>
  );
}

export default Auth0ProviderWithHistory;
