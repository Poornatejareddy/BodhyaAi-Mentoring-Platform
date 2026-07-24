import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const validThemes = new Set(['light', 'dark', 'system']);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('bodhyai-theme') || 'system');

  useEffect(() => {
    const applyTheme = () => {
      const resolved = theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;
      document.documentElement.dataset.theme = resolved;
    };
    applyTheme();
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [theme]);

  const updateTheme = (nextTheme) => {
    if (!validThemes.has(nextTheme)) return;
    localStorage.setItem('bodhyai-theme', nextTheme);
    setTheme(nextTheme);
  };

  return <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>{children}</ThemeContext.Provider>;
}

// The hook intentionally shares this module with its provider to keep theme state cohesive.
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
