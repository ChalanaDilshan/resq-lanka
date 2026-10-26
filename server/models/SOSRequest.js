import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema(
  {
    previousStatus: {
      type: String,
      required: true,
    },
    newStatus: {
      type: String,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    changedByName: {
      type: String,
      default: 'Authorized Responder',
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const sosRequestSchema = new mongoose.Schema(
  {
    hazardType: {
      type: String,
      required: [true, 'Hazard type is required'],
      enum: {
        values: [
          'Flood',
          'Earthquake',
          'Landslide',
          'Cyclone',
          'Tsunami',
          'Fire',
          'Other',
        ],
        message: '{VALUE} is not a supported hazard type',
      },
      default: 'Flood',
    },
    urgency: {
      type: String,
      required: [true, 'Urgency level is required'],
      enum: {
        values: ['Critical', 'High', 'Medium', 'Low'],
        message: '{VALUE} is not a supported urgency level',
      },
      default: 'Critical',
    },
    locationText: {
      type: String,
      required: [true, 'Location address or landmark is required'],
      trim: true,
      minlength: [3, 'Location description must be at least 3 characters'],
      maxlength: [300, 'Location description cannot exceed 300 characters'],
    },
    coordinates: {
      lat: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
        default: null,
      },
      lng: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
        default: null,
      },
      hasCoordinates: {
        type: Boolean,
        default: false,
      },
    },
    contactNumber: {
      type: String,
      required: [true, 'Valid emergency contact number is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: 'Emergency assistance requested',
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'In Progress', 'Resolved', 'Cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Pending',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reporterName: {
      type: String,
      trim: true,
      default: 'Anonymous Citizen',
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance querying on the emergency feed
sosRequestSchema.index({ status: 1, createdAt: -1 });
sosRequestSchema.index({ hazardType: 1, urgency: 1 });

/**
 * Mask sensitive contact number for public feeds (e.g., 077 123 4567 -> 077 **** 4567)
 */
sosRequestSchema.methods.toPublicFeedObject = function () {
  const obj = this.toObject();
  if (obj.contactNumber && obj.contactNumber.length >= 7) {
    const raw = obj.contactNumber;
    const prefix = raw.slice(0, 3);
    const suffix = raw.slice(-3);
    obj.contactNumber = `${prefix} **** ${suffix}`;
  } else if (obj.contactNumber) {
    obj.contactNumber = '***-***-****';
  }
  return obj;
};

const SOSRequest = mongoose.model('SOSRequest', sosRequestSchema);
export default SOSRequest;