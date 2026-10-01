import mongoose from 'mongoose';

const sosRequestSchema = new mongoose.Schema(
  {
    hazardType: {
      type: String,
      required: [true, 'Hazard type is required'],
      enum: ['Flood', 'Earthquake'],
    },
    urgency: {
      type: String,
      required: [true, 'Urgency level is required'],
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Critical',
    },
    locationText: {
      type: String,
      required: [true, 'Location address or landmark is required'],
      trim: true,
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
        default: 6.9271,
      },
      lng: {
        type: Number,
        required: true,
        default: 79.8612,
      },
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact mobile number is required'],
      match: [
        /^(?:0|94|\+94)?7\d{8}$/,
        'Please enter a valid Sri Lankan mobile number (e.g., 0771234567)',
      ],
    },
    description: {
      type: String,
      required: [true, 'Emergency assistance description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const SOSRequest = mongoose.model('SOSRequest', sosRequestSchema);
export default SOSRequest;