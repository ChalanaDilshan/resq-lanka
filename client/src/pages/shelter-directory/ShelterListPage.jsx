import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Building2,
  Waves,
  TreePine,
  PlusCircle,
  Sliders,
  AlertCircle,
  RefreshCw,
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
  const [searchParams] = useSearchParams();
  const { user, activeRole } = useAuth();
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
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const refreshData = () => {
    setReloadTrigger((prev) => prev + 1);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Trigger data load on filter change with cancellation guard
  useEffect(() => {
    let isCancelled = false;

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
        if (!isCancelled) {
          setShelters(shelterList);
          setStats(shelterStats);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to load shelter directory:', err);
          setError('Unable to fetch live shelter records from server. Showing cached directory.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [hazardFilter, districtFilter, statusFilter, searchQuery, reloadTrigger]);

  // Handle coordinator occupancy update
  const handleSaveOccupancy = async (id, payload) => {
    try {
      const updated = await updateShelterOccupancyAndCapacity(id, payload);
      // Update local state
      setShelters((prev) =>
        prev.map((s) => (String(s._id) === String(id) || String(s.id) === String(id) ? updated : s))
      );
      if (
        selectedShelter &&
        (String(selectedShelter._id) === String(id) || String(selectedShelter.id) === String(id))
      ) {
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
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl flex items-center gap-2.5 border border-slate-700 animate-fadeIn">
          <svg
            className="w-4 h-4 text-sky-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header: Dignified Civil Protection Identity */}
      <section className="bg-slate-900 text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 text-xs font-medium mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Disaster Management Centre (DMC) Sri Lanka • Civil Protection</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Safe Shelter & Evacuation Directory
              </h1>
              <p className="mt-2 text-slate-300 text-sm leading-relaxed max-w-2xl">
                Real-time registry of certified disaster relief safe havens categorized by hazard vulnerability profile:
                elevated vertical refuge for flood inundations and open perimeter assembly grounds for seismic tremors.
              </p>
            </div>

            {/* Coordinator Actions Banner */}
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isAuthorizedManager && (
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    <span>
                      {activeRole === 'administrator' || user?.role === 'administrator'
                        ? 'Administrator Active'
                        : 'Coordinator Active'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(true)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-md text-xs font-semibold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <PlusCircle size={15} />
                    <span>Register New Shelter</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-20">
        {/* Error Notification Banner */}
        {error && (
          <div className="mb-4 p-3.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-slate-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={refreshData}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-md font-semibold text-xs transition"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Statistics Banner */}
        <ShelterStatsBanner stats={stats} />

        {/* Hazard Category Filter Tabs */}
        <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-slate-200 shadow-xs mb-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Categorized hazard buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setHazardFilter('all')}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                hazardFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-transparent'
              }`}
            >
              <Building2 size={14} />
              <span>All Safe Havens</span>
              {stats && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                    hazardFilter === 'all'
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {stats.totalShelters}
                </span>
              )}
            </button>

            {/* High-Ground Facilities for Floods */}
            <button
              type="button"
              onClick={() => setHazardFilter('flood')}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                hazardFilter === 'flood'
                  ? 'bg-sky-900 text-white shadow-xs'
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200'
              }`}
            >
              <Waves size={14} className="text-sky-600" />
              <span>High-Ground (Floods)</span>
              {stats && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                    hazardFilter === 'flood'
                      ? 'bg-sky-800 text-white'
                      : 'bg-sky-100 text-sky-900'
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
              className={`px-3.5 py-2 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                hazardFilter === 'earthquake'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300'
              }`}
            >
              <TreePine size={14} className="text-stone-600" />
              <span>Open Assembly (Earthquakes)</span>
              {stats && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                    hazardFilter === 'earthquake'
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-200 text-stone-900'
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
            onClick={refreshData}
            title="Refresh directory"
            className="self-end md:self-auto p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-xs font-semibold transition flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>

        {/* Secondary Filter & Search Toolbar */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search
                size={15}
                className="absolute left-3 top-2.5 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shelter by name, street address, coordinator, facilities..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-medium text-slate-800"
              />
            </div>

            {/* District Filter */}
            <div className="sm:col-span-3">
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-medium text-slate-800"
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
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-medium text-slate-800"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 px-0.5 gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
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
            <div className="text-xs text-slate-700 font-medium bg-slate-100 px-3 py-1 rounded-md border border-slate-200 flex items-center gap-1.5 self-start sm:self-auto">
              <Sliders size={12} className="text-slate-600" />
              <span>Coordinator intake permissions enabled</span>
            </div>
          )}
        </div>

        {/* Shelters Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl border border-slate-200 h-96 animate-pulse p-4 flex flex-col justify-between"
              >
                <div className="w-full h-44 bg-slate-100 rounded-lg" />
                <div className="space-y-2 mt-4">
                  <div className="w-3/4 h-5 bg-slate-100 rounded" />
                  <div className="w-1/2 h-4 bg-slate-100 rounded" />
                </div>
                <div className="w-full h-10 bg-slate-100 rounded-md mt-4" />
              </div>
            ))}
          </div>
        ) : shelters.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center max-w-md mx-auto">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">
              No shelters found matching criteria
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
              className="px-3.5 py-2 bg-slate-900 text-white rounded-md text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {shelters.map((shelter) => (
              <ShelterCard
                key={shelter._id || shelter.id}
                shelter={shelter}
                isCoordinator={isAuthorizedManager}
                onOpenOccupancyModal={(sh) => setEditingShelter(sh)}
                onSelectShelter={(sh) => setSelectedShelter(sh)}
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
