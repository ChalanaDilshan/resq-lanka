import mongoose from 'mongoose';
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
  },
  {
    itemName: 'Dry Ration Packs (Rice, Dhal, Canned Fish, Biscuits)',
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
  },
  {
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
  },
  {
    itemName: 'Thermal Blankets & Sleeping Mats',
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
    notes: 'Night temperatures dropping during heavy rainfall.',
  },
  {
    itemName: 'First Aid Antiseptic, Paracetamol & Oral Rehydration Salts',
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
    dropOffLocation: 'Red Cross Health Post',
    status: 'Fully Pledged',
    notes: 'Fully pledged by Sri Lanka Doctors Association.',
  },
  {
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
      createdAt: -1,
    });

    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve supply items',
      error: error.message,
    });
  }
};

// POST /api/supplies - Coordinator/Administrator lists a new needed item
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

    if (!itemName || !itemName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Item name is required and cannot be empty.',
      });
    }

    const parsedTarget = Number(targetQuantity);

    if (
      isNaN(parsedTarget) ||
      parsedTarget < 1 ||
      !Number.isInteger(parsedTarget)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Target quantity must be a positive whole integer greater than zero.',
      });
    }

    if (parsedTarget > 1000000) {
      return res.status(400).json({
        success: false,
        message:
          'Target quantity exceeds the maximum allowable limit of 1,000,000.',
      });
    }

    if (!shelterLocation || !shelterLocation.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Shelter / delivery location is required.',
      });
    }

    const allowedCategories = [
      'Drinking Water',
      'Dry Rations & Food',
      'Medical & First Aid',
      'Baby & Infant Care',
      'Bedding & Mats',
      'Sanitary & Hygiene',
      'Clothing',
      'Other',
    ];

    if (category && !allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${allowedCategories.join(', ')}`,
      });
    }

    const allowedUnits = [
      'bottles',
      'packs',
      'kg',
      'boxes',
      'sets',
      'liters',
      'units',
    ];

    if (unit && !allowedUnits.includes(unit)) {
      return res.status(400).json({
        success: false,
        message: `Invalid unit. Must be one of: ${allowedUnits.join(', ')}`,
      });
    }

    const allowedUrgencies = ['Immediate', 'High', 'Medium', 'Low'];

    if (urgency && !allowedUrgencies.includes(urgency)) {
      return res.status(400).json({
        success: false,
        message: `Invalid urgency level. Must be one of: ${allowedUrgencies.join(', ')}`,
      });
    }

    // Determine coordinator name from session if available
    const effectiveCoordinator =
      req.user?.name ||
      coordinatorName?.trim() ||
      'Shelter Relief Coordinator';

    const effectiveContact =
      coordinatorContact?.trim() ||
      req.user?.email ||
      '+94 11 000 0000';

    const newItem = new SupplyItem({
      itemName: itemName.trim(),
      category: category || 'Drinking Water',
      urgency: urgency || 'High',
      targetQuantity: parsedTarget,
      pledgedQuantity: 0,
      receivedQuantity: 0,
      remainingQuantity: parsedTarget,
      unit: unit || 'units',
      shelterLocation: shelterLocation.trim(),
      district: district?.trim() || 'Ampara',
      coordinatorName: effectiveCoordinator,
      coordinatorContact: effectiveContact,
      dropOffLocation:
        dropOffLocation?.trim() ||
        'Shelter reception / relief storage facility',
      status: 'Open',
      notes: notes?.trim() || '',
      createdBy: req.user?._id || null,
    });

    const savedItem = await newItem.save();

    return res.status(201).json(savedItem);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Failed to create supply item',
      error: error.message,
    });
  }
};

// POST /api/supplies/:id/pledge - Create a donor pledge
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supply item ID format.',
      });
    }

    if (!donorName || !donorName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Donor name is required.',
      });
    }

    if (!donorEmail || !donorEmail.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Donor email address is required.',
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(donorEmail.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid donor email address.',
      });
    }

    if (!donorPhone || !donorPhone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Donor contact telephone number is required.',
      });
    }

    const pledgeAmount = Number(pledgedQuantity);

    if (
      isNaN(pledgeAmount) ||
      pledgeAmount <= 0 ||
      !Number.isInteger(pledgeAmount)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Pledged quantity must be a positive whole integer.',
      });
    }

    // Find the supply item
    const item = await SupplyItem.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Supply item not found.',
      });
    }

    // Check if remaining quantity is already zero
    if (item.remainingQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message:
          'This supply item is already fully pledged! Thank you for your support.',
      });
    }

    if (pledgeAmount > item.remainingQuantity) {
      return res.status(400).json({
        success: false,
        message: `Pledge quantity (${pledgeAmount} ${item.unit}) exceeds remaining needed amount (${item.remainingQuantity} ${item.unit}).`,
      });
    }

    // Prevent identical submissions within 15 seconds
    const normalizedEmail = donorEmail.trim().toLowerCase();
    const fifteenSecondsAgo = new Date(Date.now() - 15000);

    const recentDuplicate = await DonorPledge.findOne({
      supplyItemId: item._id,
      donorEmail: normalizedEmail,
      pledgedQuantity: pledgeAmount,
      createdAt: { $gte: fifteenSecondsAgo },
    });

    if (recentDuplicate) {
      return res.status(409).json({
        success: false,
        message:
          'A duplicate pledge with identical details was recently recorded. Please wait before pledging again.',
        pledge: recentDuplicate,
      });
    }

    // Increment pledged quantity and recalculate remaining
    item.pledgedQuantity += pledgeAmount;

    item.remainingQuantity = Math.max(
      0,
      item.targetQuantity - item.pledgedQuantity
    );

    const received = item.receivedQuantity || 0;

    if (received >= item.targetQuantity) {
      item.status = 'Fulfilled';
    } else if (item.pledgedQuantity >= item.targetQuantity) {
      item.status = 'Fully Pledged';
    } else {
      item.status = 'Partially Pledged';
    }

    await item.save();

    // Create DonorPledge record
    const pledge = new DonorPledge({
      supplyItemId: item._id,
      itemName: item.itemName,
      shelterLocation: item.shelterLocation,
      userId: req.user?._id || null,
      donorName: donorName.trim(),
      donorEmail: normalizedEmail,
      donorPhone: donorPhone.trim(),
      pledgedQuantity: pledgeAmount,
      unit: item.unit,
      deliveryMethod: deliveryMethod || 'Direct Drop-off',
      estimatedDeliveryDate:
        estimatedDeliveryDate ||
        new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'Pledged',
      donorNotes: donorNotes?.trim() || '',
    });

    const savedPledge = await pledge.save();

    return res.status(201).json({
      success: true,
      message:
        'Pledge successfully recorded! Thank you for supporting affected communities.',
      supplyItem: item,
      pledge: savedPledge,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to record donor pledge',
      error: error.message,
    });
  }
};

// GET /api/supplies/pledges - List donor pledges with privacy masking
export const getAllPledges = async (req, res) => {
  try {
    const { supplyItemId, status } = req.query;
    const query = {};

    if (supplyItemId && mongoose.Types.ObjectId.isValid(supplyItemId)) {
      query.supplyItemId = supplyItemId;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const pledges = await DonorPledge.find(query).sort({
      createdAt: -1,
    });

    const isAdmin =
      req.user &&
      ['administrator', 'coordinator'].includes(req.user.role);

    // Administrators and coordinators can view full pledge records
    if (isAdmin) {
      return res.status(200).json(pledges);
    }

    // Hide sensitive donor details from public users
    const safePledges = pledges.map((p) => {
      const obj = p.toObject();

      return {
        ...obj,
        donorEmail: obj.donorEmail ? '***@***.***' : '',
        donorPhone: obj.donorPhone ? '***-***-****' : '',
        donorNotes: undefined,
      };
    });

    return res.status(200).json(safePledges);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve donor pledges',
      error: error.message,
    });
  }
};

// PATCH /api/supplies/pledges/:pledgeId/status
// Update pledge status and received stock
export const updatePledgeStatus = async (req, res) => {
  try {
    const { pledgeId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(pledgeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pledge ID format.',
      });
    }

    const allowedStatuses = [
      'Pledged',
      'In Transit',
      'Received & Verified',
      'Cancelled',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid pledge status '${status}'. Must be one of: [${allowedStatuses.join(', ')}]`,
      });
    }

    const pledge = await DonorPledge.findById(pledgeId);

    if (!pledge) {
      return res.status(404).json({
        success: false,
        message: 'Pledge record not found.',
      });
    }

    const oldStatus = pledge.status;

    // Idempotent check
    if (oldStatus === status) {
      return res.status(200).json(pledge);
    }

    // A cancelled pledge cannot move directly to received
    if (oldStatus === 'Cancelled' && status === 'Received & Verified') {
      return res.status(400).json({
        success: false,
        message: 'A cancelled pledge cannot be directly marked as received.',
      });
    }

    const item = await SupplyItem.findById(pledge.supplyItemId);

    if (item) {
      if (status === 'Received & Verified' && oldStatus !== 'Received & Verified') {
        item.receivedQuantity = (item.receivedQuantity || 0) + pledge.pledgedQuantity;
      }
      if (oldStatus === 'Received & Verified' && status !== 'Received & Verified') {
        item.receivedQuantity = Math.max(0, (item.receivedQuantity || 0) - pledge.pledgedQuantity);
      }
      if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
        item.pledgedQuantity = Math.max(0, (item.pledgedQuantity || 0) - pledge.pledgedQuantity);
      }
      if (oldStatus === 'Cancelled' && status !== 'Cancelled') {
        item.pledgedQuantity = (item.pledgedQuantity || 0) + pledge.pledgedQuantity;
      }

      item.remainingQuantity = Math.max(0, item.targetQuantity - item.pledgedQuantity);
      if (item.receivedQuantity >= item.targetQuantity) {
        item.status = 'Fulfilled';
      } else if (item.pledgedQuantity >= item.targetQuantity) {
        item.status = 'Fully Pledged';
      } else if (item.pledgedQuantity > 0) {
        item.status = 'Partially Pledged';
      } else {
        item.status = 'Open';
      }

      await item.save();
    }

    pledge.status = status;
    if (req.user) {
      pledge.verifiedBy = req.user.name || req.user.email;
    }
    await pledge.save();

    return res.status(200).json(pledge);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update pledge status',
      error: error.message,
    });
  }
};

// DELETE /api/supplies/:id - Coordinator deletes a supply item
export const deleteSupplyItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supply item ID format.',
      });
    }

    const deleted = await SupplyItem.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Supply item not found.',
      });
    }

    // Clean up associated pledges
    await DonorPledge.deleteMany({ supplyItemId: id });

    res.status(200).json({
      success: true,
      message: 'Supply item and associated pledges removed successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete supply item',
      error: error.message,
    });
  }
};

// GET /api/supplies/stats - Metrics overview distinguishing pledged from physically received stock
export const getSupplyStats = async (req, res) => {
  try {
    await ensureSeedData();

    const totalRequests = await SupplyItem.countDocuments();
    const fulfilledRequests = await SupplyItem.countDocuments({ status: 'Fulfilled' });
    const fullyPledgedRequests = await SupplyItem.countDocuments({ status: 'Fully Pledged' });
    const pledgesCount = await DonorPledge.countDocuments({ status: { $ne: 'Cancelled' } });

    const items = await SupplyItem.find();
    let totalTargetUnits = 0;
    let totalPledgedUnits = 0;
    let totalReceivedUnits = 0;

    items.forEach((item) => {
      totalTargetUnits += item.targetQuantity || 0;
      totalPledgedUnits += item.pledgedQuantity || 0;
      totalReceivedUnits += item.receivedQuantity || 0;
    });

    const percentPledged =
      totalTargetUnits > 0
        ? Math.min(100, Math.round((totalPledgedUnits / totalTargetUnits) * 100))
        : 0;

    const percentFulfilled =
      totalTargetUnits > 0
        ? Math.min(100, Math.round((totalReceivedUnits / totalTargetUnits) * 100))
        : 0;

    res.status(200).json({
      totalRequests,
      fulfilledRequests,
      fullyPledgedRequests,
      pledgesCount,
      totalTargetUnits,
      totalPledgedUnits,
      totalReceivedUnits,
      percentPledged,
      percentFulfilled,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve supply stats',
      error: error.message,
    });
  }
};