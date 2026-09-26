import { useState } from 'react';
import { Search, Filter } from 'lucide-react';

export default function SOSDashboard() {
  const [requests, setRequests] = useState([
    { _id: '1', hazardType: 'Flood', locationText: 'Gampaha Town, Near Clock Tower', contactNumber: '0711234567', description: 'Water level at 4 feet and rising. 3 children stranded.', status: 'Pending' },
    { _id: '2', hazardType: 'Earthquake', locationText: 'Kandy Road, Digana', contactNumber: '0779876543', description: 'Boundary wall collapsed, road blocked.', status: 'In Progress' },
    { _id: '3', hazardType: 'Flood', locationText: 'Sedawatta, Wellampitiya', contactNumber: '0754433221', description: 'Evacuation boat requested for elderly resident.', status: 'Resolved' }
  ]);

  const [statusFilter, setStatusFilter] = useState('All');
  const [hazardFilter, setHazardFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const updateStatus = (id, newStatus) => {
    setRequests(prev => prev.map(req => req._id === id ? { ...req, status: newStatus } : req));
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesHazard = hazardFilter === 'All' || req.hazardType === hazardFilter;
    const matchesSearch = req.locationText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.contactNumber.includes(searchTerm);
    return matchesStatus && matchesHazard && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">SOS Incident Management</h2>
          <p className="text-gray-500 text-sm">Review, triage, and update community disaster help requests.</p>
        </div>
        <div className="text-sm font-semibold bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200">
          Total Incidents: {requests.length}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search location or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Hazard:</span>
            <select
              value={hazardFilter}
              onChange={(e) => setHazardFilter(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm outline-none"
            >
              <option value="All">All Hazards</option>
              <option value="Flood">Flood</option>
              <option value="Earthquake">Earthquake</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRequests.map((req) => (
          <div key={req._id} className="bg-white rounded-lg shadow-sm border p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{req.hazardType}</span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(req.status)}`}>
                  {req.status}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{req.locationText}</h3>
              <p className="text-sm text-gray-600 mb-2"><strong>Contact:</strong> {req.contactNumber}</p>
              <p className="text-sm bg-gray-50 border p-3 rounded text-gray-700 mb-4">{req.description}</p>
            </div>

            <div className="border-t pt-3 flex items-center justify-between text-xs gap-2">
              <button
                onClick={() => updateStatus(req._id, 'In Progress')}
                disabled={req.status === 'In Progress'}
                className="flex-1 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium disabled:opacity-40 transition"
              >
                In Progress
              </button>
              <button
                onClick={() => updateStatus(req._id, 'Resolved')}
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
            No emergency reports match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}