import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import '../style/home.css';

const Home = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const url = 'https://movie-database-alternative.p.rapidapi.com/?s=harry potter&r=json&page=1';
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': '13238c97a9msh8a1c1d0d65ff6f8p100703jsn21fdae6a5b6b',
          'X-RapidAPI-Host': 'movie-database-alternative.p.rapidapi.com'
        }
      };

      try {
        const response = await fetch(url, options);
        const data = await response.json();
        if (data && data.Search) {
          setMovies(data.Search);
          data.Search.forEach(movie => saveMovieToDatabase(movie)); 
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchData();
  }, []);

  const saveMovieToDatabase = async (movie) => {
    try {
        const response = await fetch('http://localhost:8000/api/movies', {
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
    <div className="home">
      <h1>Movie Rating</h1>
      <NavigationBar />
      <h1>Featured Movies</h1>
      <ul>
        {movies.map(movie => (
          <li key={movie.imdbID}>
            <img src={movie.Poster} alt={movie.Title} />
            <h2><Link to={`/details/${movie.imdbID}`}>{movie.Title}</Link></h2>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;

