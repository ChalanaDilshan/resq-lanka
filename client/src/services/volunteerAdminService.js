import axios from 'axios';
import { getToken } from './authService';
import { API_AUTH_URL } from './apiConfig';

const AUTH_API_URL = API_AUTH_URL;

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetch all registered volunteers with demographic NIC details & reliability stats
 * @param {object} params { status, search, district }
 */
export const fetchVolunteers = async (params = {}) => {
  try {
    const response = await axios.get(`${AUTH_API_URL}/volunteers`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to load volunteer directory.';
    throw new Error(message, { cause: error });
  }
};

/**
 * Update volunteer vetting status (Verified, Flagged, Suspended, or Pending_Review)
 * @param {string} id Volunteer User ID
 * @param {string} status 'Verified' | 'Flagged' | 'Suspended' | 'Pending_Review'
 * @param {string} notes Optional coordinator evaluation notes
 */
export const updateVolunteerStatus = async (id, status, notes = '') => {
  try {
    const response = await axios.patch(
      `${AUTH_API_URL}/volunteers/${id}/status`,
      { status, notes },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to update volunteer status.';
    throw new Error(message, { cause: error });
  }
};

/**
 * Update volunteer reliability metrics (incrementCompleted, incrementNoShow, or reset)
 * @param {string} id Volunteer User ID
 * @param {string} action 'incrementCompleted' | 'incrementNoShow' | 'reset'
 * @param {string} notes Optional evaluation note
 */
export const updateVolunteerReliability = async (id, action, notes = '') => {
  try {
    const response = await axios.patch(
      `${AUTH_API_URL}/volunteers/${id}/reliability`,
      { action, notes },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to update volunteer reliability metrics.';
    throw new Error(message, { cause: error });
  }
};

