import mongoose from 'mongoose';

export const HAZARD_TYPES = [
  'Flood',
  'Cyclone',
  'Landslide',
  'Tsunami',
  'Earthquake',
  'Heavy Rainfall',
  'General Emergency',
];

export const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export const PUBLICATION_STATUSES = ['Draft', 'Published', 'Expired', 'Withdrawn'];

export const VERIFICATION_STATUSES = ['Unverified', 'Verified', 'Rejected'];

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

const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

const NoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Alert/Notice title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    message: {
      type: String,
      required: [true, 'Alert message/description is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
    hazardType: {
      type: String,
      required: [true, 'Hazard type is required'],
      enum: {
        values: HAZARD_TYPES,
        message: '{VALUE} is not a valid hazard type',
      },
    },
    severity: {
      type: String,
      required: [true, 'Alert severity level is required'],
      enum: {
        values: SEVERITY_LEVELS,
        message: '{VALUE} is not a valid severity level',
      },
      default: 'Medium',
    },
    affectedDistricts: {
      type: [String],
      required: [true, 'At least one affected district is required'],
      validate: {
        validator: function (districts) {
          if (!Array.isArray(districts) || districts.length === 0) return false;
          return districts.every((d) => SRI_LANKA_DISTRICTS.includes(d));
        },
        message: 'Affected districts must contain only valid Sri Lankan districts (min 1)',
      },
    },
    sourceName: {
      type: String,
      required: [true, 'Source organization/entity name is required'],
      trim: true,
      minlength: [2, 'Source name must be at least 2 characters'],
      maxlength: [100, 'Source name cannot exceed 100 characters'],
    },
    sourceUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (val) {
          if (!val || val.trim() === '') return true;
          return urlRegex.test(val);
        },
        message: 'Source URL must be a valid http or https URL',
      },
      default: '',
    },
    isOfficial: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: {
        values: VERIFICATION_STATUSES,
        message: '{VALUE} is not a valid verification status',
      },
      default: 'Unverified',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verificationNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Verification notes cannot exceed 500 characters'],
      default: '',
    },
    publicationStatus: {
      type: String,
      enum: {
        values: PUBLICATION_STATUSES,
        message: '{VALUE} is not a valid publication status',
      },
      default: 'Draft',
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    withdrawnAt: {
      type: Date,
      default: null,
    },
    withdrawnReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Withdrawal reason cannot exceed 500 characters'],
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdByName: {
      type: String,
      trim: true,
      default: 'Authorized Coordinator',
    },
    contactNumber: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: isCurrent - accurately checks if notice is active & not expired
NoticeSchema.virtual('isCurrent').get(function () {
  if (this.publicationStatus !== 'Published') {
    return false;
  }
  if (this.expiresAt && new Date(this.expiresAt).getTime() <= Date.now()) {
    return false;
  }
  return true;
});

// Pre-save validation & timestamp management
NoticeSchema.pre('validate', function () {
  // If publicationStatus is Published and no publishedAt date is set, default to now
  if (this.publicationStatus === 'Published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Validate date logic: expiresAt cannot be earlier than or equal to publishedAt
  if (this.expiresAt && this.publishedAt) {
    if (new Date(this.expiresAt).getTime() <= new Date(this.publishedAt).getTime()) {
      this.invalidate('expiresAt', 'Expiry date must be after publication date');
    }
  }

  // If status is Withdrawn, ensure withdrawnAt is recorded
  if (this.publicationStatus === 'Withdrawn' && !this.withdrawnAt) {
    this.withdrawnAt = new Date();
  }
});

// Static query helper for active public feed
NoticeSchema.statics.getActivePublicFilter = function () {
  const now = new Date();
  return {
    publicationStatus: 'Published',
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  };
};

const Notice = mongoose.model('Notice', NoticeSchema);

export default Notice;
