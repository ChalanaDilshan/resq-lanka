import { useState, useEffect } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import {
  Search,
  Filter,
  Map as MapIcon,
  LayoutGrid,
  Clock,
  Flame,
  RefreshCw,
  AlertCircle,
  Phone,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { fetchSOSRequests, updateSOSStatus } from '../../services/sosService';
import { formatTimeAgo } from '../../utils/timeAgo';
import { useAuth } from '../../context/AuthContext';

const mapContainerStyle = {
  width: '100%',
  height: '520px',
  borderRadius: '0.75rem',
};
const srilankaCenter = { lat: 7.8731, lng: 80.7718 };

export default function SOSDashboard() {
  const { user, activeRole } = useAuth();
  const isResponder =
    user &&
    ['administrator', 'coordinator', 'volunteer'].includes(
      activeRole || user.role
    );

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState('All');
  const [hazardFilter, setHazardFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [selectedIncident, setSelectedIncident] = useState(null);

  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isAutoPolling, setIsAutoPolling] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initial load and filter change trigger with cleanup
  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      try {
        const data = await fetchSOSRequests({
          status: statusFilter,
          hazard: hazardFilter,
          urgency: urgencyFilter,
          search: searchTerm,
        });
        if (!isCancelled) {
          setRequests(Array.isArray(data) ? data : []);
          setError(null);
          setLastRefreshed(new Date());
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Failed to fetch live emergency incidents.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    executeFetch();

    if (!isAutoPolling) {
      return () => {
        isCancelled = true;
      };
    }

    const interval = setInterval(executeFetch, 10000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [
    statusFilter,
    hazardFilter,
    urgencyFilter,
    searchTerm,
    isAutoPolling,
    refreshTrigger,
  ]);

  const handleStatusChange = async (id, newStatus) => {
    if (!isResponder) {
      alert('Only authorized relief volunteers and administrators can update incident status.');
      return;
    }

    try {
      const updated = await updateSOSStatus(id, newStatus);
      setRequests((prev) =>
        prev.map((req) => (req._id === id ? { ...req, ...updated } : req))
      );
      if (selectedIncident && selectedIncident._id === id) {
        setSelectedIncident((prev) => ({ ...prev, ...updated }));
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const term = searchTerm.toLowerCase();
    return (
      (req.locationText && req.locationText.toLowerCase().includes(term)) ||
      (req.description && req.description.toLowerCase().includes(term)) ||
      (req.hazardType && req.hazardType.toLowerCase().includes(term)) ||
      (req.contactNumber && req.contactNumber.includes(term))
    );
  });

  // Only incidents with valid coordinates are placed on Google Map
  const mapIncidents = filteredRequests.filter(
    (req) =>
      req.coordinates &&
      req.coordinates.hasCoordinates !== false &&
      typeof req.coordinates.lat === 'number' &&
      typeof req.coordinates.lng === 'number'
  );

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-red-600 text-white font-black animate-pulse';
      case 'High':
        return 'bg-orange-500 text-white font-bold';
      case 'Medium':
        return 'bg-amber-100 text-amber-900 border border-amber-300';
      case 'Low':
        return 'bg-blue-50 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-6 px-4 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            SOS Incident Management Feed
          </h1>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
            <span className="flex h-2 w-2 relative">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isAutoPolling ? 'bg-emerald-400' : 'bg-gray-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isAutoPolling ? 'bg-emerald-500' : 'bg-gray-400'
                }`}
              ></span>
            </span>
            <span>
              {isAutoPolling
                ? 'Live auto-refresh active (10s)'
                : 'Live auto-refresh paused'}
            </span>
            <span>• Last checked: {lastRefreshed.toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setRefreshTrigger((c) => c + 1)}
            title="Refresh incident list now"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsAutoPolling((prev) => !prev)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
              isAutoPolling
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <RefreshCw
              size={13}
              className={isAutoPolling ? 'animate-spin' : ''}
            />
            <span>{isAutoPolling ? 'Polling On' : 'Polling Off'}</span>
          </button>

          <div className="flex items-center space-x-1 bg-white border border-slate-200 p-1 rounded-xl shadow-2xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon size={14} />
              <span>Live Map ({mapIncidents.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Incident Reports
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {requests.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-red-200 bg-red-50/40">
          <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
            Pending Dispatch
          </div>
          <div className="text-2xl font-black text-red-600 mt-1">
            {requests.filter((r) => r.status === 'Pending').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-amber-200 bg-amber-50/40">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            Response In Progress
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {requests.filter((r) => r.status === 'In Progress').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-emerald-200 bg-emerald-50/40">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            Resolved / Safe
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {requests.filter((r) => r.status === 'Resolved').length}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-xl mb-4 text-xs flex items-center space-x-2">
          <AlertCircle size={17} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 mb-6 flex flex-col md:flex-row gap-3.5 items-center justify-between">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search incident landmark, hazard, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
            <Flame size={14} className="text-red-500" />
            <span className="font-bold text-slate-600">Urgency:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold outline-none text-slate-800 cursor-pointer"
            >
              <option value="All">All Urgencies</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
            <Filter size={14} className="text-slate-500" />
            <span className="font-bold text-slate-600">Hazard:</span>
            <select
              value={hazardFilter}
              onChange={(e) => setHazardFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold outline-none text-slate-800 cursor-pointer"
            >
              <option value="All">All Hazards</option>
              <option value="Flood">Flood</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Landslide">Landslide</option>
              <option value="Cyclone">Cyclone</option>
              <option value="Tsunami">Tsunami</option>
              <option value="Fire">Fire</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
            <span className="font-bold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold outline-none text-slate-800 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm font-semibold">
          Loading live incident feed...
        </div>
      ) : viewMode === 'map' ? (
        <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200">
          {loadError ? (
            <div className="h-96 flex flex-col items-center justify-center text-red-500 p-6 text-center">
              <AlertCircle size={32} className="mb-2" />
              <p className="font-bold text-sm">Google Maps failed to load.</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Please ensure a valid VITE_GOOGLE_MAPS_API_KEY is configured in your .env file, or switch to Cards view.
              </p>
            </div>
          ) : isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={srilankaCenter}
              zoom={8}
            >
              {mapIncidents.map((req) => (
                <Marker
                  key={req._id}
                  position={{
                    lat: req.coordinates.lat,
                    lng: req.coordinates.lng,
                  }}
                  onClick={() => setSelectedIncident(req)}
                />
              ))}

              {selectedIncident && selectedIncident.coordinates && (
                <InfoWindow
                  position={{
                    lat: selectedIncident.coordinates.lat,
                    lng: selectedIncident.coordinates.lng,
                  }}
                  onCloseClick={() => setSelectedIncident(null)}
                >
                  <div className="p-2 max-w-xs text-left">
                    <div className="flex justify-between items-center mb-1 gap-2">
                      <span
                        className={`text-[9.5px] uppercase px-1.5 py-0.5 rounded font-black ${getUrgencyBadge(
                          selectedIncident.urgency
                        )}`}
                      >
                        {selectedIncident.urgency}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                        <Clock size={11} />{' '}
                        {formatTimeAgo(selectedIncident.createdAt)}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {selectedIncident.locationText}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {selectedIncident.description}
                    </p>
                    <p className="text-xs font-semibold mt-1.5 text-slate-800 flex items-center gap-1">
                      <Phone size={11} /> Tel: {selectedIncident.contactNumber}
                    </p>

                    {isResponder && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200 flex gap-1">
                        <button
                          onClick={() =>
                            handleStatusChange(selectedIncident._id, 'Pending')
                          }
                          disabled={selectedIncident.status === 'Pending'}
                          className={`text-[11px] px-2 py-1 rounded font-bold transition ${
                            selectedIncident.status === 'Pending'
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-red-50'
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(selectedIncident._id, 'In Progress')
                          }
                          disabled={selectedIncident.status === 'In Progress'}
                          className={`text-[11px] px-2 py-1 rounded font-bold transition ${
                            selectedIncident.status === 'In Progress'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-amber-50'
                          }`}
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(selectedIncident._id, 'Resolved')
                          }
                          disabled={selectedIncident.status === 'Resolved'}
                          className={`text-[11px] px-2 py-1 rounded font-bold transition ${
                            selectedIncident.status === 'Resolved'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-emerald-50'
                          }`}
                        >
                          Resolved
                        </button>
                      </div>
                    )}
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : (
            <div className="h-96 flex items-center justify-center text-slate-400">
              Loading Google Map View...
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                      {req.hazardType}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${getUrgencyBadge(
                        req.urgency
                      )}`}
                    >
                      {req.urgency}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      req.status
                    )}`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="flex items-center text-xs text-slate-400 mb-2.5 space-x-1">
                  <Clock size={12} />
                  <span>Reported {formatTimeAgo(req.createdAt)}</span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base mb-1.5">
                  {req.locationText}
                </h3>

                <div className="text-xs text-slate-600 mb-2 flex items-center gap-1.5">
                  {req.contactNumber?.includes('*') ? (
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <Lock size={12} />
                      <span>{req.contactNumber}</span>
                      <span className="text-[10px] text-slate-400 font-sans">(Protected)</span>
                    </span>
                  ) : (
                    <a
                      href={`tel:${req.contactNumber}`}
                      className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Phone size={12} />
                      <span>{req.contactNumber}</span>
                    </a>
                  )}
                </div>

                <p className="text-xs bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-700 mb-4 leading-relaxed">
                  {req.description}
                </p>

                {req.coordinates &&
                  req.coordinates.hasCoordinates !== false &&
                  req.coordinates.lat && (
                    <div className="text-[11px] text-slate-400 mb-3 flex items-center gap-1">
                      <ShieldCheck size={13} className="text-emerald-600" />
                      <span>
                        Verified GPS: {req.coordinates.lat.toFixed(4)},{' '}
                        {req.coordinates.lng.toFixed(4)}
                      </span>
                    </div>
                  )}
              </div>

              {/* Responder Status Actions */}
              <div>
                <div className="border-t border-slate-100 pt-3">
                  {isResponder ? (
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">
                        Responder Status Action:
                      </div>
                      <div className="flex items-center justify-between text-xs gap-1.5">
                        <button
                          onClick={() => handleStatusChange(req._id, 'Pending')}
                          disabled={req.status === 'Pending'}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            req.status === 'Pending'
                              ? 'bg-red-600 text-white cursor-default shadow-xs'
                              : 'bg-slate-100 hover:bg-red-50 text-slate-700'
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(req._id, 'In Progress')
                          }
                          disabled={req.status === 'In Progress'}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            req.status === 'In Progress'
                              ? 'bg-amber-500 text-white cursor-default shadow-xs'
                              : 'bg-slate-100 hover:bg-amber-50 text-slate-700'
                          }`}
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(req._id, 'Resolved')
                          }
                          disabled={req.status === 'Resolved'}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            req.status === 'Resolved'
                              ? 'bg-emerald-600 text-white cursor-default shadow-xs'
                              : 'bg-slate-100 hover:bg-emerald-50 text-slate-700'
                          }`}
                        >
                          Resolved
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Status: <strong className="text-slate-700">{req.status}</strong></span>
                      <span className="italic">Login as responder to update</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs sm:text-sm font-semibold">
              No emergency reports found matching your selected filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}