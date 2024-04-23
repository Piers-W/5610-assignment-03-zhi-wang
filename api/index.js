import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";

// Middleware to validate the access token sent by the client
const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: "RS256",
});

const PORT = parseInt(process.env.PORT) || 8080;
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Public endpoint
app.get("/ping", (req, res) => {
  res.send("pong");
});

// Get user information endpoint
app.get("/me", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  
  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });
  res.json(user);
});

// Verify user endpoint
app.post("/verify-user", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`];
  const name = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/name`];
  
  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });
  if (user) {
    res.json(user);
  } else {
    const newUser = await prisma.user.create({
      data: {
        email,
        auth0Id,
        name,
      },
    });
    res.json(newUser);
  }
});

// Endpoint to add a movie
app.post('/movies', async (req, res) => {
  const { title, year, imdbID, type, poster } = req.body;
  
  try {
    const existingMovie = await prisma.movie.findUnique({
      where: { imdbID: imdbID }
    });
    if (existingMovie) {
      return res.status(204).send();
    }

    const newMovie = await prisma.movie.create({
      data: { title, year, imdbID, type, poster }
    });
    res.status(201).json(newMovie);
  } catch (error) {
    console.error('Failed to save movie:', error);
    res.status(500).json({ message: 'Failed to save the movie' });
  }
});

// Endpoint to get reviews for a movie
app.get('/movies/:imdbID/reviews', async (req, res) => {
  const { imdbID } = req.params; 

  try {
    const movie = await prisma.movie.findUnique({
      where: { imdbID: imdbID }
    });

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    const reviews = await prisma.review.findMany({
      where: { movieId: movie.id },
      include: {
        user: true 
      },
      orderBy: {
        createdAt: 'desc' 
      }
    });
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Failed to retrieve reviews for movie with imdbID:', imdbID, error);
    res.status(500).json({ message: 'Failed to retrieve the reviews' });
  }
});

// Update user's name endpoint
app.put('/user/:auth0Id/name', requireAuth, async (req, res) => {
  const { auth0Id } = req.params;
  const { newName } = req.body;

  if (!newName || newName.trim() === '') {
    return res.status(400).json({ error: 'Username must not be empty.' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { auth0Id: auth0Id },
      data: { name: newName.trim() } 
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'User not found.' });
    } else {
      console.error('Failed to update username:', error);
      res.status(500).json({ error: 'Failed to update username' });
    }
  }
});

// Get user's name endpoint
app.get('/user/:auth0Id', requireAuth, async (req, res) => {
  const { auth0Id } = req.params;
  
  try {
      const user = await prisma.user.findUnique({
          where: { auth0Id: auth0Id },  
          select: { name: true }       
      });
      if (!user) {
          return res.status(404).send('User not found');
      }
      res.json({ name: user.name });
  } catch (error) {
      console.error('Error fetching user by Auth0 ID:', error);
      res.status(500).send('Server error');
  }
});

// Get user's reviews endpoint
app.get('/user/reviews', requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub; 
  
  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id: auth0Id },
      include: {
        reviews: {
          include: {
            movie: true 
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.reviews);
  } catch (error) {
    console.error('Error retrieving user reviews:', error);
    res.status(500).send('Failed to retrieve user reviews');
  }
});

// Get movie details endpoint
app.get('/movies/:imdbID', async (req, res) => {
  const { imdbID } = req.params; 

  try {
    const movie = await prisma.movie.findUnique({
      where: { imdbID: imdbID }
    });
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' }); 
    }

    res.status(200).json(movie); 
  } catch (error) {
    console.error('Failed to retrieve movie:', error);
    res.status(500).json({ message: 'Failed to retrieve the movie' }); 
  }
});

// Get reviews for a movie endpoint
app.get('/movies/:imdbID/reviews', async (req, res) => {
  const { imdbID } = req.params; 

  try {
    const movie = await prisma.movie.findUnique({
      where: { imdbID: imdbID }
    });
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    const reviews = await prisma.review.findMany({
      where: { movieId: movie.id },
      include: {
        user: true 
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this movie.' });
    }
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Failed to retrieve reviews for movie with imdbID:', imdbID, error);
    res.status(500).json({ message: 'Failed to retrieve the reviews' });
  }
});

// Add review endpoint
app.post('/reviews', requireAuth, async (req, res) => {
  const { userId, movieId, comment, rating } = req.body;

  // Validate the comment and rating
  if (!comment.trim()) {
    return res.status(400).json({ error: 'Comment cannot be empty.' });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id: userId }
    });
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!user || !movie) {
      return res.status(404).json({ error: 'User or Movie not found.' });
    }

    // Check if the user has already reviewed this movie
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        movieId: movie.id
      }
    });

    if (existingReview) {
      return res.status(403).json({ error: 'You have already reviewed this movie.' });
    }

    const newReview = await prisma.review.create({
      data: {
        userId: user.id,
        movieId,
        comment,
        rating
      },
      include: {
        user: true
      }
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Failed to create review:', error);
    res.status(500).json({ message: 'Failed to create the review' });
  }
});

// Delete review endpoint
app.delete('/reviews/:reviewId', requireAuth, async (req, res) => {
  const { reviewId } = req.params;  
  const auth0UserId = req.auth.payload.sub;  

  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id: auth0UserId }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) }
    });
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }
    if (review.userId !== user.id) {
      return res.status(403).json({ message: 'You can only delete your own reviews.' });
    }
    await prisma.review.delete({
      where: { id: parseInt(reviewId) }
    });
    res.status(204).send(); 
  } catch (error) {
    console.error('Failed to delete review:', error);
    res.status(500).json({ message: 'Failed to delete the review' });
  }
});

// Update review endpoint
app.put('/reviews/:reviewId', requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { userId, comment, rating } = req.body;

  // Validate the comment and rating
  if (!comment.trim()) {
    return res.status(400).json({ error: 'Comment cannot be empty.' });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id: userId }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) }
    });
    if (!review) {
      return res.status(404).json({ error: 'Review not found.' });
    }
    if (review.userId !== user.id) {
      return res.status(403).json({ error: 'You can only update your own reviews.' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(reviewId) },
      data: { comment, rating },
      include: {
        user: true
      }
    });

    res.status(200).json(updatedReview);
  } catch (error) {
    console.error('Failed to update review:', error);
    res.status(500).json({ error: 'Failed to update the review' });
  }
});

// Start server

app.listen(PORT, () => {
 console.log(`Server running on http://localhost:${PORT} 🎉 🚀`);
});


