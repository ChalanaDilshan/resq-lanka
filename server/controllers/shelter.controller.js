import mongoose from 'mongoose';
import Shelter from '../models/Shelter.model.js';

// Initial verified shelters matching Sri Lanka disaster relief context
const initialShelters = [
  {
    name: 'Ampara Central College Relief Center',
    hazardType: 'flood',
    hazardCategoryLabel: 'High-Ground Facilities (Floods)',
    capacityTotal: 250,
    capacityCurrent: 145,
    isVerified: true,
    verificationAgency: 'Disaster Management Centre (DMC) Sri Lanka',
    district: 'Ampara',
    address: 'Central College Road, Ampara Town',
    coordinates: { lat: 7.2912, lng: 81.6724 },
    elevationMeters: 42,
    clearanceRadiusMeters: 50,
    status: 'Available',
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
    imageUrl: '/assets/shelter_ampara.jpg',
    occupancyHistory: [
      {
        timestamp: new Date(Date.now() - 3600000 * 6),
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
    name: 'Akkaraipattu Public Ground Staging Area',
    hazardType: 'earthquake',
    hazardCategoryLabel: 'Open Assembly Grounds (Earthquakes)',
    capacityTotal: 600,
    capacityCurrent: 380,
    isVerified: true,
    verificationAgency: 'Disaster Management Centre (DMC) Sri Lanka',
    district: 'Ampara',
    address: 'Beach Road, Akkaraipattu 03',
    coordinates: { lat: 7.2185, lng: 81.8504 },
    elevationMeters: 8,
    clearanceRadiusMeters: 140,
    status: 'Available',
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
    imageUrl: '/assets/shelter_akkaraipattu.jpg',
    occupancyHistory: [
      {
        timestamp: new Date(Date.now() - 3600000 * 10),
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
    name: 'Kalmunai National School High-Ground Haven',
    hazardType: 'flood',
    hazardCategoryLabel: 'High-Ground Facilities (Floods)',
    capacityTotal: 180,
    capacityCurrent: 165,
    isVerified: true,
    verificationAgency: 'Disaster Management Centre (DMC) Sri Lanka',
    district: 'Ampara',
    address: 'Main Street, Kalmunai North',
    coordinates: { lat: 7.4144, lng: 81.8268 },
    elevationMeters: 38,
    clearanceRadiusMeters: 45,
    status: 'Nearly Full',
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
    imageUrl: '/assets/shelter_kalmunai.jpg',
    occupancyHistory: [
      {
        timestamp: new Date(Date.now() - 3600000 * 3),
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
    name: 'Batticaloa Hindu College High-Ground Shelter',
    hazardType: 'flood',
    hazardCategoryLabel: 'High-Ground Facilities (Floods)',
    capacityTotal: 300,
    capacityCurrent: 190,
    isVerified: true,
    verificationAgency: 'Disaster Management Centre (DMC) Sri Lanka',
    district: 'Batticaloa',
    address: 'New Road, Batticaloa Town',
    coordinates: { lat: 7.717, lng: 81.6984 },
    elevationMeters: 35,
    clearanceRadiusMeters: 60,
    status: 'Available',
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
    imageUrl: '/assets/shelter_ampara.jpg',
    occupancyHistory: [],
  },
  {
    name: 'Galle International Stadium Open Assembly Ground',
    hazardType: 'earthquake',
    hazardCategoryLabel: 'Open Assembly Grounds (Earthquakes)',
    capacityTotal: 1200,
    capacityCurrent: 420,
    isVerified: true,
    verificationAgency: 'Disaster Management Centre (DMC) Sri Lanka',
    district: 'Galle',
    address: 'Cricket Ground Road, Galle Fort Perimeter',
    coordinates: { lat: 6.0329, lng: 80.2168 },
    elevationMeters: 14,
    clearanceRadiusMeters: 220,
    status: 'Available',
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
    imageUrl: '/assets/shelter_akkaraipattu.jpg',
    occupancyHistory: [],
  },
];

// Helper: Seed initial database items if collection is empty
const seedDatabaseIfEmpty = async () => {
  try {
    const count = await Shelter.countDocuments();
    if (count === 0) {
      await Shelter.insertMany(initialShelters);
      console.log('Seeded initial verified shelters into MongoDB');
    }
  } catch (err) {
    console.error('Shelter seeding warning:', err.message);
  }
};

/**
 * GET /api/shelters
 * Fetch all verified shelters with optional hazard type, district, and search query filters
 */
export const getAllShelters = async (req, res) => {
  try {
    await seedDatabaseIfEmpty();

    const { hazardType, district, status, search, verifiedOnly } = req.query;
    const filter = {};

    if (verifiedOnly !== 'false') {
      filter.isVerified = true;
    }

    if (hazardType && hazardType !== 'all') {
      filter.hazardType = hazardType.toLowerCase();
    }

    if (district && district !== 'all') {
      const sanitizedDistrict = district.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.district = new RegExp(sanitizedDistrict, 'i');
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
        { district: { $regex: q, $options: 'i' } },
        { hazardCategoryLabel: { $regex: q, $options: 'i' } },
        { 'coordinator.name': { $regex: q, $options: 'i' } },
      ];
    }

    const shelters = await Shelter.find(filter).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: shelters.length,
      data: shelters,
    });
  } catch (error) {
    console.error('Error fetching shelters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve shelter directory',
      error: error.message,
    });
  }
};

/**
 * GET /api/shelters/stats
 * Aggregated metrics on capacities, occupancies, and hazard types
 */
export const getShelterStats = async (req, res) => {
  try {
    await seedDatabaseIfEmpty();

    const shelters = await Shelter.find({ isVerified: true });

    const totalShelters = shelters.length;
    const totalCapacity = shelters.reduce((acc, s) => acc + (s.capacityTotal || 0), 0);
    const totalOccupancy = shelters.reduce((acc, s) => acc + (s.capacityCurrent || 0), 0);
    const availableSpaces = Math.max(0, totalCapacity - totalOccupancy);
    const overallOccupancyRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

    const floodShelters = shelters.filter((s) => s.hazardType === 'flood').length;
    const earthquakeShelters = shelters.filter((s) => s.hazardType === 'earthquake').length;
    const nearlyFullCount = shelters.filter(
      (s) => s.status !== 'Closed' && (s.capacityCurrent / s.capacityTotal) >= 0.85
    ).length;
    const closedCount = shelters.filter((s) => s.status === 'Closed').length;

    res.status(200).json({
      success: true,
      stats: {
        totalShelters,
        totalCapacity,
        totalOccupancy,
        availableSpaces,
        overallOccupancyRate,
        floodShelters,
        earthquakeShelters,
        nearlyFullCount,
        closedCount,
      },
    });
  } catch (error) {
    console.error('Error generating shelter statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate shelter statistics',
      error: error.message,
    });
  }
};

/**
 * GET /api/shelters/:id
 * Retrieve a specific shelter by ID
 */
export const getShelterById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shelter identifier format',
      });
    }

    const shelter = await Shelter.findById(id);
    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: 'Shelter not found with the requested identifier',
      });
    }

    res.status(200).json({
      success: true,
      data: shelter,
    });
  } catch (error) {
    console.error('Error finding shelter:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving shelter details',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/shelters/:id/occupancy
 * Coordinator / Admin endpoint to edit shelter capacities, occupancies, and operational status
 */
export const updateShelterOccupancyAndCapacity = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shelter identifier format',
      });
    }

    const {
      capacityCurrent,
      capacityTotal,
      status,
      note,
      updatedBy,
    } = req.body;

    const shelter = await Shelter.findById(id);
    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: 'Shelter not found',
      });
    }

    const prevOccupancy = shelter.capacityCurrent;
    const prevCapacity = shelter.capacityTotal;

    let targetOccupancy = prevOccupancy;
    let targetTotal = prevCapacity;
    let hasChange = false;

    if (capacityCurrent !== undefined && capacityCurrent !== null) {
      const parsedOccupancy = parseInt(capacityCurrent, 10);
      if (isNaN(parsedOccupancy) || parsedOccupancy < 0) {
        return res.status(400).json({
          success: false,
          message: 'Current occupancy must be a valid non-negative integer',
        });
      }
      targetOccupancy = parsedOccupancy;
      hasChange = true;
    }

    if (capacityTotal !== undefined && capacityTotal !== null) {
      const parsedCapacity = parseInt(capacityTotal, 10);
      if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Total capacity must be a positive integer greater than 0',
        });
      }
      targetTotal = parsedCapacity;
      hasChange = true;
    }

    if (status !== undefined && status !== null && status !== shelter.status) {
      const allowedStatuses = ['Available', 'Nearly Full', 'At Capacity', 'Closed'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
        });
      }
      shelter.status = status;
      hasChange = true;
    }

    if (!hasChange) {
      return res.status(400).json({
        success: false,
        message: 'Please provide capacityCurrent, capacityTotal, or status to update',
      });
    }

    // Strict Cross-Field Invariant Enforcement: 0 <= targetOccupancy <= targetTotal
    if (targetOccupancy > targetTotal) {
      return res.status(400).json({
        success: false,
        message: `Current occupancy (${targetOccupancy}) cannot exceed total capacity (${targetTotal})`,
      });
    }

    shelter.capacityCurrent = targetOccupancy;
    shelter.capacityTotal = targetTotal;

    // Operational Status Handling:
    // If explicitly set to 'Closed' or already 'Closed' and not explicitly changed, preserve 'Closed'
    if (status === 'Closed') {
      shelter.status = 'Closed';
    } else if (!status && shelter.status === 'Closed') {
      shelter.status = 'Closed';
    } else {
      const occupancyRatio = shelter.capacityCurrent / shelter.capacityTotal;
      if (occupancyRatio >= 1.0) {
        shelter.status = 'At Capacity';
      } else if (occupancyRatio >= 0.85) {
        shelter.status = 'Nearly Full';
      } else {
        shelter.status = 'Available';
      }
    }

    // Derive actor from authenticated middleware (req.user)
    const actorName = req.user?.name
      ? `${req.user.name} (${req.user.role || 'administrator'})`
      : (updatedBy || 'Authorized Coordinator');

    // Create log record
    const changeDelta = targetOccupancy - prevOccupancy;
    shelter.occupancyHistory.unshift({
      timestamp: new Date(),
      previousOccupancy: prevOccupancy,
      newOccupancy: targetOccupancy,
      previousCapacity: prevCapacity,
      newCapacity: targetTotal,
      changeDelta,
      updatedBy: actorName,
      note: note || (changeDelta >= 0 ? `Admitted ${changeDelta} persons` : `Released ${Math.abs(changeDelta)} persons`),
    });

    // Keep history reasonable (latest 30 entries)
    if (shelter.occupancyHistory.length > 30) {
      shelter.occupancyHistory = shelter.occupancyHistory.slice(0, 30);
    }

    const updatedShelter = await shelter.save();

    res.status(200).json({
      success: true,
      message: 'Shelter capacity and occupancy updated successfully',
      data: updatedShelter,
    });
  } catch (error) {
    console.error('Error updating shelter capacity/occupancy:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update shelter capacity and occupancy',
      error: error.message,
    });
  }
};

/**
 * POST /api/shelters
 * Create a new verified shelter entry (Coordinator or Admin)
 */
export const createShelter = async (req, res) => {
  try {
    const {
      name,
      hazardType,
      capacityTotal,
      capacityCurrent = 0,
      district,
      address,
      elevationMeters,
      clearanceRadiusMeters,
      coordinator,
      facilities,
      notes,
    } = req.body;

    if (!name || !hazardType || capacityTotal === undefined || !district || !address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, hazardType, capacityTotal, district, address',
      });
    }

    const parsedTotal = parseInt(capacityTotal, 10);
    const parsedCurrent = parseInt(capacityCurrent, 10) || 0;

    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total capacity must be a positive integer greater than 0',
      });
    }

    if (isNaN(parsedCurrent) || parsedCurrent < 0) {
      return res.status(400).json({
        success: false,
        message: 'Initial occupancy must be a non-negative integer',
      });
    }

    if (parsedCurrent > parsedTotal) {
      return res.status(400).json({
        success: false,
        message: `Initial occupancy (${parsedCurrent}) cannot exceed total capacity (${parsedTotal})`,
      });
    }

    const creatorName = req.user?.name
      ? `${req.user.name} (${req.user.role || 'administrator'})`
      : (coordinator?.name || 'Authorized Coordinator');

    const shelter = new Shelter({
      name: name.trim(),
      hazardType,
      capacityTotal: parsedTotal,
      capacityCurrent: parsedCurrent,
      district: district.trim(),
      address: address.trim(),
      elevationMeters: elevationMeters ? parseFloat(elevationMeters) : 30,
      clearanceRadiusMeters: clearanceRadiusMeters ? parseFloat(clearanceRadiusMeters) : 75,
      coordinator: coordinator || {
        name: creatorName,
        phone: '+94 11 267 0001',
        email: req.user?.email || 'coordinator@resqlanka.lk',
      },
      facilities: Array.isArray(facilities) && facilities.length > 0 ? facilities : ['Clean Drinking Water', 'First Aid Station'],
      notes: notes || 'Verified shelter designated under DMC guidelines.',
      isVerified: true,
      occupancyHistory: [
        {
          timestamp: new Date(),
          previousOccupancy: 0,
          newOccupancy: parsedCurrent,
          previousCapacity: parsedTotal,
          newCapacity: parsedTotal,
          changeDelta: parsedCurrent,
          updatedBy: creatorName,
          note: 'Initial shelter registration and capacity setup.',
        },
      ],
    });

    const savedShelter = await shelter.save();

    res.status(201).json({
      success: true,
      message: 'Verified shelter successfully registered',
      data: savedShelter,
    });
  } catch (error) {
    console.error('Error creating shelter:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to register new shelter',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/shelters/:id
 * Remove a shelter (Coordinator or Admin)
 */
export const deleteShelter = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shelter identifier format',
      });
    }

    const deleted = await Shelter.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Shelter not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Shelter removed successfully',
    });
  } catch (error) {
    console.error('Error deleting shelter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete shelter',
      error: error.message,
    });
  }
};
