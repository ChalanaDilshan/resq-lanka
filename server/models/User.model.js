import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Do not return password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['citizen', 'volunteer', 'administrator'],
        message: '{VALUE} is not a valid canonical role',
      },
      default: 'citizen',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    district: {
      type: String,
      trim: true,
      default: 'Ampara District',
    },
    nicNumber: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true, // Only indexes documents with a defined nicNumber, allowing optional citizen registration
      index: true,
      default: undefined,
    },
    nicDetails: {
      format: {
        type: String,
        enum: ['OLD', 'NEW', null],
        default: null,
      },
      birthYear: {
        type: Number,
        default: null,
      },
      gender: {
        type: String,
        enum: ['Male', 'Female', null],
        default: null,
      },
      approximateAge: {
        type: Number,
        default: null,
      },
      dobDisplay: {
        type: String,
        default: null,
      },
      isValidated: {
        type: Boolean,
        default: false,
      },
    },
    volunteerStatus: {
      type: String,
      enum: {
        values: ['Pending_Review', 'Verified', 'Flagged', 'Suspended'],
        message: '{VALUE} is not a valid volunteer status',
      },
      default: 'Pending_Review',
    },
    volunteerReliability: {
      tasksCompleted: {
        type: Number,
        default: 0,
        min: 0,
      },
      noShows: {
        type: Number,
        default: 0,
        min: 0,
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Reliability note cannot exceed 500 characters'],
        default: '',
      },
      lastEvaluatedAt: {
        type: Date,
        default: null,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otpCode: {
      type: String,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Transform to safe JSON (strip password and internal fields)
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    district: this.district,
    nicNumber: this.nicNumber || null,
    nicDetails: this.nicDetails || null,
    volunteerStatus: this.volunteerStatus || 'Pending_Review',
    volunteerReliability: this.volunteerReliability || {
      tasksCompleted: 0,
      noShows: 0,
      notes: '',
      lastEvaluatedAt: null,
    },
    isActive: this.isActive,
    isEmailVerified: this.isEmailVerified ?? false,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model('User', userSchema);
export default User;
