import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Building2,
  Waves,
  TreePine,
  Filter,
  PlusCircle,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchShelters,
  fetchShelterStats,
  updateShelterOccupancyAndCapacity,
  createShelter,
} from '../../services/shelterService';
import ShelterCard from '../../components/mod2-shelter/ShelterCard';
import ShelterStatsBanner from '../../components/mod2-shelter/ShelterStatsBanner';
import OccupancyEditorModal from '../../components/mod2-shelter/OccupancyEditorModal';
import AddShelterModal from '../../components/mod2-shelter/AddShelterModal';
import ShelterDetailModal from '../../components/mod2-shelter/ShelterDetailModal';

export default function ShelterListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, activeRole, switchRole } = useAuth();
  const isAuthorizedManager = Boolean(
    user && ['administrator', 'coordinator'].includes(activeRole || user.role)
  );

  const [shelters, setShelters] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [hazardFilter, setHazardFilter] = useState(searchParams.get('hazard') || 'all');
  const [districtFilter, setDistrictFilter] = useState(searchParams.get('district') || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Modals
  const [editingShelter, setEditingShelter] = useState(null);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [shelterList, shelterStats] = await Promise.all([
        fetchShelters({
          hazardType: hazardFilter !== 'all' ? hazardFilter : undefined,
          district: districtFilter !== 'all' ? districtFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery.trim() || undefined,
        }),
        fetchShelterStats(),
      ]);
      setShelters(shelterList);
      setStats(shelterStats);
    } catch (err) {
      console.error('Failed to load shelter directory:', err);
      setError('Unable to fetch live shelter records from server. Showing cached directory.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger data load on filter change
  useEffect(() => {
    loadData();
  }, [hazardFilter, districtFilter, statusFilter, searchQuery]);

  // Handle coordinator occupancy update
  const handleSaveOccupancy = async (id, payload) => {
    try {
      const updated = await updateShelterOccupancyAndCapacity(id, payload);
      // Update local state
      setShelters((prev) =>
        prev.map((s) => (String(s._id) === String(id) || String(s.id) === String(id) ? updated : s))
      );
      if (selectedShelter && (String(selectedShelter._id) === String(id) || String(selectedShelter.id) === String(id))) {
        setSelectedShelter(updated);
      }
      // Refresh stats
      const newStats = await fetchShelterStats();
      setStats(newStats);
      showToast(`Occupancy updated successfully for ${updated.name}`);
    } catch (err) {
      showToast(err.message || 'Error updating shelter occupancy.');
      throw err;
    }
  };

  // Handle coordinator add shelter
  const handleAddShelter = async (shelterData) => {
    try {
      const created = await createShelter(shelterData);
      setShelters((prev) => [created, ...prev]);
      const newStats = await fetchShelterStats();
      setStats(newStats);
      showToast(`Verified shelter "${created.name}" registered successfully.`);
    } catch (err) {
      showToast(err.message || 'Error registering shelter.');
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-blue-900 via-slate-900 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        {/* Background Subtle Grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
                <ShieldCheck size={14} className="text-blue-400" />
                <span>Verified Public Emergency Infrastructure</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Safe Shelter Directory
              </h1>
              <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Real-time directory of verified safe havens categorized by hazard vulnerability:{' '}
                <strong className="text-cyan-300 font-bold">
                  High-Ground Facilities for floods
                </strong>{' '}
                vs.{' '}
                <strong className="text-emerald-300 font-bold">
                  Open Assembly Grounds for earthquakes
                </strong>
                .
              </p>
            </div>

            {/* Coordinator Actions Banner */}
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isAuthorizedManager ? (
                <>
                  <div className="px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      {activeRole === 'administrator' || user?.role === 'administrator'
                        ? 'Administrator Mode Active'
                        : 'Coordinator Mode Active'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(true)}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                  >
                    <PlusCircle size={16} />
                    <span>Register New Shelter</span>
                  </button>
                </>
              ) : (
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="text-slate-300 text-[11px]">
                    Are you a shelter coordinator or admin?
                  </div>
                  <button
                    type="button"
                    onClick={() => switchRole('administrator')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition shadow-xs"
                  >
                    Switch to Administrator
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {/* Error Notification Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl font-bold text-[11px] transition"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Statistics Banner */}
        <ShelterStatsBanner stats={stats} />

        {/* Hazard Category Filter Tabs */}
        <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200/90 shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Categorized hazard buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setHazardFilter('all')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
                hazardFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Building2 size={15} />
              <span>All Shelters</span>
              {stats && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-200">
                  {stats.totalShelters}
                </span>
              )}
            </button>

            {/* High-Ground Facilities for Floods */}
            <button
              type="button"
              onClick={() => setHazardFilter('flood')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
                hazardFilter === 'flood'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200/60'
              }`}
            >
              <Waves size={15} />
              <span>High-Ground Facilities (Floods)</span>
              {stats && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    hazardFilter === 'flood'
                      ? 'bg-cyan-800 text-white'
                      : 'bg-cyan-200 text-cyan-900'
                  }`}
                >
                  {stats.floodShelters}
                </span>
              )}
            </button>

            {/* Open Assembly Grounds for Earthquakes */}
            <button
              type="button"
              onClick={() => setHazardFilter('earthquake')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
                hazardFilter === 'earthquake'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/60'
              }`}
            >
              <TreePine size={15} />
              <span>Open Assembly Grounds (Earthquakes)</span>
              {stats && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    hazardFilter === 'earthquake'
                      ? 'bg-emerald-800 text-white'
                      : 'bg-emerald-200 text-emerald-900'
                  }`}
                >
                  {stats.earthquakeShelters}
                </span>
              )}
            </button>
          </div>

          {/* Quick refresh button */}
          <button
            type="button"
            onClick={loadData}
            title="Refresh directory"
            className="self-end md:self-auto p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Secondary Filter & Search Toolbar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search
                size={16}
                className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shelter by name, street address, coordinator, facilities..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-800"
              />
            </div>

            {/* District Filter */}
            <div className="sm:col-span-3">
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-blue-500 font-semibold text-slate-700"
              >
                <option value="all">All Districts</option>
                <option value="Ampara">Ampara District</option>
                <option value="Batticaloa">Batticaloa District</option>
                <option value="Colombo">Colombo District</option>
                <option value="Galle">Galle District</option>
                <option value="Kandy">Kandy District</option>
                <option value="Matara">Matara District</option>
              </select>
            </div>

            {/* Occupancy Status Filter */}
            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-blue-500 font-semibold text-slate-700"
              >
                <option value="all">All Capacities & Statuses</option>
                <option value="Available">Available Spaces Only</option>
                <option value="Nearly Full">Nearly Full (≥85%)</option>
                <option value="At Capacity">At Maximum Capacity</option>
                <option value="Closed">Closed Shelters</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shelters Listing Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {hazardFilter === 'flood'
                ? 'High-Ground Facilities for Floods'
                : hazardFilter === 'earthquake'
                ? 'Open Assembly Grounds for Earthquakes'
                : 'Verified Disaster Shelters'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {shelters.length} certified locations with live occupancy updates
            </p>
          </div>

          {isAuthorizedManager && (
            <div className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <Sliders size={13} />
              <span>You have permissions to update capacities & occupancies</span>
            </div>
          )}
        </div>

        {/* Shelters Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl border border-slate-200 h-96 animate-pulse p-4 flex flex-col justify-between"
              >
                <div className="w-full h-44 bg-slate-100 rounded-2xl" />
                <div className="space-y-2 mt-4">
                  <div className="w-3/4 h-5 bg-slate-100 rounded" />
                  <div className="w-1/2 h-4 bg-slate-100 rounded" />
                </div>
                <div className="w-full h-10 bg-slate-100 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : shelters.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              No shelters found matching filters
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Try adjusting the hazard category, district, or search keywords.
            </p>
            <button
              type="button"
              onClick={() => {
                setHazardFilter('all');
                setDistrictFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shelters.map((shelter) => (
              <ShelterCard
                key={shelter._id || shelter.id}
                shelter={shelter}
                isCoordinator={isAuthorizedManager}
                onOpenOccupancyModal={(sh) => setEditingShelter(sh)}
                onSelectShelter={(sh) => setSelectedShelter(sh)}
                onSwitchToCoordinator={() => switchRole('administrator')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Coordinator Occupancy & Capacity Editor Modal */}
      {editingShelter && (
        <OccupancyEditorModal
          shelter={editingShelter}
          onClose={() => setEditingShelter(null)}
          onSave={handleSaveOccupancy}
          coordinatorUser={user}
        />
      )}

      {/* Shelter Full Details Modal */}
      {selectedShelter && (
        <ShelterDetailModal
          shelter={selectedShelter}
          onClose={() => setSelectedShelter(null)}
          onOpenOccupancyModal={(sh) => setEditingShelter(sh)}
          isCoordinator={isAuthorizedManager}
          onSwitchToCoordinator={() => switchRole('administrator')}
        />
      )}

      {/* Add Shelter Modal (Coordinator) */}
      {addModalOpen && (
        <AddShelterModal
          onClose={() => setAddModalOpen(false)}
          onAdd={handleAddShelter}
          coordinatorUser={user}
        />
      )}
    </div>
  );
}
