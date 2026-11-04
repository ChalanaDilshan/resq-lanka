import SOSRequest from '../models/SOSRequest.js';

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
  console.log('--- ResQ-Lanka Module 1 Emergency SOS Invariant & Validation Tests ---\n');

  // Test 1: Valid SOS schema validation
  try {
    const validSOS = new SOSRequest({
      hazardType: 'Flood',
      urgency: 'Critical',
      locationText: 'Near Kelani River Bridge, Kaduwela',
      coordinates: {
        lat: 6.9322,
        lng: 79.9812,
        hasCoordinates: true,
      },
      contactNumber: '0771234567',
      description: 'Water level rising quickly above ground floor.',
    });
    await validSOS.validate();
    assert(true, '1. Valid SOS request passes schema validation');
    assert(validSOS.status === 'Pending', '1b. Default status initializes to "Pending"');
    assert(validSOS.reporterName === 'Anonymous Citizen', '1c. Default reporterName initializes to "Anonymous Citizen"');
    assert(validSOS.reportedBy === null, '1d. Default reportedBy is null for unauthenticated reports');
  } catch (err) {
    assert(false, `1. Valid SOS schema validation failed: ${err.message}`);
  }

  // Test 2: Invariant enforcement - missing locationText
  try {
    const invalidSOS = new SOSRequest({
      hazardType: 'Flood',
      urgency: 'High',
      locationText: '',
      contactNumber: '0771234567',
    });
    await invalidSOS.validate();
    assert(false, '2. Should reject missing locationText');
  } catch (err) {
    assert(
      err.message.includes('Location address or landmark is required'),
      `2. Correctly rejected missing locationText: ${err.message}`
    );
  }

  // Test 3: Invariant enforcement - locationText too short (<3 chars)
  try {
    const shortLocSOS = new SOSRequest({
      hazardType: 'Landslide',
      urgency: 'High',
      locationText: 'AB',
      contactNumber: '0771234567',
    });
    await shortLocSOS.validate();
    assert(false, '3. Should reject location description under 3 characters');
  } catch (err) {
    assert(
      err.message.includes('must be at least 3 characters'),
      `3. Correctly rejected short location description: ${err.message}`
    );
  }

  // Test 4: Invariant enforcement - invalid hazard type
  try {
    const invalidHazard = new SOSRequest({
      hazardType: 'Alien Attack',
      urgency: 'Critical',
      locationText: 'Colombo Fort',
      contactNumber: '0771234567',
    });
    await invalidHazard.validate();
    assert(false, '4. Should reject unsupported hazard type');
  } catch (err) {
    assert(
      err.message.includes('is not a supported hazard type'),
      `4. Correctly rejected unsupported hazard type: ${err.message}`
    );
  }

  // Test 5: Invariant enforcement - invalid urgency level
  try {
    const invalidUrgency = new SOSRequest({
      hazardType: 'Tsunami',
      urgency: 'Catastrophic',
      locationText: 'Galle Coastal Promenade',
      contactNumber: '0771234567',
    });
    await invalidUrgency.validate();
    assert(false, '5. Should reject unsupported urgency level');
  } catch (err) {
    assert(
      err.message.includes('is not a supported urgency level'),
      `5. Correctly rejected unsupported urgency level: ${err.message}`
    );
  }

  // Test 6: Invariant enforcement - invalid status
  try {
    const invalidStatus = new SOSRequest({
      hazardType: 'Cyclone',
      urgency: 'Critical',
      locationText: 'Batticaloa Lagoon Area',
      contactNumber: '0771234567',
      status: 'Archived',
    });
    await invalidStatus.validate();
    assert(false, '6. Should reject unsupported lifecycle status');
  } catch (err) {
    assert(
      err.message.includes('is not a valid status'),
      `6. Correctly rejected invalid lifecycle status: ${err.message}`
    );
  }

  // Test 7: Invariant enforcement - coordinate bounds
  try {
    const invalidLat = new SOSRequest({
      hazardType: 'Flood',
      urgency: 'Medium',
      locationText: 'Matara Fort Area',
      contactNumber: '0771234567',
      coordinates: { lat: 95.5, lng: 80.2, hasCoordinates: true },
    });
    await invalidLat.validate();
    assert(false, '7. Should reject latitude > 90');
  } catch (err) {
    assert(
      err.message.includes('Latitude must be between -90 and 90'),
      `7. Correctly rejected latitude > 90: ${err.message}`
    );
  }

  // Test 8: Public masking method toPublicFeedObject
  try {
    const sosForMasking = new SOSRequest({
      hazardType: 'Flood',
      urgency: 'Critical',
      locationText: 'Ratnapura Clock Tower Area',
      contactNumber: '0771234567',
      description: 'Family of 4 stranded on roof',
    });
    const publicObj = sosForMasking.toPublicFeedObject();
    assert(
      publicObj.contactNumber === '077 **** 567',
      `8a. Correctly masked 10-digit emergency contact phone: ${publicObj.contactNumber}`
    );

    const shortPhoneSOS = new SOSRequest({
      hazardType: 'Flood',
      urgency: 'Critical',
      locationText: 'Ratnapura Main Street',
      contactNumber: '119',
    });
    const shortPublicObj = shortPhoneSOS.toPublicFeedObject();
    assert(
      shortPublicObj.contactNumber === '***-***-****',
      `8b. Correctly masked short contact phone: ${shortPublicObj.contactNumber}`
    );
  } catch (err) {
    assert(false, `8. Public masking test failed: ${err.message}`);
  }

  // Test 9: Status history tracking
  try {
    const sosWithHistory = new SOSRequest({
      hazardType: 'Fire',
      urgency: 'Critical',
      locationText: 'Kandy Commercial District',
      contactNumber: '0719876543',
      statusHistory: [
        {
          previousStatus: 'None',
          newStatus: 'Pending',
          changedByName: 'Citizen',
          note: 'Incident registered.',
        },
        {
          previousStatus: 'Pending',
          newStatus: 'In Progress',
          changedByName: 'DMC Officer',
          note: 'Rescue team boat 4 dispatched.',
        },
      ],
    });
    await sosWithHistory.validate();
    assert(sosWithHistory.statusHistory.length === 2, '9a. Status history correctly stores timeline entries');
    assert(
      sosWithHistory.statusHistory[1].newStatus === 'In Progress',
      '9b. Status history records correct transition status'
    );
  } catch (err) {
    assert(false, `9. Status history validation failed: ${err.message}`);
  }

  // Summary
  console.log('\n=================================================');
  console.log(`Module 1 Total Passed: ${passed} | Total Failed: ${failed}`);
  console.log('=================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
