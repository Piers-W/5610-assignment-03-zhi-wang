import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "../components/Home";
import '@testing-library/jest-dom';

// Mock the global fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      Search: [
        { imdbID: "tt1234567", Title: "Harry Potter", Year: "2001", Type: "movie", Poster: "http://example.com/potter.jpg" },
        { imdbID: "tt2345678", Title: "Lord of the Rings", Year: "2002", Type: "movie", Poster: "http://example.com/rings.jpg" }
      ]
    })
  })
);

describe("Home Component Tests", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test("renders without crashing and displays movies", async () => {
    render(<Home />);
    expect(screen.getByText("Movie Rating Platform")).toBeInTheDocument();
    expect(screen.getByText("Featured Movies")).toBeInTheDocument();

    // Wait for the movies to be displayed
    await waitFor(() => {
      expect(screen.getByText("Harry Potter")).toBeInTheDocument();
      expect(screen.getByText("Lord of the Rings")).toBeInTheDocument();
    });

    // Check that the images are rendered
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'http://example.com/potter.jpg');
    expect(images[1]).toHaveAttribute('src', 'http://example.com/rings.jpg');
  });

  test("handles API failure gracefully", async () => {
    fetch.mockImplementationOnce(() => Promise.reject("API is down"));
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText("Failed to load movies")).toBeInTheDocument();
    });
  });

  test("checks if movie data is saved to the database", async () => {
    render(<Home />);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/movies', expect.any(Object));
    });
  });
});
