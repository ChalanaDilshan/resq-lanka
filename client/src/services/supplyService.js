import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_SUPPLY_URL || 'http://localhost:5000/api/supplies';
const TOKEN_KEY = 'resq_jwt_token';

// Helper to get authenticated header for privileged actions
const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Initial fallback mock data matching Sri Lanka disaster context
const fallbackSupplies = [
  {
    _id: 'sup-1',
    itemName: 'Bottled Drinking Water (5L Bottles)',
    category: 'Drinking Water',
    urgency: 'Immediate',
    targetQuantity: 500,
    pledgedQuantity: 260,
    receivedQuantity: 0,
    remainingQuantity: 240,
    unit: 'bottles',
    shelterLocation: 'Ampara Central College Relief Center',
    district: 'Ampara',
    coordinatorName: 'Mr. N. Senanayake',
    coordinatorContact: '+94 63 222 2341',
    dropOffLocation: 'Main Gate Receiving Bay, Ampara Central College',
    status: 'Partially Pledged',
    notes: 'Urgent need due to flood contamination of local wells.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    _id: 'sup-2',
    itemName: 'Dry Ration Survival Packs (Rice, Dhal, Canned Fish, Biscuits)',
    category: 'Dry Rations & Food',
    urgency: 'Immediate',
    targetQuantity: 350,
    pledgedQuantity: 140,
    receivedQuantity: 0,
    remainingQuantity: 210,
    unit: 'packs',
    shelterLocation: 'Akkaraipattu Public Ground Staging Area',
    district: 'Ampara',
    coordinatorName: 'Eng. M. Rizwan',
    coordinatorContact: '+94 67 227 7890',
    dropOffLocation: 'Municipal Council Community Hall',
    status: 'Partially Pledged',
    notes: 'Family survival packs for 4-person displaced households.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    _id: 'sup-3',
    itemName: 'Infant Milk Formula & Baby Diapers (Size M/L)',
    category: 'Baby & Infant Care',
    urgency: 'Immediate',
    targetQuantity: 150,
    pledgedQuantity: 45,
    receivedQuantity: 0,
    remainingQuantity: 105,
    unit: 'packs',
    shelterLocation: 'Kalmunai National School High-Ground Shelter',
    district: 'Ampara',
    coordinatorName: 'Mrs. K. Tharmalingam',
    coordinatorContact: '+94 67 222 1455',
    dropOffLocation: 'School Auditorium Desk 2',
    status: 'Partially Pledged',
    notes: 'For 60+ infants and nursing mothers in Kalmunai zone.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    _id: 'sup-4',
    itemName: 'Thermal Blankets & Heavy Sleeping Mats',
    category: 'Bedding & Mats',
    urgency: 'High',
    targetQuantity: 250,
    pledgedQuantity: 100,
    receivedQuantity: 0,
    remainingQuantity: 150,
    unit: 'sets',
    shelterLocation: 'Ampara Central College Relief Center',
    district: 'Ampara',
    coordinatorName: 'Mr. N. Senanayake',
    coordinatorContact: '+94 63 222 2341',
    dropOffLocation: 'Relief Storage Room 4',
    status: 'Partially Pledged',
    notes: 'Night temperatures dropping during heavy continuous rains.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    _id: 'sup-5',
    itemName: 'First Aid Antiseptic, Paracetamol & ORS Sachets',
    category: 'Medical & First Aid',
    urgency: 'High',
    targetQuantity: 200,
    pledgedQuantity: 200,
    receivedQuantity: 0,
    remainingQuantity: 0,
    unit: 'boxes',
    shelterLocation: 'Kalmunai National School High-Ground Shelter',
    district: 'Ampara',
    coordinatorName: 'Dr. S. Pathirana',
    coordinatorContact: '+94 67 222 1456',
    dropOffLocation: 'Red Cross Mobile Clinic Desk',
    status: 'Fully Pledged',
    notes: 'Fully pledged by Government Medical Officers Association.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    _id: 'sup-6',
    itemName: 'Sanitary Napkins, Soap & Toothpaste Hygiene Kits',
    category: 'Sanitary & Hygiene',
    urgency: 'Medium',
    targetQuantity: 300,
    pledgedQuantity: 80,
    receivedQuantity: 0,
    remainingQuantity: 220,
    unit: 'packs',
    shelterLocation: 'Akkaraipattu Public Ground Staging Area',
    district: 'Ampara',
    coordinatorName: 'Eng. M. Rizwan',
    coordinatorContact: '+94 67 227 7890',
    dropOffLocation: 'Hygiene Supply Container A',
    status: 'Partially Pledged',
    notes: 'Crucial for maintaining shelter health and sanitation standards.',
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
];

// Fallback pledges
const fallbackPledges = [
  {
    _id: 'plg-1',
    supplyItemId: 'sup-1',
    itemName: 'Bottled Drinking Water (5L Bottles)',
    shelterLocation: 'Ampara Central College Relief Center',
    donorName: 'Dr. Rohan Perera',
    donorEmail: '***@***.***',
    donorPhone: '***-***-****',
    pledgedQuantity: 100,
    unit: 'bottles',
    deliveryMethod: 'Direct Drop-off',
    status: 'Received & Verified',
    verifiedBy: 'Mr. N. Senanayake (Coordinator)',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    _id: 'plg-2',
    supplyItemId: 'sup-2',
    itemName: 'Dry Ration Survival Packs',
    shelterLocation: 'Akkaraipattu Public Ground Staging Area',
    donorName: 'Colombo Lions Club',
    donorEmail: '***@***.***',
    donorPhone: '***-***-****',
    pledgedQuantity: 140,
    unit: 'packs',
    deliveryMethod: 'Courier / Dispatch',
    status: 'In Transit',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

// Helper to access LocalStorage cache
const getLocalData = (key, defaultVal) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setLocalData = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
};

// 1. Fetch Supply Items
export const fetchSupplyItems = async (filters = {}) => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params: filters,
      timeout: 5000,
    });
    if (Array.isArray(response.data)) {
      setLocalData('resq_supplies', response.data);
      return response.data;
    }
  } catch (err) {
    console.warn('Backend API unreachable for fetchSupplyItems, checking local cache:', err.message);
  }

  // Graceful fallback to client storage
  let items = getLocalData('resq_supplies', fallbackSupplies);
  if (filters.category && filters.category !== 'All') {
    items = items.filter((i) => i.category === filters.category);
  }
  if (filters.urgency && filters.urgency !== 'All') {
    items = items.filter((i) => i.urgency === filters.urgency);
  }
  if (filters.status && filters.status !== 'All') {
    items = items.filter((i) => i.status === filters.status);
  }
  if (filters.district && filters.district !== 'All') {
    items = items.filter((i) => i.district === filters.district);
  }
  if (filters.search && filters.search.trim()) {
    const s = filters.search.toLowerCase();
    items = items.filter(
      (i) =>
        i.itemName.toLowerCase().includes(s) ||
        i.shelterLocation.toLowerCase().includes(s) ||
        (i.notes && i.notes.toLowerCase().includes(s))
    );
  }
  return items;
};

// 2. Create Supply Item (Coordinator/Admin Action)
export const createSupplyRequest = async (itemData) => {
  try {
    const response = await axios.post(API_BASE_URL, itemData, {
      headers: getAuthHeaders(),
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message, { cause: error });
    }
    // Only fall back to local if network totally disconnected
    if (!error.response) {
      const items = getLocalData('resq_supplies', fallbackSupplies);
      const parsedTarget = Number(itemData.targetQuantity);
      const newItem = {
        _id: `sup-${Date.now()}`,
        ...itemData,
        targetQuantity: parsedTarget,
        pledgedQuantity: 0,
        receivedQuantity: 0,
        remainingQuantity: parsedTarget,
        status: 'Open',
        createdAt: new Date().toISOString(),
      };
      items.unshift(newItem);
      setLocalData('resq_supplies', items);
      return newItem;
    }
    throw new Error(error.message || 'Failed to publish supply request', { cause: error });
  }
};

// 3. Make Donor Pledge (Atomic decrement logic)
export const submitDonorPledge = async (itemId, pledgeData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${itemId}/pledge`, pledgeData, {
      headers: getAuthHeaders(),
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message, { cause: error });
    }
    // If totally offline, perform safe local decrement
    if (!error.response) {
      const items = getLocalData('resq_supplies', fallbackSupplies);
      const index = items.findIndex((i) => i._id === itemId);

      if (index === -1) {
        throw new Error('Supply item not found in local cache', { cause: error });
      }

      const item = items[index];
      const pledgeAmount = Number(pledgeData.pledgedQuantity);

      if (pledgeAmount > item.remainingQuantity) {
        throw new Error(`Maximum pledge allowed is ${item.remainingQuantity} ${item.unit}`, { cause: error });
      }

      item.pledgedQuantity += pledgeAmount;
      item.remainingQuantity = Math.max(0, item.targetQuantity - item.pledgedQuantity);
      item.status = item.remainingQuantity === 0 ? 'Fully Pledged' : 'Partially Pledged';
      items[index] = item;
      setLocalData('resq_supplies', items);

      const pledges = getLocalData('resq_pledges', fallbackPledges);
      const newPledge = {
        _id: `plg-${Date.now()}`,
        supplyItemId: item._id,
        itemName: item.itemName,
        shelterLocation: item.shelterLocation,
        donorName: pledgeData.donorName,
        donorEmail: pledgeData.donorEmail,
        donorPhone: pledgeData.donorPhone,
        pledgedQuantity: pledgeAmount,
        unit: item.unit,
        deliveryMethod: pledgeData.deliveryMethod || 'Direct Drop-off',
        status: 'Pledged',
        createdAt: new Date().toISOString(),
      };
      pledges.unshift(newPledge);
      setLocalData('resq_pledges', pledges);

      return {
        success: true,
        message: 'Pledge successfully recorded locally (offline mode)!',
        supplyItem: item,
        pledge: newPledge,
      };
    }
    throw new Error(error.message || 'Failed to submit donor pledge', { cause: error });
  }
};

// 4. Fetch All Pledges (Tracking Interface)
export const fetchAllPledges = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/pledges`, {
      params: filters,
      headers: getAuthHeaders(),
      timeout: 5000,
    });
    if (Array.isArray(response.data)) {
      setLocalData('resq_pledges', response.data);
      return response.data;
    }
  } catch (err) {
    console.warn('Backend API unreachable for fetchAllPledges, checking local cache:', err.message);
  }

  let pledges = getLocalData('resq_pledges', fallbackPledges);
  if (filters.status && filters.status !== 'All') {
    pledges = pledges.filter((p) => p.status === filters.status);
  }
  return pledges;
};

// 5. Update Pledge Status (Coordinator verification & physical stock receipt)
export const updatePledgeStatus = async (pledgeId, status) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/pledges/${pledgeId}/status`,
      { status },
      {
        headers: getAuthHeaders(),
        timeout: 5000,
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message, { cause: error });
    }
    if (!error.response) {
      const pledges = getLocalData('resq_pledges', fallbackPledges);
      const idx = pledges.findIndex((p) => p._id === pledgeId);
      if (idx !== -1) {
        pledges[idx].status = status;
        setLocalData('resq_pledges', pledges);
        return { success: true, pledge: pledges[idx] };
      }
      throw new Error('Pledge not found in offline cache', { cause: error });
    }
    throw new Error(error.message || 'Failed to update pledge status', { cause: error });
  }
};

// 6. Delete Supply Request
export const deleteSupplyItem = async (itemId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${itemId}`, {
      headers: getAuthHeaders(),
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message, { cause: error });
    }
    if (!error.response) {
      let items = getLocalData('resq_supplies', fallbackSupplies);
      items = items.filter((i) => i._id !== itemId);
      setLocalData('resq_supplies', items);
      return { success: true, message: 'Item deleted from local storage' };
    }
    throw new Error(error.message || 'Failed to delete supply item', { cause: error });
  }
};

// 7. Get Supply Metrics
export const fetchSupplyStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats`, { timeout: 5000 });
    return response.data;
  } catch (err) {
    console.warn('Backend API unreachable for fetchSupplyStats, computing from cache:', err.message);
    const items = getLocalData('resq_supplies', fallbackSupplies);
    const pledges = getLocalData('resq_pledges', fallbackPledges);
    let totalTargetUnits = 0;
    let totalPledgedUnits = 0;
    let totalReceivedUnits = 0;
    let fulfilledCount = 0;
    let fullyPledgedCount = 0;

    items.forEach((i) => {
      totalTargetUnits += i.targetQuantity || 0;
      totalPledgedUnits += i.pledgedQuantity || 0;
      totalReceivedUnits += i.receivedQuantity || 0;
      if (i.status === 'Fulfilled') fulfilledCount++;
      if (i.status === 'Fully Pledged') fullyPledgedCount++;
    });

    return {
      totalRequests: items.length,
      fulfilledRequests: fulfilledCount,
      fullyPledgedRequests: fullyPledgedCount,
      pledgesCount: pledges.filter((p) => p.status !== 'Cancelled').length,
      totalTargetUnits,
      totalPledgedUnits,
      totalReceivedUnits,
      percentPledged:
        totalTargetUnits > 0 ? Math.min(100, Math.round((totalPledgedUnits / totalTargetUnits) * 100)) : 0,
      percentFulfilled:
        totalTargetUnits > 0 ? Math.min(100, Math.round((totalReceivedUnits / totalTargetUnits) * 100)) : 0,
    };
  }
};

