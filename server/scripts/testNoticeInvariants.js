import mongoose from 'mongoose';
import Notice, {
  HAZARD_TYPES,
  SEVERITY_LEVELS,
  PUBLICATION_STATUSES,
  VERIFICATION_STATUSES,
  SRI_LANKA_DISTRICTS,
} from '../models/Notice.model.js';

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
  console.log('--- ResQ-Lanka Module 5 Noticeboard & Emergency Alerts Invariant Tests ---\n');

  const dummyAdminId = new mongoose.Types.ObjectId();
  const now = Date.now();

  // Test 1: Valid Notice Schema Validation and Default Invariants
  try {
    const validNotice = new Notice({
      title: 'Gal Oya Basin Reservoir Water Level Warning',
      message:
        'Irrigation Department indicates water levels in the lower reservoir basin are rising at 0.3m per hour.',
      hazardType: 'Flood',
      severity: 'Critical',
      affectedDistricts: ['Ampara', 'Batticaloa'],
      sourceName: 'Disaster Management Centre (DMC)',
      sourceUrl: 'https://www.dmc.gov.lk/alerts/2026-09',
      isOfficial: true,
      verificationStatus: 'Verified',
      publicationStatus: 'Published',
      publishedAt: new Date(now),
      expiresAt: new Date(now + 86400000 * 2),
      createdBy: dummyAdminId,
    });

    await validNotice.validate();
    assert(true, '1. Valid official notice passes schema validation');
    assert(validNotice.isOfficial === true, '1b. Official flag set to true');
    assert(validNotice.verificationStatus === 'Verified', '1c. Verification status is Verified');
    assert(validNotice.publicationStatus === 'Published', '1d. Publication status is Published');
    assert(validNotice.isCurrent === true, '1e. Virtual isCurrent evaluates to true for active future alert');
  } catch (err) {
    assert(false, `1. Valid notice test failed: ${err.message}`);
  }

  // Test 2: Reject notice with missing mandatory fields
  try {
    const missingTitleNotice = new Notice({
      message: 'Missing title description content here',
      hazardType: 'Flood',
      affectedDistricts: ['Ampara'],
      sourceName: 'DMC',
    });
    await missingTitleNotice.validate();
    assert(false, '2a. Notice without title should fail validation');
  } catch {
    assert(true, '2a. Notice without title correctly rejected');
  }

  try {
    const missingMessageNotice = new Notice({
      title: 'Valid Alert Title Here',
      hazardType: 'Flood',
      affectedDistricts: ['Ampara'],
      sourceName: 'DMC',
    });
    await missingMessageNotice.validate();
    assert(false, '2b. Notice without message should fail validation');
  } catch {
    assert(true, '2b. Notice without message correctly rejected');
  }

  try {
    const missingSourceNameNotice = new Notice({
      title: 'Valid Alert Title Here',
      message: 'Valid alert message description here',
      hazardType: 'Flood',
      affectedDistricts: ['Ampara'],
    });
    await missingSourceNameNotice.validate();
    assert(false, '2c. Notice without sourceName should fail validation');
  } catch {
    assert(true, '2c. Notice without sourceName correctly rejected');
  }

  // Test 3: Reject invalid hazard types
  try {
    const invalidHazardNotice = new Notice({
      title: 'Invalid Hazard Notice Title',
      message: 'Description with an unsupported hazard type.',
      hazardType: 'Alien Invasion',
      severity: 'High',
      affectedDistricts: ['Ampara'],
      sourceName: 'DMC',
    });
    await invalidHazardNotice.validate();
    assert(false, '3. Invalid hazard type should fail validation');
  } catch {
    assert(true, '3. Invalid hazard type Alien Invasion correctly rejected');
  }

  // Test 4: Reject invalid severity levels
  try {
    const invalidSeverityNotice = new Notice({
      title: 'Invalid Severity Notice Title',
      message: 'Description with an unsupported severity.',
      hazardType: 'Flood',
      severity: 'Catastrophic',
      affectedDistricts: ['Ampara'],
      sourceName: 'DMC',
    });
    await invalidSeverityNotice.validate();
    assert(false, '4. Invalid severity should fail validation');
  } catch {
    assert(true, '4. Invalid severity Catastrophic correctly rejected');
  }

  // Test 5: District validation - Must be valid Sri Lankan district
  try {
    const invalidDistrictNotice = new Notice({
      title: 'Invalid District Notice Title',
      message: 'Description with nonexistent district name.',
      hazardType: 'Flood',
      severity: 'Medium',
      affectedDistricts: ['Wakanda'],
      sourceName: 'Community Watch',
    });
    await invalidDistrictNotice.validate();
    assert(false, '5a. Nonexistent district Wakanda should fail validation');
  } catch {
    assert(true, '5a. Nonexistent district Wakanda correctly rejected');
  }

  try {
    const emptyDistrictsNotice = new Notice({
      title: 'Empty Districts Notice Title',
      message: 'Description with empty districts list.',
      hazardType: 'Flood',
      severity: 'Medium',
      affectedDistricts: [],
      sourceName: 'Community Watch',
    });
    await emptyDistrictsNotice.validate();
    assert(false, '5b. Empty affected districts array should fail validation');
  } catch {
    assert(true, '5b. Empty affected districts array correctly rejected');
  }

  // Test 6: Invariant - Expiry Date must be AFTER Publication Date
  try {
    const expiredPastNotice = new Notice({
      title: 'Past Expiry Date Alert Test',
      message: 'Testing that expiry date cannot be earlier than publication date.',
      hazardType: 'Heavy Rainfall',
      severity: 'Medium',
      affectedDistricts: ['Colombo'],
      sourceName: 'Met Dept',
      publicationStatus: 'Published',
      publishedAt: new Date(now),
      expiresAt: new Date(now - 3600000 * 2), // 2 hours in the past
    });
    await expiredPastNotice.validate();
    assert(false, '6. Notice with expiresAt earlier than publishedAt should fail validation');
  } catch {
    assert(true, '6. Notice with expiresAt <= publishedAt correctly rejected');
  }

  // Test 7: Virtual isCurrent accurately reflects expiry in the past
  try {
    const pastNotice = new Notice({
      title: 'Expired Alert Virtual Test',
      message: 'Checking isCurrent evaluates to false when expiresAt is in the past.',
      hazardType: 'Landslide',
      severity: 'High',
      affectedDistricts: ['Kandy'],
      sourceName: 'NBRO',
      publicationStatus: 'Published',
      publishedAt: new Date(now - 86400000 * 3),
      expiresAt: new Date(now - 86400000 * 1),
    });
    assert(pastNotice.isCurrent === false, '7a. Virtual isCurrent evaluates to false for past expired alert');
  } catch (err) {
    assert(false, `7a. Virtual isCurrent test failed: ${err.message}`);
  }

  // Test 8: Separation of Publication Status vs Source Verification Status
  try {
    const communityNotice = new Notice({
      title: 'Community Bridge Water Level Observation',
      message: 'Water is accumulating around the western footing of the village culvert.',
      hazardType: 'Flood',
      severity: 'Medium',
      affectedDistricts: ['Ampara'],
      sourceName: 'Local Resident Watch',
      isOfficial: false,
      verificationStatus: 'Unverified',
      publicationStatus: 'Draft',
    });
    await communityNotice.validate();
    assert(
      communityNotice.isOfficial === false && communityNotice.verificationStatus === 'Unverified',
      '8a. Community notice initialized as Unverified and non-official'
    );
    assert(communityNotice.isCurrent === false, '8b. Draft notice has isCurrent === false');
  } catch (err) {
    assert(false, `8. Separation test failed: ${err.message}`);
  }

  // Test 9: Withdrawn Notice Invariant
  try {
    const withdrawnNotice = new Notice({
      title: 'Withdrawn Alert Invariant Test',
      message: 'Flood water has completely receded and warning is revoked.',
      hazardType: 'Flood',
      severity: 'Low',
      affectedDistricts: ['Galle'],
      sourceName: 'DMC Galle Unit',
      publicationStatus: 'Withdrawn',
      publishedAt: new Date(now - 86400000),
      withdrawnAt: new Date(),
      withdrawnReason: 'Water receded to safe thresholds. All clear issued.',
    });
    await withdrawnNotice.validate();
    assert(withdrawnNotice.isCurrent === false, '9a. Withdrawn notice has isCurrent === false');
    assert(withdrawnNotice.withdrawnReason.length > 0, '9b. Withdrawn notice records clear reason');
    assert(withdrawnNotice.withdrawnAt instanceof Date, '9c. Withdrawn notice records withdrawnAt timestamp');
  } catch (err) {
    assert(false, `9. Withdrawn notice test failed: ${err.message}`);
  }

  // Test 10: URL format validation
  try {
    const invalidUrlNotice = new Notice({
      title: 'Invalid URL Format Test',
      message: 'Testing bad URL schema validation for external source reference.',
      hazardType: 'Flood',
      severity: 'Low',
      affectedDistricts: ['Matara'],
      sourceName: 'DMC',
      sourceUrl: 'htt://invalid-url-format',
    });
    await invalidUrlNotice.validate();
    assert(false, '10a. Invalid source URL format should fail validation');
  } catch {
    assert(true, '10a. Malformed source URL htt://invalid-url-format correctly rejected');
  }

  try {
    const validUrlNotice = new Notice({
      title: 'Valid URL Format Test',
      message: 'Testing valid https URL schema validation for external source reference.',
      hazardType: 'Flood',
      severity: 'Low',
      affectedDistricts: ['Matara'],
      sourceName: 'DMC',
      sourceUrl: 'https://www.dmc.gov.lk/en/situation-report',
      publicationStatus: 'Published',
    });
    await validUrlNotice.validate();
    assert(true, '10b. Valid HTTPS source URL passes validation');
  } catch (err) {
    assert(false, `10b. Valid HTTPS URL test failed: ${err.message}`);
  }

  // Test 11: Static query filter for active public feed
  try {
    const activeFilter = Notice.getActivePublicFilter();
    assert(
      activeFilter.publicationStatus === 'Published',
      '11a. Active public filter strictly enforces publicationStatus === Published'
    );
    assert(
      Array.isArray(activeFilter.$or) && activeFilter.$or.length === 2,
      '11b. Active public filter excludes notices past their expiresAt timestamp'
    );
  } catch (err) {
    assert(false, `11. Active query filter test failed: ${err.message}`);
  }

  // Test 12: Sri Lanka 25 districts complete enumeration
  try {
    assert(SRI_LANKA_DISTRICTS.length === 25, '12a. Exactly 25 official Sri Lankan districts defined');
    assert(
      ['Ampara', 'Batticaloa', 'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Ratnapura'].every((d) =>
        SRI_LANKA_DISTRICTS.includes(d)
      ),
      '12b. Key disaster-prone districts present in canonical district list'
    );
  } catch (err) {
    assert(false, `12. District enumeration test failed: ${err.message}`);
  }

  // Test 13: Hazard types and severity enumerations
  try {
    assert(
      HAZARD_TYPES.includes('Flood') &&
        HAZARD_TYPES.includes('Landslide') &&
        HAZARD_TYPES.includes('Cyclone') &&
        HAZARD_TYPES.includes('Tsunami') &&
        HAZARD_TYPES.includes('Earthquake') &&
        HAZARD_TYPES.includes('Heavy Rainfall'),
      '13a. Core disaster hazards properly enumerated'
    );
    assert(
      SEVERITY_LEVELS.includes('Critical') &&
        SEVERITY_LEVELS.includes('High') &&
        SEVERITY_LEVELS.includes('Medium') &&
        SEVERITY_LEVELS.includes('Low'),
      '13b. Standard 4-tier alert severity scale properly enumerated'
    );
    assert(
      PUBLICATION_STATUSES.includes('Draft') &&
        PUBLICATION_STATUSES.includes('Published') &&
        PUBLICATION_STATUSES.includes('Expired') &&
        PUBLICATION_STATUSES.includes('Withdrawn'),
      '13c. Publication lifecycles accurately enumerated'
    );
    assert(
      VERIFICATION_STATUSES.includes('Unverified') &&
        VERIFICATION_STATUSES.includes('Verified') &&
        VERIFICATION_STATUSES.includes('Rejected'),
      '13d. Source verification states accurately enumerated'
    );
  } catch (err) {
    assert(false, `13. Constants enumeration test failed: ${err.message}`);
  }

  console.log('\n=================================================');
  console.log(`Module 5 Total Passed: ${passed} | Total Failed: ${failed}`);
  console.log('=================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
