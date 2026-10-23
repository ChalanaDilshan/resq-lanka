import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_NOTICE_URL || 'http://localhost:5000/api/notices';
const TOKEN_KEY = 'resq_jwt_token';

// Helper to get authenticated header for privileged actions
const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Realistic fallback emergency notices matching Sri Lanka disaster context
export const fallbackNotices = [
  {
    _id: 'notice-fallback-1',
    title: 'Red Alert: Severe Flash Flood & Reservoir Spilling Warning in Gal Oya Basin',
    message:
      'Disaster Management Centre (DMC) and Irrigation Department have issued an immediate RED ALERT for low-lying areas of the Gal Oya basin. Senanayake Samudraya and surrounding spillways are operating at full capacity with sluice gates opened. Displaced residents must evacuate immediately to designated high-ground shelters at Ampara Central College or Kalmunai National School.',
    hazardType: 'Flood',
    severity: 'Critical',
    affectedDistricts: ['Ampara', 'Batticaloa'],
    sourceName: 'Disaster Management Centre (DMC) & Irrigation Department',
    sourceUrl: 'https://www.dmc.gov.lk',
    isOfficial: true,
    verificationStatus: 'Verified',
    verificationNotes: 'Confirmed via National Disaster Management Centre emergency bulletin #DMC-E-2026-09.',
    publicationStatus: 'Published',
    publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    contactNumber: '117 (DMC Hotline) / +94 63 222 2341',
    createdByName: 'Disaster Management Centre',
  },
  {
    _id: 'notice-fallback-2',
    title: 'Severe Weather Warning: Torrential Monsoon Rains Exceeding 150mm',
    message:
      'Department of Meteorology warns that heavy monsoon rainfall exceeding 150mm is forecasted across Eastern, Northern, and North-Central provinces. Wind gusts up to 60km/h expected during thundershowers. Naval and coastal fishing communities are strictly advised not to venture into deep sea areas until further notice.',
    hazardType: 'Heavy Rainfall',
    severity: 'High',
    affectedDistricts: ['Ampara', 'Batticaloa', 'Trincomalee', 'Mullaitivu', 'Polonnaruwa'],
    sourceName: 'Department of Meteorology Sri Lanka',
    sourceUrl: 'https://www.meteo.gov.lk',
    isOfficial: true,
    verificationStatus: 'Verified',
    verificationNotes: 'Verified against Weather Warning Circular MET-SRI-2026-A10.',
    publicationStatus: 'Published',
    publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 1).toISOString(),
    contactNumber: '011-2694801',
    createdByName: 'Department of Meteorology',
  },
  {
    _id: 'notice-fallback-3',
    title: 'Level 2 Amber Landslide Warning for Sloped Areas in Central Highlands',
    message:
      'National Building Research Organisation (NBRO) has placed hilly divisional secretariats under Level 2 (Amber) Landslide Early Warning following continuous rain accumulation over 100mm. Residents near steep embankments, cutting failures, and mountain slopes should watch for ground cracks, tilted utility poles, and muddy water springs, and evacuate proactively.',
    hazardType: 'Landslide',
    severity: 'High',
    affectedDistricts: ['Badulla', 'Kegalle', 'Ratnapura', 'Kandy', 'Nuwara Eliya'],
    sourceName: 'National Building Research Organisation (NBRO)',
    sourceUrl: 'https://www.nbro.gov.lk',
    isOfficial: true,
    verificationStatus: 'Verified',
    verificationNotes: 'NBRO Landslide Warning Unit Bulletin 4.',
    publicationStatus: 'Published',
    publishedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    contactNumber: '011-2588946',
    createdByName: 'NBRO Operations Center',
  },
  {
    _id: 'notice-fallback-4',
    title: 'Advisory on Minor Offshore Seismic Activity and Structural Safety',
    message:
      'Geological Survey and Mines Bureau (GSMB) reports minor tremors detected in the offshore seismic belt off the eastern coast. No tsunami threat exists. Citizens are advised to follow standard earthquake safety protocols, remain calm, and avoid older brick buildings showing structural cracks until municipal inspections are complete.',
    hazardType: 'Earthquake',
    severity: 'Medium',
    affectedDistricts: ['Ampara', 'Batticaloa', 'Hambantota'],
    sourceName: 'Geological Survey and Mines Bureau (GSMB)',
    sourceUrl: 'https://www.gsmb.gov.lk',
    isOfficial: true,
    verificationStatus: 'Verified',
    verificationNotes: 'Confirmed by National Seismic Monitoring Network.',
    publicationStatus: 'Published',
    publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    contactNumber: '011-2886289',
    createdByName: 'GSMB Liaison',
  },
  {
    _id: 'notice-fallback-5',
    title: 'Akkarayan Causeway Submerged - Heavy Vehicle Detour Established',
    message:
      'Community Volunteer field report: The minor access culvert bridge connecting Akkarayan village to the A35 road is submerged under 2.5 feet of rapid flood waters. Light vehicles and motorcycles cannot pass. Emergency supply trucks must utilize the Mankulam bypass detour route.',
    hazardType: 'Flood',
    severity: 'Medium',
    affectedDistricts: ['Kilinochchi'],
    sourceName: 'Kilinochchi Community Volunteer Watch',
    sourceUrl: '',
    isOfficial: false,
    verificationStatus: 'Unverified',
    verificationNotes: 'Field volunteer report awaiting verification by regional disaster officer.',
    publicationStatus: 'Published',
    publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 1).toISOString(),
    contactNumber: '+94 21 228 5555',
    createdByName: 'Community Volunteer Watch',
  },
];

/**
 * Fetch notices with query filters
 */
export const getNotices = async (params = {}) => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data?.data || [];
  } catch (error) {
    console.warn('Notice API fetch failed, falling back to local dataset:', error.message);
    let filtered = [...fallbackNotices];

    if (params.hazardType && params.hazardType !== 'All') {
      filtered = filtered.filter((n) => n.hazardType === params.hazardType);
    }
    if (params.severity && params.severity !== 'All') {
      filtered = filtered.filter((n) => n.severity === params.severity);
    }
    if (params.district && params.district !== 'All') {
      filtered = filtered.filter((n) => n.affectedDistricts.includes(params.district));
    }
    if (params.isOfficial === 'true') {
      filtered = filtered.filter((n) => n.isOfficial === true);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          n.sourceName.toLowerCase().includes(q)
      );
    }
    return filtered;
  }
};

/**
 * Fetch notice statistics
 */
export const getNoticeStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats`);
    return response.data?.stats || null;
  } catch (error) {
    console.warn('Notice stats API failed, computing from fallback:', error.message);
    const totalActive = fallbackNotices.length;
    const criticalAlerts = fallbackNotices.filter((n) => n.severity === 'Critical').length;
    const highAlerts = fallbackNotices.filter((n) => n.severity === 'High').length;
    const verifiedOfficialCount = fallbackNotices.filter(
      (n) => n.isOfficial && n.verificationStatus === 'Verified'
    ).length;
    const districtSet = new Set();
    fallbackNotices.forEach((n) => n.affectedDistricts.forEach((d) => districtSet.add(d)));

    return {
      totalActive,
      criticalAlerts,
      highAlerts,
      affectedDistrictsCount: districtSet.size,
      verifiedOfficialCount,
    };
  }
};

/**
 * Fetch notice by ID
 */
export const getNoticeById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data?.data;
  } catch (error) {
    console.warn(`Notice ${id} API fetch failed, checking fallback:`, error.message);
    const found = fallbackNotices.find((n) => n._id === id);
    if (found) return found;
    throw error;
  }
};

/**
 * Create a new emergency notice
 */
export const createNotice = async (noticeData) => {
  const response = await axios.post(API_BASE_URL, noticeData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

/**
 * Update an existing notice
 */
export const updateNotice = async (id, updateData) => {
  const response = await axios.put(`${API_BASE_URL}/${id}`, updateData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

/**
 * Verify or reject source
 */
export const verifyNoticeSource = async (id, verificationData) => {
  const response = await axios.patch(
    `${API_BASE_URL}/${id}/verify`,
    verificationData,
    {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

/**
 * Withdraw an active emergency notice
 */
export const withdrawNotice = async (id, reason) => {
  const response = await axios.patch(
    `${API_BASE_URL}/${id}/withdraw`,
    { reason },
    {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

/**
 * Delete a notice
 */
export const deleteNotice = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
