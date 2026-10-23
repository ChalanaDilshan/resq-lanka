import Shelter from '../models/Shelter.model.js';

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
  console.log('--- ResQ-Lanka Module 2 Shelter Invariant & Logic Verification ---\n');

  // Test 1: Valid shelter validation
  try {
    const validShelter = new Shelter({
      name: 'Test Relief Center',
      hazardType: 'flood',
      capacityTotal: 200,
      capacityCurrent: 100,
      district: 'Ampara',
      address: '123 Main St, Ampara',
    });
    await validShelter.validate();
    assert(true, 'Valid shelter schema validation succeeds');
    assert(validShelter.remainingCapacity === 100, 'Virtual remainingCapacity calculates 200 - 100 = 100');
    assert(validShelter.occupancyPercentage === 50, 'Virtual occupancyPercentage calculates 50%');
  } catch (err) {
    assert(false, `Valid shelter schema validation failed: ${err.message}`);
  }

  // Test 2: Invariant enforcement - capacityCurrent > capacityTotal
  try {
    const invalidShelter = new Shelter({
      name: 'Overloaded Center',
      hazardType: 'flood',
      capacityTotal: 100,
      capacityCurrent: 150,
      district: 'Ampara',
      address: '123 Main St',
    });
    await invalidShelter.validate();
    assert(false, 'Should reject capacityCurrent (150) > capacityTotal (100)');
  } catch (err) {
    assert(
      err.message.includes('cannot exceed total capacity'),
      `Correctly rejected capacityCurrent > capacityTotal: ${err.message}`
    );
  }

  // Test 3: Invariant enforcement - negative occupancy
  try {
    const negativeOcc = new Shelter({
      name: 'Negative Occ Center',
      hazardType: 'earthquake',
      capacityTotal: 100,
      capacityCurrent: -10,
      district: 'Galle',
      address: 'Galle Fort',
    });
    await negativeOcc.validate();
    assert(false, 'Should reject negative occupancy');
  } catch (err) {
    assert(
      err.message.includes('Occupancy cannot be negative') || err.message.includes('negative'),
      `Correctly rejected negative occupancy: ${err.message}`
    );
  }

  // Test 4: Invariant enforcement - zero or negative capacityTotal
  try {
    const zeroCap = new Shelter({
      name: 'Zero Cap Center',
      hazardType: 'earthquake',
      capacityTotal: 0,
      capacityCurrent: 0,
      district: 'Galle',
      address: 'Galle Fort',
    });
    await zeroCap.validate();
    assert(false, 'Should reject zero capacityTotal');
  } catch (err) {
    assert(
      err.message.includes('Capacity must be at least 1') || err.message.includes('at least 1 person'),
      `Correctly rejected zero capacityTotal: ${err.message}`
    );
  }

  // Test 5: Pre-save hook status recalculation
  try {
    const shelterAtCap = new Shelter({
      name: 'Full Shelter',
      hazardType: 'flood',
      capacityTotal: 100,
      capacityCurrent: 100,
      district: 'Ampara',
      address: 'High St',
    });
    // Trigger pre-save middleware
    await shelterAtCap.constructor.schema.s.hooks.execPre('save', shelterAtCap);
    assert(shelterAtCap.status === 'At Capacity', `Pre-save correctly computes 'At Capacity' for 100% full: ${shelterAtCap.status}`);
  } catch (err) {
    assert(false, `Pre-save status calculation failed: ${err.message}`);
  }

  // Test 6: Pre-save hook status Nearly Full
  try {
    const shelterNearlyFull = new Shelter({
      name: 'Nearly Full Shelter',
      hazardType: 'cyclone',
      capacityTotal: 100,
      capacityCurrent: 88,
      district: 'Batticaloa',
      address: 'Beach Rd',
    });
    await shelterNearlyFull.constructor.schema.s.hooks.execPre('save', shelterNearlyFull);
    assert(shelterNearlyFull.status === 'Nearly Full', `Pre-save correctly computes 'Nearly Full' for 88% full: ${shelterNearlyFull.status}`);
    assert(shelterNearlyFull.hazardCategoryLabel === 'Reinforced Cyclone Haven', 'Pre-save correctly sets cyclone hazard label');
  } catch (err) {
    assert(false, `Pre-save status nearly full failed: ${err.message}`);
  }

  // Test 7: CRITICAL BUG FIX - 'Closed' status must NOT be overwritten to 'Available'!
  try {
    const closedShelter = new Shelter({
      name: 'Closed Shelter',
      hazardType: 'flood',
      capacityTotal: 200,
      capacityCurrent: 50,
      status: 'Closed',
      district: 'Ampara',
      address: 'Station Rd',
    });
    await closedShelter.constructor.schema.s.hooks.execPre('save', closedShelter);
    assert(
      closedShelter.status === 'Closed',
      `CRITICAL FIX VERIFIED: Pre-save preserved 'Closed' status despite having low occupancy (${closedShelter.capacityCurrent}/${closedShelter.capacityTotal})`
    );
  } catch (err) {
    assert(false, `Closed status test failed: ${err.message}`);
  }

  // Test 8: Controller rejects malformed ObjectId format on GET
  try {
    const { getShelterById } = await import('../controllers/shelter.controller.js');
    let resStatus = 0;
    let resJson = null;
    const req = { params: { id: 'invalid-id-format' } };
    const res = {
      status(code) {
        resStatus = code;
        return this;
      },
      json(data) {
        resJson = data;
        return this;
      },
    };
    await getShelterById(req, res);
    assert(resStatus === 400, `getShelterById rejects invalid ObjectId with HTTP 400: ${resStatus}`);
    assert(resJson?.message?.includes('Invalid shelter identifier'), 'getShelterById returns descriptive invalid ID message');
  } catch (err) {
    assert(false, `getShelterById test failed: ${err.message}`);
  }

  // Test 9: Controller rejects malformed ObjectId format on PATCH occupancy
  try {
    const { updateShelterOccupancyAndCapacity } = await import('../controllers/shelter.controller.js');
    let resStatus = 0;
    let resJson = null;
    const req = { params: { id: 'invalid-id' }, body: { capacityCurrent: 10 } };
    const res = {
      status(code) {
        resStatus = code;
        return this;
      },
      json(data) {
        resJson = data;
        return this;
      },
    };
    await updateShelterOccupancyAndCapacity(req, res);
    assert(resStatus === 400, `updateShelterOccupancyAndCapacity rejects invalid ObjectId with HTTP 400: ${resStatus}`);
  } catch (err) {
    assert(false, `updateShelterOccupancyAndCapacity invalid id test failed: ${err.message}`);
  }

  // Test 10: Controller rejects malformed ObjectId format on DELETE
  try {
    const { deleteShelter } = await import('../controllers/shelter.controller.js');
    let resStatus = 0;
    let resJson = null;
    const req = { params: { id: 'invalid-id' } };
    const res = {
      status(code) {
        resStatus = code;
        return this;
      },
      json(data) {
        resJson = data;
        return this;
      },
    };
    await deleteShelter(req, res);
    assert(resStatus === 400, `deleteShelter rejects invalid ObjectId with HTTP 400: ${resStatus}`);
  } catch (err) {
    assert(false, `deleteShelter invalid id test failed: ${err.message}`);
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
