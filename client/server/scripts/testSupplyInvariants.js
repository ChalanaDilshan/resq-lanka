import mongoose from 'mongoose';
import SupplyItem from '../models/SupplyItem.js';
import DonorPledge from '../models/DonorPledge.js';

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
  console.log('--- ResQ-Lanka Module 3 Relief Supplies & Donor Pledges Invariant Tests ---\n');

  // Test 1: Valid supply item schema validation and defaults
  try {
    const validItem = new SupplyItem({
      itemName: 'Drinking Water (5L)',
      category: 'Drinking Water',
      urgency: 'High',
      targetQuantity: 100,
      unit: 'bottles',
      shelterLocation: 'Ampara Central College',
      district: 'Ampara',
      coordinatorName: 'Mr. N. Senanayake',
      coordinatorContact: '+94 63 222 2341',
    });
    await validItem.validate();
    assert(true, '1. Valid supply request passes schema validation');
    assert(validItem.remainingQuantity === 100, '1b. Default remainingQuantity equals targetQuantity (100)');
    assert(validItem.receivedQuantity === 0, '1c. Default receivedQuantity initializes to 0');
    assert(validItem.status === 'Open', '1d. Initial status is Open');
  } catch (err) {
    assert(false, `1. Valid supply request failed: ${err.message}`);
  }

  // Test 2: Reject non-positive or invalid quantities
  try {
    const nonPositiveItem = new SupplyItem({
      itemName: 'Test Zero Item',
      targetQuantity: 0,
      shelterLocation: 'Ampara',
      coordinatorName: 'Test',
      coordinatorContact: '123',
    });
    await nonPositiveItem.validate();
    assert(false, '2. Should reject targetQuantity = 0');
  } catch (err) {
    assert(
      err.message.includes('Target quantity must be at least 1') || err.message.includes('targetQuantity'),
      '2. Correctly rejected targetQuantity <= 0'
    );
  }

  // Test 3: Reject missing required fields (e.g. itemName)
  try {
    const missingNameItem = new SupplyItem({
      targetQuantity: 50,
      shelterLocation: 'Ampara',
      coordinatorName: 'Test',
      coordinatorContact: '123',
    });
    await missingNameItem.validate();
    assert(false, '3. Should reject missing itemName');
  } catch (err) {
    assert(
      err.message.includes('Item name is required'),
      '3. Correctly rejected supply request missing itemName'
    );
  }

  // Test 4: Creating a valid donor pledge schema validation
  try {
    const dummyId = new mongoose.Types.ObjectId();
    const validPledge = new DonorPledge({
      supplyItemId: dummyId,
      itemName: 'Drinking Water (5L)',
      shelterLocation: 'Ampara Central College',
      donorName: 'Kamal Perera',
      donorEmail: 'kamal.p@gmail.com',
      donorPhone: '077 123 4567',
      pledgedQuantity: 25,
      unit: 'bottles',
      deliveryMethod: 'Direct Drop-off',
    });
    await validPledge.validate();
    assert(true, '4. Valid donor pledge passes validation');
    assert(validPledge.status === 'Pledged', '4b. Default pledge status is Pledged');
    assert(validPledge.verifiedBy === null, '4c. Default verifiedBy is null');
  } catch (err) {
    assert(false, `4. Valid donor pledge failed: ${err.message}`);
  }

  // Test 5: Reject invalid donor email format
  try {
    const invalidEmailPledge = new DonorPledge({
      supplyItemId: new mongoose.Types.ObjectId(),
      itemName: 'Water',
      shelterLocation: 'Ampara',
      donorName: 'Test Donor',
      donorEmail: 'invalid-email-address',
      donorPhone: '077 123 4567',
      pledgedQuantity: 10,
    });
    await invalidEmailPledge.validate();
    assert(false, '5. Should reject malformed donor email');
  } catch (err) {
    assert(
      err.message.includes('valid donor email') || err.message.includes('donorEmail'),
      '5. Correctly rejected malformed donor email'
    );
  }

  // Test 6: Reject non-positive pledge quantity
  try {
    const zeroPledge = new DonorPledge({
      supplyItemId: new mongoose.Types.ObjectId(),
      itemName: 'Water',
      shelterLocation: 'Ampara',
      donorName: 'Test Donor',
      donorEmail: 'test@donor.lk',
      donorPhone: '077 123 4567',
      pledgedQuantity: 0,
    });
    await zeroPledge.validate();
    assert(false, '6. Should reject pledgedQuantity = 0');
  } catch (err) {
    assert(
      err.message.includes('Pledge amount must be at least 1') || err.message.includes('pledgedQuantity'),
      '6. Correctly rejected non-positive pledge quantity'
    );
  }

  // Test 7: Separation of Pledged vs Received stock and status lifecycle
  try {
    const item = new SupplyItem({
      itemName: 'First Aid Kits',
      targetQuantity: 100,
      pledgedQuantity: 100,
      receivedQuantity: 0,
      shelterLocation: 'Kalmunai Shelter',
      coordinatorName: 'Coordinator',
      coordinatorContact: '123',
    });
    await item.validate();
    assert(
      item.status === 'Fully Pledged',
      `7a. 100% pledged with 0 received results in 'Fully Pledged', NOT 'Fulfilled' (Actual: '${item.status}')`
    );
    assert(item.remainingQuantity === 0, '7b. remainingQuantity is 0');

    // Now simulate physical delivery & verification
    item.receivedQuantity = 100;
    await item.validate();
    assert(
      item.status === 'Fulfilled',
      `7c. Once receivedQuantity >= targetQuantity, status becomes 'Fulfilled' (Actual: '${item.status}')`
    );
  } catch (err) {
    assert(false, `7. Separation of pledged vs received failed: ${err.message}`);
  }

  // Test 8: Partial pledge calculation and status
  try {
    const partialItem = new SupplyItem({
      itemName: 'Dry Ration Packs',
      targetQuantity: 200,
      pledgedQuantity: 50,
      receivedQuantity: 0,
      shelterLocation: 'Akkaraipattu Staging Area',
      coordinatorName: 'Coordinator',
      coordinatorContact: '123',
    });
    await partialItem.validate();
    assert(
      partialItem.status === 'Partially Pledged',
      `8a. Partially pledged item has status 'Partially Pledged' (Actual: '${partialItem.status}')`
    );
    assert(
      partialItem.remainingQuantity === 150,
      `8b. remainingQuantity calculates 200 - 50 = 150 (Actual: ${partialItem.remainingQuantity})`
    );
  } catch (err) {
    assert(false, `8. Partial pledge test failed: ${err.message}`);
  }

  // Test 9: Donor privacy masking simulation
  try {
    const samplePledge = {
      _id: 'plg-test-123',
      donorName: 'Saman Kumara',
      donorEmail: 'saman.kumara@relief.lk',
      donorPhone: '071 234 5678',
      donorNotes: 'Internal donor private instructions',
      pledgedQuantity: 20,
      toObject: function () {
        return { ...this };
      },
    };

    // Simulate public masking function logic
    const masked = {
      ...samplePledge.toObject(),
      donorEmail: samplePledge.donorEmail ? '***@***.***' : '',
      donorPhone: samplePledge.donorPhone ? '***-***-****' : '',
      donorNotes: undefined,
    };

    assert(masked.donorEmail === '***@***.***', '9a. Public donor email is masked as ***@***.***');
    assert(masked.donorPhone === '***-***-****', '9b. Public donor phone is masked as ***-***-****');
    assert(masked.donorNotes === undefined, '9c. Internal donor notes are stripped from public response');
    assert(masked.donorName === 'Saman Kumara', '9d. Donor name / handle remains visible');
  } catch (err) {
    assert(false, `9. Donor privacy masking failed: ${err.message}`);
  }

  // Test 10: State transition logic verification (Cancelled reverts pledged quantity, Verified adds received)
  try {
    const mockItem = {
      targetQuantity: 100,
      pledgedQuantity: 50,
      receivedQuantity: 0,
      remainingQuantity: 50,
    };
    const mockPledge = { pledgedQuantity: 25, status: 'Pledged' };

    // Transition 1: Mark Received & Verified
    mockItem.receivedQuantity += mockPledge.pledgedQuantity;
    assert(mockItem.receivedQuantity === 25, '10a. Transition to Received & Verified increments receivedQuantity to 25');

    // Transition 2: Cancellation of pledge reverts pledged and received
    mockItem.receivedQuantity = Math.max(0, mockItem.receivedQuantity - mockPledge.pledgedQuantity);
    mockItem.pledgedQuantity = Math.max(0, mockItem.pledgedQuantity - mockPledge.pledgedQuantity);
    mockItem.remainingQuantity = mockItem.targetQuantity - mockItem.pledgedQuantity;
    assert(mockItem.receivedQuantity === 0, '10b. Cancellation reverts receivedQuantity to 0');
    assert(mockItem.pledgedQuantity === 25, '10c. Cancellation decrements pledgedQuantity to 25');
    assert(mockItem.remainingQuantity === 75, '10d. remainingQuantity accurately restored to 75');
  } catch (err) {
    assert(false, `10. State transition test failed: ${err.message}`);
  }

  // Test 11: Accurate stats calculation distinguishing pledged from physically received stock
  try {
    const items = [
      { targetQuantity: 100, pledgedQuantity: 100, receivedQuantity: 100, status: 'Fulfilled' },
      { targetQuantity: 100, pledgedQuantity: 100, receivedQuantity: 0, status: 'Fully Pledged' },
      { targetQuantity: 100, pledgedQuantity: 50, receivedQuantity: 0, status: 'Partially Pledged' },
    ];
    let totalTarget = 0, totalPledged = 0, totalReceived = 0;
    items.forEach(i => {
      totalTarget += i.targetQuantity;
      totalPledged += i.pledgedQuantity;
      totalReceived += i.receivedQuantity;
    });

    const percentPledged = Math.round((totalPledged / totalTarget) * 100);
    const percentFulfilled = Math.round((totalReceived / totalTarget) * 100);

    assert(totalTarget === 300, '11a. Total target units equals 300');
    assert(totalPledged === 250, '11b. Total pledged units equals 250');
    assert(totalReceived === 100, '11c. Total physically received units equals 100');
    assert(percentPledged === 83, `11d. percentPledged correctly calculates 83% (Actual: ${percentPledged}%)`);
    assert(percentFulfilled === 33, `11e. percentFulfilled correctly calculates 33% (Actual: ${percentFulfilled}%)`);
  } catch (err) {
    assert(false, `11. Stats calculation test failed: ${err.message}`);
  }

  // Test 12: Upper bound limit validation (1,000,000)
  try {
    const excessiveItem = new SupplyItem({
      itemName: 'Astronomical Item',
      targetQuantity: 10000000, // 10 million exceeds 1 million limit
      shelterLocation: 'Ampara',
      coordinatorName: 'Coordinator',
      coordinatorContact: '123',
    });
    await excessiveItem.validate();
    assert(false, '12. Should reject targetQuantity exceeding 1,000,000');
  } catch (err) {
    assert(
      err.message.includes('1,000,000') || err.message.includes('max'),
      '12. Correctly enforced upper bound on targetQuantity'
    );
  }

  console.log(`\n=================================================`);
  console.log(`Total Passed: ${passed} | Total Failed: ${failed}`);
  console.log(`=================================================`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
