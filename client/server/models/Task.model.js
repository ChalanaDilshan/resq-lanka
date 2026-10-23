import mongoose from 'mongoose';

export const TASK_CATEGORIES = [
  'Dry Rations & Food Packing',
  'Supply Distribution & Transport',
  'Shelter Logistics & Management',
  'Elderly & Child Care Assistance',
  'Sanitation & Hygiene Maintenance',
  'Medical Aid & First Aid Support',
  'Community Coordination & Help Desk',
  'General Non-Hazardous Assistance',
];

export const TASK_STATUSES = [
  'Open',
  'Assigned',
  'In Progress',
  'Completed',
  'Cancelled',
];

export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const SRI_LANKA_DISTRICTS = [
  'Ampara',
  'Anuradhapura',
  'Badulla',
  'Batticaloa',
  'Colombo',
  'Galle',
  'Gampaha',
  'Hambantota',
  'Jaffna',
  'Kalutara',
  'Kandy',
  'Kegalle',
  'Kilinochchi',
  'Kurunegala',
  'Mannar',
  'Matale',
  'Matara',
  'Monaragala',
  'Mullaitivu',
  'Nuwara Eliya',
  'Polonnaruwa',
  'Puttalam',
  'Ratnapura',
  'Trincomalee',
  'Vavuniya',
];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [5, 'Task title must be at least 5 characters'],
      maxlength: [120, 'Task title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
      minlength: [10, 'Task description must be at least 10 characters'],
      maxlength: [2000, 'Task description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Task category is required'],
      enum: {
        values: TASK_CATEGORIES,
        message: '{VALUE} is not a valid task category',
      },
      default: 'General Non-Hazardous Assistance',
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITIES,
        message: '{VALUE} is not a valid priority level',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: '{VALUE} is not a valid task status',
      },
      default: 'Open',
    },
    district: {
      type: String,
      required: [true, 'Affected district is required'],
      trim: true,
      default: 'Ampara',
    },
    location: {
      type: String,
      required: [true, 'Task location or assembly point is required'],
      trim: true,
      maxlength: [200, 'Location description cannot exceed 200 characters'],
    },
    requiredVolunteers: {
      type: Number,
      required: [true, 'Required volunteer capacity is required'],
      min: [1, 'At least 1 volunteer is required'],
      max: [500, 'Volunteer capacity cannot exceed 500 per task'],
    },
    assignedVolunteersCount: {
      type: Number,
      default: 0,
      min: [0, 'Assigned volunteer count cannot be negative'],
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    safetyInstructions: {
      type: String,
      trim: true,
      default:
        'Volunteers must follow site safety protocols, wear protective footwear and high-visibility vests. Hazardous water rescues, structural demolition, or electrical operations are strictly prohibited for civilian volunteers.',
      maxlength: [1000, 'Safety instructions cannot exceed 1000 characters'],
    },
    deadline: {
      type: Date,
      default: null,
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task creator reference is required'],
    },
    contactPerson: {
      type: String,
      trim: true,
      default: 'Relief Coordinator',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '+94 63 222 2341',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: available slots remaining
taskSchema.virtual('availableSlots').get(function () {
  return Math.max(0, (this.requiredVolunteers || 0) - (this.assignedVolunteersCount || 0));
});

// Virtual: is task at maximum volunteer capacity
taskSchema.virtual('isFull').get(function () {
  return (this.assignedVolunteersCount || 0) >= (this.requiredVolunteers || 0);
});

// Cross-field capacity validation hook
taskSchema.pre('validate', function () {
  if (typeof this.requiredVolunteers === 'number' && this.requiredVolunteers < 1) {
    throw new Error('At least 1 volunteer is required');
  }
  if (typeof this.assignedVolunteersCount === 'number' && this.assignedVolunteersCount < 0) {
    throw new Error('Assigned volunteer count cannot be negative');
  }
  if (
    typeof this.assignedVolunteersCount === 'number' &&
    typeof this.requiredVolunteers === 'number' &&
    this.assignedVolunteersCount > this.requiredVolunteers
  ) {
    throw new Error(
      `Assigned volunteers (${this.assignedVolunteersCount}) cannot exceed required capacity (${this.requiredVolunteers})`
    );
  }
});

// Pre-save status auto-transition hook
taskSchema.pre('save', function () {
  // Preserve terminal or in-progress statuses
  if (['Completed', 'Cancelled', 'In Progress'].includes(this.status)) {
    return;
  }

  // Auto transition Open <-> Assigned based on capacity
  if (this.assignedVolunteersCount >= this.requiredVolunteers) {
    this.status = 'Assigned';
  } else if (this.status === 'Assigned' && this.assignedVolunteersCount < this.requiredVolunteers) {
    this.status = 'Open';
  }
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
