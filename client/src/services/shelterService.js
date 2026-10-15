import axios from 'axios';
import shelterAmpara from '../assets/shelter_ampara.jpg';
import shelterAkkaraipattu from '../assets/shelter_akkaraipattu.jpg';
import shelterKalmunai from '../assets/shelter_kalmunai.jpg';

const API_BASE_URL = import.meta.env.VITE_API_SHELTER_URL || 'http://localhost:5000/api/shelters';
const STORAGE_KEY = 'resq_shelters_directory_data_v2';

// Baseline verified shelters categorized by hazard type
const initialFallbackShelters = [
  {
    _id: 'sh-1',
    name: 'Ampara Central College Relief Center',
    hazardType: 'flood',
    hazardCategoryLabel: 'High-Ground Facilities (Floods)',
    capacityTotal: 250,
    capacityCurrent: 145,
    isVerified: true,
    verificationAgency: 'Disaster Management Centre (DMC) Sri Lanka',
    verifiedDate: '2026-09-12T08:00:00.000Z',
    district: 'Ampara',
    address: 'Central College Road, Ampara Town',
    coordinates: { lat: 7.2912, lng: 81.6724 },
    elevationMeters: 42,
    clearanceRadiusMeters: 50,
    status: 'Available',
    image: shelterAmpara,
    coordinator: {
      name: 'Eng. N. Senanayake',
      phone: '+94 63 222 2341',
      email: 'senanayake.ampara@resqlanka.lk',
      designation: 'Principal & Zonal Relief Coordinator',
    },
    facilities: [
      'Clean Drinking Water',
      'First Aid Station',
      'Separated Family Quarters',
      'Backup Generator',
      'Sanitation Units',
      'Community Kitchen',
    ],
    notes:
      'High-elevation flood refuge located 42m above river plain. Safe from Gal Oya overflow basin.',
    occupancyHistory: [
      {
        id: 'log-1',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        previousOccupancy: 110,
        newOccupancy: 145,
        previousCapacity: 250,
        newCapacity: 250,
        changeDelta: 35,
        updatedBy: 'Eng. N. Senanayake (Coordinator)',
        note: 'Admitted 7 families evacuated from low-lying Karangawa village.',
      },
    ],
  },
  {
    _id: 'sh-2',
    name: 'Akkaraipattu Public Ground Staging Area',
    hazardType: 'earthquake',
    hazardCategoryLabel: 'Open Assembly Grounds (Earthquakes)',
    capacityTotal: 600,
    capacityCurrent: 380,
    isVerified: true,
    verificationAgency: 'Disaster Management Centre (DMC) Sri Lanka',
    verifiedDate: '2026-09-11T10:30:00.000Z',
    district: 'Ampara',
    address: 'Beach Road, Akkaraipattu 03',
    coordinates: { lat: 7.2185, lng: 81.8504 },
    elevationMeters: 8,
    clearanceRadiusMeters: 140,
    status: 'Available',
    image: shelterAkkaraipattu,
    coordinator: {
      name: 'Eng. M. Rizwan',
      phone: '+94 67 227 7890',
      email: 'rizwan.akkaraipattu@resqlanka.lk',
      designation: 'Municipal Disaster Response Officer',
    },
    facilities: [
      'Wide Open Tenting Grounds',
      'Mobile Water Tankers',
      'Emergency Sanitation Units',
      'Field Hospital Post',
      'Solar Floodlighting',
      'Helipad Clearance Area',
    ],
    notes:
      'Over 140m clearance from masonry structures, power lines, and falling debris. Ideal earthquake evacuation staging ground.',
    occupancyHistory: [
      {
        id: 'log-2',
        timestamp: new Date(Date.now() - 3600000 * 9).toISOString(),
        previousOccupancy: 320,
        newOccupancy: 380,
        previousCapacity: 600,
        newCapacity: 600,
        changeDelta: 60,
        updatedBy: 'Eng. M. Rizwan (Coordinator)',
        note: 'Registered new arrivals following tremor alert advisory.',
      },
    ],
  },
  {
    _id: 'sh-3',
    name: 'Kalmunai National School High-Ground Haven',
    hazardType: 'flood',
    hazardCategoryLabel: 'High-Ground Facilities (Floods)',
    capacityTotal: 180,
    capacityCurrent: 165,
    isVerified: true,
    verificationAgency: 'Disaster Management Centre (DMC) Sri Lanka',
    verifiedDate: '2026-09-10T14:15:00.000Z',
    district: 'Ampara',
    address: 'Main Street, Kalmunai North',
    coordinates: { lat: 7.4144, lng: 81.8268 },
    elevationMeters: 38,
    clearanceRadiusMeters: 45,
    status: 'Nearly Full',
    image: shelterKalmunai,
    coordinator: {
      name: 'Mrs. K. Tharmalingam',
      phone: '+94 67 222 1455',
      email: 'tharmalingam.kalmunai@resqlanka.lk',
      designation: 'Zonal Emergency Coordinator',
    },
    facilities: [
      'Infirmary & Medical Triage',
      'Infant Nutrition Station',
      'Clean Water Filtration Unit',
      'Disability Ramp Access',
      'Phone Battery Charging Station',
    ],
    notes:
      'Elevated multi-storey reinforced structure safe from monsoon coastal flooding and canal surges.',
    occupancyHistory: [
      {
        id: 'log-3',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        previousOccupancy: 140,
        newOccupancy: 165,
        previousCapacity: 180,
        newCapacity: 180,
        changeDelta: 25,
        updatedBy: 'Mrs. K. Tharmalingam (Coordinator)',
        note: 'Capacity now nearing threshold. Directing incoming vehicles to Ampara Central.',
      },
    ],
  },
  {
    _id: 'sh-4',
    name: 'Batticaloa Hindu College High-Ground Shelter',
    hazardType: 'flood',
    hazardCategoryLabel: 'High-Ground Facilities (Floods)',
    capacityTotal: 300,
    capacityCurrent: 190,
    isVerified: true,
    verificationAgency: 'Disaster Management Centre (DMC) Sri Lanka',
    verifiedDate: '2026-09-13T09:00:00.000Z',
    district: 'Batticaloa',
    address: 'New Road, Batticaloa Town',
    coordinates: { lat: 7.717, lng: 81.6984 },
    elevationMeters: 35,
    clearanceRadiusMeters: 60,
    status: 'Available',
    image: shelterAmpara,
    coordinator: {
      name: 'Dr. V. Sivakumar',
      phone: '+94 65 222 4110',
      email: 'sivakumar.batti@resqlanka.lk',
      designation: 'Regional Relief Coordinator',
    },
    facilities: [
      'Water Purification Plant',
      'Pediatric Care Corner',
      'Backup Solar Inverter',
      'Hot Meal Kitchen',
      'Separate Sanitation Blocks',
    ],
    notes:
      'Elevated institutional campus situated above highest recorded flood line for Batticaloa lagoon.',
    occupancyHistory: [],
  },
  {
    _id: 'sh-5',
    name: 'Galle International Stadium Open Assembly Ground',
    hazardType: 'earthquake',
    hazardCategoryLabel: 'Open Assembly Grounds (Earthquakes)',
    capacityTotal: 1200,
    capacityCurrent: 420,
    isVerified: true,
    verificationAgency: 'Disaster Management Centre (DMC) Sri Lanka',
    verifiedDate: '2026-09-08T11:00:00.000Z',
    district: 'Galle',
    address: 'Cricket Ground Road, Galle Fort Perimeter',
    coordinates: { lat: 6.0329, lng: 80.2168 },
    elevationMeters: 14,
    clearanceRadiusMeters: 220,
    status: 'Available',
    image: shelterAkkaraipattu,
    coordinator: {
      name: 'Capt. A. Jayasuriya',
      phone: '+94 91 223 4567',
      email: 'jayasuriya.galle@resqlanka.lk',
      designation: 'Disaster Evacuation Marshal',
    },
    facilities: [
      'Expansive Open Grass Field',
      'Wide Emergency Ingress / Egress',
      'Water Tankers On-site',
      'Field Hospital Staging',
      'Communication Satellite Terminal',
    ],
    notes:
      'Massive open perimeter ground completely free of tall buildings or structural hazard zones for earthquake recovery.',
    occupancyHistory: [],
  },
  {
    _id: 'sh-6',
    name: 'Colombo Sugathadasa Open Complex Grounds',
    hazardType: 'earthquake',
    hazardCategoryLabel: 'Open Assembly Grounds (Earthquakes)',
    capacityTotal: 950,
    capacityCurrent: 280,
    isVerified: true,
    verificationAgency: 'Disaster Management Centre (DMC) Sri Lanka',
    verifiedDate: '2026-09-09T16:00:00.000Z',
    district: 'Colombo',
    address: 'Prince of Wales Avenue, Colombo 14',
    coordinates: { lat: 6.9497, lng: 79.8656 },
    elevationMeters: 9,
    clearanceRadiusMeters: 180,
    status: 'Available',
    image: shelterAkkaraipattu,
    coordinator: {
      name: 'Ms. Priyanthi Wickramasinghe',
      phone: '+94 11 243 5678',
      email: 'wickramasinghe.colombo@resqlanka.lk',
      designation: 'Metro Emergency Response Lead',
    },
    facilities: [
      'Mass Evacuation Ingress',
      'Clean Water Points',
      'Red Cross Triage Station',
      'Emergency Ambulance Bay',
      'Perimeter Lighting',
    ],
    notes:
      'Open stadium grounds designated by Disaster Management Centre for urban earthquake evacuation.',
    occupancyHistory: [],
  },
];

// Helper to get local storage
const getLocalData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Could not read shelter local storage:', err);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialFallbackShelters));
  return initialFallbackShelters;
};

// Helper to save local storage
const saveLocalData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Could not save shelter local storage:', err);
  }
};

/**
 * Fetch all verified shelters with filtering
 */
export const fetchShelters = async (params = {}) => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params,
      timeout: 3000,
    });
    if (response.data?.success && Array.isArray(response.data.data)) {
      // Sync local storage with fresh backend items
      saveLocalData(response.data.data);
      return response.data.data;
    }
  } catch {
    // Backend offline / error: fallback to localStorage gracefully
  }

  // Fallback filtering in memory
  let list = getLocalData();
  const { hazardType, district, status, search } = params;

  if (hazardType && hazardType !== 'all') {
    list = list.filter((s) => s.hazardType === hazardType);
  }

  if (district && district !== 'all') {
    list = list.filter((s) => s.district.toLowerCase().includes(district.toLowerCase()));
  }

  if (status && status !== 'all') {
    list = list.filter((s) => s.status === status);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.hazardCategoryLabel.toLowerCase().includes(q) ||
        s.coordinator?.name?.toLowerCase().includes(q) ||
        s.facilities?.some((f) => f.toLowerCase().includes(q))
    );
  }

  return list;
};

/**
 * Fetch shelter statistics
 */
export const fetchShelterStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats`, { timeout: 3000 });
    if (response.data?.success && response.data.stats) {
      return response.data.stats;
    }
  } catch {
    // compute locally
  }

  const list = getLocalData();
  const totalShelters = list.length;
  const totalCapacity = list.reduce((acc, s) => acc + (s.capacityTotal || 0), 0);
  const totalOccupancy = list.reduce((acc, s) => acc + (s.capacityCurrent || 0), 0);
  const availableSpaces = Math.max(0, totalCapacity - totalOccupancy);
  const overallOccupancyRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;
  const floodShelters = list.filter((s) => s.hazardType === 'flood').length;
  const earthquakeShelters = list.filter((s) => s.hazardType === 'earthquake').length;
  const nearlyFullCount = list.filter((s) => (s.capacityCurrent / s.capacityTotal) >= 0.85).length;

  return {
    totalShelters,
    totalCapacity,
    totalOccupancy,
    availableSpaces,
    overallOccupancyRate,
    floodShelters,
    earthquakeShelters,
    nearlyFullCount,
  };
};

/**
 * Fetch single shelter by ID
 */
export const fetchShelterById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`, { timeout: 3000 });
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
  } catch {
    // fallback
  }

  const list = getLocalData();
  return list.find((s) => String(s._id) === String(id) || String(s.id) === String(id)) || null;
};

/**
 * Update shelter capacity and occupancy (Coordinator Action)
 */
export const updateShelterOccupancyAndCapacity = async (id, {
  capacityCurrent,
  capacityTotal,
  note = '',
  updatedBy = 'Relief Coordinator',
}) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/${id}/occupancy`, {
      capacityCurrent,
      capacityTotal,
      note,
      updatedBy,
    });
    if (response.data?.success && response.data.data) {
      // Update local storage
      const list = getLocalData();
      const updated = list.map((s) =>
        String(s._id) === String(id) ? response.data.data : s
      );
      saveLocalData(updated);
      return response.data.data;
    }
  } catch {
    // fallback offline edit
  }

  // Update in localStorage
  const list = getLocalData();
  const index = list.findIndex((s) => String(s._id) === String(id) || String(s.id) === String(id));
  if (index === -1) throw new Error('Shelter not found');

  const target = { ...list[index] };
  const prevOcc = target.capacityCurrent;
  const prevCap = target.capacityTotal;

  if (capacityCurrent !== undefined && capacityCurrent !== null) {
    target.capacityCurrent = Math.max(0, parseInt(capacityCurrent, 10));
  }
  if (capacityTotal !== undefined && capacityTotal !== null) {
    target.capacityTotal = Math.max(1, parseInt(capacityTotal, 10));
  }

  const ratio = target.capacityCurrent / target.capacityTotal;
  if (ratio >= 1.0) {
    target.status = 'At Capacity';
  } else if (ratio >= 0.85) {
    target.status = 'Nearly Full';
  } else {
    target.status = 'Available';
  }

  const delta = target.capacityCurrent - prevOcc;
  if (!target.occupancyHistory) target.occupancyHistory = [];
  target.occupancyHistory.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    previousOccupancy: prevOcc,
    newOccupancy: target.capacityCurrent,
    previousCapacity: prevCap,
    newCapacity: target.capacityTotal,
    changeDelta: delta,
    updatedBy,
    note: note || (delta >= 0 ? `Admitted ${delta} persons` : `Released ${Math.abs(delta)} persons`),
  });

  list[index] = target;
  saveLocalData(list);
  return target;
};

/**
 * Create a new verified shelter (Coordinator / Admin)
 */
export const createShelter = async (shelterData) => {
  try {
    const response = await axios.post(API_BASE_URL, shelterData);
    if (response.data?.success && response.data.data) {
      const list = getLocalData();
      list.unshift(response.data.data);
      saveLocalData(list);
      return response.data.data;
    }
  } catch {
    // fallback offline add
  }

  const list = getLocalData();
  const newShelter = {
    _id: `sh-${Date.now()}`,
    ...shelterData,
    isVerified: true,
    verificationAgency: 'Disaster Management Centre (DMC) Sri Lanka',
    verifiedDate: new Date().toISOString(),
    capacityTotal: parseInt(shelterData.capacityTotal, 10) || 100,
    capacityCurrent: parseInt(shelterData.capacityCurrent, 10) || 0,
    status:
      (parseInt(shelterData.capacityCurrent, 10) || 0) >= (parseInt(shelterData.capacityTotal, 10) || 100)
        ? 'At Capacity'
        : (parseInt(shelterData.capacityCurrent, 10) || 0) / (parseInt(shelterData.capacityTotal, 10) || 100) >= 0.85
        ? 'Nearly Full'
        : 'Available',
    hazardCategoryLabel:
      shelterData.hazardType === 'flood'
        ? 'High-Ground Facilities (Floods)'
        : shelterData.hazardType === 'earthquake'
        ? 'Open Assembly Grounds (Earthquakes)'
        : 'Multi-Hazard Emergency Shelter',
    image: shelterData.hazardType === 'earthquake' ? shelterAkkaraipattu : shelterAmpara,
    occupancyHistory: [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        previousOccupancy: 0,
        newOccupancy: parseInt(shelterData.capacityCurrent, 10) || 0,
        previousCapacity: parseInt(shelterData.capacityTotal, 10) || 100,
        newCapacity: parseInt(shelterData.capacityTotal, 10) || 100,
        changeDelta: parseInt(shelterData.capacityCurrent, 10) || 0,
        updatedBy: shelterData.coordinator?.name || 'Authorized Coordinator',
        note: 'Initial shelter registration and capacity setup.',
      },
    ],
  };

  list.unshift(newShelter);
  saveLocalData(list);
  return newShelter;
};
