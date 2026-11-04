import mongoose from 'mongoose';
import User from '../models/User.model.js';
import TaskApplication from '../models/TaskApplication.model.js';

/**
 * Retrieve all registered volunteers with demographic NIC details & reliability telemetry
 * GET /api/auth/volunteers
 * Protected: Administrator / Coordinator
 */
export const getVolunteers = async (req, res) => {
  try {
    const { status, search, district } = req.query;

    const query = { role: 'volunteer' };

    // Status filter
    if (status && status !== 'all' && status !== 'All') {
      if (status === 'Unverified') {
        query.$or = [
          { volunteerStatus: 'Pending_Review' },
          { 'nicDetails.isValidated': false },
          { nicNumber: null },
        ];
      } else if (status === 'NIC_Verified' || status === 'Verified') {
        query.volunteerStatus = 'Verified';
      } else if (['Pending_Review', 'Flagged', 'Suspended'].includes(status)) {
        query.volunteerStatus = status;
      }
    }

    // District filter
    if (district && district !== 'all' && district !== 'All') {
      query.district = { $regex: new RegExp(`^${district.trim()}`, 'i') };
    }

    // Text search across Name, Email, Phone, and NIC Number
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { nicNumber: regex },
      ];
    }

    const volunteers = await User.find(query)
      .select('-password -otpCode -otpExpiresAt')
      .sort({ createdAt: -1 });

    // Aggregate summary counters across all volunteers
    const allVolunteers = await User.find({ role: 'volunteer' }).select('volunteerStatus nicDetails');
    const summary = {
      totalVolunteers: allVolunteers.length,
      pendingReview: allVolunteers.filter((v) => v.volunteerStatus === 'Pending_Review').length,
      verifiedCount: allVolunteers.filter((v) => v.volunteerStatus === 'Verified').length,
      flaggedCount: allVolunteers.filter((v) => v.volunteerStatus === 'Flagged').length,
      suspendedCount: allVolunteers.filter((v) => v.volunteerStatus === 'Suspended').length,
    };

    // Attach active applications count for each volunteer
    const volunteerIds = volunteers.map((v) => v._id);
    const applicationCounts = await TaskApplication.aggregate([
      { $match: { volunteer: { $in: volunteerIds } } },
      { $group: { _id: '$volunteer', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    applicationCounts.forEach((ac) => {
      countMap[ac._id.toString()] = ac.count;
    });

    const enrichedVolunteers = volunteers.map((vol) => {
      const plain = vol.toObject();
      plain.appliedTasksCount = countMap[vol._id.toString()] || 0;
      return plain;
    });

    return res.status(200).json({
      success: true,
      summary,
      volunteers: enrichedVolunteers,
    });
  } catch (error) {
    console.error('Error fetching volunteers list:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve volunteer records.',
      error: error.message,
    });
  }
};

/**
 * Update volunteer vetting status (Verify, Flag, Suspend, or Revert)
 * PATCH /api/auth/volunteers/:id/status
 * Protected: Administrator / Coordinator
 */
export const updateVolunteerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid volunteer ID format.',
      });
    }

    const validStatuses = ['Pending_Review', 'Verified', 'Flagged', 'Suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const volunteer = await User.findOne({ _id: id, role: 'volunteer' });
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer account not found.',
      });
    }

    volunteer.volunteerStatus = status;

    if (notes !== undefined) {
      if (!volunteer.volunteerReliability) {
        volunteer.volunteerReliability = { tasksCompleted: 0, noShows: 0, notes: '' };
      }
      volunteer.volunteerReliability.notes = notes.trim();
      volunteer.volunteerReliability.lastEvaluatedAt = new Date();
    }

    await volunteer.save();

    return res.status(200).json({
      success: true,
      message: `Volunteer status successfully updated to "${status}".`,
      volunteer: volunteer.toSafeObject(),
    });
  } catch (error) {
    console.error('Error updating volunteer status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update volunteer status.',
      error: error.message,
    });
  }
};

/**
 * Update volunteer reliability metrics (Increment Completed, No-Show, or Update Notes)
 * PATCH /api/auth/volunteers/:id/reliability
 * Protected: Administrator / Coordinator
 */
export const updateVolunteerReliability = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid volunteer ID format.',
      });
    }

    const volunteer = await User.findOne({ _id: id, role: 'volunteer' });
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer account not found.',
      });
    }

    if (!volunteer.volunteerReliability) {
      volunteer.volunteerReliability = {
        tasksCompleted: 0,
        noShows: 0,
        notes: '',
        lastEvaluatedAt: null,
      };
    }

    if (action === 'incrementCompleted') {
      volunteer.volunteerReliability.tasksCompleted += 1;
    } else if (action === 'incrementNoShow') {
      volunteer.volunteerReliability.noShows += 1;
      // Auto-flag volunteer if they accumulate 3 or more no-shows
      if (volunteer.volunteerReliability.noShows >= 3 && volunteer.volunteerStatus !== 'Flagged') {
        volunteer.volunteerStatus = 'Flagged';
        volunteer.volunteerReliability.notes = `Auto-flagged: Reached ${volunteer.volunteerReliability.noShows} unattended task absences.`;
      }
    } else if (action === 'reset') {
      volunteer.volunteerReliability.tasksCompleted = 0;
      volunteer.volunteerReliability.noShows = 0;
    }

    if (notes !== undefined && notes.trim()) {
      volunteer.volunteerReliability.notes = notes.trim();
    }

    volunteer.volunteerReliability.lastEvaluatedAt = new Date();

    await volunteer.save();

    return res.status(200).json({
      success: true,
      message: 'Volunteer reliability record updated successfully.',
      volunteer: volunteer.toSafeObject(),
    });
  } catch (error) {
    console.error('Error updating volunteer reliability:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update reliability record.',
      error: error.message,
    });
  }
};

