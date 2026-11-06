import axios from 'axios';
import { API_TASK_URL } from './apiConfig';

const API_BASE_URL = API_TASK_URL;
const TOKEN_KEY = 'resq_jwt_token';

// Helper to get authenticated header for privileged actions
const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fallback emergency relief tasks matching Sri Lanka context
export const fallbackTasks = [
  {
    _id: 'task-fallback-1',
    title: 'Dry Ration Survival Packs Packing & Sealing',
    description:
      'Assemble emergency food packs containing rice, dhal, canned fish, tea, and infant biscuits for flood-affected families in the Gal Oya basin. Work involves sorting, packing, and quality checking.',
    category: 'Dry Rations & Food Packing',
    priority: 'Urgent',
    status: 'Open',
    district: 'Ampara',
    location: 'Ampara Central College Staging Hall, Central Road, Ampara',
    requiredVolunteers: 15,
    assignedVolunteersCount: 4,
    skillsRequired: ['Packing & Sorting', 'Quality Checking', 'Physical Stamina'],
    safetyInstructions:
      'Wear closed-toe footwear and high-visibility vests. Maintain hygiene guidelines for handling food rations. Heavy lifting (>15kg) is restricted to designated logistics teams.',
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    contactPerson: 'Eng. N. Senanayake',
    contactPhone: '+94 63 222 2341',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: 'task-fallback-2',
    title: 'Clean Drinking Water Distribution at Kalmunai High-Ground Center',
    description:
      'Manage distribution queue and ensure orderly distribution of 5L clean water bottles to registered flood evacuees. Coordinate with shelter staff to log distributed units.',
    category: 'Supply Distribution & Transport',
    priority: 'High',
    status: 'Open',
    district: 'Ampara',
    location: 'Kalmunai National School Gate 2 Distribution Point',
    requiredVolunteers: 8,
    assignedVolunteersCount: 3,
    skillsRequired: ['Crowd Management', 'Inventory Logging', 'Tamil or Sinhala fluency'],
    safetyInstructions:
      'Avoid standing near vehicular delivery bays. Drink water regularly and take sun protection precautions. Non-swimmers must remain strictly within elevated tarmac areas.',
    scheduledDate: new Date(Date.now() + 86400000 * 1).toISOString(),
    contactPerson: 'Mrs. K. Tharmalingam',
    contactPhone: '+94 67 222 1455',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    _id: 'task-fallback-3',
    title: 'High-Ground Evacuee Reception & Registration Desk',
    description:
      'Welcome incoming displaced families, record registration details, and issue relief tokens. Assist nursing mothers and elderly evacuees to allocated shelter zones.',
    category: 'Community Coordination & Help Desk',
    priority: 'Medium',
    status: 'Open',
    district: 'Ampara',
    location: 'Akkaraipattu Municipal Council Auditorium',
    requiredVolunteers: 6,
    assignedVolunteersCount: 2,
    skillsRequired: ['Registration / Data Entry', 'Empathetic Communication', 'Bilingual Support'],
    safetyInstructions:
      'Civilian volunteers must remain at the designated registration hall. Do not accompany vehicles into inundated areas.',
    scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    contactPerson: 'Eng. M. Rizwan',
    contactPhone: '+94 67 227 7890',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    _id: 'task-fallback-4',
    title: 'Batticaloa Relief Center First Aid & Hygiene Kit Station',
    description:
      'Assist paramedical staff with distributing wound dressing packs, antiseptic liquid, and hygiene kits to shelter residents. Non-medical volunteers handle registration and supply restocking.',
    category: 'Medical Aid & First Aid Support',
    priority: 'Urgent',
    status: 'Open',
    district: 'Batticaloa',
    location: 'Batticaloa Hindu College Auditorium, New Road',
    requiredVolunteers: 10,
    assignedVolunteersCount: 2,
    skillsRequired: ['Basic First Aid awareness', 'Sanitation Handling', 'Record Keeping'],
    safetyInstructions:
      'Gloves and masks must be worn at all times in the medical station. Direct all clinical emergencies immediately to DMC medical officers on site.',
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    contactPerson: 'Dr. V. Sivakumar',
    contactPhone: '+94 65 222 4110',
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    _id: 'task-fallback-5',
    title: 'Child Care & Educational Activities at Akkaraipattu Camp',
    description:
      'Supervise art sessions, storytelling, and structured recreational activities for displaced children in the safe child-friendly space to reduce disaster trauma.',
    category: 'Elderly & Child Care Assistance',
    priority: 'Medium',
    status: 'Open',
    district: 'Ampara',
    location: 'Akkaraipattu Public Ground Pavilion Wing B',
    requiredVolunteers: 5,
    assignedVolunteersCount: 1,
    skillsRequired: ['Child Protection Awareness', 'Teaching / Art skills', 'Patience'],
    safetyInstructions:
      'Follow child safeguarding policy. At least two adult volunteers must be present at all times. Never leave designated safe zone.',
    scheduledDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    contactPerson: 'Mr. S. Perera',
    contactPhone: '+94 67 222 3400',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
];

/**
 * Fetch all tasks with optional filters
 */
export const getTasks = async (params = {}) => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params,
      headers: getAuthHeaders(),
      timeout: 8000,
    });
    return response.data?.tasks || response.data || [];
  } catch (error) {
    console.warn('API error fetching tasks, using fallback dataset:', error.message);
    // Filter fallback tasks locally if server is offline
    let filtered = [...fallbackTasks];
    if (params.category && params.category !== 'All') {
      filtered = filtered.filter((t) => t.category === params.category);
    }
    if (params.priority && params.priority !== 'All') {
      filtered = filtered.filter((t) => t.priority === params.priority);
    }
    if (params.status && params.status !== 'All') {
      filtered = filtered.filter((t) => t.status === params.status);
    }
    if (params.district && params.district !== 'All') {
      filtered = filtered.filter(
        (t) => t.district.toLowerCase() === params.district.toLowerCase()
      );
    }
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q)
      );
    }
    return filtered;
  }
};

/**
 * Fetch aggregated task metrics
 */
export const getTaskStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats`, {
      timeout: 5000,
    });
    return response.data?.stats;
  } catch (error) {
    console.warn('API error fetching task stats, calculating from local fallback:', error.message);
    const totalTasks = fallbackTasks.length;
    const openTasks = fallbackTasks.filter((t) => t.status === 'Open').length;
    const totalVolunteersRequired = fallbackTasks.reduce(
      (acc, t) => acc + (t.requiredVolunteers || 0),
      0
    );
    const totalVolunteersAssigned = fallbackTasks.reduce(
      (acc, t) => acc + (t.assignedVolunteersCount || 0),
      0
    );
    return {
      totalTasks,
      openTasks,
      assignedTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
      cancelledTasks: 0,
      totalVolunteersRequired,
      totalVolunteersAssigned,
      availableSlots: totalVolunteersRequired - totalVolunteersAssigned,
    };
  }
};

/**
 * Fetch task details by ID
 */
export const getTaskById = async (taskId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${taskId}`, {
      headers: getAuthHeaders(),
      timeout: 6000,
    });
    return response.data;
  } catch (error) {
    // If fallback
    const match = fallbackTasks.find((t) => t._id === taskId);
    if (match) {
      return { success: true, task: match, userApplication: null, applications: [] };
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to load volunteer task details.';
    throw new Error(message, { cause: error });
  }
};

/**
 * Create a new task (Administrator / Coordinator only)
 */
export const createTask = async (taskData) => {
  try {
    const response = await axios.post(API_BASE_URL, taskData, {
      headers: getAuthHeaders(),
      timeout: 8000,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to create volunteer task.';
    throw new Error(message, { cause: error });
  }
};

/**
 * Update task details or status (Administrator / Coordinator only)
 */
export const updateTask = async (taskId, updateData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${taskId}`, updateData, {
      headers: getAuthHeaders(),
      timeout: 8000,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to update volunteer task.';
    throw new Error(message, { cause: error });
  }
};

/**
 * Delete a task (Administrator / Coordinator only)
 */
export const deleteTask = async (taskId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${taskId}`, {
      headers: getAuthHeaders(),
      timeout: 8000,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to delete volunteer task.';
    throw new Error(message, { cause: error });
  }
};

/**
 * Submit volunteer application for a task
 */
export const applyForTask = async (taskId, applicationData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/${taskId}/apply`,
      applicationData,
      {
        headers: getAuthHeaders(),
        timeout: 8000,
      }
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to submit volunteer application.';
    throw new Error(message, { cause: error });
  }
};

/**
 * Get current volunteer's own applications and assignments
 */
export const getMyApplications = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/my-applications`, {
      headers: getAuthHeaders(),
      timeout: 8000,
    });
    return response.data?.applications || [];
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to retrieve your volunteer applications.';
    throw new Error(message, { cause: error });
  }
};

/**
 * Get roster of applications for a specific task (Administrator / Coordinator only)
 */
export const getTaskApplications = async (taskId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${taskId}/applications`, {
      headers: getAuthHeaders(),
      timeout: 8000,
    });
    return response.data?.applications || [];
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to retrieve task applicant roster.';
    throw new Error(message, { cause: error });
  }
};

/**
 * Review application: Approve or Reject (Administrator / Coordinator only)
 */
export const reviewApplication = async (applicationId, { status, reviewNotes }) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/applications/${applicationId}/review`,
      { status, reviewNotes },
      {
        headers: getAuthHeaders(),
        timeout: 8000,
      }
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to update application review status.';
    throw new Error(message, { cause: error });
  }
};

/**
 * Withdraw an application (Volunteer self-service)
 */
export const withdrawApplication = async (applicationId) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/applications/${applicationId}/withdraw`,
      {},
      {
        headers: getAuthHeaders(),
        timeout: 8000,
      }
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to withdraw application.';
    throw new Error(message, { cause: error });
  }
};
