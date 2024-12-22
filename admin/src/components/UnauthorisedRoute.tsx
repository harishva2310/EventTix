import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";


export function Unauthorized(): JSX.Element {
    const {  logout } = useAuth0();
    return (
      <div>
        <h1>Unauthorized Access</h1>
        <p>You don't have permission to access this page.</p>
        <Button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
              Sign Out
            </Button>
      </div>
    );
  }