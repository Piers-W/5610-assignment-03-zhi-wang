// detail.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Details from '../components/Details';
import { BrowserRouter } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

jest.mock('@auth0/auth0-react');

describe("Details Component Tests", () => {
  beforeEach(() => {
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      user: { sub: '123' },
      getAccessTokenSilently: jest.fn(),
    });
  });

  it("loads details and reviews on mount", async () => {
    global.fetch = jest.fn((url) =>
      Promise.resolve({
        ok: true,
        json: () => url.includes('/reviews')
          ? Promise.resolve([{ id: 1, comment: 'Great movie!', rating: 5, user: { name: 'User1', auth0Id: '123' } }])
          : Promise.resolve({ id: 'tt123', title: 'Inception', year: '2010', poster: 'http://example.com/poster.jpg' })
      })
    );

    render(<BrowserRouter><Details /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Inception (2010)')).toBeInTheDocument();
      expect(screen.getByText(/Great movie!/i)).toBeInTheDocument();
    });
  });
});

// Test for submitting a new review
it("handles submitting a new review correctly", async () => {
    const userResponse = jest.fn();
    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (options && options.method === 'POST') {
        userResponse();
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 2,
            comment: 'Nice!',
            rating: 4,
            user: { name: 'User2', auth0Id: '124' }
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      });
    });
  
    render(<BrowserRouter><Details /></BrowserRouter>);
    await waitFor(() => {
      const commentInput = screen.getByPlaceholderText("Your comment");
      fireEvent.change(commentInput, { target: { value: 'Nice!' } });
      const ratingInput = screen.getByLabelText("Rate the movie from 1 to 5");
      fireEvent.change(ratingInput, { target: { value: '4' } });
  
      const submitButton = screen.getByText("Submit Review");
      expect(submitButton).not.toBeDisabled();  
      fireEvent.click(submitButton);
    });
  
    await waitFor(() => {
      expect(userResponse).toHaveBeenCalled();  
      expect(screen.getByText('Nice!')).toBeInTheDocument();  
    });
  });
  
// Test for editing a review
it("allows user to edit their review", async () => {
    global.fetch = jest.fn().mockImplementation((url, options = {}) => {
      if (url.includes('reviews') && options.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 1,
            comment: 'Updated review!',
            rating: 5,
            user: { name: 'User1', auth0Id: '123' }
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{
          id: 1,
          comment: 'Great movie!',
          rating: 5,
          user: { name: 'User1', auth0Id: '123' }
        }])
      });
    });
  
    render(<BrowserRouter><Details /></BrowserRouter>);
    await waitFor(() => {
      fireEvent.click(screen.getByText("Edit"));
      fireEvent.change(screen.getByPlaceholderText("Your comment"), { target: { value: 'Updated review!' } });
      fireEvent.click(screen.getByText("Update Review"));
    });
  
    await waitFor(() => {
      expect(screen.getByText("Updated review!")).toBeInTheDocument();  
    });
  });
  
