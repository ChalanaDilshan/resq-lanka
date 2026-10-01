import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/sos';

export const createSOSRequest = async (formData) => {
  try {
    const response = await axios.post(API_BASE_URL, formData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to submit SOS request';
    throw new Error(message, { cause: error });
  }
};

export const fetchSOSRequests = async (filters = {}) => {
  try {
    const params = {};
    if (filters.status && filters.status !== 'All') params.status = filters.status;
    if (filters.hazard && filters.hazard !== 'All') params.hazard = filters.hazard;
    if (filters.urgency && filters.urgency !== 'All') params.urgency = filters.urgency;

    const response = await axios.get(API_BASE_URL, { params });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to retrieve emergency incidents';
    throw new Error(message, { cause: error });
  }
};

export const updateSOSStatus = async (id, status) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/${id}/status`, { status });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to update incident status';
    throw new Error(message, { cause: error });
  }
};