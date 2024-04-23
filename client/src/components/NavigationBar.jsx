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
            <nav>
                <Link to="/">Main</Link>
                {isAuthenticated ? (
                    <>
                        <Link to="/profile">Profile</Link>
                        <button onClick={() => logout({ returnTo: window.location.origin })}>
                            Logout
                        </button>
                    </>
                ) : (
                    <button onClick={handleLogin}>Login</button>  // 使用 handleLogin 而不是直接 loginWithRedirect
                )}
            </nav>
        </header>
    );
};

export default NavigationBar;

