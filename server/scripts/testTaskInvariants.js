import mongoose from 'mongoose';
import Task, {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '../models/Task.model.js';
import TaskApplication, {
  APPLICATION_STATUSES,
} from '../models/TaskApplication.model.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`PASS: ${message}`);
    passed++;
  } else {
    console.error(`FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('--- ResQ-Lanka Module 4 Volunteer Task Board Invariant Tests ---\n');

  const dummyAdminId = new mongoose.Types.ObjectId();
  const dummyVolunteerId = new mongoose.Types.ObjectId();

  // Test 1: Valid Task schema validation and default fields
  try {
    const validTask = new Task({
      title: 'Dry Rations Packing for Flood Victims',
      description: 'Sorting and boxing dry ration survival packs at staging center.',
      category: 'Dry Rations & Food Packing',
      priority: 'Urgent',
      district: 'Ampara',
      location: 'Ampara Central College Staging Hall',
      requiredVolunteers: 10,
      createdBy: dummyAdminId,
    });

    await validTask.validate();
    assert(true, '1. Valid task passes schema validation');
    assert(validTask.status === 'Open', '1b. Default status initializes to Open');
    assert(validTask.assignedVolunteersCount === 0, '1c. Default assignedVolunteersCount initializes to 0');
    assert(validTask.availableSlots === 10, '1d. Virtual availableSlots calculates 10 - 0 = 10');
    assert(validTask.isFull === false, '1e. Virtual isFull evaluates to false');
    assert(
      validTask.safetyInstructions.includes('Hazardous water rescues'),
      '1f. Default safety guidelines emphasize safety restrictions'
    );
  } catch (err) {
    assert(false, `1. Valid task schema test failed: ${err.message}`);
  }

  // Test 2: Reject task with missing mandatory fields
  try {
    const missingTitleTask = new Task({
      description: 'Missing title task',
      category: 'Dry Rations & Food Packing',
      district: 'Ampara',
      location: 'Grounds',
      requiredVolunteers: 5,
      createdBy: dummyAdminId,
    });
    await missingTitleTask.validate();
    assert(false, '2a. Should reject task without title');
  } catch (err) {
    assert(
      err.message.includes('Task title is required'),
      '2a. Correctly rejected task without title'
    );
  }

  try {
    const missingCategoryTask = new Task({
      title: 'Test Task Category Missing',
      description: 'Some description text',
      district: 'Ampara',
      location: 'Grounds',
      requiredVolunteers: 5,
      createdBy: dummyAdminId,
    });
    // Category has default 'General Non-Hazardous Assistance', so it should default properly
    assert(
      missingCategoryTask.category === 'General Non-Hazardous Assistance',
      '2b. Default category defaults to General Non-Hazardous Assistance'
    );
  } catch (err) {
    assert(false, `2b. Failed default category: ${err.message}`);
  }

  // Test 3: Reject non-positive or invalid volunteer capacity
  try {
    const zeroCapacityTask = new Task({
      title: 'Invalid Zero Capacity Task',
      description: 'Testing zero volunteer capacity boundary condition',
      district: 'Ampara',
      location: 'Grounds',
      requiredVolunteers: 0,
      createdBy: dummyAdminId,
    });
    await zeroCapacityTask.validate();
    assert(false, '3a. Should reject requiredVolunteers = 0');
  } catch (err) {
    assert(
      err.message.includes('At least 1 volunteer is required') ||
        err.message.includes('requiredVolunteers'),
      '3a. Correctly rejected requiredVolunteers = 0'
    );
  }

  try {
    const negativeCapacityTask = new Task({
      title: 'Negative Capacity Task',
      description: 'Testing negative capacity boundary condition',
      district: 'Ampara',
      location: 'Grounds',
      requiredVolunteers: -4,
      createdBy: dummyAdminId,
    });
    await negativeCapacityTask.validate();
    assert(false, '3b. Should reject negative requiredVolunteers');
  } catch (err) {
    assert(true, '3b. Correctly rejected negative requiredVolunteers');
  }

  // Test 4: Invariant: assignedVolunteersCount cannot exceed requiredVolunteers
  try {
    const overassignedTask = new Task({
      title: 'Overassigned Task',
      description: 'Testing assigned count greater than required capacity',
      district: 'Ampara',
      location: 'Grounds',
      requiredVolunteers: 5,
      assignedVolunteersCount: 7,
      createdBy: dummyAdminId,
    });
    await overassignedTask.validate();
    assert(false, '4. Should reject assignedVolunteersCount > requiredVolunteers');
  } catch (err) {
    assert(
      err.message.includes('cannot exceed required capacity'),
      '4. Correctly enforced invariant: assignedVolunteersCount cannot exceed requiredVolunteers'
    );
  }

  // Test 5: Virtuals and auto-transition to Assigned when capacity is reached
  try {
    const atCapacityTask = new Task({
      title: 'Task at Full Capacity',
      description: 'Testing full capacity virtual and status change',
      district: 'Batticaloa',
      location: 'Batticaloa Hindu College',
      requiredVolunteers: 5,
      assignedVolunteersCount: 5,
      createdBy: dummyAdminId,
    });

    assert(atCapacityTask.availableSlots === 0, '5a. availableSlots is 0 when capacity full');
    assert(atCapacityTask.isFull === true, '5b. isFull is true when capacity full');

    await atCapacityTask.constructor.schema.s.hooks.execPre('save', atCapacityTask);

    assert(
      atCapacityTask.status === 'Assigned',
      `5c. Pre-save hook auto-transitioned status to 'Assigned' (Actual: ${atCapacityTask.status})`
    );
  } catch (err) {
    assert(false, `5. Full capacity test failed: ${err.message}`);
  }

  // Test 6: Auto-transition back from Assigned to Open when capacity freed
  try {
    const freedSlotTask = new Task({
      title: 'Task With Freed Slot',
      description: 'Testing capacity decrement transition back to Open',
      district: 'Ampara',
      location: 'Grounds',
      requiredVolunteers: 5,
      assignedVolunteersCount: 4,
      status: 'Assigned',
      createdBy: dummyAdminId,
    });

    await freedSlotTask.constructor.schema.s.hooks.execPre('save', freedSlotTask);
    assert(
      freedSlotTask.status === 'Open',
      `6. Auto-transitioned back to 'Open' when capacity fell below limit (Actual: ${freedSlotTask.status})`
    );
  } catch (err) {
    assert(false, `6. Freed slot test failed: ${err.message}`);
  }

  // Test 7: Terminal status preservation (Completed or Cancelled must not revert)
  try {
    const completedTask = new Task({
      title: 'Completed Relief Task',
      description: 'Relief mission already completed and archived',
      district: 'Ampara',
      location: 'Grounds',
      requiredVolunteers: 10,
      assignedVolunteersCount: 3,
      status: 'Completed',
      createdBy: dummyAdminId,
    });

    await completedTask.constructor.schema.s.hooks.execPre('save', completedTask);
    assert(
      completedTask.status === 'Completed',
      '7a. Pre-save preserved terminal status "Completed"'
    );

    const cancelledTask = new Task({
      title: 'Cancelled Relief Task',
      description: 'Relief mission cancelled due to severe weather',
      district: 'Ampara',
      location: 'Grounds',
      requiredVolunteers: 10,
      assignedVolunteersCount: 8,
      status: 'Cancelled',
      createdBy: dummyAdminId,
    });

    await cancelledTask.constructor.schema.s.hooks.execPre('save', cancelledTask);
    assert(
      cancelledTask.status === 'Cancelled',
      '7b. Pre-save preserved terminal status "Cancelled"'
    );
  } catch (err) {
    assert(false, `7. Status preservation test failed: ${err.message}`);
  }

  // Test 8: TaskApplication schema validation
  try {
    const validApp = new TaskApplication({
      task: new mongoose.Types.ObjectId(),
      volunteer: dummyVolunteerId,
      message: 'Certified in first aid and available immediately.',
      skills: ['First Aid', 'Logistics'],
      availability: 'Weekends & Evenings',
    });

    await validApp.validate();
    assert(true, '8a. Valid task application passes schema validation');
    assert(validApp.status === 'Pending', '8b. Default application status is Pending');
    assert(validApp.reviewedBy === null, '8c. Default reviewedBy is null');
    assert(validApp.reviewedAt === null, '8d. Default reviewedAt is null');
  } catch (err) {
    assert(false, `8. Valid application test failed: ${err.message}`);
  }

  // Test 9: Reject invalid TaskApplication status
  try {
    const invalidApp = new TaskApplication({
      task: new mongoose.Types.ObjectId(),
      volunteer: dummyVolunteerId,
      status: 'InvalidStatusString',
    });
    await invalidApp.validate();
    assert(false, '9. Should reject invalid application status');
  } catch (err) {
    assert(
      err.message.includes('is not a valid application status'),
      '9. Correctly rejected invalid application status'
    );
  }

  // Test 10: Compound unique index configuration verification
  try {
    const indexes = TaskApplication.schema.indexes();
    const hasCompoundUnique = indexes.some(
      (idx) =>
        idx[0].task === 1 &&
        idx[0].volunteer === 1 &&
        idx[1] &&
        idx[1].unique === true
    );
    assert(
      hasCompoundUnique,
      '10. Schema defines unique compound index on { task: 1, volunteer: 1 } to prevent duplicate active applications'
    );
  } catch (err) {
    assert(false, `10. Compound index verification failed: ${err.message}`);
  }

  // Test 11: Safety Guidelines verification across categories
  try {
    assert(
      TASK_CATEGORIES.length >= 8,
      `11a. Enforces at least 8 specialized disaster response categories (Count: ${TASK_CATEGORIES.length})`
    );
    assert(
      TASK_CATEGORIES.includes('Medical Aid & First Aid Support'),
      '11b. Includes Medical Aid & First Aid category'
    );
    assert(
      TASK_CATEGORIES.includes('Sanitation & Hygiene Maintenance'),
      '11c. Includes Sanitation & Hygiene category'
    );
    assert(
      TASK_CATEGORIES.includes('Dry Rations & Food Packing'),
      '11d. Includes Dry Rations Packing category'
    );
    assert(
      !TASK_CATEGORIES.includes('Underwater Deep Dive Rescue'),
      '11e. Correctly excludes hazardous untrained rescue categories'
    );
  } catch (err) {
    assert(false, `11. Safety categories test failed: ${err.message}`);
  }

  // Test 12: Permitted task priorities
  try {
    assert(
      TASK_PRIORITIES.includes('Urgent') && TASK_PRIORITIES.includes('High'),
      '12. Permitted priorities include Urgent and High'
    );
  } catch (err) {
    assert(false, `12. Priority test failed: ${err.message}`);
  }

  console.log('\n=================================================');
  console.log(`Total Passed: ${passed} | Total Failed: ${failed}`);
  console.log('=================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
