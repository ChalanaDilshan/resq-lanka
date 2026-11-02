/**
 * Sri Lankan National Identity Card (NIC) Validation Service
 * 
 * Supports both:
 * 1. Old NIC format (9 digits + 'V' or 'X') - issued prior to 2016
 * 2. New NIC format (12 digits) - issued from 2016 onwards
 * 
 * Mathematical Rules Enforced:
 * - Format check (Old: 9 digits + V/X, New: 12 numeric digits)
 * - Birth year extraction (Old: 1900 + 2 digits, New: 4 digits)
 * - Day-of-year and gender extraction:
 *     Male: 1 to 366
 *     Female: 501 to 866 (day of year + 500)
 *     Invalid: <= 0, 367-500, > 866
 * - Age validation: Volunteer must be between 16 and 105 years of age.
 * - Approximate Date of Birth resolution (using standard 366-day registration lookup table)
 */

const MONTH_DAYS = [
  { month: 'January', days: 31, monthIndex: 1 },
  { month: 'February', days: 29, monthIndex: 2 },
  { month: 'March', days: 31, monthIndex: 3 },
  { month: 'April', days: 30, monthIndex: 4 },
  { month: 'May', days: 31, monthIndex: 5 },
  { month: 'June', days: 30, monthIndex: 6 },
  { month: 'July', days: 31, monthIndex: 7 },
  { month: 'August', days: 31, monthIndex: 8 },
  { month: 'September', days: 30, monthIndex: 9 },
  { month: 'October', days: 31, monthIndex: 10 },
  { month: 'November', days: 30, monthIndex: 11 },
  { month: 'December', days: 31, monthIndex: 12 },
];

/**
 * Convert NIC day-of-year (1-366) to Month and Day
 */
export function getMonthAndDateFromDayOfYear(dayOfYear) {
  let remainingDays = dayOfYear;
  for (const m of MONTH_DAYS) {
    if (remainingDays <= m.days) {
      return {
        month: m.month,
        monthIndex: m.monthIndex,
        day: remainingDays,
      };
    }
    remainingDays -= m.days;
  }
  return { month: 'December', monthIndex: 12, day: 31 };
}

/**
 * Validate a Sri Lankan NIC and extract demographic data
 * @param {string} nic Raw NIC input string
 * @returns {object} Validation result and metadata
 */
export function validateSriLankanNIC(nic) {
  if (!nic || typeof nic !== 'string') {
    return {
      isValid: false,
      error: 'National Identity Card (NIC) number is required.',
      cleanNIC: '',
    };
  }

  // Sanitize: strip whitespace and hyphens, convert to uppercase
  const clean = nic.replace(/[\s-]/g, '').toUpperCase();

  const isOldFormat = /^[0-9]{9}[VX]$/.test(clean);
  const isNewFormat = /^[0-9]{12}$/.test(clean);

  if (!isOldFormat && !isNewFormat) {
    return {
      isValid: false,
      cleanNIC: clean,
      error: 'Invalid format. Sri Lankan NIC must be 9 digits followed by V/X or exactly 12 digits.',
    };
  }

  let birthYear = 0;
  let rawDays = 0;
  let format = '';

  if (isOldFormat) {
    format = 'OLD';
    const yearDigits = parseInt(clean.substring(0, 2), 10);
    birthYear = 1900 + yearDigits;
    rawDays = parseInt(clean.substring(2, 5), 10);
  } else {
    format = 'NEW';
    birthYear = parseInt(clean.substring(0, 4), 10);
    rawDays = parseInt(clean.substring(4, 7), 10);
  }

  // Gender and day-of-year validation
  let gender = 'Male';
  let dayOfYear = rawDays;

  if (rawDays > 500) {
    gender = 'Female';
    dayOfYear = rawDays - 500;
  }

  if (dayOfYear < 1 || dayOfYear > 366 || (rawDays > 366 && rawDays <= 500) || rawDays > 866) {
    return {
      isValid: false,
      format,
      cleanNIC: clean,
      error: `Invalid day-of-year code (${rawDays}) in NIC. Must be 001-366 for males or 501-866 for females.`,
    };
  }

  // Age checks
  const currentYear = new Date().getFullYear();
  const approximateAge = currentYear - birthYear;

  if (birthYear > currentYear) {
    return {
      isValid: false,
      format,
      cleanNIC: clean,
      error: 'Birth year indicated in NIC cannot be in the future.',
    };
  }

  if (approximateAge < 16) {
    return {
      isValid: false,
      format,
      cleanNIC: clean,
      error: `Applicant is approximately ${approximateAge} years old. Must be at least 16 years of age to register with an NIC.`,
    };
  }

  if (approximateAge > 105) {
    return {
      isValid: false,
      format,
      cleanNIC: clean,
      error: 'Birth year in NIC indicates age exceeding 105 years.',
    };
  }

  const { month, monthIndex, day } = getMonthAndDateFromDayOfYear(dayOfYear);
  const formattedDob = `${birthYear}-${String(monthIndex).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return {
    isValid: true,
    format,
    cleanNIC: clean,
    birthYear,
    dayOfYear,
    gender,
    approximateAge,
    dobString: formattedDob,
    dobDisplay: `${month} ${day}, ${birthYear}`,
  };
}

export default validateSriLankanNIC;

