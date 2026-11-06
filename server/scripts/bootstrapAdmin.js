import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resq-lanka';

// Parse command-line arguments: node scripts/bootstrapAdmin.js [email] [password] [name]
// Or: node scripts/bootstrapAdmin.js --email=foo@bar.com --password=secret
function parseArgs() {
  const args = process.argv.slice(2);
  let email = process.env.ADMIN_EMAIL || 'admin@resqlanka.lk';
  let password = process.env.ADMIN_PASSWORD || 'Admin@ResQ2026!';
  let name = 'ResQ-Lanka System Administrator';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--email=')) {
      email = arg.split('=')[1];
    } else if (arg === '--email' && args[i + 1]) {
      email = args[++i];
    } else if (arg.startsWith('--password=')) {
      password = arg.split('=')[1];
    } else if (arg === '--password' && args[i + 1]) {
      password = args[++i];
    } else if (arg.startsWith('--name=')) {
      name = arg.split('=')[1];
    } else if (arg === '--name' && args[i + 1]) {
      name = args[++i];
    } else if (!arg.startsWith('--')) {
      // Positional args: [email] [password] [name]
      if (i === 0) email = arg;
      else if (i === 1) password = arg;
      else if (i === 2) name = arg;
    }
  }

  return { email: email.trim().toLowerCase(), password, name };
}

async function bootstrapAdmin() {
  const { email, password, name } = parseArgs();

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB database.');

    // Look for an existing account with this email
    let user = await User.findOne({ email }).select('+password');

    if (user) {
      console.log(`\nFound existing user account for: ${email}`);
      console.log(`Previous role: ${user.role}`);

      // Promote to administrator and set password
      user.role = 'administrator';
      user.isEmailVerified = true;
      user.isActive = true;
      if (password) {
        user.password = password; // pre-save hook will hash modified password
      }
      if (name && user.name === 'Anonymous Citizen') {
        user.name = name;
      }
      await user.save();

      console.log('====================================================');
      console.log('   🎉 USER PROMOTED TO ADMINISTRATOR SUCCESSFULLY');
      console.log('====================================================');
      console.log(`Name:             ${user.name}`);
      console.log(`Email:            ${user.email}`);
      console.log(`Role:             ${user.role}`);
      console.log(`Email Verified:   ${user.isEmailVerified}`);
      console.log('Password updated and active.');
      console.log('====================================================');
    } else {
      // Create new administrator account
      user = await User.create({
        name,
        email,
        password,
        role: 'administrator',
        district: 'National Emergency Operations Centre (Colombo)',
        phone: '+94 11 267 0001',
        isEmailVerified: true,
        isActive: true,
      });

      console.log('====================================================');
      console.log('   🎉 NEW ADMINISTRATOR PROVISIONED SUCCESSFULLY');
      console.log('====================================================');
      console.log(`Name:             ${user.name}`);
      console.log(`Email:            ${user.email}`);
      console.log(`Role:             ${user.role}`);
      console.log(`Email Verified:   ${user.isEmailVerified}`);
      console.log('====================================================');
    }

    // List all current administrators in database
    const allAdmins = await User.find({ role: 'administrator' });
    console.log(`\nActive Administrators in Database (${allAdmins.length}):`);
    allAdmins.forEach((adm, idx) => {
      console.log(`  ${idx + 1}. ${adm.name} <${adm.email}> (Status: ${adm.isActive ? 'Active' : 'Inactive'})`);
    });

    console.log('\n--- HOW TO LOG IN AS ADMINISTRATOR ---');
    console.log(`1. Navigate to: https://resq-lanka.vercel.app/login`);
    console.log(`2. Enter Email: ${email}`);
    console.log(`3. Enter Password: [your configured password]`);
    console.log(`4. Enter the 6-digit verification code sent to ${email}`);
    console.log(`5. You will automatically be routed to: /dashboard/administrator\n`);

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
