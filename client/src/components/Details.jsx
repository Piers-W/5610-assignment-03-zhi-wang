import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import NavigationBar from './NavigationBar';
import '../style/details.css';

const MovieDetails = () => {
  const { imdbID } = useParams(); // Get IMDb ID from URL params
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0(); // Auth0 authentication
  const [movie, setMovie] = useState(null); // State for movie details
  const [reviews, setReviews] = useState([]); // State for movie reviews
  const [averageRating, setAverageRating] = useState(null); // State for average rating of the movie
  const [newComment, setNewComment] = useState(''); // State for new comment
  const [newRating, setNewRating] = useState(5); // State for new rating
  const [editingReviewId, setEditingReviewId] = useState(null); // State for ID of review being edited
  const [editingComment, setEditingComment] = useState(''); // State for comment being edited
  const [editingRating, setEditingRating] = useState(5); // State for rating being edited
  const [hasReviewed, setHasReviewed] = useState(false); // State to track if user has reviewed the movie

  useEffect(() => {
    fetchMovieAndReviews();
  }, [imdbID]); // Fetch movie details and reviews on component mount and when IMDb ID changes

  // Fetch movie details and reviews from server
  const fetchMovieAndReviews = async () => {
    const movieResponse = await fetch(`http://localhost:8000/movies/${imdbID}`);
    const reviewsResponse = await fetch(`http://localhost:8000/movies/${imdbID}/reviews`);

    if (movieResponse.ok) {
      const movieData = await movieResponse.json();
      setMovie(movieData);
    }

    if (reviewsResponse.ok) {
      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData);
      updateAverageRating(reviewsData);
      setHasReviewed(reviewsData.some(review => review.user.auth0Id === user.sub));
    }
  };

  // Calculate and update average rating
  const updateAverageRating = (reviews) => {
    const average = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    setAverageRating(average.toFixed(1));
  };

  // Handle submission of a new review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.alert("Please log in to submit a review.");
      return;
    }

    const accessToken = await getAccessTokenSilently();
    const response = await fetch('https://assignment-03-zhi-wang.onrender.com/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        userId: user.sub,
        movieId: movie.id,
        comment: newComment,
        rating: parseInt(newRating)
      })
    });

    if (response.ok) {
      const newReview = await response.json();
      setReviews([...reviews, newReview]);
      setNewComment('');
      setNewRating(5);
      updateAverageRating([...reviews, newReview]);
      setHasReviewed(true);
    }
  };

  // Handle deletion of a review
  const handleDeleteReview = async (reviewId) => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`https://assignment-03-zhi-wang.onrender.com/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (response.ok) {
      const updatedReviews = reviews.filter(review => review.id !== reviewId);
      setReviews(updatedReviews);
      updateAverageRating(updatedReviews);
    }
  };

  // Initialize editing mode for a review
  const startEdit = (review) => {
    setEditingReviewId(review.id);
    setEditingComment(review.comment);
    setEditingRating(review.rating);
  };

  // Handle submission of edited review
  const handleEditReview = async (e) => {
    e.preventDefault();
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`https://assignment-03-zhi-wang.onrender.com/reviews/${editingReviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        userId: user.sub,
        comment: editingComment,
        rating: parseInt(editingRating)
      })
    });

    if (response.ok) {
      const updatedReview = await response.json();
      const updatedReviews = reviews.map(review => review.id === updatedReview.id ? updatedReview : review);
      setReviews(updatedReviews);
      setEditingReviewId(null);
      setEditingComment('');
      setEditingRating(5);
      updateAverageRating(updatedReviews);
    } else {
      // Cancel editing and reset the editing form
      setEditingReviewId(null);
      setEditingComment('');
      setEditingRating(5);
    }
  };

  // Cancel editing mode for a review
  const cancelEdit = () => {
    setEditingReviewId(null);
    setEditingComment('');
    setEditingRating(5);
  };

  return (
    <div className="movie-details" role="main">
      <NavigationBar />
      {movie ? (
        <div className="movie-content">
          <h2 className="movie-title">{movie.title} ({movie.year})</h2>
          <p className="movie-rating">Average Rating: {averageRating || 'No ratings yet'}</p>
          <img src={movie.poster} alt={movie.title} className="movie-poster" />
          <form onSubmit={handleReviewSubmit} className="review-form" aria-labelledby="review-form">
            <label htmlFor="comment" className="visually-hidden">Your comment</label>
            <textarea 
              id="comment"
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)} 
              placeholder="Your comment" 
              required 
              disabled={!isAuthenticated || hasReviewed}
              className="review-textarea"
              aria-label="Type your comment here"
            />
            <label htmlFor="rating" className="visually-hidden">Rating</label>
            <input 
              type="number" 
              id="rating"
              value={newRating} 
              onChange={(e) => setNewRating(e.target.value)} 
              min="1" 
              max="5" 
              required 
              disabled={!isAuthenticated || hasReviewed}
              className="review-rating-input"
              aria-label="Rate the movie from 1 to 5"
            />
            <button type="submit" className={`submit-review-btn ${hasReviewed ? 'disabled-btn' : ''}`} disabled={hasReviewed}>Submit Review</button>
          </form>
          <h2>Movie Reviews</h2>
          <div className="reviews-container" aria-live="polite">
            {reviews.map(review => (
              <div key={review.id} className="review-item">
                <p className="review-user">{review.user?.name || "Anonymous"}: {review.comment}</p>
                <p className="review-score">Rating: {review.rating}</p>
                {isAuthenticated && user.sub === review.user.auth0Id && (
                  <div className="review-actions">
                    <button onClick={() => startEdit(review)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDeleteReview(review.id)} className="delete-btn">Delete</button>
                    {editingReviewId === review.id && (
                      <form onSubmit={handleEditReview} className="edit-form">
                        <textarea value={editingComment} onChange={(e) => setEditingComment(e.target.value)} required className="edit-textarea"/>
                        <input type="number" value={editingRating} onChange={(e) => setEditingRating(e.target.value)} min="1" max="5" required className="edit-rating-input"/>
                        <button type="submit" className="update-review-btn">Update Review</button>
                        <button type="button" onClick={cancelEdit} className="cancel-edit-btn">Cancel</button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="loading-text">Loading movie details...</p>
      )}
    </div>
  );
}

export default MovieDetails;

