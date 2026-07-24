# Frontend reference

The SPA is React 19 + Vite + React Router, styled with Tailwind utilities and semantic theme variables. `App.jsx` defines public, student, mentor and admin routes. `AuthContext` holds session state; `SocketContext` manages real-time events; `ThemeContext` persists light/dark/system preference. API calls live under `src/services` and use the configured backend base URL.

Dashboard routes are guarded by `ProtectedRoute` and role allow-lists. Public survey-token routes are intentionally unauthenticated. The UI cannot by itself secure a route; backend authorization remains the enforcement point.
