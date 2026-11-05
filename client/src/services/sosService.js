import axios from 'axios';
import { API_SOS_URL } from './apiConfig';

const API_BASE_URL = API_SOS_URL;

const TOKEN_KEY = 'resq_jwt_token';

const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Submit emergency SOS request
 */
export const createSOSRequest = async (formData) => {
  try {
    const response = await axios.post(API_BASE_URL, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });
    return response.data?.data || response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to submit SOS request. Please try again.';
    throw new Error(message, { cause: error });
  }
};

/**
 * Fetch filtered live emergency incidents
 */
export const fetchSOSRequests = async (filters = {}) => {
  try {
    const params = {};
    if (filters.status && filters.status !== 'All') params.status = filters.status;
    if (filters.hazard && filters.hazard !== 'All') params.hazard = filters.hazard;
    if (filters.urgency && filters.urgency !== 'All') params.urgency = filters.urgency;
    if (filters.search && filters.search.trim()) params.search = filters.search.trim();

    const response = await axios.get(API_BASE_URL, {
      params,
      headers: getAuthHeaders(),
    });
    const result = response.data;
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    return [];
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to retrieve emergency incidents';
    throw new Error(message, { cause: error });
  }
};

/**
 * Fetch single incident by ID
 */
export const fetchSOSById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data?.data || response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to retrieve incident details';
    throw new Error(message, { cause: error });
  }
};

/**
 * Update incident status (authorized responders)
 */
export const updateSOSStatus = async (id, status, note = '') => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/${id}/status`,
      {
        status,
        note,
      },
      {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data?.data || response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to update incident status';
    throw new Error(message, { cause: error });
  }
};
