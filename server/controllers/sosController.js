import mongoose from 'mongoose';
import SOSRequest from '../models/SOSRequest.js';

// Status transition rule matrix
const ALLOWED_TRANSITIONS = {
  Pending: ['In Progress', 'Resolved', 'Cancelled'],
  'In Progress': ['Resolved', 'Pending', 'Cancelled'],
  Resolved: ['In Progress'],
  Cancelled: ['Pending'],
};

/**
 * @desc    Submit a new emergency SOS request
 * @route   POST /api/sos
 * @access  Public (Optional authentication attaches user identity)
 */
export const createSOS = async (req, res) => {
  try {
    const {
      hazardType,
      urgency,
      locationText,
      coordinates,
      contactNumber,
      description,
    } = req.body;

    // 1. Validate required locationText
    if (!locationText || !locationText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Location landmark or address description is required.',
      });
    }

    // 2. Validate emergency contact number
    if (!contactNumber || !contactNumber.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid contact phone number is required so responders can coordinate with you.',
      });
    }

    const cleanedContact = contactNumber.toString().replace(/[\s-]+/g, '');
    if (cleanedContact.length < 9 || cleanedContact.length > 15) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number (9 to 15 digits).',
      });
    }

    // 3. Validate coordinates safely without injecting fake defaults
    let safeCoords = { lat: null, lng: null, hasCoordinates: false };
    if (
      coordinates &&
      typeof coordinates.lat === 'number' &&
      typeof coordinates.lng === 'number' &&
      !isNaN(coordinates.lat) &&
      !isNaN(coordinates.lng)
    ) {
      if (
        coordinates.lat >= -90 &&
        coordinates.lat <= 90 &&
        coordinates.lng >= -180 &&
        coordinates.lng <= 180
      ) {
        safeCoords = {
          lat: coordinates.lat,
          lng: coordinates.lng,
          hasCoordinates: true,
        };
      }
    }

    // 4. Attach authenticated reporter if logged in
    const reportedBy = req.user ? req.user._id : null;
    const reporterName = req.user ? req.user.name : 'Anonymous Citizen';

    // 5. Initial status is always 'Pending' on creation
    const initialHistoryEntry = {
      previousStatus: 'None',
      newStatus: 'Pending',
      changedBy: reportedBy,
      changedByName: reporterName,
      note: 'Incident registered in ResQ-Lanka system.',
      timestamp: new Date(),
    };

    const newRequest = await SOSRequest.create({
      hazardType: hazardType || 'Flood',
      urgency: urgency || 'Critical',
      locationText: locationText.trim(),
      coordinates: safeCoords,
      contactNumber: cleanedContact,
      description:
        description && description.trim()
          ? description.trim()
          : `Emergency assistance requested at ${locationText.trim()}`,
      status: 'Pending',
      reportedBy,
      reporterName,
      statusHistory: [initialHistoryEntry],
    });

    return res.status(201).json({
      success: true,
      message: 'Emergency SOS report received by ResQ-Lanka.',
      data: newRequest,
    });
  } catch (error) {
    console.error('Create SOS error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit SOS request.',
    });
  }
};

/**
 * @desc    Get all incident reports (with filters, newest first)
 * @route   GET /api/sos
 * @access  Public (Contact numbers masked unless requester is authorized responder)
 */
export const getAllSOS = async (req, res) => {
  try {
    const { hazard, status, urgency, search } = req.query;
    const query = {};

    if (hazard && hazard !== 'All') query.hazardType = hazard;
    if (status && status !== 'All') query.status = status;
    if (urgency && urgency !== 'All') query.urgency = urgency;

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { locationText: searchRegex },
        { description: searchRegex },
        { hazardType: searchRegex },
      ];
    }

    const requests = await SOSRequest.find(query).sort({ createdAt: -1 });

    // Check if requester has responder/admin privileges
    const isResponder =
      req.user &&
      ['administrator', 'coordinator', 'volunteer'].includes(req.user.role);

    let outputData;
    if (isResponder) {
      outputData = requests;
    } else {
      // Mask contact numbers for public privacy
      outputData = requests.map((reqDoc) => reqDoc.toPublicFeedObject());
    }

    return res.status(200).json(outputData);
  } catch (error) {
    console.error('Get SOS error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch incident reports.',
    });
  }
};

/**
 * @desc    Get single incident report by ID
 * @route   GET /api/sos/:id
 * @access  Public
 */
export const getSOSById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid incident ID format.',
      });
    }

    const incident = await SOSRequest.findById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'SOS incident not found.',
      });
    }

    const isResponder =
      req.user &&
      ['administrator', 'coordinator', 'volunteer'].includes(req.user.role);

    return res.status(200).json({
      success: true,
      data: isResponder ? incident : incident.toPublicFeedObject(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve incident.',
    });
  }
};

/**
 * @desc    Update incident lifecycle status (Pending -> In Progress -> Resolved)
 * @route   PATCH /api/sos/:id/status
 * @access  Protected (Administrator, Coordinator, Volunteer)
 */
export const updateSOSStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note = '' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid incident ID format.',
      });
    }

    if (!['Pending', 'In Progress', 'Resolved', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending, In Progress, Resolved, or Cancelled.',
      });
    }

    const incident = await SOSRequest.findById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'SOS incident not found.',
      });
    }

    // Verify valid status transition
    const validNextStatuses = ALLOWED_TRANSITIONS[incident.status] || [];
    if (!validNextStatuses.includes(status) && incident.status !== status) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition incident from '${incident.status}' directly to '${status}'. Allowed: [${validNextStatuses.join(', ')}]`,
      });
    }

    const previousStatus = incident.status;
    incident.status = status;

    // Record in status audit history
    incident.statusHistory.push({
      previousStatus,
      newStatus: status,
      changedBy: req.user ? req.user._id : null,
      changedByName: req.user
        ? `${req.user.name} (${req.user.role})`
        : 'Authorized Responder',
      note: note.trim() || `Status updated from ${previousStatus} to ${status}`,
      timestamp: new Date(),
    });

    const updated = await incident.save();

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Update SOS error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update incident status.',
    });
  }
};