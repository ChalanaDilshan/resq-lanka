/**
 * Centralized API endpoint routing
 * - Reads platform environment variables configured in Vercel / GitHub
 * - In production: defaults to the public Render backend API
 * - In local development: defaults to http://localhost:5000/api
 */
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  if (import.meta.env.PROD || !isLocalhost) {
    return 'https://resq-lanka-api.onrender.com/api';
  }

  return 'http://localhost:5000/api';
};

const BASE_API_URL = getApiBaseUrl();

export const API_BASE_URL = BASE_API_URL;
export const API_AUTH_URL =
  import.meta.env.VITE_API_AUTH_URL || `${BASE_API_URL}/auth`;
export const API_SOS_URL =
  import.meta.env.VITE_API_SOS_URL || `${BASE_API_URL}/sos`;
export const API_SHELTER_URL =
  import.meta.env.VITE_API_SHELTER_URL || `${BASE_API_URL}/shelters`;
export const API_SUPPLY_URL =
  import.meta.env.VITE_API_SUPPLY_URL || `${BASE_API_URL}/supplies`;
export const API_TASK_URL =
  import.meta.env.VITE_API_TASK_URL || `${BASE_API_URL}/tasks`;
export const API_NOTICE_URL =
  import.meta.env.VITE_API_NOTICE_URL || `${BASE_API_URL}/notices`;

export default {
  API_BASE_URL,
  API_AUTH_URL,
  API_SOS_URL,
  API_SHELTER_URL,
  API_SUPPLY_URL,
  API_TASK_URL,
  API_NOTICE_URL,
};
