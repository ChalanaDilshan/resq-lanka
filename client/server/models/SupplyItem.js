import mongoose from 'mongoose';

const supplyItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
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
      min: [1, 'Quantity must be at least 1'],
    },
    pledgedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingQuantity: {
      type: Number,
      required: true,
      min: 0,
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
      enum: ['Open', 'Partially Pledged', 'Fulfilled'],
      default: 'Open',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: ensure remainingQuantity = targetQuantity - pledgedQuantity
supplyItemSchema.pre('validate', function () {
  if (this.targetQuantity !== undefined && this.pledgedQuantity !== undefined) {
    this.remainingQuantity = Math.max(0, this.targetQuantity - this.pledgedQuantity);
    if (this.remainingQuantity === 0) {
      this.status = 'Fulfilled';
    } else if (this.pledgedQuantity > 0) {
      this.status = 'Partially Pledged';
    } else {
      this.status = 'Open';
    }
  }
});

const SupplyItem = mongoose.model('SupplyItem', supplyItemSchema);
export default SupplyItem;
