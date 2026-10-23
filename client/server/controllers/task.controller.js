import mongoose from 'mongoose';
import Task, {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '../models/Task.model.js';
import TaskApplication from '../models/TaskApplication.model.js';
import User from '../models/User.model.js';

// Realistic starter tasks matching Sri Lanka disaster relief context
const initialTasks = [
  {
    title: 'Dry Ration Survival Packs Packing & Sealing',
    description:
      'Assemble emergency food packs containing rice, dhal, canned fish, tea, and infant biscuits for flood-affected families in the Gal Oya basin. Work involves sorting, packing, and quality checking.',
    category: 'Dry Rations & Food Packing',
    priority: 'Urgent',
    status: 'Open',
    district: 'Ampara',
    location: 'Ampara Central College Staging Hall, Central Road, Ampara',
    requiredVolunteers: 15,
    assignedVolunteersCount: 4,
    skillsRequired: ['Packing & Sorting', 'Quality Checking', 'Physical Stamina'],
    safetyInstructions:
      'Wear closed-toe footwear and high-visibility vests. Maintain hygiene guidelines for handling food rations. Heavy lifting (>15kg) is restricted to designated logistics teams.',
    scheduledDate: new Date(Date.now() + 86400000 * 2),
    contactPerson: 'Eng. N. Senanayake',
    contactPhone: '+94 63 222 2341',
  },
  {
    title: 'Clean Drinking Water Distribution at Kalmunai High-Ground Center',
    description:
      'Manage distribution queue and ensure orderly distribution of 5L clean water bottles to registered flood evacuees. Coordinate with shelter staff to log distributed units.',
    category: 'Supply Distribution & Transport',
    priority: 'High',
    status: 'Open',
    district: 'Ampara',
    location: 'Kalmunai National School Gate 2 Distribution Point',
    requiredVolunteers: 8,
    assignedVolunteersCount: 3,
    skillsRequired: ['Crowd Management', 'Inventory Logging', 'Tamil or Sinhala fluency'],
    safetyInstructions:
      'Avoid standing near vehicular delivery bays. Drink water regularly and take sun protection precautions. Non-swimmers must remain strictly within elevated tarmac areas.',
    scheduledDate: new Date(Date.now() + 86400000 * 1),
    contactPerson: 'Mrs. K. Tharmalingam',
    contactPhone: '+94 67 222 1455',
  },
  {
    title: 'High-Ground Evacuee Reception & Registration Desk',
    description:
      'Welcome incoming displaced families, record registration details, and issue relief tokens. Assist nursing mothers and elderly evacuees to allocated shelter zones.',
    category: 'Community Coordination & Help Desk',
    priority: 'Medium',
    status: 'Open',
    district: 'Ampara',
    location: 'Akkaraipattu Municipal Council Auditorium',
    requiredVolunteers: 6,
    assignedVolunteersCount: 2,
    skillsRequired: ['Registration / Data Entry', 'Empathetic Communication', 'Bilingual Support'],
    safetyInstructions:
      'Civilian volunteers must remain at the designated registration hall. Do not accompany vehicles into inundated areas.',
    scheduledDate: new Date(Date.now() + 86400000 * 3),
    contactPerson: 'Eng. M. Rizwan',
    contactPhone: '+94 67 227 7890',
  },
  {
    title: 'Batticaloa Relief Center First Aid & Hygiene Kit Station',
    description:
      'Assist paramedical staff with distributing wound dressing packs, antiseptic liquid, and hygiene kits to shelter residents. Non-medical volunteers handle registration and supply restocking.',
    category: 'Medical Aid & First Aid Support',
    priority: 'Urgent',
    status: 'Open',
    district: 'Batticaloa',
    location: 'Batticaloa Hindu College Auditorium, New Road',
    requiredVolunteers: 10,
    assignedVolunteersCount: 2,
    skillsRequired: ['Basic First Aid awareness', 'Sanitation Handling', 'Record Keeping'],
    safetyInstructions:
      'Gloves and masks must be worn at all times in the medical station. Direct all clinical emergencies immediately to DMC medical officers on site.',
    scheduledDate: new Date(Date.now() + 86400000 * 2),
    contactPerson: 'Dr. V. Sivakumar',
    contactPhone: '+94 65 222 4110',
  },
  {
    title: 'Child Care & Educational Activities at Akkaraipattu Camp',
    description:
      'Supervise art sessions, storytelling, and structured recreational activities for displaced children in the safe child-friendly space to reduce disaster trauma.',
    category: 'Elderly & Child Care Assistance',
    priority: 'Medium',
    status: 'Open',
    district: 'Ampara',
    location: 'Akkaraipattu Public Ground Pavilion Wing B',
    requiredVolunteers: 5,
    assignedVolunteersCount: 1,
    skillsRequired: ['Child Protection Awareness', 'Teaching / Art skills', 'Patience'],
    safetyInstructions:
      'Follow child safeguarding policy. At least two adult volunteers must be present at all times. Never leave designated safe zone.',
    scheduledDate: new Date(Date.now() + 86400000 * 4),
    contactPerson: 'Mr. S. Perera',
    contactPhone: '+94 67 222 3400',
  },
];

// Helper: Seed initial tasks if collection is empty
const seedTasksIfEmpty = async () => {
  try {
    const count = await Task.countDocuments();
    if (count === 0) {
      let admin = await User.findOne({
        role: { $in: ['administrator', 'coordinator'] },
      });

      if (!admin) {
        admin = await User.findOne();
      }

      const creatorId = admin ? admin._id : new mongoose.Types.ObjectId();
      const docsToInsert = initialTasks.map((t) => ({
        ...t,
        createdBy: creatorId,
      }));

      await Task.insertMany(docsToInsert);
      console.log('Seeded initial disaster relief volunteer tasks into MongoDB');
    }
  } catch (err) {
    console.error('Task seeding warning:', err.message);
  }
};

/**
 * GET /api/tasks
 * Retrieve published tasks with filters (category, priority, status, district, search)
 */
export const getAllTasks = async (req, res) => {
  try {
    await seedTasksIfEmpty();

    const { category, priority, status, district, search, page, limit } =
      req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (priority && priority !== 'All') {
      filter.priority = priority;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (district && district !== 'All') {
      const sanitizedDistrict = district
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.district = new RegExp(`^${sanitizedDistrict}$`, 'i');
    }

    if (search && search.trim() !== '') {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(sanitized, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { skillsRequired: searchRegex },
      ];
    }

    let query = Task.find(filter)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    const total = await Task.countDocuments(filter);

    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const tasks = await query.exec();

    return res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve volunteer tasks',
      error: error.message,
    });
  }
};

/**
 * GET /api/tasks/stats
 * Aggregated metrics on volunteer tasks
 */
export const getTaskStats = async (req, res) => {
  try {
    await seedTasksIfEmpty();

    const tasks = await Task.find();

    const totalTasks = tasks.length;
    const openTasks = tasks.filter((t) => t.status === 'Open').length;
    const assignedTasks = tasks.filter((t) => t.status === 'Assigned').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
    const cancelledTasks = tasks.filter((t) => t.status === 'Cancelled').length;

    const totalVolunteersRequired = tasks.reduce(
      (acc, t) => acc + (t.requiredVolunteers || 0),
      0
    );
    const totalVolunteersAssigned = tasks.reduce(
      (acc, t) => acc + (t.assignedVolunteersCount || 0),
      0
    );
    const availableSlots = Math.max(
      0,
      totalVolunteersRequired - totalVolunteersAssigned
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        openTasks,
        assignedTasks,
        inProgressTasks,
        completedTasks,
        cancelledTasks,
        totalVolunteersRequired,
        totalVolunteersAssigned,
        availableSlots,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to compute task statistics',
      error: error.message,
    });
  }
};

/**
 * GET /api/tasks/:id
 * Retrieve a single task by ID with context-aware applications
 */
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format. Must be a 24-character hexadecimal ObjectId.',
      });
    }

    const task = await Task.findById(id).populate(
      'createdBy',
      'name email role'
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer task not found.',
      });
    }

    let userApplication = null;
    let applications = [];

    // If authenticated user
    if (req.user) {
      // Find current user's application
      userApplication = await TaskApplication.findOne({
        task: task._id,
        volunteer: req.user._id,
      });

      // If user is administrator or coordinator, allow viewing applicant roster
      if (['administrator', 'coordinator'].includes(req.user.role)) {
        applications = await TaskApplication.find({ task: task._id })
          .populate('volunteer', 'name email phone district')
          .populate('reviewedBy', 'name email')
          .sort({ createdAt: -1 });
      }
    }

    return res.status(200).json({
      success: true,
      task,
      userApplication,
      applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve task details',
      error: error.message,
    });
  }
};

/**
 * POST /api/tasks
 * Create a new task (Administrator / Coordinator only)
 */
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      district,
      location,
      requiredVolunteers,
      skillsRequired,
      safetyInstructions,
      deadline,
      scheduledDate,
      contactPerson,
      contactPhone,
    } = req.body;

    if (!title || !description || !category || !district || !location || !requiredVolunteers) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: title, description, category, district, location, and requiredVolunteers are mandatory.',
      });
    }

    if (Number(requiredVolunteers) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Required volunteers count must be at least 1.',
      });
    }

    const task = new Task({
      title: title.trim(),
      description: description.trim(),
      category,
      priority: priority || 'Medium',
      district: district.trim(),
      location: location.trim(),
      requiredVolunteers: Number(requiredVolunteers),
      skillsRequired: Array.isArray(skillsRequired)
        ? skillsRequired
        : typeof skillsRequired === 'string' && skillsRequired.trim()
        ? skillsRequired.split(',').map((s) => s.trim())
        : [],
      safetyInstructions:
        safetyInstructions && safetyInstructions.trim()
          ? safetyInstructions.trim()
          : undefined,
      deadline: deadline || null,
      scheduledDate: scheduledDate || null,
      createdBy: req.user._id,
      contactPerson:
        contactPerson && contactPerson.trim()
          ? contactPerson.trim()
          : req.user.name || 'Relief Coordinator',
      contactPhone:
        contactPhone && contactPhone.trim()
          ? contactPhone.trim()
          : req.user.phone || '+94 63 222 2341',
    });

    await task.save();

    return res.status(201).json({
      success: true,
      message: 'Volunteer task created successfully.',
      task,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${messages.join(', ')}`,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create volunteer task',
      error: error.message,
    });
  }
};

/**
 * PUT /api/tasks/:id
 * Update an existing task (Administrator / Coordinator only)
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format.',
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const {
      title,
      description,
      category,
      priority,
      status,
      district,
      location,
      requiredVolunteers,
      skillsRequired,
      safetyInstructions,
      deadline,
      scheduledDate,
      contactPerson,
      contactPhone,
    } = req.body;

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (category !== undefined) task.category = category;
    if (priority !== undefined) task.priority = priority;
    if (district !== undefined) task.district = district.trim();
    if (location !== undefined) task.location = location.trim();
    if (safetyInstructions !== undefined)
      task.safetyInstructions = safetyInstructions.trim();
    if (deadline !== undefined) task.deadline = deadline;
    if (scheduledDate !== undefined) task.scheduledDate = scheduledDate;
    if (contactPerson !== undefined) task.contactPerson = contactPerson.trim();
    if (contactPhone !== undefined) task.contactPhone = contactPhone.trim();

    if (skillsRequired !== undefined) {
      task.skillsRequired = Array.isArray(skillsRequired)
        ? skillsRequired
        : typeof skillsRequired === 'string'
        ? skillsRequired.split(',').map((s) => s.trim())
        : [];
    }

    if (requiredVolunteers !== undefined) {
      const reqVal = Number(requiredVolunteers);
      if (reqVal < task.assignedVolunteersCount) {
        return res.status(400).json({
          success: false,
          message: `Required volunteers (${reqVal}) cannot be less than already assigned volunteers (${task.assignedVolunteersCount}).`,
        });
      }
      task.requiredVolunteers = reqVal;
    }

    // Permitted status transitions
    if (status !== undefined) {
      if (!TASK_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status: '${status}'. Allowed values: ${TASK_STATUSES.join(', ')}`,
        });
      }
      task.status = status;
    }

    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${messages.join(', ')}`,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/tasks/:id
 * Delete a task and remove associated applications (Administrator / Coordinator only)
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format.',
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // Remove associated applications
    await TaskApplication.deleteMany({ task: task._id });
    await Task.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Task and associated applications deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message,
    });
  }
};

/**
 * POST /api/tasks/:id/apply
 * Apply to an open volunteer task (Authenticated volunteer / citizen)
 */
export const applyForTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, skills, availability } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format.',
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // Invariant: Task must be Open to accept new applications
    if (task.status !== 'Open') {
      return res.status(400).json({
        success: false,
        message: `Cannot apply to task with status '${task.status}'. Only 'Open' tasks accept applications.`,
      });
    }

    // Invariant: Task must not be at capacity
    if (task.assignedVolunteersCount >= task.requiredVolunteers) {
      return res.status(400).json({
        success: false,
        message:
          'This task has already reached maximum volunteer capacity. No further applications are being accepted.',
      });
    }

    // Check if volunteer already applied
    const existing = await TaskApplication.findOne({
      task: task._id,
      volunteer: req.user._id,
    });

    if (existing) {
      if (existing.status !== 'Withdrawn') {
        return res.status(409).json({
          success: false,
          message: `You have already applied for this task. Current status: '${existing.status}'.`,
          application: existing,
        });
      } else {
        // If withdrawn, allow re-application by resetting to Pending
        existing.status = 'Pending';
        existing.message = message ? message.trim() : '';
        existing.skills = Array.isArray(skills)
          ? skills
          : typeof skills === 'string'
          ? skills.split(',').map((s) => s.trim())
          : existing.skills;
        existing.availability = availability || 'Immediate';
        existing.reviewedBy = null;
        existing.reviewedAt = null;
        existing.reviewNotes = '';
        await existing.save();

        return res.status(200).json({
          success: true,
          message: 'Application resubmitted successfully.',
          application: existing,
        });
      }
    }

    const application = new TaskApplication({
      task: task._id,
      volunteer: req.user._id,
      status: 'Pending',
      message: message ? message.trim() : '',
      skills: Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim())
        : [],
      availability: availability || 'Immediate',
    });

    await application.save();

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully. Awaiting coordinator review.',
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this task.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to submit task application',
      error: error.message,
    });
  }
};

/**
 * GET /api/tasks/my-applications
 * Retrieve current authenticated volunteer's applications and assignments
 */
export const getMyApplications = async (req, res) => {
  try {
    const applications = await TaskApplication.find({
      volunteer: req.user._id,
    })
      .populate({
        path: 'task',
        select:
          'title category priority status district location requiredVolunteers assignedVolunteersCount scheduledDate contactPerson contactPhone',
      })
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your applications',
      error: error.message,
    });
  }
};

/**
 * GET /api/tasks/:id/applications
 * Retrieve all applications for a task (Administrator / Coordinator only)
 */
export const getTaskApplications = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format.',
      });
    }

    const applications = await TaskApplication.find({ task: id })
      .populate('volunteer', 'name email phone district')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve task applications',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/tasks/applications/:applicationId/review
 * Administrator review action: Approve or Reject application with concurrency-safe atomic capacity increment
 */
export const reviewApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, reviewNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format.',
      });
    }

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Approved' or 'Rejected'.",
      });
    }

    const application = await TaskApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Task application not found.',
      });
    }

    const task = await Task.findById(application.task);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Associated task no longer exists.',
      });
    }

    const previousStatus = application.status;

    // Handle Approval
    if (status === 'Approved') {
      if (previousStatus === 'Approved') {
        return res.status(400).json({
          success: false,
          message: 'Application is already approved.',
        });
      }

      // Concurrency protection: Atomic conditional increment
      // Only increment if assignedVolunteersCount < requiredVolunteers and status is Open or Assigned
      const updatedTask = await Task.findOneAndUpdate(
        {
          _id: task._id,
          assignedVolunteersCount: { $lt: task.requiredVolunteers },
          status: { $in: ['Open', 'Assigned'] },
        },
        {
          $inc: { assignedVolunteersCount: 1 },
        },
        { new: true }
      );

      if (!updatedTask) {
        return res.status(409).json({
          success: false,
          message:
            'Task volunteer capacity is full. Cannot approve additional volunteers.',
        });
      }

      // Check if task is now at capacity and auto-transition to Assigned
      if (
        updatedTask.assignedVolunteersCount >= updatedTask.requiredVolunteers &&
        updatedTask.status === 'Open'
      ) {
        updatedTask.status = 'Assigned';
        await updatedTask.save();
      }

      application.status = 'Approved';
      application.reviewedBy = req.user._id;
      application.reviewNotes = reviewNotes ? reviewNotes.trim() : '';
      application.reviewedAt = new Date();
      await application.save();

      return res.status(200).json({
        success: true,
        message: 'Volunteer application approved and assigned to task.',
        application,
        task: updatedTask,
      });
    }

    // Handle Rejection
    if (status === 'Rejected') {
      // If was previously Approved, atomic decrement of assigned capacity
      if (previousStatus === 'Approved') {
        const updatedTask = await Task.findOneAndUpdate(
          {
            _id: task._id,
            assignedVolunteersCount: { $gt: 0 },
          },
          {
            $inc: { assignedVolunteersCount: -1 },
          },
          { new: true }
        );

        if (
          updatedTask &&
          updatedTask.status === 'Assigned' &&
          updatedTask.assignedVolunteersCount < updatedTask.requiredVolunteers
        ) {
          updatedTask.status = 'Open';
          await updatedTask.save();
        }
      }

      application.status = 'Rejected';
      application.reviewedBy = req.user._id;
      application.reviewNotes = reviewNotes ? reviewNotes.trim() : '';
      application.reviewedAt = new Date();
      await application.save();

      const freshTask = await Task.findById(task._id);

      return res.status(200).json({
        success: true,
        message: 'Volunteer application rejected.',
        application,
        task: freshTask,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process application review',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/tasks/applications/:applicationId/withdraw
 * Volunteer self-service withdrawal of pending or approved application
 */
export const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format.',
      });
    }

    const application = await TaskApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Must be the owner volunteer
    if (application.volunteer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only withdraw your own applications.',
      });
    }

    if (application.status === 'Withdrawn') {
      return res.status(400).json({
        success: false,
        message: 'Application is already withdrawn.',
      });
    }

    // If was Approved, decrement assigned count on task
    if (application.status === 'Approved') {
      const updatedTask = await Task.findOneAndUpdate(
        {
          _id: application.task,
          assignedVolunteersCount: { $gt: 0 },
        },
        {
          $inc: { assignedVolunteersCount: -1 },
        },
        { new: true }
      );

      if (
        updatedTask &&
        updatedTask.status === 'Assigned' &&
        updatedTask.assignedVolunteersCount < updatedTask.requiredVolunteers
      ) {
        updatedTask.status = 'Open';
        await updatedTask.save();
      }
    }

    application.status = 'Withdrawn';
    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully.',
      application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to withdraw application',
      error: error.message,
    });
  }
};
