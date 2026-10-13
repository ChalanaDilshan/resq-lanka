import mongoose from 'mongoose';

const sosRequestSchema = new mongoose.Schema(
  {
    hazardType: {
      type: String,
      required: [true, 'Hazard type is required'],
      enum: ['Flood', 'Earthquake', 'Landslide', 'Cyclone', 'Tsunami', 'Fire', 'Other'],
      default: 'Flood',
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
      default: '0770000000',
    },
    description: {
      type: String,
      default: 'Emergency assistance requested',
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