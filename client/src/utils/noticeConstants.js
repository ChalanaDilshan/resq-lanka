/**
 * Module 5: Emergency Alerts & Noticeboard Constants
 * Sri Lanka Disaster Management Context
 */

export const HAZARD_TYPES = [
  'Flood',
  'Cyclone',
  'Landslide',
  'Tsunami',
  'Earthquake',
  'Heavy Rainfall',
  'General Emergency',
];

export const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export const PUBLICATION_STATUSES = ['Draft', 'Published', 'Expired', 'Withdrawn'];

export const VERIFICATION_STATUSES = ['Unverified', 'Verified', 'Rejected'];

export const SRI_LANKA_DISTRICTS = [
  'Ampara',
  'Anuradhapura',
  'Badulla',
  'Batticaloa',
  'Colombo',
  'Galle',
  'Gampaha',
  'Hambantota',
  'Jaffna',
  'Kalutara',
  'Kandy',
  'Kegalle',
  'Kilinochchi',
  'Kurunegala',
  'Mannar',
  'Matale',
  'Matara',
  'Monaragala',
  'Mullaitivu',
  'Nuwara Eliya',
  'Polonnaruwa',
  'Puttalam',
  'Ratnapura',
  'Trincomalee',
  'Vavuniya',
];

export const SEVERITY_CONFIG = {
  Critical: {
    label: 'Critical Alert',
    badgeClass: 'bg-red-500 text-white border-red-600',
    borderClass: 'border-l-4 border-l-red-600',
    cardBg: 'bg-red-50/50',
    iconColor: 'text-red-600',
    pillBg: 'bg-red-100 text-red-800 border-red-300',
    bannerBg: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700',
    lightBorder: 'border-red-200',
  },
  High: {
    label: 'High Advisory',
    badgeClass: 'bg-amber-500 text-white border-amber-600',
    borderClass: 'border-l-4 border-l-amber-500',
    cardBg: 'bg-amber-50/40',
    iconColor: 'text-amber-600',
    pillBg: 'bg-amber-100 text-amber-800 border-amber-300',
    bannerBg: 'bg-gradient-to-r from-amber-500 to-orange-600',
    lightBorder: 'border-amber-200',
  },
  Medium: {
    label: 'Medium Watch',
    badgeClass: 'bg-yellow-500 text-slate-900 border-yellow-600',
    borderClass: 'border-l-4 border-l-yellow-400',
    cardBg: 'bg-yellow-50/30',
    iconColor: 'text-yellow-600',
    pillBg: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    bannerBg: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    lightBorder: 'border-yellow-200',
  },
  Low: {
    label: 'Low Notice',
    badgeClass: 'bg-blue-500 text-white border-blue-600',
    borderClass: 'border-l-4 border-l-blue-400',
    cardBg: 'bg-blue-50/30',
    iconColor: 'text-blue-600',
    pillBg: 'bg-blue-100 text-blue-800 border-blue-300',
    bannerBg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    lightBorder: 'border-blue-200',
  },
};

export const EMERGENCY_HOTLINES = [
  {
    name: 'Disaster Management Centre (DMC)',
    number: '117',
    description: 'National Emergency Operations Centre 24/7 Hotline',
    primary: true,
  },
  {
    name: 'Suwa Seriya Pre-Hospital Care',
    number: '1990',
    description: 'Free National Ambulance & Medical Emergency Service',
    primary: true,
  },
  {
    name: 'Sri Lanka Police Emergency',
    number: '119',
    description: 'Immediate Police Assistance & Flood Search Response',
    primary: true,
  },
  {
    name: 'Meteorology Department',
    number: '011-2694801',
    description: 'Early Warning for Cyclones, Monsoons & Heavy Rain',
    primary: false,
  },
  {
    name: 'NBRO Landslide Warning',
    number: '011-2588946',
    description: 'Early Warning Unit for Highland Landslides & Slope Failures',
    primary: false,
  },
];
