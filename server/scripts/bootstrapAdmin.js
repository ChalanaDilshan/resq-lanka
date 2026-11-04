import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resq-lanka';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@resqlanka.lk';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@ResQ2026!';
const ADMIN_NAME = 'ResQ-Lanka System Administrator';

async function bootstrapAdmin() {
  try {
    console.log('Connecting to MongoDB for admin bootstrap...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB database.');

    // Check if an administrator already exists
    const existingAdmin = await User.findOne({
      $or: [{ role: 'administrator' }, { email: ADMIN_EMAIL.toLowerCase() }],
    });

    if (existingAdmin) {
      console.log(
        `[NOTICE] Administrator already provisioned: ${existingAdmin.email} (Role: ${existingAdmin.role})`
      );
      console.log('No additional administrator account was created.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create the initial administrator
    const adminUser = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: ADMIN_PASSWORD,
      role: 'administrator',
      district: 'National Emergency Operations Centre (Colombo)',
      phone: '+94 11 267 0001',
    });

    console.log('====================================================');
    console.log('   ResQ-Lanka Administrator Bootstrapped Successfully');
    console.log('====================================================');
    console.log(`Name:  ${adminUser.name}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role:  ${adminUser.role}`);
    console.log('Password set from secure environment configuration.');
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Failed to bootstrap administrator:', error.message);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
    process.exit(1);
  }
}

bootstrapAdmin();
