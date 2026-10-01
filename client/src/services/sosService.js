const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/sos';


export const createSOSRequest = async (formData) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to submit SOS request');
  }

  return response.json();
};


export const fetchSOSRequests = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.status && filters.status !== 'All') queryParams.append('status', filters.status);
  if (filters.hazard && filters.hazard !== 'All') queryParams.append('hazard', filters.hazard);
  if (filters.urgency && filters.urgency !== 'All') queryParams.append('urgency', filters.urgency);

  const url = queryParams.toString() ? `${API_BASE_URL}?${queryParams}` : API_BASE_URL;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to retrieve emergency incidents');
  }

  return response.json();
};


export const updateSOSStatus = async (id, status) => {
  const response = await fetch(`${API_BASE_URL}/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update incident status');
  }

  return response.json();
};