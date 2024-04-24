import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import '../style/home.css';

const Home = () => {
  const [movies, setMovies] = useState([]); // State to store fetched movies

  useEffect(() => {
    const fetchData = async () => {
      const url = 'https://movie-database-alternative.p.rapidapi.com/?s=harry potter&r=json&page=1'; // URL for fetching movie data
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': '13238c97a9msh8a1c1d0d65ff6f8p100703jsn21fdae6a5b6b',
          'X-RapidAPI-Host': 'movie-database-alternative.p.rapidapi.com'
        }
      };

      try {
        const response = await fetch(url, options); // Fetch movie data from the API
        const data = await response.json(); // Parse the JSON response
        if (data && data.Search) {
          setMovies(data.Search); // Set the fetched movies in state
          data.Search.forEach(movie => saveMovieToDatabase(movie)); // Save each movie to the database
        }
      } catch (error) {
        console.error('Error fetching data: ', error); // Log any errors that occur during fetching
      }
    };

    fetchData(); // Call the fetchData function when the component mounts
  }, []);

  // Function to save movie data to the backend database
  const saveMovieToDatabase = async (movie) => {
    try {
      const response = await fetch('https://assignment-03-zhi-wang.onrender.com/api/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: movie.Title,
          year: movie.Year,
          imdbID: movie.imdbID,
          type: movie.Type,
          poster: movie.Poster
        })
      });

      if (response.status === 204) {
        console.log('Movie already exists or was processed without content being returned.');
        return;
      }

      const result = await response.json();
      if (!response.ok) {
        console.error(`Failed to save the movie: ${movie.Title}`, result);
      } else {
        console.log('Movie saved:', result);
      }
    } catch (error) {
      console.error('Failed to save the movie:', error);
    }
  };

  return (
    <div className="home-container" role="main">
      <NavigationBar /> {/* Navigation bar component */}
      <header className="home-header">
        <h1>Movie Rating Platform</h1> {/* Main heading */}
        <h2>Featured Movies</h2> {/* Subheading */}
      </header>
      <ul className="movie-list">
        {/* Render each movie as a list item */}
        {movies.map(movie => (
          <li key={movie.imdbID} className="movie-item">
            <img src={movie.Poster} alt={`${movie.Title} movie poster`} className="movie-poster" /> {/* Movie poster */}
            <h3 className="movie-title">
              <Link to={`/details/${movie.imdbID}`}>{movie.Title}</Link> {/* Link to movie details */}
            </h3>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;


