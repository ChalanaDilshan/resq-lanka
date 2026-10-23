import mongoose from 'mongoose';

const donorPledgeSchema = new mongoose.Schema(
  {
    supplyItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupplyItem',
      required: [true, 'Supply item reference is required'],
      index: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    shelterLocation: {
      type: String,
      required: true,
      trim: true,
    },
    donorName: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true,
      maxlength: [120, 'Donor name cannot exceed 120 characters'],
    },
    donorEmail: {
      type: String,
      required: [true, 'Donor email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid donor email address'],
    },
    donorPhone: {
      type: String,
      required: [true, 'Donor phone number is required'],
      trim: true,
      maxlength: [30, 'Phone number is too long'],
    },
    pledgedQuantity: {
      type: Number,
      required: [true, 'Pledged quantity is required'],
      min: [1, 'Pledge amount must be at least 1'],
      max: [1000000, 'Pledge amount exceeds maximum allowed'],
    },
    unit: {
      type: String,
      default: 'units',
      trim: true,
    },
    deliveryMethod: {
      type: String,
      enum: ['Direct Drop-off', 'Volunteer Pickup', 'Courier / Dispatch'],
      default: 'Direct Drop-off',
    },
    estimatedDeliveryDate: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // Default next day
    },
    status: {
      type: String,
      enum: ['Pledged', 'In Transit', 'Received & Verified', 'Cancelled'],
      default: 'Pledged',
      index: true,
    },
    donorNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Donor notes cannot exceed 500 characters'],
    },
    verifiedBy: {
      type: String,
      default: null,
      trim: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for tracking queries and duplicate checks
donorPledgeSchema.index({ supplyItemId: 1, status: 1 });
donorPledgeSchema.index({ donorEmail: 1, createdAt: -1 });

const DonorPledge = mongoose.model('DonorPledge', donorPledgeSchema);
export default DonorPledge;
