import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Search, Filter, Map as MapIcon, LayoutGrid, Clock, Flame, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchSOSRequests, updateSOSStatus } from '../../services/sosService';
import { formatTimeAgo } from '../../utils/timeAgo';

const mapContainerStyle = { width: '100%', height: '520px', borderRadius: '0.5rem' };
const srilankaCenter = { lat: 7.8731, lng: 80.7718 };

export default function SOSDashboard() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
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

  const loadIncidents = useCallback(async () => {
    try {
      const data = await fetchSOSRequests({
        status: statusFilter,
        hazard: hazardFilter,
        urgency: urgencyFilter
      });
      setRequests(data);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.message || 'Failed to fetch live emergency incidents.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, hazardFilter, urgencyFilter]);

  // Initial load and filter change trigger
  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  // 10-second polling interval
  useEffect(() => {
    if (!isAutoPolling) return;
    const interval = setInterval(() => {
      loadIncidents();
    }, 10000);
    return () => clearInterval(interval);
  }, [isAutoPolling, loadIncidents]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await updateSOSStatus(id, newStatus);
      setRequests((prev) => prev.map((req) => (req._id === id ? updated : req)));
      if (selectedIncident && selectedIncident._id === id) {
        setSelectedIncident(updated);
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const term = searchTerm.toLowerCase();
    return (
      req.locationText.toLowerCase().includes(term) ||
      req.description.toLowerCase().includes(term) ||
      req.contactNumber.includes(term)
    );
  });

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-600 text-white font-black animate-pulse';
      case 'High': return 'bg-orange-500 text-white font-bold';
      case 'Medium': return 'bg-amber-100 text-amber-900 border border-amber-300';
      case 'Low': return 'bg-blue-50 text-blue-800 border border-blue-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-red-100 text-red-800 border-red-300';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">SOS Incident Management</h2>
          <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAutoPolling ? 'bg-green-400' : 'bg-gray-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isAutoPolling ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </span>
            <span>{isAutoPolling ? 'Live auto-refresh active (10s)' : 'Live updates paused'}</span>
            <span>• Last checked: {lastRefreshed.toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAutoPolling((prev) => !prev)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition ${
              isAutoPolling ? 'bg-green-50 text-green-700 border-green-300' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <RefreshCw size={13} className={isAutoPolling ? 'animate-spin' : ''} />
            <span>{isAutoPolling ? 'Polling On' : 'Polling Off'}</span>
          </button>

          <div className="flex items-center space-x-1 bg-white border p-1 rounded-lg">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-semibold ${viewMode === 'cards' ? 'bg-red-600 text-white' : 'text-gray-600'}`}
            >
              <LayoutGrid size={15} />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-semibold ${viewMode === 'map' ? 'bg-red-600 text-white' : 'text-gray-600'}`}
            >
              <MapIcon size={15} />
              <span>Live Map</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-lg mb-4 text-sm flex items-center space-x-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={17} />
          <input
            type="text"
            placeholder="Search location or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border rounded text-sm outline-none focus:border-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-sm">
          <div className="flex items-center space-x-1.5">
            <Flame size={15} className="text-red-500" />
            <span className="text-xs font-semibold text-gray-600">Urgency:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="border rounded px-2 py-1 text-xs outline-none font-medium"
            >
              <option value="All">All Urgencies</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <Filter size={15} className="text-gray-500" />
            <span className="text-xs font-semibold text-gray-600">Hazard:</span>
            <select
              value={hazardFilter}
              onChange={(e) => setHazardFilter(e.target.value)}
              className="border rounded px-2 py-1 text-xs outline-none"
            >
              <option value="All">All Hazards</option>
              <option value="Flood">Flood</option>
              <option value="Earthquake">Earthquake</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-gray-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-2 py-1 text-xs outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading incident data from MongoDB...</div>
      ) : viewMode === 'map' ? (
        <div className="bg-white p-3 rounded-lg shadow-sm border">
          {isLoaded ? (
            <GoogleMap mapContainerStyle={mapContainerStyle} center={srilankaCenter} zoom={8}>
              {filteredRequests.map((req) => (
                <Marker
                  key={req._id}
                  position={{ lat: req.coordinates?.lat || 6.9271, lng: req.coordinates?.lng || 79.8612 }}
                  onClick={() => setSelectedIncident(req)}
                />
              ))}

              {selectedIncident && (
                <InfoWindow
                  position={{
                    lat: selectedIncident.coordinates?.lat || 6.9271,
                    lng: selectedIncident.coordinates?.lng || 79.8612
                  }}
                  onCloseClick={() => setSelectedIncident(null)}
                >
                  <div className="p-2 max-w-xs">
                    <div className="flex justify-between items-center mb-1 gap-2">
                      <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${getUrgencyBadge(selectedIncident.urgency)}`}>
                        {selectedIncident.urgency}
                      </span>
                      <span className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Clock size={11} /> {formatTimeAgo(selectedIncident.createdAt)}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">{selectedIncident.locationText}</h4>
                    <p className="text-xs text-gray-600 mt-1">{selectedIncident.description}</p>
                    <p className="text-xs font-semibold mt-1">Tel: {selectedIncident.contactNumber}</p>
                    <div className="mt-2 pt-2 border-t flex gap-1">
                      <button
                        onClick={() => handleStatusChange(selectedIncident._id, 'In Progress')}
                        disabled={selectedIncident.status === 'In Progress'}
                        className="bg-yellow-500 text-white text-xs px-2 py-1 rounded disabled:opacity-40"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedIncident._id, 'Resolved')}
                        disabled={selectedIncident.status === 'Resolved'}
                        className="bg-green-600 text-white text-xs px-2 py-1 rounded disabled:opacity-40"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400">Loading Map...</div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((req) => (
            <div key={req._id} className="bg-white rounded-lg shadow-sm border p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{req.hazardType}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${getUrgencyBadge(req.urgency)}`}>
                      {req.urgency}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(req.status)}`}>
                    {req.status}
                  </span>
                </div>

                <div className="flex items-center text-xs text-gray-400 mb-2 space-x-1">
                  <Clock size={12} />
                  <span>Reported {formatTimeAgo(req.createdAt)}</span>
                </div>

                <h3 className="font-bold text-gray-900 text-base mb-1">{req.locationText}</h3>
                <p className="text-xs text-gray-600 mb-2"><strong>Contact:</strong> {req.contactNumber}</p>
                <p className="text-xs bg-gray-50 border p-2.5 rounded text-gray-700 mb-4">{req.description}</p>
              </div>

              <div className="border-t pt-3 flex items-center justify-between text-xs gap-2">
                <button
                  onClick={() => handleStatusChange(req._id, 'In Progress')}
                  disabled={req.status === 'In Progress'}
                  className="flex-1 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium disabled:opacity-40 transition"
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleStatusChange(req._id, 'Resolved')}
                  disabled={req.status === 'Resolved'}
                  className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium disabled:opacity-40 transition"
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}
          {filteredRequests.length === 0 && (
            <div className="col-span-full text-center py-10 bg-white rounded border text-gray-500">
              No emergency reports found in the database.
            </div>
          )}
        </div>
      )}
    </div>
  );
}