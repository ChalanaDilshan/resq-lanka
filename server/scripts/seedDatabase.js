import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import Shelter from '../models/Shelter.model.js';
import SupplyItem from '../models/SupplyItem.js';
import DonorPledge from '../models/DonorPledge.js';
import Task from '../models/Task.model.js';
import TaskApplication from '../models/TaskApplication.model.js';
import Notice from '../models/Notice.model.js';
import SOSRequest from '../models/SOSRequest.js';

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resq-lanka';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB database for comprehensive seed...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB.');

    // 1. Seed or Upsert Standard Users
    console.log('\n--- Seeding User Accounts ---');
    const usersData = [
      {
        name: 'ResQ-Lanka Administrator',
        email: 'admin@resqlanka.lk',
        password: process.env.ADMIN_PASSWORD || 'Admin@ResQ2026!',
        role: 'administrator',
        phone: '+94 11 267 0001',
        district: 'National Emergency Operations Centre (Colombo)',
      },
      {
        name: 'Saman Perera (Volunteer Lead)',
        email: 'volunteer@resqlanka.lk',
        password: 'password123',
        role: 'volunteer',
        phone: '+94 77 123 4567',
        district: 'Ampara District',
        nicNumber: '198514502341',
        nicDetails: {
          format: 'NEW',
          birthYear: 1985,
          gender: 'Male',
          approximateAge: 41,
          dobDisplay: 'May 25, 1985',
          isValidated: true,
        },
        volunteerStatus: 'Verified',
        volunteerReliability: {
          tasksCompleted: 6,
          noShows: 0,
          notes: 'Lead field volunteer for Ampara relief logistics with verified NIC.',
          lastEvaluatedAt: new Date(),
        },
      },
      {
        name: 'Nimali Fernando (First Aid Volunteer)',
        email: 'nimali.volunteer@resqlanka.lk',
        password: 'password123',
        role: 'volunteer',
        phone: '+94 71 456 7890',
        district: 'Ampara District',
        nicNumber: '199856701234',
        nicDetails: {
          format: 'NEW',
          birthYear: 1998,
          gender: 'Female',
          approximateAge: 28,
          dobDisplay: 'March 8, 1998',
          isValidated: true,
        },
        volunteerStatus: 'Pending_Review',
        volunteerReliability: {
          tasksCompleted: 0,
          noShows: 0,
          notes: 'Newly registered citizen volunteer awaiting coordinator onboarding.',
          lastEvaluatedAt: new Date(),
        },
      },
      {
        name: 'Dinesh Rathnayake (Field Volunteer)',
        email: 'dinesh.volunteer@resqlanka.lk',
        password: 'password123',
        role: 'volunteer',
        phone: '+94 76 987 6543',
        district: 'Batticaloa District',
        nicNumber: '921123456V',
        nicDetails: {
          format: 'OLD',
          birthYear: 1992,
          gender: 'Male',
          approximateAge: 34,
          dobDisplay: 'April 22, 1992',
          isValidated: true,
        },
        volunteerStatus: 'Flagged',
        volunteerReliability: {
          tasksCompleted: 1,
          noShows: 3,
          notes: 'Auto-flagged: Reached 3 unattended task absences at Akkaraipattu Ground.',
          lastEvaluatedAt: new Date(),
        },
      },
      {
        name: 'Kasun Bandara (Citizen)',
        email: 'citizen@resqlanka.lk',
        password: 'password123',
        role: 'citizen',
        phone: '+94 71 987 6543',
        district: 'Ampara District',
      },
    ];

    const seededUsers = {};
    for (const u of usersData) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create(u);
        console.log(`Created user: ${user.name} (${user.email}) - [${user.role}]`);
      } else {
        console.log(`Existing user preserved: ${user.name} (${user.email})`);
      }
      seededUsers[u.role] = user;
    }

    // 2. Seed Safe Shelters
    console.log('\n--- Seeding Emergency Safe Shelters ---');
    const shelterCount = await Shelter.countDocuments();
    if (shelterCount === 0) {
      const shelters = await Shelter.create([
        {
          name: 'Ampara Central College Relief Center',
          hazardType: 'flood',
          capacityTotal: 250,
          capacityCurrent: 120,
          district: 'Ampara',
          address: 'Main Street, Ampara Central',
          elevationMeters: 42,
          isVerified: true,
          verificationAgency: 'Disaster Management Centre (DMC)',
          coordinator: {
            name: 'Mr. N. Senanayake',
            phone: '+94 63 222 2341',
            email: 'ampara.coordinator@resqlanka.lk',
          },
          occupancyHistory: [
            {
              timestamp: new Date(Date.now() - 86400000),
              previousOccupancy: 0,
              newOccupancy: 120,
              previousCapacity: 250,
              newCapacity: 250,
              changeDelta: 120,
              updatedBy: 'Mr. N. Senanayake',
              note: 'Initial shelter intake during heavy monsoon inundation.',
            },
          ],
        },
        {
          name: 'Kalmunai National School Relief Camp',
          hazardType: 'flood',
          capacityTotal: 180,
          capacityCurrent: 155,
          district: 'Ampara',
          address: 'Hospital Road, Kalmunai',
          elevationMeters: 38,
          isVerified: true,
          verificationAgency: 'Disaster Management Centre (DMC)',
          coordinator: {
            name: 'Mrs. F. Rizwan',
            phone: '+94 67 222 1100',
            email: 'kalmunai.coordinator@resqlanka.lk',
          },
          occupancyHistory: [
            {
              timestamp: new Date(Date.now() - 43200000),
              previousOccupancy: 80,
              newOccupancy: 155,
              previousCapacity: 180,
              newCapacity: 180,
              changeDelta: 75,
              updatedBy: 'Mrs. F. Rizwan',
              note: 'Evacuees transferred from coastal low-ground villages.',
            },
          ],
        },
        {
          name: 'Akkaraipattu Open Ground Assembly Area',
          hazardType: 'earthquake',
          capacityTotal: 300,
          capacityCurrent: 45,
          district: 'Ampara',
          address: 'Public Stadium Grounds, Akkaraipattu',
          clearanceRadiusMeters: 120,
          isVerified: true,
          verificationAgency: 'Disaster Management Centre (DMC)',
          coordinator: {
            name: 'Mr. K. Thushara',
            phone: '+94 67 227 8900',
            email: 'akkaraipattu.coordinator@resqlanka.lk',
          },
        },
      ]);
      console.log(`Created ${shelters.length} verified safe shelters.`);
    } else {
      console.log(`Shelters collection already contains ${shelterCount} records.`);
    }

    // 3. Seed Relief Supply Requests
    console.log('\n--- Seeding Relief Supplies & Donor Pledges ---');
    const supplyCount = await SupplyItem.countDocuments();
    if (supplyCount === 0) {
      const item1 = await SupplyItem.create({
        itemName: 'Drinking Water (5L Cans)',
        category: 'Drinking Water',
        urgency: 'Immediate',
        targetQuantity: 500,
        unit: 'bottles',
        pledgedQuantity: 200,
        receivedQuantity: 50,
        remainingQuantity: 300,
        shelterLocation: 'Ampara Central College Relief Center',
        district: 'Ampara',
        coordinatorName: 'Mr. N. Senanayake',
        coordinatorContact: '+94 63 222 2341',
        dropOffLocation: 'Main Gate Receiving Bay, Room 4',
        status: 'Partially Pledged',
        notes: 'Gal Oya reservoir spillway overflow disrupted local water supply mains.',
      });

      await DonorPledge.create({
        supplyItem: item1._id,
        donorName: 'Rotary Club Colombo',
        donorEmail: 'rotary@relief.lk',
        donorPhone: '0773344556',
        pledgedQuantity: 200,
        unit: 'bottles',
        status: 'Partially Received',
        donorNotes: 'Dispatched via private lorry on 26th October.',
      });

      const item2 = await SupplyItem.create({
        itemName: 'Dry Rations Family Pack (Rice, Dhal, Sugar)',
        category: 'Dry Rations & Food',
        urgency: 'High',
        targetQuantity: 300,
        unit: 'packs',
        pledgedQuantity: 100,
        receivedQuantity: 20,
        remainingQuantity: 200,
        shelterLocation: 'Kalmunai National School Relief Camp',
        district: 'Ampara',
        coordinatorName: 'Mrs. F. Rizwan',
        coordinatorContact: '+94 67 222 1100',
        dropOffLocation: 'School Auditorium Ground Floor',
        status: 'Partially Pledged',
        notes: 'Each pack feeds a family of 4 for 5 days.',
      });

      await DonorPledge.create({
        supplyItem: item2._id,
        donorName: 'Community Relief Initiative',
        donorEmail: 'donations@initiative.lk',
        donorPhone: '0712233445',
        pledgedQuantity: 100,
        unit: 'packs',
        status: 'Pledged',
      });

      console.log('Created sample relief supply items and verified donor pledges.');
    } else {
      console.log(`Supply items collection already contains ${supplyCount} records.`);
    }

    // 4. Seed Volunteer Response Tasks
    console.log('\n--- Seeding Volunteer Response Tasks ---');
    const taskCount = await Task.countDocuments();
    if (taskCount === 0) {
      const task1 = await Task.create({
        title: 'Emergency Dry Rations Bagging & Sorting',
        description:
          'Volunteers needed to unpack bulk rice, canned fish, and lentils into family emergency ration hampers at the central storage warehouse.',
        category: 'Dry Rations Packing',
        priority: 'Urgent',
        shelterLocation: 'Ampara Central Storage Depot',
        district: 'Ampara',
        requiredVolunteers: 15,
        assignedVolunteersCount: 3,
        estimatedHours: 4,
        date: new Date(Date.now() + 86400000),
        status: 'Open',
        contactPerson: 'Mr. N. Senanayake',
        contactPhone: '+94 63 222 2341',
        safetyGuidelines:
          'Wear closed-toe shoes and cotton clothing. Gloves and face masks provided on site. Hydration stations available.',
        createdBy: seededUsers.administrator._id,
      });

      if (seededUsers.volunteer) {
        await TaskApplication.create({
          task: task1._id,
          volunteer: seededUsers.volunteer._id,
          volunteerName: seededUsers.volunteer.name,
          volunteerEmail: seededUsers.volunteer.email,
          volunteerPhone: seededUsers.volunteer.phone,
          skillsSummary: 'Experienced in community relief warehouse distribution.',
          availability: 'Available full mornings throughout this week.',
          status: 'Approved',
          reviewedBy: seededUsers.administrator._id,
          reviewedAt: new Date(),
        });
      }

      await Task.create({
        title: 'First Aid Kit Assembly & Medical Station Setup',
        description:
          'Assist medical response team in sorting bandages, antiseptic solutions, and rehydration salts for camp health clinic.',
        category: 'Medical Aid & First Aid',
        priority: 'High',
        shelterLocation: 'Kalmunai National School Relief Camp',
        district: 'Ampara',
        requiredVolunteers: 8,
        assignedVolunteersCount: 2,
        estimatedHours: 6,
        date: new Date(Date.now() + 172800000),
        status: 'Open',
        contactPerson: 'Dr. S. Jayasinghe',
        contactPhone: '+94 67 222 1100',
        safetyGuidelines:
          'Medical background preferred but not mandatory for packing. Sanitization protocols strictly enforced.',
        createdBy: seededUsers.administrator._id,
      });

      console.log('Created disaster response volunteer tasks and roster applications.');
    } else {
      console.log(`Tasks collection already contains ${taskCount} records.`);
    }

    // 5. Seed Emergency Alerts & Notices
    console.log('\n--- Seeding Official Notices & Early Warning Alerts ---');
    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      await Notice.create([
        {
          title: 'Red Alert: Severe Flash Flood Warning in Gal Oya Basin',
          message:
            'Disaster Management Centre (DMC) and Irrigation Department have issued an immediate RED ALERT for low-lying areas of the Gal Oya basin. Sluice gates are operating at full discharge. Residents must evacuate immediately to designated high-ground shelters at Ampara Central College or Kalmunai National School.',
          hazardType: 'Flood',
          severity: 'Critical',
          affectedDistricts: ['Ampara', 'Batticaloa'],
          sourceName: 'Disaster Management Centre (DMC) & Irrigation Department',
          sourceUrl: 'https://www.dmc.gov.lk',
          isOfficial: true,
          verificationStatus: 'Verified',
          verificationNotes: 'Confirmed via National Disaster Management Centre emergency bulletin #DMC-E-2026-09.',
          publicationStatus: 'Published',
          publishedAt: new Date(Date.now() - 7200000),
          expiresAt: new Date(Date.now() + 86400000 * 30),
          contactNumber: '117 (DMC Hotline) / +94 63 222 2341',
          createdByName: 'Disaster Management Centre',
        },
        {
          title: 'Severe Weather Warning: Torrential Monsoon Rains Exceeding 150mm',
          message:
            'Department of Meteorology warns that heavy monsoon rainfall exceeding 150mm is forecasted across Eastern, Northern, and North-Central provinces. Wind gusts up to 60km/h expected during thundershowers. Naval and coastal fishing communities are strictly advised not to venture into deep sea areas until further notice.',
          hazardType: 'Heavy Rainfall',
          severity: 'High',
          affectedDistricts: ['Ampara', 'Batticaloa', 'Trincomalee'],
          sourceName: 'Department of Meteorology Sri Lanka',
          sourceUrl: 'http://www.meteo.gov.lk',
          isOfficial: true,
          verificationStatus: 'Verified',
          verificationNotes: 'Meteorological advisory #MET-2026-OCT-26.',
          publicationStatus: 'Published',
          publishedAt: new Date(Date.now() - 14400000),
          expiresAt: new Date(Date.now() + 86400000 * 30),
          contactNumber: '117 (DMC Hotline)',
          createdByName: 'Department of Meteorology',
        },
      ]);
      console.log('Created official DMC notices and early warnings.');
    } else {
      console.log(`Notices collection already contains ${noticeCount} records.`);
    }

    // 6. Seed Sample SOS Reports
    console.log('\n--- Seeding Emergency SOS Incident Reports ---');
    const sosCount = await SOSRequest.countDocuments();
    if (sosCount === 0) {
      await SOSRequest.create([
        {
          hazardType: 'Flood',
          urgency: 'Critical',
          locationText: 'Near Kelani River Bridge, Kaduwela Low-Ground Area',
          coordinates: { lat: 6.9322, lng: 79.9812, hasCoordinates: true },
          contactNumber: '0771234567',
          description: 'Water level reached second floor. 4 adults and 1 infant stranded on upper terrace.',
          status: 'In Progress',
          reporterName: 'Sunil Wickramasinghe',
          statusHistory: [
            {
              previousStatus: 'None',
              newStatus: 'Pending',
              changedByName: 'Sunil Wickramasinghe',
              note: 'Incident registered via ResQ-Lanka mobile portal.',
              timestamp: new Date(Date.now() - 3600000),
            },
            {
              previousStatus: 'Pending',
              newStatus: 'In Progress',
              changedByName: 'DMC Officer Perera',
              note: 'Navy rescue boat unit dispatched.',
              timestamp: new Date(Date.now() - 1800000),
            },
          ],
        },
        {
          hazardType: 'Flood',
          urgency: 'High',
          locationText: 'Akkaraipattu Division 4, Canal Bund Road',
          coordinates: { lat: 7.2185, lng: 81.8504, hasCoordinates: true },
          contactNumber: '0719876543',
          description: 'Access road submerged by 3 feet of water. Elderly residents need transport to relief center.',
          status: 'Pending',
          reporterName: 'Anonymous Citizen',
          statusHistory: [
            {
              previousStatus: 'None',
              newStatus: 'Pending',
              changedByName: 'Anonymous Citizen',
              note: 'Emergency notification submitted.',
              timestamp: new Date(Date.now() - 900000),
            },
          ],
        },
      ]);
      console.log('Created sample SOS incident reports.');
    } else {
      console.log(`SOS collection already contains ${sosCount} records.`);
    }

    console.log('\n======================================================');
    console.log('  ResQ-Lanka Database Seeding Completed Successfully!  ');
    console.log('======================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Database seeding failed:', err.message);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
    process.exit(1);
  }
}

seedDatabase();
