import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Clock,
  UserCheck,
  UserX,
  Flag,
  FileText,
  Award,
} from 'lucide-react';
import {
  fetchVolunteers,
  updateVolunteerStatus,
  updateVolunteerReliability,
} from '../../services/volunteerAdminService';

const DISTRICT_LIST = [
  'All Districts',
  'Ampara District',
  'Anuradhapura District',
  'Badulla District',
  'Batticaloa District',
  'Colombo District',
  'Galle District',
  'Gampaha District',
  'Hambantota District',
  'Jaffna District',
  'Kalutara District',
  'Kandy District',
  'Kegalle District',
  'Kilinochchi District',
  'Kurunegala District',
  'Mannar District',
  'Matale District',
  'Matara District',
  'Monaragala District',
  'Mullaitivu District',
  'Nuwara Eliya District',
  'Polonnaruwa District',
  'Puttalam District',
  'Ratnapura District',
  'Trincomalee District',
  'Vavuniya District',
];

export default function VolunteerVettingQueue() {
  const [volunteers, setVolunteers] = useState([]);
  const [summary, setSummary] = useState({
    totalVolunteers: 0,
    pendingReview: 0,
    verifiedCount: 0,
    flaggedCount: 0,
    suspendedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All Districts');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionInProgress, setActionInProgress] = useState(null);

  // Note editing state: { volunteerId: string, note: string }
  const [editingNoteFor, setEditingNoteFor] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');

  const loadVolunteers = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter !== 'All') {
        params.status = statusFilter;
      }
      if (districtFilter !== 'All Districts') {
        params.district = districtFilter;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await fetchVolunteers(params);
      if (res.success) {
        setVolunteers(res.volunteers || []);
        if (res.summary) {
          setSummary(res.summary);
        }
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load volunteers:', err);
      setError(err.message || 'Unable to retrieve volunteer records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, districtFilter, searchQuery]);

  useEffect(() => {
    loadVolunteers();
  }, [loadVolunteers]);

  // One-click status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionInProgress(id);
      await updateVolunteerStatus(id, newStatus);
      await loadVolunteers();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  // Reliability metric adjustment (+1 Completed, +1 No-Show)
  const handleReliabilityAction = async (id, action) => {
    try {
      setActionInProgress(id);
      await updateVolunteerReliability(id, action);
      await loadVolunteers();
    } catch (err) {
      alert(`Metric update failed: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  // Save coordinator evaluation note
  const handleSaveNote = async (id) => {
    try {
      setActionInProgress(id);
      await updateVolunteerReliability(id, 'updateNotes', noteDraft);
      setEditingNoteFor(null);
      await loadVolunteers();
    } catch (err) {
      alert(`Failed to save note: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return {
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold',
          icon: ShieldCheck,
          label: 'NIC Verified & Approved',
        };
      case 'Pending_Review':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300 font-bold',
          icon: Clock,
          label: 'Pending Review',
        };
      case 'Flagged':
        return {
          bg: 'bg-orange-50 text-orange-950 border-orange-300 font-bold',
          icon: Flag,
          label: 'Flagged / Attendance Risk',
        };
      case 'Suspended':
        return {
          bg: 'bg-rose-50 text-rose-950 border-rose-300 font-bold',
          icon: XCircle,
          label: 'Suspended Account',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-300 font-semibold',
          icon: Users,
          label: status || 'Unreviewed',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Total Volunteers
            </span>
            <Users size={15} />
          </div>
          <p className="text-2xl font-black text-slate-900">{summary.totalVolunteers}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Registered personnel roster</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Pending Review
            </span>
            <Clock size={15} />
          </div>
          <p className="text-2xl font-black text-slate-900">{summary.pendingReview}</p>
          <p className="text-[11px] font-medium text-amber-800 mt-0.5">Awaiting coordinator check</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              NIC Verified
            </span>
            <ShieldCheck size={15} />
          </div>
          <p className="text-2xl font-black text-slate-900">{summary.verifiedCount}</p>
          <p className="text-[11px] font-medium text-emerald-800 mt-0.5">Authenticated citizens</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-rose-800 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
              Flagged / Suspended
            </span>
            <Flag size={15} />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {summary.flaggedCount + summary.suspendedCount}
          </p>
          <p className="text-[11px] font-medium text-rose-800 mt-0.5">
            {summary.flaggedCount} flagged, {summary.suspendedCount} suspended
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Volunteer Name, Email, Phone, or Sri Lankan NIC..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
            />
          </div>

          {/* District Filter Dropdown */}
          <div className="relative min-w-[200px]">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 transition-colors cursor-pointer"
            >
              {DISTRICT_LIST.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              loadVolunteers();
            }}
            disabled={refreshing || loading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs font-semibold">
          {[
            { key: 'All', label: 'All Volunteers', count: summary.totalVolunteers },
            {
              key: 'Pending_Review',
              label: 'Pending Review',
              count: summary.pendingReview,
              badgeClass: 'bg-amber-100 text-amber-900',
            },
            {
              key: 'Verified',
              label: 'NIC Verified',
              count: summary.verifiedCount,
              badgeClass: 'bg-emerald-100 text-emerald-900',
            },
            {
              key: 'Flagged',
              label: 'Flagged',
              count: summary.flaggedCount,
              badgeClass: 'bg-orange-100 text-orange-900',
            },
            {
              key: 'Suspended',
              label: 'Suspended',
              count: summary.suspendedCount,
              badgeClass: 'bg-rose-100 text-rose-900',
            },
          ].map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      active
                        ? 'bg-white/20 text-white'
                        : tab.badgeClass || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle size={15} className="text-red-700 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Volunteer Directory Listing */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-xl">
          <RefreshCw size={18} className="animate-spin mx-auto text-slate-400 mb-2" />
          <span>Loading volunteer vetting records...</span>
        </div>
      ) : volunteers.length === 0 ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-2">
          <Users size={28} className="mx-auto text-slate-300" />
          <h4 className="font-bold text-slate-800 text-sm">No Volunteers Matching Filter</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria, district selection, or status filter tabs.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {volunteers.map((vol) => {
            const statusConfig = getStatusBadge(vol.volunteerStatus);
            const StatusIcon = statusConfig.icon;
            const reliability = vol.volunteerReliability || {
              tasksCompleted: 0,
              noShows: 0,
              notes: '',
            };
            const totalEvents = reliability.tasksCompleted + reliability.noShows;
            const reliabilityScore =
              totalEvents > 0
                ? Math.round((reliability.tasksCompleted / totalEvents) * 100)
                : null;
            const isBusy = actionInProgress === vol._id;
            const isEditingNote = editingNoteFor === vol._id;

            return (
              <div
                key={vol._id}
                className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs transition hover:border-slate-300 space-y-3.5"
              >
                {/* Top Row: Name, Status Badge, Application Counts */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {vol.name}
                    </span>

                    {/* Vetting Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] border ${statusConfig.bg}`}
                    >
                      <StatusIcon size={12} />
                      <span>{statusConfig.label}</span>
                    </span>

                    {/* Active applied tasks count */}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {vol.appliedTasksCount || 0} Task Application(s)
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: #{vol._id.slice(-6).toUpperCase()} &bull; Joined{' '}
                    {new Date(vol.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Middle Grid: NIC Demographics vs Contact vs Reliability */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                  {/* Column 1: Government National Identity Card (NIC) Demographics */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                        <Award size={12} className="text-slate-600" />
                        <span>Identity Verification</span>
                      </span>
                      {vol.nicNumber ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-300">
                          {vol.nicDetails?.format || 'VALID'} NIC
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-300">
                          NIC Missing
                        </span>
                      )}
                    </div>

                    {vol.nicNumber ? (
                      <div className="space-y-1">
                        <p className="font-mono font-bold text-slate-900 text-xs">
                          NIC: {vol.nicNumber}
                        </p>
                        {vol.nicDetails?.isValidated && (
                          <div className="text-[11px] text-slate-600 space-y-0.5">
                            <p>
                              <span className="font-semibold text-slate-700">Gender: </span>
                              {vol.nicDetails.gender || 'Not specified'}
                            </p>
                            <p>
                              <span className="font-semibold text-slate-700">Born: </span>
                              {vol.nicDetails.dobDisplay || vol.nicDetails.birthYear} (
                              ~{vol.nicDetails.approximateAge} yrs)
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        Citizen registered before strict NIC enforcement was active.
                      </p>
                    )}
                  </div>

                  {/* Column 2: Contact Details & Location */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                      <Phone size={12} className="text-slate-600" />
                      <span>Contact &amp; District</span>
                    </span>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate">{vol.district || 'Ampara District'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={11} className="text-slate-400 shrink-0" />
                        {vol.phone ? (
                          <a
                            href={`tel:${vol.phone}`}
                            className="font-mono text-blue-700 font-bold hover:underline"
                          >
                            {vol.phone}
                          </a>
                        ) : (
                          <span className="text-slate-400">No phone provided</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail size={11} className="text-slate-400 shrink-0" />
                        <a
                          href={`mailto:${vol.email}`}
                          className="text-slate-600 hover:text-blue-700 hover:underline truncate"
                        >
                          {vol.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Reliability & Attendance Telemetry */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                        <Award size={12} className="text-slate-600" />
                        <span>Reliability &amp; Attendance</span>
                      </span>
                      {reliabilityScore !== null && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            reliabilityScore >= 80
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : reliabilityScore >= 50
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-rose-50 text-rose-900 border-rose-300'
                          }`}
                        >
                          {reliabilityScore}% Reliability
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-1 bg-white rounded border border-slate-200 text-center">
                        <span className="text-[9px] font-bold text-emerald-800 uppercase block">
                          Completed
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          {reliability.tasksCompleted}
                        </span>
                      </div>
                      <div className="flex-1 p-1 bg-white rounded border border-slate-200 text-center">
                        <span className="text-[9px] font-bold text-rose-800 uppercase block">
                          No-Shows
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          {reliability.noShows}
                        </span>
                      </div>
                    </div>

                    {/* Quick increment buttons */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleReliabilityAction(vol._id, 'incrementCompleted')}
                        disabled={isBusy}
                        className="flex-1 py-1 text-[10px] font-bold bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-300 rounded transition cursor-pointer"
                        title="Record successfully completed task"
                      >
                        +1 Completed
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReliabilityAction(vol._id, 'incrementNoShow')}
                        disabled={isBusy}
                        className="flex-1 py-1 text-[10px] font-bold bg-white hover:bg-rose-50 text-rose-800 border border-slate-300 rounded transition cursor-pointer"
                        title="Record unexcused no-show (auto-flags at 3 absences)"
                      >
                        +1 No-Show
                      </button>
                    </div>
                  </div>
                </div>

                {/* Coordinator Note Section */}
                {reliability.notes && !isEditingNote && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5">
                      <FileText size={13} className="text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800">Coordinator Evaluation: </span>
                        <span className="text-slate-700">{reliability.notes}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoteFor(vol._id);
                        setNoteDraft(reliability.notes);
                      }}
                      className="text-[10px] font-bold text-blue-700 hover:underline shrink-0 cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                )}

                {/* Inline Note Editor */}
                {isEditingNote && (
                  <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Coordinator Evaluation Note for {vol.name}:
                    </label>
                    <textarea
                      rows={2}
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="e.g. Reliable driver with light truck, punctual during Akkaraipattu dry ration distribution..."
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                    <div className="flex items-center justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setEditingNoteFor(null)}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveNote(vol._id)}
                        disabled={isBusy}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md cursor-pointer"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Action Bar: Verify, Flag, Suspend, Add Note */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    {!reliability.notes && !isEditingNote && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNoteFor(vol._id);
                          setNoteDraft('');
                        }}
                        className="px-2 py-1 rounded text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition cursor-pointer"
                      >
                        + Add Coordinator Note
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* One-click: Verify */}
                    {vol.volunteerStatus !== 'Verified' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(vol._id, 'Verified')}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold rounded-md transition shadow-xs cursor-pointer"
                        title="Approve and verify volunteer for relief deployment"
                      >
                        <UserCheck size={13} />
                        <span>Verify Volunteer</span>
                      </button>
                    )}

                    {/* One-click: Flag */}
                    {vol.volunteerStatus !== 'Flagged' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(vol._id, 'Flagged')}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-orange-50 text-orange-800 border border-orange-300 font-bold rounded-md transition cursor-pointer"
                        title="Flag account for suspicious attendance or coordinator review"
                      >
                        <Flag size={12} />
                        <span>Flag Account</span>
                      </button>
                    )}

                    {/* One-click: Suspend */}
                    {vol.volunteerStatus !== 'Suspended' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(vol._id, 'Suspended')}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 font-bold rounded-md transition cursor-pointer"
                        title="Suspend volunteer from applying for disaster relief tasks"
                      >
                        <UserX size={12} />
                        <span>Suspend</span>
                      </button>
                    )}

                    {/* One-click: Revert to Pending */}
                    {(vol.volunteerStatus === 'Flagged' ||
                      vol.volunteerStatus === 'Suspended') && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(vol._id, 'Pending_Review')}
                        disabled={isBusy}
                        className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 underline font-medium cursor-pointer"
                        title="Revert status back to Pending Review"
                      >
                        Re-evaluate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
