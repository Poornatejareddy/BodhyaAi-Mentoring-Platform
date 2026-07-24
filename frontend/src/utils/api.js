const DEFAULT_BACKEND_URL = 'http://localhost:5000';

const configuredBackendUrl = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || DEFAULT_BACKEND_URL)
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

export const BACKEND_URL = configuredBackendUrl;
export const API_BASE_URL = `${configuredBackendUrl}/api`;
export const SOCKET_URL = configuredBackendUrl;
