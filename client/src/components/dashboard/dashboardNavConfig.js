import {
  LayoutDashboard,
  ShieldAlert,
  Building2,
  PackageCheck,
  Users,
  Bell,
  ClipboardList,
  PlusCircle,
  UserCheck,
} from 'lucide-react';

/**
 * Navigation configuration for each canonical role.
 * Links strictly map to validated routes currently in the application.
 */
export const DASHBOARD_NAV_CONFIG = {
  citizen: [
    {
      label: 'Citizen Overview',
      path: '/dashboard/citizen',
      icon: LayoutDashboard,
      description: 'Personal relief status & emergency quick actions',
    },
    {
      label: 'Report SOS Emergency',
      path: '/sos',
      icon: ShieldAlert,
      isEmergency: true,
      description: 'Submit urgent distress call or hazard report',
    },
    {
      label: 'Safe Shelters Directory',
      path: '/shelters',
      icon: Building2,
      description: 'Find active shelters & elevation clearance',
    },
    {
      label: 'Relief Supplies & Donate',
      path: '/supplies',
      icon: PackageCheck,
      description: 'View requested essential supplies & pledge aid',
    },
    {
      label: 'Emergency Alerts & Notices',
      path: '/alerts',
      icon: Bell,
      description: 'Official DMC & weather advisories',
    },
  ],
  volunteer: [
    {
      label: 'Volunteer Overview',
      path: '/dashboard/volunteer',
      icon: LayoutDashboard,
      description: 'Active assignments & open task board',
    },
    {
      label: 'Browse Relief Tasks',
      path: '/tasks',
      icon: Users,
      description: 'Explore open community relief operations',
    },
    {
      label: 'Safe Shelters Directory',
      path: '/shelters',
      icon: Building2,
      description: 'View shelter locations and staging areas',
    },
    {
      label: 'Emergency Alerts & Notices',
      path: '/alerts',
      icon: Bell,
      description: 'Official emergency bulletins for field responders',
    },
  ],
  administrator: [
    {
      label: 'Operation Overview',
      path: '/dashboard/administrator',
      icon: LayoutDashboard,
      description: 'High-level operational metrics across all 5 modules',
    },
    {
      label: 'Volunteer Vetting Queue',
      path: '/dashboard/administrator?tab=volunteers',
      icon: UserCheck,
      description: 'Review Sri Lankan NIC verification & attendance',
    },
    {
      label: 'SOS Incident Feed',
      path: '/sos-dashboard',
      icon: ShieldAlert,
      isEmergency: true,
      description: 'Review & dispatch incoming distress incidents',
    },
    {
      label: 'Shelter Directory & Capacity',
      path: '/shelters',
      icon: Building2,
      description: 'Update occupancy, thresholds, and operational status',
    },
    {
      label: 'Supplies & Donor Pledges',
      path: '/coordinator',
      icon: ClipboardList,
      description: 'Manage inventory needs & verify donor pledges',
    },
    {
      label: 'Volunteer Task Board',
      path: '/tasks',
      icon: Users,
      description: 'Manage tasks and review volunteer applicant rosters',
    },
    {
      label: 'Create Volunteer Task',
      path: '/tasks/new',
      icon: PlusCircle,
      description: 'Publish verified task requests for community aid',
    },
    {
      label: 'Emergency Alerts & Notices',
      path: '/alerts',
      icon: Bell,
      description: 'Manage official hazard warnings and public notices',
    },
    {
      label: 'Post Emergency Alert',
      path: '/alerts/new',
      icon: PlusCircle,
      description: 'Draft and publish official hazard advisory',
    },
  ],
};

/**
 * Normalizes legacy coordinator role to administrator
 */
export const getNavItemsForRole = (role) => {
  const normalized = role === 'coordinator' ? 'administrator' : role;
  return DASHBOARD_NAV_CONFIG[normalized] || DASHBOARD_NAV_CONFIG.citizen;
};
