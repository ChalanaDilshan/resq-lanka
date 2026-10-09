import SOSRequest from '../models/SOSRequest.js';

// @desc    Broadcast a new emergency SOS request
// @route   POST /api/sos
export const createSOS = async (req, res) => {
  try {
    const { hazardType, urgency, locationText, coordinates, contactNumber, description } = req.body;

    if (!locationText || !locationText.trim()) {
      return res.status(400).json({ message: 'Location address or landmark is required.' });
    }

    // Clean phone number if provided, otherwise default to emergency hotline / anonymous
    const cleanedContactNumber = contactNumber
      ? contactNumber.toString().replace(/[\s-]+/g, '')
      : '0770000000';

    const cleanDescription = (description && description.trim()) 
      ? description.trim() 
      : 'Emergency assistance requested';

    const newRequest = await SOSRequest.create({
      hazardType: hazardType || 'Flood',
      urgency: urgency || 'Critical',
      locationText: locationText.trim(),
      coordinates: coordinates || { lat: 6.9271, lng: 79.8612 },
      contactNumber: cleanedContactNumber,
      description: cleanDescription,
      status: 'Pending',
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create SOS request', error: error.message });
  }
};

// @desc    Get all incident reports (sorted newest first, optional filtering)
// @route   GET /api/sos
export const getAllSOS = async (req, res) => {
  try {
    const { hazard, status, urgency } = req.query;
    const query = {};

    if (hazard && hazard !== 'All') query.hazardType = hazard;
    if (status && status !== 'All') query.status = status;
    if (urgency && urgency !== 'All') query.urgency = urgency;

    // Sort by createdAt descending (-1) so newest emergencies appear at the top
    const requests = await SOSRequest.find(query).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch incident reports', error: error.message });
  }
};

// @desc    Update incident lifecycle status (Pending -> In Progress -> Resolved)
// @route   PATCH /api/sos/:id/status
export const updateSOSStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Pending, In Progress, or Resolved.' });
    }

    const updatedRequest = await SOSRequest.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'SOS incident not found.' });
    }

    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update incident status', error: error.message });
  }
};