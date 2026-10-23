import mongoose from 'mongoose';

export const APPLICATION_STATUSES = [
  'Pending',
  'Approved',
  'Rejected',
  'Withdrawn',
];

const taskApplicationSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
      index: true,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Volunteer reference is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: APPLICATION_STATUSES,
        message: '{VALUE} is not a valid application status',
      },
      default: 'Pending',
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Application message cannot exceed 500 characters'],
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      trim: true,
      default: 'Immediate',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Review notes cannot exceed 500 characters'],
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications by the same volunteer for the same task
taskApplicationSchema.index({ task: 1, volunteer: 1 }, { unique: true });

const TaskApplication = mongoose.model('TaskApplication', taskApplicationSchema);
export default TaskApplication;
