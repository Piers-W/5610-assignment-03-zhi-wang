import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import MovieDetails from "../components/MovieDetails";
import { BrowserRouter as Router } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

jest.mock("@auth0/auth0-react");

const mockGetAccessTokenSilently = jest.fn();
const mockUser = {
  sub: "auth0|123456",
  name: "Test User"
};

useAuth0.mockReturnValue({
  isAuthenticated: true,
  user: mockUser,
  getAccessTokenSilently: mockGetAccessTokenSilently
});

describe("MovieDetails Component Tests", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          title: "Harry Potter",
          year: "2001",
          imdbID: "tt0295297",
          poster: "http://example.com/potter.jpg",
          reviews: [
            { id: 1, userId: mockUser.sub, rating: 5, comment: "Great movie!", user: mockUser }
          ]
        })
      })
    );
  });

  test("renders movie details and reviews", async () => {
    render(
      <Router>
        <MovieDetails />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText("Harry Potter (2001)")).toBeInTheDocument();
      expect(screen.getByText("Average Rating:")).toBeInTheDocument();
      expect(screen.getByText("Great movie!")).toBeInTheDocument();
    });
  });

  test("allows user to edit their review", async () => {
    render(
      <Router>
        <MovieDetails />
      </Router>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText("Edit"));
      const editTextArea = screen.getByLabelText("Type your comment here");
      fireEvent.change(editTextArea, { target: { value: "Updated comment" } });
      fireEvent.submit(screen.getByText("Update Review"));
    });

    expect(mockGetAccessTokenSilently).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("api/reviews/1"), // Assuming the endpoint and ID of review
      expect.objectContaining({
        method: "PUT"
      })
    );
  });

  test("displays loading text initially", () => {
    render(
      <Router>
        <MovieDetails />
      </Router>
    );

    expect(screen.getByText("Loading movie details...")).toBeInTheDocument();
  });
});
