const API_URL = 'http://localhost:5000/api';

// A helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An API error occurred');
  }
  return data;
};

// Function to handle user login
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

// Function to handle user registration
export const registerUser = async (name, email, password, role) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  return handleResponse(response);
};

// Function to get the current user's profile
export const getMe = async (token) => {
  const response = await fetch(`${API_URL}/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};