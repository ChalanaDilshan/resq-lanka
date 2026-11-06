import assert from 'assert';
import {
  generateOtp,
  escapeHtml,
  getTransporter,
  sendOtpEmail,
  sendWelcomeEmail,
} from '../services/emailService.js';

console.log('\n--- ResQ-Lanka Email Service & OTP Security Tests ---');

let passed = 0;
let failed = 0;

const test = async (name, fn) => {
  try {
    await fn();
    console.log(`PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`FAIL: ${name}`);
    console.error(`      ${err.message}`);
    failed++;
  }
};

await test('1. generateOtp generates a valid 6-digit string', () => {
  const otp = generateOtp();
  assert.strictEqual(typeof otp, 'string');
  assert.strictEqual(otp.length, 6);
  const num = parseInt(otp, 10);
  assert.ok(num >= 100000 && num <= 999999, 'OTP must be between 100000 and 999999');
});

await test('2. generateOtp generates unique cryptographically random codes', () => {
  const codes = new Set();
  for (let i = 0; i < 200; i++) {
    const code = generateOtp();
    assert.strictEqual(code.length, 6);
    codes.add(code);
  }
  // With 200 samples out of 900,000, collisions should be 0 or extremely close to 0
  assert.ok(codes.size >= 195, `Expected >= 195 unique codes, got ${codes.size}`);
});

await test('3. escapeHtml sanitizes dangerous HTML injection characters', () => {
  const dirty = '<script>alert("xss & \'injection\'")</script>';
  const clean = escapeHtml(dirty);
  assert.strictEqual(
    clean,
    '&lt;script&gt;alert(&quot;xss &amp; &#39;injection&#39;&quot;)&lt;/script&gt;'
  );
  assert.strictEqual(escapeHtml(null), '');
  assert.strictEqual(escapeHtml(undefined), '');
});

await test('4. getTransporter returns null when EMAIL_PASS is missing (safe dev mode)', () => {
  const origPass = process.env.EMAIL_PASS;
  delete process.env.EMAIL_PASS;
  try {
    const transporter = getTransporter();
    assert.strictEqual(transporter, null);
  } finally {
    if (origPass) process.env.EMAIL_PASS = origPass;
  }
});

await test('5. getTransporter initializes Gmail service when EMAIL_PASS is present', () => {
  const origPass = process.env.EMAIL_PASS;
  process.env.EMAIL_PASS = 'mock_app_pass_test';
  try {
    const transporter = getTransporter();
    assert.ok(transporter !== null, 'Transporter should be created');
  } finally {
    if (origPass) {
      process.env.EMAIL_PASS = origPass;
    } else {
      delete process.env.EMAIL_PASS;
    }
  }
});

await test('6. sendOtpEmail handles simulation mode cleanly without throwing', async () => {
  const origPass = process.env.EMAIL_PASS;
  delete process.env.EMAIL_PASS;
  try {
    const otp = generateOtp();
    const res = await sendOtpEmail({
      to: 'citizen@test.lk',
      name: 'Amal Perera',
      otp,
      purpose: 'login',
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.simulated, true);
    assert.strictEqual(res.otp, otp);
  } finally {
    if (origPass) process.env.EMAIL_PASS = origPass;
  }
});

await test('7. sendWelcomeEmail handles simulation mode cleanly without throwing', async () => {
  const origPass = process.env.EMAIL_PASS;
  delete process.env.EMAIL_PASS;
  try {
    const res = await sendWelcomeEmail({
      to: 'volunteer@test.lk',
      name: 'Kamal Silva',
      role: 'volunteer',
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.simulated, true);
  } finally {
    if (origPass) process.env.EMAIL_PASS = origPass;
  }
});

console.log('\n=================================================');
console.log(`Email Service Tests: Total Passed: ${passed} | Total Failed: ${failed}`);
console.log('=================================================\n');

if (failed > 0) {
  process.exit(1);
}
