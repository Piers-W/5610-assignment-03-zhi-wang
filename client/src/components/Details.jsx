import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react'; 
import NavigationBar from './NavigationBar';

const MovieDetails = () => {
  const { imdbID } = useParams();
  const { isAuthenticated, getAccessTokenSilently, user ,loginWithRedirect} = useAuth0();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingComment, setEditingComment] = useState('');
  const [editingRating, setEditingRating] = useState(5);

  useEffect(() => {
    fetchMovieAndReviews();
  }, [imdbID]);

  const fetchMovieAndReviews = async () => {
    const movieResponse = await fetch(`http://localhost:8000/api/movies/${imdbID}`);
    const reviewsResponse = await fetch(`http://localhost:8000/api/movies/${imdbID}/reviews`);

    if (movieResponse.ok) {
      const movieData = await movieResponse.json();
      setMovie(movieData);
    }

    if (reviewsResponse.ok) {
      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData);
      updateAverageRating(reviewsData);
    }
  };

  const updateAverageRating = (reviews) => {
    const average = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    setAverageRating(average.toFixed(1));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.alert("Please log in to submit a review.");
      return;
    }
    

    const accessToken = await getAccessTokenSilently();
    const response = await fetch('http://localhost:8000/api/reviews', {
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
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`http://localhost:8000/api/reviews/${reviewId}`, {
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

  const startEdit = (review) => {
    setEditingReviewId(review.id);
    setEditingComment(review.comment);
    setEditingRating(review.rating);
  };

  const handleEditReview = async (e) => {
    e.preventDefault();
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`http://localhost:8000/api/reviews/${editingReviewId}`, {
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
    }
  };

  return (
    <div>
      <NavigationBar />
      {movie ? (
        <div>
          <h2>{movie.title} ({movie.year})</h2>
          <p>Average Rating: {averageRating || 'No ratings yet'}</p>
          <img src={movie.poster} alt={movie.title} />
          <form onSubmit={handleReviewSubmit}>
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Your comment" required></textarea>
            <input type="number" value={newRating} onChange={(e) => setNewRating(e.target.value)} min="1" max="5" required />
            <button type="submit">Submit Review</button>
          </form>
          <div>
            {reviews.map(review => (
              <div key={review.id}>
                <p>{review.user?.name || "Anonymous"}: {review.comment}</p>
                <p>Rating: {review.rating}</p>
                {isAuthenticated && user.sub === review.user.auth0Id && (
                  <div>
                    <button onClick={() => startEdit(review)}>Edit</button>
                    <button onClick={() => handleDeleteReview(review.id)}>Delete</button>
                  </div>
                )}
                {editingReviewId === review.id && (
                  <form onSubmit={handleEditReview}>
                    <textarea value={editingComment} onChange={(e) => setEditingComment(e.target.value)} required />
                    <input type="number" value={editingRating} onChange={(e) => setEditingRating(e.target.value)} min="1" max="5" required />
                    <button type="submit">Update Review</button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Loading movie details...</p>
      )}
    </div>
  );
};

export default MovieDetails;