/**
 * ResQ-Lanka User & Sri Lankan NIC Invariant Tests
 * 
 * Tests:
 * 1. Valid Old NIC format (9 digits + V/X) passes and identifies gender & birth year.
 * 2. Valid New NIC format (12 digits) passes and identifies gender & birth year.
 * 3. Female day offset (+500) correctly detected for both Old and New formats.
 * 4. Invalid formats rejected (alphabetic characters, incorrect lengths, punctuation).
 * 5. Invalid mathematical day-of-year codes rejected (e.g. 000, 367-500, >866).
 * 6. Underage applicants (< 16 years old) rejected.
 * 7. Future birth years rejected.
 * 8. Whitespace and hyphen sanitization correctly normalizes input.
 * 9. User schema enforces uniqueness on nicNumber.
 * 10. User schema allows null/undefined nicNumber via sparse indexing (citizens without NIC).
 */

import mongoose from 'mongoose';
import User from '../models/User.model.js';
import { validateSriLankanNIC } from '../services/nicValidator.js';

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

console.log('--- ResQ-Lanka Sri Lankan NIC & User Invariant Tests ---\n');

// 1. Valid Old NIC format (Male)
const oldMale = validateSriLankanNIC('942501234V');
assert(oldMale.isValid === true, '1. Valid 9-digit + V old male NIC passes validation');
assert(oldMale.format === 'OLD', '1b. Correctly identified as OLD format');
assert(oldMale.birthYear === 1994, '1c. Correctly extracted birth year 1994');
assert(oldMale.gender === 'Male', '1d. Correctly identified as Male (day 250)');
assert(oldMale.dayOfYear === 250, '1e. Correct day of year extracted');

// 2. Valid Old NIC format (Female)
const oldFemale = validateSriLankanNIC('857501234X');
assert(oldFemale.isValid === true, '2. Valid 9-digit + X old female NIC passes validation');
assert(oldFemale.gender === 'Female', '2b. Correctly identified as Female (raw day 750 - 500 = 250)');
assert(oldFemale.birthYear === 1985, '2c. Correctly extracted birth year 1985');
assert(oldFemale.dayOfYear === 250, '2d. Correct day of year 250 extracted');

// 3. Valid New NIC format (Male)
const newMale = validateSriLankanNIC('199514501234');
assert(newMale.isValid === true, '3. Valid 12-digit new male NIC passes validation');
assert(newMale.format === 'NEW', '3b. Correctly identified as NEW format');
assert(newMale.birthYear === 1995, '3c. Correctly extracted birth year 1995');
assert(newMale.gender === 'Male', '3d. Correctly identified as Male (day 145)');

// 4. Valid New NIC format (Female)
const newFemale = validateSriLankanNIC('200164501234');
assert(newFemale.isValid === true, '4. Valid 12-digit new female NIC passes validation');
assert(newFemale.birthYear === 2001, '4b. Correctly extracted birth year 2001');
assert(newFemale.gender === 'Female', '4c. Correctly identified as Female (raw day 645 - 500 = 145)');

// 5. Invalid formats
const tooShort = validateSriLankanNIC('94250123');
assert(tooShort.isValid === false, '5a. Correctly rejected too-short NIC string');

const invalidChars = validateSriLankanNIC('94250123AB');
assert(invalidChars.isValid === false, '5b. Correctly rejected NIC with invalid letters');

const wrongLength = validateSriLankanNIC('1994250123456');
assert(wrongLength.isValid === false, '5c. Correctly rejected 13-digit number');

// 6. Mathematical day-of-year violations
const deadZoneDay = validateSriLankanNIC('944501234V');
assert(deadZoneDay.isValid === false, '6a. Correctly rejected day in dead-zone (450: between 367 and 500)');

const excessiveDay = validateSriLankanNIC('949501234V');
assert(excessiveDay.isValid === false, '6b. Correctly rejected excessive day code (950 > 866)');

const zeroDay = validateSriLankanNIC('940001234V');
assert(zeroDay.isValid === false, '6c. Correctly rejected zero day code (000)');

// 7. Age limits
const currentYear = new Date().getFullYear();
const infantYear = currentYear - 5;
const infantNIC = `${infantYear}14501234`;
const underage = validateSriLankanNIC(infantNIC);
assert(underage.isValid === false, '7. Correctly rejected underage applicant (< 16 years old)');

const futureYear = currentYear + 2;
const futureNIC = `${futureYear}14501234`;
const futureUser = validateSriLankanNIC(futureNIC);
assert(futureUser.isValid === false, '7b. Correctly rejected future birth year');

// 8. Sanitization (spaces and hyphens)
const withSpaces = validateSriLankanNIC(' 1995 1450 1234 ');
assert(withSpaces.isValid === true, '8a. Correctly sanitized space-separated input');
assert(withSpaces.cleanNIC === '199514501234', '8b. Normalized cleanNIC has no spaces');

const withHyphens = validateSriLankanNIC('94250-1234v');
assert(withHyphens.isValid === true, '8c. Correctly sanitized hyphenated input and uppercased letter');
assert(withHyphens.cleanNIC === '942501234V', '8d. Normalized cleanNIC is 942501234V');

// 9. Schema Invariants (Mongoose Model definition)
const nicSchemaPath = User.schema.path('nicNumber');
assert(nicSchemaPath !== undefined, '9a. User schema defines nicNumber path');
assert(nicSchemaPath.options.unique === true, '9b. nicNumber path enforces unique: true');
assert(nicSchemaPath.options.sparse === true, '9c. nicNumber path enforces sparse: true for optional citizen accounts');

console.log('\n=================================================');
console.log(`NIC Tests Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('=================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
