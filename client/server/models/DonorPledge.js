import mongoose from 'mongoose';

const donorPledgeSchema = new mongoose.Schema(
  {
    supplyItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupplyItem',
      required: [true, 'Supply item reference is required'],
    },
    itemName: {
      type: String,
      required: true,
    },
    shelterLocation: {
      type: String,
      required: true,
    },
    donorName: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true,
    },
    donorEmail: {
      type: String,
      required: [true, 'Donor email is required'],
      trim: true,
    },
    donorPhone: {
      type: String,
      required: [true, 'Donor phone number is required'],
      trim: true,
    },
    pledgedQuantity: {
      type: Number,
      required: [true, 'Pledged quantity is required'],
      min: [1, 'Pledge amount must be at least 1'],
    },
    unit: {
      type: String,
      default: 'units',
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
    },
    donorNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const DonorPledge = mongoose.model('DonorPledge', donorPledgeSchema);
export default DonorPledge;
