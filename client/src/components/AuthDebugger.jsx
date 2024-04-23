import { useAuth0 } from "@auth0/auth0-react";
import { useAuthToken } from "../AuthTokenContext";
import NavigationBar from './NavigationBar';
import '../style/debugger.css';

export default function AuthDebugger() {
  const { user } = useAuth0();
  const { accessToken } = useAuthToken();

  return (
    <div className="app-container" role="main">
        <NavigationBar />
        <div className="token-display">
            <h2 className="token-label">Access Token:</h2>  
            <pre className="token-value" aria-label="Access Token Value">{JSON.stringify(accessToken, null, 2)}</pre>
        </div>
        <div className="user-info-display">
            <h2 className="user-info-label">User Info</h2>  
            <pre className="user-info-value" aria-label="User Information">{JSON.stringify(user, null, 2)}</pre>
        </div>
    </div>
  );
}
