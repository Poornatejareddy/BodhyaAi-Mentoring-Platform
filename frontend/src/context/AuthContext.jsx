import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true); // To check auth status on initial load

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const res = await fetch('http://localhost:5000/api/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.data);
          } else {
            // Token is invalid or expired
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Error validating token', error);
        }
      }
      setLoading(false);
    };

    validateToken();
  }, [token]);

  const login = (userData, authToken) => {
    localStorage.setItem('authToken', authToken);
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  const authContextValue = { user, token, login, logout, loading };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context easily
export function useAuth() {
  return useContext(AuthContext);
}