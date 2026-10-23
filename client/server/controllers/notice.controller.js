import mongoose from 'mongoose';
import Notice, {
  HAZARD_TYPES,
  SEVERITY_LEVELS,
  PUBLICATION_STATUSES,
  VERIFICATION_STATUSES,
  SRI_LANKA_DISTRICTS,
} from '../models/Notice.model.js';
import User from '../models/User.model.js';

// Realistic starter emergency notices matching Sri Lanka disaster context
const initialNotices = [
  {
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
    publishedAt: new Date(Date.now() - 3600000 * 2),
    expiresAt: new Date(Date.now() + 86400000 * 2),
    contactNumber: '117 (DMC Hotline) / +94 63 222 2341',
  },
  {
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
    publishedAt: new Date(Date.now() - 3600000 * 5),
    expiresAt: new Date(Date.now() + 86400000 * 1),
    contactNumber: '011-2694801',
  },
  {
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
    publishedAt: new Date(Date.now() - 3600000 * 8),
    expiresAt: new Date(Date.now() + 86400000 * 2),
    contactNumber: '011-2588946',
  },
  {
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
    publishedAt: new Date(Date.now() - 3600000 * 12),
    expiresAt: new Date(Date.now() + 86400000 * 3),
    contactNumber: '011-2886289',
  },
  {
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
    publishedAt: new Date(Date.now() - 3600000 * 4),
    expiresAt: new Date(Date.now() + 86400000 * 1),
    contactNumber: '+94 21 228 5555',
  },
];

// Helper: Seed initial notices if collection is empty
const seedNoticesIfEmpty = async () => {
  try {
    const count = await Notice.countDocuments();
    if (count === 0) {
      let admin = await User.findOne({
        role: { $in: ['administrator', 'coordinator'] },
      });

      if (!admin) {
        admin = await User.findOne();
      }

      const creatorId = admin ? admin._id : new mongoose.Types.ObjectId();
      const docsToInsert = initialNotices.map((n) => ({
        ...n,
        createdBy: creatorId,
        createdByName: admin ? admin.name : 'DMC Liaison Coordinator',
      }));

      await Notice.insertMany(docsToInsert);
      console.log(`[Module 5] Seeded ${docsToInsert.length} initial emergency notices`);
    }
  } catch (error) {
    console.warn('[Module 5] Notice seeding bypassed:', error.message);
  }
};

/**
 * GET /api/notices
 * Public feed for active, published emergency alerts and notices.
 * Supports query filters: hazardType, severity, district, isOfficial, verificationStatus, search, includeExpired
 */
export const getAllNotices = async (req, res) => {
  try {
    await seedNoticesIfEmpty();

    const {
      hazardType,
      severity,
      district,
      isOfficial,
      verificationStatus,
      status,
      includeExpired,
      search,
    } = req.query;

    const query = {};
    const now = new Date();

    const isPrivileged =
      req.user &&
      ['administrator', 'coordinator'].includes(req.user.role);

    // Publication status filter
    if (includeExpired === 'true') {
      // Historical archive view: includes Expired or Withdrawn or past dates
      if (status && PUBLICATION_STATUSES.includes(status)) {
        query.publicationStatus = status;
      }
    } else {
      // Default: Active public feed
      // Must be Published, and either expiresAt is null or in the future
      query.publicationStatus = 'Published';
      query.$or = [{ expiresAt: null }, { expiresAt: { $gt: now } }];
    }

    // Privileged users can inspect Drafts or Withdrawn specifically
    if (isPrivileged && status && status !== 'Published') {
      query.publicationStatus = status;
      delete query.$or;
    }

    // Hazard type filter
    if (hazardType && hazardType !== 'All' && HAZARD_TYPES.includes(hazardType)) {
      query.hazardType = hazardType;
    }

    // Severity level filter
    if (severity && severity !== 'All' && SEVERITY_LEVELS.includes(severity)) {
      query.severity = severity;
    }

    // District filter
    if (district && district !== 'All') {
      query.affectedDistricts = district;
    }

    // Official status filter
    if (isOfficial === 'true') {
      query.isOfficial = true;
    } else if (isOfficial === 'false') {
      query.isOfficial = false;
    }

    // Verification status filter
    if (verificationStatus && VERIFICATION_STATUSES.includes(verificationStatus)) {
      query.verificationStatus = verificationStatus;
    }

    // Search query
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: searchRegex },
          { message: searchRegex },
          { sourceName: searchRegex },
        ],
      });
    }

    const notices = await Notice.find(query)
      .sort({ severity: -1, publishedAt: -1, createdAt: -1 })
      .populate('createdBy', 'name email role')
      .populate('verifiedBy', 'name email role');

    return res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (error) {
    console.error('Error in getAllNotices:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve emergency notices. Please try again.',
    });
  }
};

/**
 * GET /api/notices/stats
 * Aggregate metrics for emergency noticeboard dashboard banner
 */
export const getNoticeStats = async (req, res) => {
  try {
    await seedNoticesIfEmpty();

    const now = new Date();
    const activeFilter = {
      publicationStatus: 'Published',
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    };

    const [totalActive, criticalAlerts, highAlerts, verifiedOfficialCount, notices] =
      await Promise.all([
        Notice.countDocuments(activeFilter),
        Notice.countDocuments({ ...activeFilter, severity: 'Critical' }),
        Notice.countDocuments({ ...activeFilter, severity: 'High' }),
        Notice.countDocuments({ ...activeFilter, isOfficial: true, verificationStatus: 'Verified' }),
        Notice.find(activeFilter, 'affectedDistricts'),
      ]);

    // Unique affected districts
    const districtSet = new Set();
    notices.forEach((n) => {
      if (Array.isArray(n.affectedDistricts)) {
        n.affectedDistricts.forEach((d) => districtSet.add(d));
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalActive,
        criticalAlerts,
        highAlerts,
        affectedDistrictsCount: districtSet.size,
        verifiedOfficialCount,
      },
    });
  } catch (error) {
    console.error('Error in getNoticeStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve noticeboard statistics.',
    });
  }
};

/**
 * GET /api/notices/:id
 * Retrieve a single notice by ID
 */
export const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notice ID format.',
      });
    }

    const notice = await Notice.findById(id)
      .populate('createdBy', 'name email role')
      .populate('verifiedBy', 'name email role');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Emergency notice not found.',
      });
    }

    // Access control for drafts
    const isPrivileged =
      req.user &&
      ['administrator', 'coordinator'].includes(req.user.role);

    const isCreator =
      req.user &&
      notice.createdBy &&
      notice.createdBy._id &&
      notice.createdBy._id.toString() === req.user._id.toString();

    if (notice.publicationStatus === 'Draft' && !isPrivileged && !isCreator) {
      return res.status(404).json({
        success: false,
        message: 'Emergency notice not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error('Error in getNoticeById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notice details.',
    });
  }
};

/**
 * POST /api/notices
 * Create a new emergency notice or community submission
 * Admins/coordinators can publish immediately. Citizens/volunteers create unverified drafts.
 */
export const createNotice = async (req, res) => {
  try {
    const {
      title,
      message,
      hazardType,
      severity,
      affectedDistricts,
      sourceName,
      sourceUrl,
      contactNumber,
      expiresAt,
      publicationStatus,
    } = req.body;

    const isPrivileged =
      req.user &&
      ['administrator', 'coordinator'].includes(req.user.role);

    // Enforce publication & verification rules
    let finalPublicationStatus = 'Draft';
    let finalIsOfficial = false;
    let finalVerificationStatus = 'Unverified';

    if (isPrivileged) {
      finalPublicationStatus =
        publicationStatus && PUBLICATION_STATUSES.includes(publicationStatus)
          ? publicationStatus
          : 'Published';

      if (req.body.isOfficial === true) {
        finalIsOfficial = true;
        finalVerificationStatus = 'Verified';
      }
    }

    // Validate date logic
    if (expiresAt) {
      const expDate = new Date(expiresAt);
      if (isNaN(expDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expiry date format.',
        });
      }
      if (expDate.getTime() <= Date.now()) {
        return res.status(400).json({
          success: false,
          message: 'Expiry date must be in the future.',
        });
      }
    }

    const notice = new Notice({
      title,
      message,
      hazardType,
      severity: severity || 'Medium',
      affectedDistricts,
      sourceName,
      sourceUrl: sourceUrl || '',
      contactNumber: contactNumber || '',
      isOfficial: finalIsOfficial,
      verificationStatus: finalVerificationStatus,
      publicationStatus: finalPublicationStatus,
      publishedAt: finalPublicationStatus === 'Published' ? new Date() : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user ? req.user._id : null,
      createdByName: req.user ? req.user.name : 'Authorized Coordinator',
      verifiedBy: finalVerificationStatus === 'Verified' ? req.user?._id : null,
      verifiedAt: finalVerificationStatus === 'Verified' ? new Date() : null,
    });

    await notice.save();

    return res.status(201).json({
      success: true,
      message:
        finalPublicationStatus === 'Published'
          ? 'Emergency alert published successfully.'
          : 'Notice submitted as draft for administrative review.',
      data: notice,
    });
  } catch (error) {
    console.error('Error in createNotice:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to create emergency notice.',
    });
  }
};

/**
 * PUT /api/notices/:id
 * Update an existing notice (Administrators / Coordinators only)
 */
export const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notice ID format.',
      });
    }

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    if (notice.publicationStatus === 'Withdrawn') {
      return res.status(400).json({
        success: false,
        message: 'A withdrawn notice cannot be edited. Please create a new alert if needed.',
      });
    }

    const {
      title,
      message,
      hazardType,
      severity,
      affectedDistricts,
      sourceName,
      sourceUrl,
      contactNumber,
      expiresAt,
      publicationStatus,
    } = req.body;

    if (title) notice.title = title;
    if (message) notice.message = message;
    if (hazardType) notice.hazardType = hazardType;
    if (severity) notice.severity = severity;
    if (affectedDistricts) notice.affectedDistricts = affectedDistricts;
    if (sourceName) notice.sourceName = sourceName;
    if (sourceUrl !== undefined) notice.sourceUrl = sourceUrl;
    if (contactNumber !== undefined) notice.contactNumber = contactNumber;

    if (expiresAt !== undefined) {
      if (expiresAt === null || expiresAt === '') {
        notice.expiresAt = null;
      } else {
        const expDate = new Date(expiresAt);
        if (isNaN(expDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid expiry date format.',
          });
        }
        if (expDate.getTime() <= Date.now()) {
          return res.status(400).json({
            success: false,
            message: 'Expiry date must be in the future.',
          });
        }
        notice.expiresAt = expDate;
      }
    }

    if (publicationStatus && PUBLICATION_STATUSES.includes(publicationStatus)) {
      notice.publicationStatus = publicationStatus;
      if (publicationStatus === 'Published' && !notice.publishedAt) {
        notice.publishedAt = new Date();
      }
    }

    await notice.save();

    return res.status(200).json({
      success: true,
      message: 'Notice updated successfully.',
      data: notice,
    });
  } catch (error) {
    console.error('Error in updateNotice:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to update emergency notice.',
    });
  }
};

/**
 * PATCH /api/notices/:id/verify
 * Review and verify notice source (Administrators / Coordinators only)
 */
export const verifyNoticeSource = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus, verificationNotes, isOfficial } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notice ID format.',
      });
    }

    if (!VERIFICATION_STATUSES.includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid verification status. Must be one of: ${VERIFICATION_STATUSES.join(', ')}`,
      });
    }

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Emergency notice not found.',
      });
    }

    notice.verificationStatus = verificationStatus;
    notice.verifiedBy = req.user ? req.user._id : null;
    notice.verifiedAt = new Date();
    if (verificationNotes !== undefined) {
      notice.verificationNotes = verificationNotes;
    }
    if (isOfficial !== undefined) {
      notice.isOfficial = Boolean(isOfficial);
    }

    await notice.save();

    return res.status(200).json({
      success: true,
      message: `Notice source verified as '${verificationStatus}'.`,
      data: notice,
    });
  } catch (error) {
    console.error('Error in verifyNoticeSource:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notice verification status.',
    });
  }
};

/**
 * PATCH /api/notices/:id/withdraw
 * Withdraw an active emergency notice with mandatory reason (Administrators / Coordinators only)
 */
export const withdrawNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notice ID format.',
      });
    }

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A clear withdrawal reason of at least 5 characters is required.',
      });
    }

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    if (notice.publicationStatus === 'Withdrawn') {
      return res.status(400).json({
        success: false,
        message: 'Notice is already withdrawn.',
      });
    }

    notice.publicationStatus = 'Withdrawn';
    notice.withdrawnAt = new Date();
    notice.withdrawnReason = reason.trim();

    await notice.save();

    return res.status(200).json({
      success: true,
      message: 'Notice has been officially withdrawn from active alerts.',
      data: notice,
    });
  } catch (error) {
    console.error('Error in withdrawNotice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to withdraw notice.',
    });
  }
};

/**
 * DELETE /api/notices/:id
 * Permanently delete a notice (Administrators / Coordinators only)
 */
export const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notice ID format.',
      });
    }

    const notice = await Notice.findByIdAndDelete(id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notice permanently deleted.',
    });
  } catch (error) {
    console.error('Error in deleteNotice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notice.',
    });
  }
};
