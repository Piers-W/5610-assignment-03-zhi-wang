import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useLocation } from 'react-router-dom';
import '../style/NavigationBar.css';

const NavigationBar = () => {
    const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
    const location = useLocation();

    const handleLogin = () => {
        localStorage.setItem('preAuthPath', location.pathname);
        loginWithRedirect();
    };

    return (
        <header className="navigation-bar">
            <h1>Movie Rating</h1>
            <nav aria-label="Main navigation"> {/* Adding aria-label to describe the purpose of the navigation */}
                <Link to="/" className="nav-link">Main</Link>
                {isAuthenticated ? (
                    <>
                        <Link to="/profile" className="nav-link">Profile</Link>
                        <button className="nav-button" onClick={() => logout({ returnTo: window.location.origin })}
                            aria-label="Logout" // Adding aria-label for clarity on the action
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <button className="nav-button" onClick={handleLogin}
                        aria-label="Login" // Adding aria-label for clarity on the action
                    >
                        Login
                    </button>
                )}
            </nav>
        </header>
    );    
};

export default NavigationBar;

