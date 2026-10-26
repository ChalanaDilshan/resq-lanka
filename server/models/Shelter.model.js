import mongoose from 'mongoose';

const occupancyLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
    },
    previousOccupancy: {
      type: Number,
      required: true,
    },
    newOccupancy: {
      type: Number,
      required: true,
    },
    previousCapacity: {
      type: Number,
    },
    newCapacity: {
      type: Number,
    },
    changeDelta: {
      type: Number,
      default: 0,
    },
    updatedBy: {
      type: String,
      default: 'Authorized Coordinator',
    },
    note: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const shelterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shelter name is required'],
      trim: true,
    },
    hazardType: {
      type: String,
      required: [true, 'Hazard type category is required'],
      enum: ['flood', 'earthquake', 'cyclone', 'landslide', 'general'],
      default: 'flood',
    },
    hazardCategoryLabel: {
      type: String,
      default: 'High-Ground Facilities (Floods)',
    },
    capacityTotal: {
      type: Number,
      required: [true, 'Total shelter capacity is required'],
      min: [1, 'Capacity must be at least 1 person'],
    },
    capacityCurrent: {
      type: Number,
      required: [true, 'Current occupancy number is required'],
      min: [0, 'Occupancy cannot be negative'],
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    verificationAgency: {
      type: String,
      default: 'Disaster Management Centre (DMC) Sri Lanka',
    },
    verifiedDate: {
      type: Date,
      default: Date.now,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
      default: 'Ampara',
    },
    address: {
      type: String,
      required: [true, 'Shelter address/location is required'],
      trim: true,
    },
    coordinates: {
      lat: { type: Number, default: 7.2906 },
      lng: { type: Number, default: 81.6747 },
    },
    elevationMeters: {
      type: Number,
      default: 32, // Relevant for flood high-ground facilities
    },
    clearanceRadiusMeters: {
      type: Number,
      default: 80, // Relevant for earthquake open assembly grounds
    },
    status: {
      type: String,
      enum: ['Available', 'Nearly Full', 'At Capacity', 'Closed'],
      default: 'Available',
    },
    coordinator: {
      name: { type: String, default: 'Eng. N. Senanayake' },
      phone: { type: String, default: '+94 63 222 2341' },
      email: { type: String, default: 'coordinator@resqlanka.lk' },
      designation: { type: String, default: 'Relief Zone Administrator' },
    },
    facilities: {
      type: [String],
      default: ['Clean Drinking Water', 'First Aid Station', 'Backup Generator', 'Sanitation Units'],
    },
    notes: {
      type: String,
      default: 'Verified safe haven under National Disaster Management Protocol.',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    occupancyHistory: [occupancyLogSchema],
  },
  {
    timestamps: true,
  }
);

// Virtual property for remaining capacity
shelterSchema.virtual('remainingCapacity').get(function () {
  return Math.max(0, this.capacityTotal - this.capacityCurrent);
});

// Virtual property for occupancy percentage
shelterSchema.virtual('occupancyPercentage').get(function () {
  if (!this.capacityTotal || this.capacityTotal <= 0) return 0;
  return Math.round((this.capacityCurrent / this.capacityTotal) * 100);
});

// Cross-field capacity validation hook
shelterSchema.pre('validate', function () {
  if (typeof this.capacityTotal === 'number' && this.capacityTotal < 1) {
    throw new Error('Total capacity must be at least 1 person');
  }
  if (typeof this.capacityCurrent === 'number' && this.capacityCurrent < 0) {
    throw new Error('Current occupancy cannot be negative');
  }
  if (
    typeof this.capacityCurrent === 'number' &&
    typeof this.capacityTotal === 'number' &&
    this.capacityCurrent > this.capacityTotal
  ) {
    throw new Error(`Current occupancy (${this.capacityCurrent}) cannot exceed total capacity (${this.capacityTotal})`);
  }
});

// Compute status automatically before saving (preserving explicit 'Closed' status)
shelterSchema.pre('save', function () {
  if (this.hazardType === 'flood') {
    this.hazardCategoryLabel = 'High-Ground Facilities (Floods)';
  } else if (this.hazardType === 'earthquake') {
    this.hazardCategoryLabel = 'Open Assembly Grounds (Earthquakes)';
  } else if (this.hazardType === 'cyclone') {
    this.hazardCategoryLabel = 'Reinforced Cyclone Haven';
  } else if (this.hazardType === 'landslide') {
    this.hazardCategoryLabel = 'Stable Ground Shelter (Landslides)';
  } else {
    this.hazardCategoryLabel = 'Multi-Hazard Emergency Shelter';
  }

  // Preserve Closed status: an explicitly closed shelter must not be reopened by occupancy calculation
  if (this.status !== 'Closed') {
    const percentage = (this.capacityCurrent / this.capacityTotal) * 100;
    if (percentage >= 100) {
      this.status = 'At Capacity';
    } else if (percentage >= 85) {
      this.status = 'Nearly Full';
    } else {
      this.status = 'Available';
    }
  }
});

shelterSchema.set('toJSON', { virtuals: true });
shelterSchema.set('toObject', { virtuals: true });

const Shelter = mongoose.model('Shelter', shelterSchema);
export default Shelter;
