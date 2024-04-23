import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import '../style/profile.css';
import NavigationBar from './NavigationBar';

export default function Profile() {
    const { user, getAccessTokenSilently } = useAuth0();
    const [newUsername, setNewUsername] = useState('');
    const [localUsername, setLocalUsername] = useState(''); 
    const [showUpdate, setShowUpdate] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchUserDetails = async () => {
            const accessToken = await getAccessTokenSilently();
            try {
                const response = await fetch(`http://localhost:8000/user/${user.sub}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setLocalUsername(data.name); 
                    setIsLoading(false);
                } else {
                    console.error('Failed to fetch user details');
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        if (user) {
            fetchUserDetails();
        }
    }, [getAccessTokenSilently, user.sub, user]);

    const updateUsername = async () => {
        const accessToken = await getAccessTokenSilently();
        const response = await fetch(`http://localhost:8000/user/${user.sub}/name`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ newName: newUsername })
        });

        if (response.ok) {
            const updatedUser = await response.json();
            setLocalUsername(updatedUser.name);  
            setShowUpdate(false);
            alert('Username updated successfully!');
        } else {
            const error = await response.json();
            alert(`Failed to update username: ${error.error}`);
        }
    };

    return (
        <div>
            <NavigationBar />
            <h1>Profile</h1>
            <p>Email: {user.email}</p>
            <p>Username: {isLoading ? 'Loading...' : localUsername}</p>
            {showUpdate && (
                <div>
                    <input 
                        value={newUsername} 
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Enter new username"
                    />
                    <button onClick={updateUsername}>Save Username</button>
                </div>
            )}
            <button onClick={() => setShowUpdate(!showUpdate)}>
                {showUpdate ? 'Cancel Update' : 'Update Username'}
            </button>
            <button onClick={() => window.location.href = '/debugger'}>Go to Debugger</button>
        </div>
    );
}


