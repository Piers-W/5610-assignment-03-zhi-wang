import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from 'react-router-dom';
import '../style/profile.css';
import NavigationBar from './NavigationBar';

export default function Profile() {
    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [newUsername, setNewUsername] = useState('');
    const [localUsername, setLocalUsername] = useState('');
    const [showUpdate, setShowUpdate] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        if (!user || !isAuthenticated) {
            console.log("User not authenticated or user data is not available yet.");
            return;
        }

        const fetchUserDetails = async () => {
            const accessToken = await getAccessTokenSilently();
            const userDetailsUrl = `https://assignment-03-zhi-wang.onrender.com/user/${user.sub}`;
            const reviewsUrl = `https://assignment-03-zhi-wang.onrender.com/api/user/reviews`;

            try {
                const userDetailsResponse = await fetch(userDetailsUrl, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                const reviewsResponse = await fetch(reviewsUrl, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (userDetailsResponse.ok && reviewsResponse.ok) {
                    const userData = await userDetailsResponse.json();
                    const reviewData = await reviewsResponse.json();
                    setLocalUsername(userData.name);
                    setReviews(reviewData);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchUserDetails();
    }, [user, isAuthenticated, getAccessTokenSilently]);

    const updateUsername = async () => {
        if (!isAuthenticated) {
            console.log("User not authenticated.");
            return;
        }
        const accessToken = await getAccessTokenSilently();
        const response = await fetch(`https://assignment-03-zhi-wang.onrender.com/user/${user.sub}/name`, {
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

    if (!isAuthenticated) {
        return <p>Loading or user not authenticated...</p>;
    }

    return (
        <div className="profile-container">
            <NavigationBar /> 
            <main> 
                <h1 className="profile-header">Profile</h1>
                <section aria-labelledby="account-info"> 
                    <h2 id="account-info" className="visually-hidden">Account Information</h2>
                    <p className="profile-detail"><span>Email:</span> {user.email}</p>
                    <p className="profile-detail"><span>Username:</span> {isLoading ? 'Loading...' : localUsername}</p>
                </section>
                {showUpdate ? (
                    <form className="profile-update-form" onSubmit={updateUsername}> {/* Use form for proper semantic */}
                        <label htmlFor="new-username" className="visually-hidden">New Username</label> {/* Label for accessibility */}
                        <input 
                            id="new-username"
                            value={newUsername} 
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Enter new username"
                            aria-required="true" // Explicitly specify required for accessibility
                        />
                        <div className="button-group">
                            <button type="submit" className="button-Save">Save Username</button>
                            <button type="button" className="button-Cancel" onClick={() => setShowUpdate(false)}>Cancel Update</button>
                        </div>
                    </form>
                ) : (
                    <button className="button-style" onClick={() => setShowUpdate(true)}>
                        Update Username
                    </button>
                )}
                <section aria-labelledby="reviews-heading"> {/* Use section with aria-labelledby */}
                    <h2 id="reviews-heading">Your Reviews</h2>
                    {reviews.map(review => (
                        <div key={review.id} className="review-item">
                            <Link to={`/details/${review.movie.imdbID}`}>{review.movie.title}</Link>
                            <p>Rating: {review.rating}</p>
                            <p>{review.comment}</p>
                        </div>
                    ))}
                </section>
            </main>
            <button className="debug-button" onClick={() => window.location.href = '/debugger'}>Go to Debugger</button>
        </div>
    );    
}


