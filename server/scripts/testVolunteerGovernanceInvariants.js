/**
 * ResQ-Lanka Volunteer Governance & Vetting Invariant Tests
 * 
 * Verifies:
 * 1. Default volunteerStatus is 'Pending_Review'.
 * 2. Supported statuses ('Pending_Review', 'Verified', 'Flagged', 'Suspended') pass schema validation.
 * 3. Invalid status strings are rejected.
 * 4. Default reliability metrics initialize to 0.
 * 5. Negative reliability counts rejected.
 * 6. User.toSafeObject() exposes volunteerStatus and volunteerReliability.
 * 7. Long reliability notes (>500 chars) rejected.
 */

import mongoose from 'mongoose';
import User from '../models/User.model.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`FAIL: ${message}`);
  }
}

console.log('--- ResQ-Lanka Volunteer Governance & Vetting Invariant Tests ---\n');

// 1. Default volunteerStatus
const defaultVolunteer = new User({
  name: 'Test Volunteer',
  email: 'testvol@resqlanka.lk',
  password: 'password123',
  role: 'volunteer',
});
assert(defaultVolunteer.volunteerStatus === 'Pending_Review', '1. Default volunteerStatus initializes to "Pending_Review"');
assert(defaultVolunteer.volunteerReliability.tasksCompleted === 0, '1b. Default tasksCompleted initializes to 0');
assert(defaultVolunteer.volunteerReliability.noShows === 0, '1c. Default noShows initializes to 0');

// 2. Supported statuses
const validStatuses = ['Pending_Review', 'Verified', 'Flagged', 'Suspended'];
validStatuses.forEach((st, idx) => {
  const u = new User({
    name: `Volunteer ${st}`,
    email: `vol_${st.toLowerCase()}@resqlanka.lk`,
    password: 'password123',
    role: 'volunteer',
    volunteerStatus: st,
  });
  const err = u.validateSync();
  assert(!err || !err.errors?.volunteerStatus, `2${String.fromCharCode(97 + idx)}. Permitted status "${st}" passes schema validation`);
});

// 3. Invalid status rejection
const invalidUser = new User({
  name: 'Invalid Status Volunteer',
  email: 'invalidstatus@resqlanka.lk',
  password: 'password123',
  role: 'volunteer',
  volunteerStatus: 'Archived_Superstar',
});
const invalidErr = invalidUser.validateSync();
assert(invalidErr && invalidErr.errors?.volunteerStatus, '3. Correctly rejected invalid volunteerStatus "Archived_Superstar"');

// 4. Negative reliability validation
const negativeUser = new User({
  name: 'Negative Metrics Volunteer',
  email: 'negative@resqlanka.lk',
  password: 'password123',
  role: 'volunteer',
  volunteerReliability: {
    tasksCompleted: -1,
    noShows: 0,
  },
});
const negErr = negativeUser.validateSync();
assert(negErr && negErr.errors['volunteerReliability.tasksCompleted'], '4. Correctly rejected negative tasksCompleted (-1)');

// 5. Reliability note length bound
const longNote = 'A'.repeat(505);
const longNoteUser = new User({
  name: 'Long Note Volunteer',
  email: 'longnote@resqlanka.lk',
  password: 'password123',
  role: 'volunteer',
  volunteerReliability: {
    notes: longNote,
  },
});
const noteErr = longNoteUser.validateSync();
assert(noteErr && noteErr.errors['volunteerReliability.notes'], '5. Correctly rejected reliability note exceeding 500 characters');

// 6. toSafeObject output
const safeObj = defaultVolunteer.toSafeObject();
assert(safeObj.volunteerStatus === 'Pending_Review', '6a. toSafeObject includes volunteerStatus');
assert(typeof safeObj.volunteerReliability === 'object', '6b. toSafeObject includes volunteerReliability object');
assert(safeObj.volunteerReliability.tasksCompleted === 0, '6c. toSafeObject reliability metrics match model state');

console.log('\n=================================================');
console.log(`Volunteer Governance Tests: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('=================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
