/**
 * Centralized API endpoint routing with production environment safeguards
 * - In production (on Vercel or any live host): strictly routes to https://resq-lanka-api.onrender.com/api
 * - In local development (on localhost:5173): routes to local backend http://localhost:5000/api
 * - Automatically overrides any accidental 'localhost' environment variables when deployed live
 */

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

export const getApiBaseUrl = () => {
  const envBase = import.meta.env.VITE_API_BASE_URL;

  // In production (Vercel / live domain), NEVER connect to localhost
  if (!isLocalhost) {
    if (envBase && !envBase.includes('localhost') && !envBase.includes('127.0.0.1')) {
      return envBase.replace(/\/+$/, '');
    }
    return 'https://resq-lanka-api.onrender.com/api';
  }

  // Local development
  return (envBase || 'http://localhost:5000/api').replace(/\/+$/, '');
};

const resolveEndpoint = (envValue, endpointPath) => {
  const base = getApiBaseUrl();

  // If running live and env variable contains localhost, override to live Render backend
  if (!isLocalhost) {
    if (envValue && !envValue.includes('localhost') && !envValue.includes('127.0.0.1')) {
      return envValue.replace(/\/+$/, '');
    }
    return `${base}/${endpointPath}`;
  }

  return envValue ? envValue.replace(/\/+$/, '') : `${base}/${endpointPath}`;
};

export const API_BASE_URL = getApiBaseUrl();
export const API_AUTH_URL = resolveEndpoint(import.meta.env.VITE_API_AUTH_URL, 'auth');
export const API_SOS_URL = resolveEndpoint(import.meta.env.VITE_API_SOS_URL, 'sos');
export const API_SHELTER_URL = resolveEndpoint(import.meta.env.VITE_API_SHELTER_URL, 'shelters');
export const API_SUPPLY_URL = resolveEndpoint(import.meta.env.VITE_API_SUPPLY_URL, 'supplies');
export const API_TASK_URL = resolveEndpoint(import.meta.env.VITE_API_TASK_URL, 'tasks');
export const API_NOTICE_URL = resolveEndpoint(import.meta.env.VITE_API_NOTICE_URL, 'notices');

export default {
  API_BASE_URL,
  API_AUTH_URL,
  API_SOS_URL,
  API_SHELTER_URL,
  API_SUPPLY_URL,
  API_TASK_URL,
  API_NOTICE_URL,
};
