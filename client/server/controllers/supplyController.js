import SupplyItem from '../models/SupplyItem.js';
import DonorPledge from '../models/DonorPledge.js';

// Seed initial relief items if empty database
const defaultSupplies = [
  {
    itemName: 'Bottled Drinking Water (5L Bottles)',
    category: 'Drinking Water',
    urgency: 'Immediate',
    targetQuantity: 500,
    pledgedQuantity: 260,
    remainingQuantity: 240,
    unit: 'bottles',
    shelterLocation: 'Ampara Central College Relief Center',
    district: 'Ampara',
    coordinatorName: 'Mr. N. Senanayake',
    coordinatorContact: '+94 63 222 2341',
    dropOffLocation: 'Main Gate Receiving Bay, Ampara Central College',
    status: 'Partially Pledged',
    notes: 'Urgent need due to flood contamination of local wells.',
  },
  {
    itemName: 'Dry Ration Packs (Rice, Dhal, Canned Fish, Biscuits)',
    category: 'Dry Rations & Food',
    urgency: 'Immediate',
    targetQuantity: 350,
    pledgedQuantity: 140,
    remainingQuantity: 210,
    unit: 'packs',
    shelterLocation: 'Akkaraipattu Public Ground Staging Area',
    district: 'Ampara',
    coordinatorName: 'Eng. M. Rizwan',
    coordinatorContact: '+94 67 227 7890',
    dropOffLocation: 'Municipal Council Community Hall',
    status: 'Partially Pledged',
    notes: 'Family survival packs for 4-person displaced households.',
  },
  {
    itemName: 'Infant Milk Formula & Baby Diapers (Size M/L)',
    category: 'Baby & Infant Care',
    urgency: 'Immediate',
    targetQuantity: 150,
    pledgedQuantity: 45,
    remainingQuantity: 105,
    unit: 'packs',
    shelterLocation: 'Kalmunai National School High-Ground Shelter',
    district: 'Ampara',
    coordinatorName: 'Mrs. K. Tharmalingam',
    coordinatorContact: '+94 67 222 1455',
    dropOffLocation: 'School Auditorium Desk 2',
    status: 'Partially Pledged',
    notes: 'For 60+ infants and nursing mothers in Kalmunai zone.',
  },
  {
    itemName: 'Thermal Blankets & Sleeping Mats',
    category: 'Bedding & Mats',
    urgency: 'High',
    targetQuantity: 250,
    pledgedQuantity: 100,
    remainingQuantity: 150,
    unit: 'sets',
    shelterLocation: 'Ampara Central College Relief Center',
    district: 'Ampara',
    coordinatorName: 'Mr. N. Senanayake',
    coordinatorContact: '+94 63 222 2341',
    dropOffLocation: 'Relief Storage Room 4',
    status: 'Partially Pledged',
    notes: 'Night temperatures dropping during heavy rainfall.',
  },
  {
    itemName: 'First Aid Antiseptic, Paracetamol & Oral Rehydration Salts',
    category: 'Medical & First Aid',
    urgency: 'High',
    targetQuantity: 200,
    pledgedQuantity: 200,
    remainingQuantity: 0,
    unit: 'boxes',
    shelterLocation: 'Kalmunai National School High-Ground Shelter',
    district: 'Ampara',
    coordinatorName: 'Dr. S. Pathirana',
    coordinatorContact: '+94 67 222 1456',
    dropOffLocation: 'Red Cross Health Post',
    status: 'Fulfilled',
    notes: 'Fully pledged by Sri Lanka Doctors Association.',
  },
  {
    itemName: 'Sanitary Napkins, Soap & Toothpaste Hygiene Kits',
    category: 'Sanitary & Hygiene',
    urgency: 'Medium',
    targetQuantity: 300,
    pledgedQuantity: 80,
    remainingQuantity: 220,
    unit: 'packs',
    shelterLocation: 'Akkaraipattu Public Ground Staging Area',
    district: 'Ampara',
    coordinatorName: 'Eng. M. Rizwan',
    coordinatorContact: '+94 67 227 7890',
    dropOffLocation: 'Hygiene Supply Container A',
    status: 'Partially Pledged',
    notes: 'Crucial for maintaining shelter sanitation standards.',
  },
];

// Helper to seed if database is empty
const ensureSeedData = async () => {
  try {
    const count = await SupplyItem.countDocuments();
    if (count === 0) {
      await SupplyItem.insertMany(defaultSupplies);
      console.log('Seeded default disaster relief supply items');
    }
  } catch (err) {
    console.error('Seed check warning:', err.message);
  }
};

// GET /api/supplies - List all needed supply items with filters
export const getSupplyItems = async (req, res) => {
  try {
    await ensureSeedData();

    const { category, urgency, status, district, search } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (urgency && urgency !== 'All') {
      query.urgency = urgency;
    }
    if (status && status !== 'All') {
      query.status = status;
    }
    if (district && district !== 'All') {
      query.district = district;
    }
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { itemName: searchRegex },
        { shelterLocation: searchRegex },
        { notes: searchRegex },
      ];
    }

    const items = await SupplyItem.find(query).sort({
      // Sort: Immediate first, then updatedAt
      createdAt: -1,
    });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve supply items',
      error: error.message,
    });
  }
};

// POST /api/supplies - Coordinator lists a new needed item
export const createSupplyItem = async (req, res) => {
  try {
    const {
      itemName,
      category,
      urgency,
      targetQuantity,
      unit,
      shelterLocation,
      district,
      coordinatorName,
      coordinatorContact,
      dropOffLocation,
      notes,
    } = req.body;

    if (!itemName || !targetQuantity || !shelterLocation) {
      return res.status(400).json({
        message: 'Item name, target quantity, and shelter location are required.',
      });
    }

    const newItem = new SupplyItem({
      itemName,
      category: category || 'Drinking Water',
      urgency: urgency || 'High',
      targetQuantity: Number(targetQuantity),
      pledgedQuantity: 0,
      remainingQuantity: Number(targetQuantity),
      unit: unit || 'units',
      shelterLocation,
      district: district || 'Ampara',
      coordinatorName: coordinatorName || 'Shelter Coordinator',
      coordinatorContact: coordinatorContact || '+94 11 000 0000',
      dropOffLocation: dropOffLocation || 'Shelter reception',
      status: 'Open',
      notes: notes || '',
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({
      message: 'Failed to create supply item',
      error: error.message,
    });
  }
};

// POST /api/supplies/:id/pledge - Implement donor pledge logic to decrement remaining item counts
export const makeDonorPledge = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      donorName,
      donorEmail,
      donorPhone,
      pledgedQuantity,
      deliveryMethod,
      estimatedDeliveryDate,
      donorNotes,
    } = req.body;

    if (!donorName || !donorEmail || !donorPhone || !pledgedQuantity) {
      return res.status(400).json({
        message: 'Donor name, email, phone, and pledge quantity are required.',
      });
    }

    const pledgeAmount = Number(pledgedQuantity);
    if (isNaN(pledgeAmount) || pledgeAmount <= 0) {
      return res.status(400).json({
        message: 'Pledged quantity must be a positive number.',
      });
    }

    // Find the supply item
    const item = await SupplyItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Supply item not found.' });
    }

    // Check if remaining quantity is sufficient
    if (item.remainingQuantity <= 0) {
      return res.status(400).json({
        message: 'This supply item is already fully pledged! Thank you.',
      });
    }

    if (pledgeAmount > item.remainingQuantity) {
      return res.status(400).json({
        message: `Pledge exceeds remaining need. Maximum you can pledge is ${item.remainingQuantity} ${item.unit}.`,
      });
    }

    // Decrement remaining item counts and increment pledged quantity
    item.pledgedQuantity += pledgeAmount;
    item.remainingQuantity = Math.max(0, item.targetQuantity - item.pledgedQuantity);

    if (item.remainingQuantity === 0) {
      item.status = 'Fulfilled';
    } else {
      item.status = 'Partially Pledged';
    }

    await item.save();

    // Create DonorPledge record
    const pledge = new DonorPledge({
      supplyItemId: item._id,
      itemName: item.itemName,
      shelterLocation: item.shelterLocation,
      donorName,
      donorEmail,
      donorPhone,
      pledgedQuantity: pledgeAmount,
      unit: item.unit,
      deliveryMethod: deliveryMethod || 'Direct Drop-off',
      estimatedDeliveryDate: estimatedDeliveryDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'Pledged',
      donorNotes: donorNotes || '',
    });

    const savedPledge = await pledge.save();

    res.status(201).json({
      message: 'Pledge successfully recorded! Thank you for supporting affected communities.',
      supplyItem: item,
      pledge: savedPledge,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to record donor pledge',
      error: error.message,
    });
  }
};

// GET /api/supplies/pledges - List all donor pledges for tracking interface
export const getAllPledges = async (req, res) => {
  try {
    const { supplyItemId, status } = req.query;
    const query = {};

    if (supplyItemId) query.supplyItemId = supplyItemId;
    if (status && status !== 'All') query.status = status;

    const pledges = await DonorPledge.find(query).sort({ createdAt: -1 });

    const isAdmin =
      req.user &&
      ['administrator', 'coordinator'].includes(req.user.role);

    // If caller is administrator, return full pledge records with contact details
    if (isAdmin) {
      return res.status(200).json(pledges);
    }

    // Public / non-admin safe view: mask sensitive donor contact details
    const safePledges = pledges.map((p) => {
      const obj = p.toObject();
      return {
        ...obj,
        donorEmail: obj.donorEmail ? '***@***.***' : '',
        donorPhone: obj.donorPhone ? '***-***-****' : '',
      };
    });

    res.status(200).json(safePledges);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve donor pledges',
      error: error.message,
    });
  }
};

// PATCH /api/supplies/pledges/:pledgeId/status - Coordinator verifies delivery
export const updatePledgeStatus = async (req, res) => {
  try {
    const { pledgeId } = req.params;
    const { status } = req.body;

    if (!['Pledged', 'In Transit', 'Received & Verified', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid pledge status.' });
    }

    const pledge = await DonorPledge.findByIdAndUpdate(
      pledgeId,
      { status },
      { new: true }
    );

    if (!pledge) {
      return res.status(404).json({ message: 'Pledge record not found.' });
    }

    res.status(200).json(pledge);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update pledge status',
      error: error.message,
    });
  }
};

// DELETE /api/supplies/:id - Coordinator deletes a supply item
export const deleteSupplyItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SupplyItem.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Supply item not found.' });
    }
    res.status(200).json({ message: 'Supply item removed successfully.' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete supply item',
      error: error.message,
    });
  }
};

// GET /api/supplies/stats - Metrics overview
export const getSupplyStats = async (req, res) => {
  try {
    await ensureSeedData();

    const totalRequests = await SupplyItem.countDocuments();
    const fulfilledRequests = await SupplyItem.countDocuments({ status: 'Fulfilled' });
    const pledgesCount = await DonorPledge.countDocuments();

    const items = await SupplyItem.find();
    let totalTargetUnits = 0;
    let totalPledgedUnits = 0;

    items.forEach((item) => {
      totalTargetUnits += item.targetQuantity || 0;
      totalPledgedUnits += item.pledgedQuantity || 0;
    });

    res.status(200).json({
      totalRequests,
      fulfilledRequests,
      pledgesCount,
      totalTargetUnits,
      totalPledgedUnits,
      percentFulfilled:
        totalTargetUnits > 0
          ? Math.round((totalPledgedUnits / totalTargetUnits) * 100)
          : 0,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve supply stats',
      error: error.message,
    });
  }
};
