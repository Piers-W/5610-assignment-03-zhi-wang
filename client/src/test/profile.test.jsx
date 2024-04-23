import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "../components/Profile";
import { useAuth0 } from "@auth0/auth0-react";
import '@testing-library/jest-dom/extend-expect';

jest.mock("@auth0/auth0-react");

describe("Profile Component Tests", () => {
  const mockUser = {
    email: "user@example.com",
    sub: "auth0|1234567890"
  };

  beforeEach(() => {
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      getAccessTokenSilently: jest.fn(() => Promise.resolve("fake-token"))
    });
  });

  test("renders loading or not authenticated message when user is not authenticated", () => {
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      user: null,
      getAccessTokenSilently: jest.fn()
    });
    render(<Profile />);
    expect(screen.getByText("Loading or user not authenticated...")).toBeInTheDocument();
  });

  test("displays user information correctly when authenticated", async () => {
    render(<Profile />);
    await waitFor(() => {
      expect(screen.getByText(`Email: ${mockUser.email}`)).toBeInTheDocument();
    });
    expect(screen.getByText("Update Username")).toBeInTheDocument();
  });

  test("updates username when form is submitted", async () => {
    const fakeResponse = { name: "New Username" };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fakeResponse)
    });

    render(<Profile />);
    fireEvent.click(screen.getByText("Update Username"));
    fireEvent.change(screen.getByPlaceholderText("Enter new username"), { target: { value: "New Username" } });
    fireEvent.click(screen.getByText("Save Username"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/user/auth0|1234567890/name"), expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: `Bearer fake-token`
        }),
        body: JSON.stringify({ newName: "New Username" })
      }));
      expect(screen.getByText("New Username")).toBeInTheDocument();
    });
  });
});
