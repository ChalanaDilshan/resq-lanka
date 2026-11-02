/**
 * Client-Side Sri Lankan National Identity Card (NIC) Validator
 * Provides instantaneous demographic feedback (Gender, Year of Birth, Age)
 */

const MONTH_DAYS = [
  { month: 'Jan', days: 31, monthIndex: 1 },
  { month: 'Feb', days: 29, monthIndex: 2 },
  { month: 'Mar', days: 31, monthIndex: 3 },
  { month: 'Apr', days: 30, monthIndex: 4 },
  { month: 'May', days: 31, monthIndex: 5 },
  { month: 'Jun', days: 30, monthIndex: 6 },
  { month: 'Jul', days: 31, monthIndex: 7 },
  { month: 'Aug', days: 31, monthIndex: 8 },
  { month: 'Sep', days: 30, monthIndex: 9 },
  { month: 'Oct', days: 31, monthIndex: 10 },
  { month: 'Nov', days: 30, monthIndex: 11 },
  { month: 'Dec', days: 31, monthIndex: 12 },
];

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
  return { month: 'Dec', monthIndex: 12, day: 31 };
}

export function validateSriLankanNIC(nic) {
  if (!nic || typeof nic !== 'string') {
    return {
      isValid: false,
      error: 'National Identity Card (NIC) number is required.',
      cleanNIC: '',
    };
  }

  const clean = nic.replace(/[\s-]/g, '').toUpperCase();

  const isOldFormat = /^[0-9]{9}[VX]$/.test(clean);
  const isNewFormat = /^[0-9]{12}$/.test(clean);

  if (!isOldFormat && !isNewFormat) {
    return {
      isValid: false,
      cleanNIC: clean,
      error: 'Format must be 9 digits + V/X or exactly 12 digits.',
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
      error: `Invalid day-of-year code (${rawDays}). Must be 001-366 (male) or 501-866 (female).`,
    };
  }

  const currentYear = new Date().getFullYear();
  const approximateAge = currentYear - birthYear;

  if (birthYear > currentYear) {
    return {
      isValid: false,
      format,
      cleanNIC: clean,
      error: 'Birth year in NIC cannot be in the future.',
    };
  }

  if (approximateAge < 16) {
    return {
      isValid: false,
      format,
      cleanNIC: clean,
      error: `Applicant is ~${approximateAge} years old. Minimum required age is 16.`,
    };
  }

  if (approximateAge > 105) {
    return {
      isValid: false,
      format,
      cleanNIC: clean,
      error: 'Birth year indicates age exceeding 105 years.',
    };
  }

  const { month, day } = getMonthAndDateFromDayOfYear(dayOfYear);

  return {
    isValid: true,
    format,
    cleanNIC: clean,
    birthYear,
    dayOfYear,
    gender,
    approximateAge,
    dobDisplay: `${month} ${day}, ${birthYear}`,
  };
}

export default validateSriLankanNIC;

