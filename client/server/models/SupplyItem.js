import mongoose from 'mongoose';

const supplyItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [200, 'Item name cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Drinking Water',
        'Dry Rations & Food',
        'Medical & First Aid',
        'Baby & Infant Care',
        'Bedding & Mats',
        'Sanitary & Hygiene',
        'Clothing',
        'Other',
      ],
      default: 'Drinking Water',
    },
    urgency: {
      type: String,
      required: [true, 'Urgency level is required'],
      enum: ['Immediate', 'High', 'Medium', 'Low'],
      default: 'High',
    },
    targetQuantity: {
      type: Number,
      required: [true, 'Target quantity is required'],
      min: [1, 'Target quantity must be at least 1'],
      max: [1000000, 'Target quantity exceeds maximum allowed bound of 1,000,000'],
    },
    pledgedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Pledged quantity cannot be negative'],
    },
    receivedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Received quantity cannot be negative'],
    },
    remainingQuantity: {
      type: Number,
      required: true,
      min: [0, 'Remaining quantity cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      enum: ['bottles', 'packs', 'kg', 'boxes', 'sets', 'liters', 'units'],
      default: 'units',
    },
    shelterLocation: {
      type: String,
      required: [true, 'Shelter / delivery location is required'],
      trim: true,
      maxlength: [250, 'Location cannot exceed 250 characters'],
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
      default: 'Ampara',
    },
    coordinatorName: {
      type: String,
      required: [true, 'Coordinator name is required'],
      trim: true,
    },
    coordinatorContact: {
      type: String,
      required: [true, 'Coordinator phone or email is required'],
      trim: true,
    },
    dropOffLocation: {
      type: String,
      trim: true,
      default: 'Shelter reception / relief storage facility',
    },
    status: {
      type: String,
      enum: ['Open', 'Partially Pledged', 'Fully Pledged', 'Fulfilled'],
      default: 'Open',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high-frequency queries
supplyItemSchema.index({ category: 1, urgency: 1, status: 1 });
supplyItemSchema.index({ district: 1 });
supplyItemSchema.index({ createdAt: -1 });

// Pre-validate hook: calculate remaining quantity and set status based on actual receipts vs pledges
supplyItemSchema.pre('validate', function () {
  if (this.targetQuantity !== undefined && this.pledgedQuantity !== undefined) {
    this.remainingQuantity = Math.max(0, this.targetQuantity - this.pledgedQuantity);
    const received = this.receivedQuantity || 0;
    
    // Status reflects physical fulfillment when stock arrives, or pledge status beforehand
    if (received >= this.targetQuantity) {
      this.status = 'Fulfilled';
    } else if (this.pledgedQuantity >= this.targetQuantity) {
      this.status = 'Fully Pledged';
    } else if (this.pledgedQuantity > 0) {
      this.status = 'Partially Pledged';
    } else {
      this.status = 'Open';
    }
  }
});

const SupplyItem = mongoose.model('SupplyItem', supplyItemSchema);
export default SupplyItem;
