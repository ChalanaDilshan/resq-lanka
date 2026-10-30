import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  PackageCheck,
  PlusCircle,
  Search,
  Filter,
  Truck,
  AlertTriangle,
  ShieldCheck,
  Boxes,
  ClipboardList,
  RefreshCw,
} from 'lucide-react';

import {
  fetchSupplyItems,
  createSupplyRequest,
  submitDonorPledge,
  fetchAllPledges,
  updatePledgeStatus,
  deleteSupplyItem,
  fetchSupplyStats,
} from '../../services/supplyService';
import { useAuth } from '../../context/AuthContext';

import SupplyItemCard from '../../components/mod3-supply/SupplyItemCard';
import PledgeModal from '../../components/mod3-supply/PledgeModal';
import PledgeLedgerTable from '../../components/mod3-supply/PledgeLedgerTable';

export default function SupplyBoardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { user, activeRole } = useAuth();

  const isCoordinatorOrAdmin =
    activeRole === 'coordinator' ||
    activeRole === 'administrator' ||
    user?.role === 'coordinator' ||
    user?.role === 'administrator';

  // Active Tab derived from URL parameters & route, strictly gated by role permissions
  const activeTabRaw =
    location.pathname === '/coordinator'
      ? 'coordinator'
      : searchParams.get('tab') || 'board';

  const activeTab =
    (activeTabRaw === 'coordinator' || activeTabRaw === 'pledges') && !isCoordinatorOrAdmin
      ? 'board'
      : activeTabRaw;

  // Data states
  const [supplies, setSupplies] = useState([]);
  const [pledges, setPledges] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    fulfilledRequests: 0,
    fullyPledgedRequests: 0,
    pledgesCount: 0,
    totalTargetUnits: 0,
    totalPledgedUnits: 0,
    totalReceivedUnits: 0,
    percentPledged: 0,
    percentFulfilled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Filters for public board
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Donor Pledge Modal State
  const [selectedPledgeItem, setSelectedPledgeItem] = useState(null);

  // Coordinator New Item Form State
  const [coordinatorForm, setCoordinatorForm] = useState({
    itemName: '',
    category: 'Drinking Water',
    urgency: 'High',
    targetQuantity: 100,
    unit: 'bottles',
    shelterLocation: 'Ampara Central College Relief Center',
    district: 'Ampara',
    coordinatorName: user?.name || 'Mr. N. Senanayake',
    coordinatorContact: '+94 63 222 2341',
    dropOffLocation: 'Shelter relief reception desk',
    notes: '',
  });
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createError, setCreateError] = useState('');
  const [creatingItem, setCreatingItem] = useState(false);

  // Pledge filter for tracking tab
  const [pledgeStatusFilter, setPledgeStatusFilter] = useState('All');

  const [reloadTrigger, setReloadTrigger] = useState(0);

  const refreshData = () => {
    setReloadTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const [itemsData, pledgesData, statsData] = await Promise.all([
          fetchSupplyItems(),
          fetchAllPledges(),
          fetchSupplyStats(),
        ]);
        if (!isCancelled) {
          setSupplies(itemsData);
          setPledges(pledgesData);
          setStats(statsData);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error loading supply data:', err);
          setFetchError(err.message || 'Unable to load relief supply data.');
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
  }, [activeRole, reloadTrigger]);

  const handleTabChange = (newTab) => {
    if ((newTab === 'coordinator' || newTab === 'pledges') && !isCoordinatorOrAdmin) {
      return;
    }
    setSearchParams({ tab: newTab });
  };

  // Handle donor pledge submission
  const handlePledgeSuccess = async (itemId, pledgePayload) => {
    const result = await submitDonorPledge(itemId, pledgePayload);
    refreshData();
    return result;
  };

  // Handle coordinator creating new supply item
  const handleCoordinatorSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess(false);

    if (!coordinatorForm.itemName.trim()) {
      setCreateError('Please enter a valid relief item name.');
      return;
    }

    const qty = Number(coordinatorForm.targetQuantity);
    if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      setCreateError('Target quantity must be a positive whole integer.');
      return;
    }

    if (!coordinatorForm.shelterLocation.trim()) {
      setCreateError('Please specify the destination shelter or relief center.');
      return;
    }

    setCreatingItem(true);
    try {
      await createSupplyRequest({
        ...coordinatorForm,
        targetQuantity: qty,
      });
      setCreateSuccess(true);
      setCoordinatorForm({
        itemName: '',
        category: 'Drinking Water',
        urgency: 'High',
        targetQuantity: 100,
        unit: 'bottles',
        shelterLocation: 'Ampara Central College Relief Center',
        district: 'Ampara',
        coordinatorName: user?.name || 'Mr. N. Senanayake',
        coordinatorContact: '+94 63 222 2341',
        dropOffLocation: 'Shelter relief reception desk',
        notes: '',
      });
      refreshData();
      setTimeout(() => setCreateSuccess(false), 4000);
    } catch (err) {
      setCreateError(err.message || 'Failed to publish supply request.');
    } finally {
      setCreatingItem(false);
    }
  };

  // Filter supplies for public board
  const filteredSupplies = supplies.filter((item) => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesUrgency = urgencyFilter === 'All' || item.urgency === urgencyFilter;
    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Fulfilled'
        ? item.status === 'Fulfilled' || (item.receivedQuantity >= item.targetQuantity)
        : statusFilter === 'Fully Pledged'
        ? item.status === 'Fully Pledged'
        : item.status === statusFilter;

    const matchesSearch =
      searchQuery.trim() === '' ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shelterLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesUrgency && matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col pb-20">
      {/* =========================================================================
          OPERATIONAL COMMAND BANNER: RELIEF SUPPLY & DONATION COORDINATION
         ========================================================================= */}
      <section className="bg-slate-900 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb / Category Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 border border-slate-700 text-sky-400 rounded-md text-xs font-medium">
              <PackageCheck size={15} />
              <span>DMC Relief Logistics & Donor Intake System</span>
            </div>

            {/* Authenticated Account Status */}
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1 rounded-md text-xs">
              <span className="text-slate-400 font-medium">Active Session:</span>
              <span className="font-semibold text-slate-200 capitalize">
                {user ? `${user.name} (${activeRole})` : 'Public Visitor'}
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Disaster Relief Supplies & Donor Board
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
                Direct coordination between certified disaster relief shelters and civil donors. Review real-time deficit
                quotas, pledge humanitarian supplies, and verify warehouse intake across Sri Lanka.
              </p>
            </div>

            {/* Quick Action Button - Coordinator Only */}
            {isCoordinatorOrAdmin && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleTabChange('coordinator')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 font-medium rounded-md text-xs sm:text-sm flex items-center gap-2 transition shadow-xs"
                >
                  <PlusCircle size={16} />
                  <span>Coordinator: List Needed Items</span>
                </button>
              </div>
            )}
          </div>

          {/* Integrated Telemetry Census Strip */}
          <div className="mt-8 bg-slate-800/90 border border-slate-700 rounded-xl p-4 sm:p-5 grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-700/80">
            <div className="pt-2 sm:pt-0 sm:px-3 first:pl-0">
              <div className="text-xs font-semibold text-slate-400">
                Active Supply Requests
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
                {stats.totalRequests || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {stats.totalTargetUnits ? `${stats.totalTargetUnits} units target quota` : 'Across assigned shelters'}
              </div>
            </div>

            <div className="pt-3 sm:pt-0 sm:px-3">
              <div className="text-xs font-semibold text-slate-400">
                Community Pledged
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-sky-400 mt-1">
                {stats.totalPledgedUnits || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {stats.percentPledged || 0}% of target quota in transit
              </div>
            </div>

            <div className="pt-3 sm:pt-0 sm:px-3">
              <div className="text-xs font-semibold text-slate-400">
                Physically In Stock
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-green-400 mt-1">
                {stats.totalReceivedUnits || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Inspected & confirmed at shelters
              </div>
            </div>

            <div className="pt-3 sm:pt-0 sm:px-3">
              <div className="text-xs font-semibold text-slate-400">
                Warehouse Intake Rate
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1">
                {stats.percentFulfilled || 0}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {stats.fulfilledRequests || 0} of {stats.totalRequests || 0} items fulfilled
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          NAVIGATION TABS (Only shown for authorized coordinators / administrators)
         ========================================================================= */}
      {isCoordinatorOrAdmin && (
        <div className="sticky top-20 z-40 bg-white border-b border-slate-200 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="bg-slate-100 p-1 rounded-lg inline-flex gap-1 border border-slate-200 overflow-x-auto max-w-full">
              <button
                onClick={() => handleTabChange('board')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm rounded-md transition ${
                  activeTab === 'board'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                <Boxes size={16} />
                <span>Public Supply Requests</span>
                <span className="px-2 py-0.2 bg-slate-200 text-slate-800 rounded-full text-xs font-semibold">
                  {supplies.length}
                </span>
              </button>

              <button
                onClick={() => handleTabChange('coordinator')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm rounded-md transition ${
                  activeTab === 'coordinator'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                <ClipboardList size={16} />
                <span>Coordinator Logistics Portal</span>
                <span className="px-2 py-0.2 bg-slate-800 text-slate-100 font-semibold rounded-full text-[10px]">
                  Staff
                </span>
              </button>

              <button
                onClick={() => handleTabChange('pledges')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm rounded-md transition ${
                  activeTab === 'pledges'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                <Truck size={16} />
                <span>Pledge Tracking Ledger</span>
                <span className="px-2 py-0.2 bg-slate-200 text-slate-800 rounded-full text-xs font-semibold">
                  {pledges.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN APPLICATION CONTENT CONTAINER
         ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex-grow w-full">
        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center">
            <RefreshCw size={32} className="mx-auto text-slate-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-700">Connecting to Relief Supply Inventory...</p>
          </div>
        )}

        {/* Error Notice */}
        {fetchError && !loading && (
          <div className="mb-6 p-3.5 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-between text-xs text-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
              <span>{fetchError} Displaying local relief catalog.</span>
            </div>
            <button
              onClick={refreshData}
              className="px-3 py-1 bg-slate-800 text-white font-medium rounded-md hover:bg-slate-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* TAB 1: PUBLIC SUPPLY REQUEST BOARD & PLEDGE LOGIC */}
        {!loading && activeTab === 'board' && (
          <div className="space-y-6">
            {/* Search & Category Filter Toolbar */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Bar */}
                <div className="relative flex-grow w-full">
                  <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search items (e.g. Bottled Water, Dry Rations, First Aid) or shelter centers..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 bg-white border border-slate-300 rounded-md text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-800"
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open (Needs Pledges)</option>
                  <option value="Partially Pledged">Partially Pledged</option>
                  <option value="Fully Pledged">Fully Pledged (In Transit)</option>
                  <option value="Fulfilled">Fulfilled (In Stock)</option>
                </select>

                {/* Urgency Filter */}
                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 bg-white border border-slate-300 rounded-md text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-800"
                >
                  <option value="All">All Urgencies</option>
                  <option value="Immediate">Immediate Priority</option>
                  <option value="High">High Urgency</option>
                  <option value="Medium">Medium Urgency</option>
                  <option value="Low">Low Urgency</option>
                </select>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1 flex-shrink-0">
                  <Filter size={14} />
                  <span>Categories:</span>
                </span>
                {[
                  'All',
                  'Drinking Water',
                  'Dry Rations & Food',
                  'Medical & First Aid',
                  'Baby & Infant Care',
                  'Bedding & Mats',
                  'Sanitary & Hygiene',
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`text-xs px-3 py-1.5 rounded-md transition flex-shrink-0 ${
                      categoryFilter === cat
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSupplies.map((item) => (
                <SupplyItemCard
                  key={item._id}
                  item={item}
                  onPledgeClick={(it) => setSelectedPledgeItem(it)}
                />
              ))}
            </div>

            {filteredSupplies.length === 0 && (
              <div className="text-center py-14 bg-white rounded-xl border border-slate-200">
                <Boxes size={36} className="mx-auto text-slate-400 mb-2" />
                <h3 className="text-sm font-semibold text-slate-800">No supply items match your search.</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try selecting a different category or clearing filters.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COORDINATOR INVENTORY & ITEM REQUEST FORM */}
        {!loading && activeTab === 'coordinator' && isCoordinatorOrAdmin && (
          <div className="space-y-8">
            {/* Coordinator Action Notice */}
            <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 shadow-xs">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-md text-xs font-semibold text-sky-400 mb-2 border border-slate-700">
                  <ShieldCheck size={14} />
                  <span>Shelter Coordinator Logistics Management</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Relief Item Intake & Inventory Quota Control
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Publish verified humanitarian supply requests for assigned evacuation shelters and staging areas.
                  Listed requirements synchronize in real time with the public donor board.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form: List Needed Items (lg:col-span-5) */}
              <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <PlusCircle className="text-slate-800" size={20} />
                  <h3 className="text-lg font-bold text-slate-900">List Needed Supply Item</h3>
                </div>
                <p className="text-xs text-slate-500 mb-5">
                  Specify item specifications and required delivery quotas.
                </p>

                {createSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-950 rounded-md text-xs flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-700 stroke-[2.5] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Supply item request published to community board successfully.</span>
                  </div>
                )}

                {createError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-300 text-rose-950 rounded-md text-xs flex items-center gap-2">
                    <AlertTriangle size={15} className="text-rose-600 flex-shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}

                <form onSubmit={handleCoordinatorSubmit} className="space-y-3.5">
                  {/* Item Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Item Name & Specification *
                    </label>
                    <input
                      type="text"
                      required
                      value={coordinatorForm.itemName}
                      onChange={(e) =>
                        setCoordinatorForm({ ...coordinatorForm, itemName: e.target.value })
                      }
                      placeholder="e.g. Bottled Drinking Water (5L)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  {/* Category & Urgency */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                      <select
                        value={coordinatorForm.category}
                        onChange={(e) =>
                          setCoordinatorForm({ ...coordinatorForm, category: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                      >
                        <option value="Drinking Water">Drinking Water</option>
                        <option value="Dry Rations & Food">Dry Rations & Food</option>
                        <option value="Medical & First Aid">Medical & First Aid</option>
                        <option value="Baby & Infant Care">Baby & Infant Care</option>
                        <option value="Bedding & Mats">Bedding & Mats</option>
                        <option value="Sanitary & Hygiene">Sanitary & Hygiene</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency Level *</label>
                      <select
                        value={coordinatorForm.urgency}
                        onChange={(e) =>
                          setCoordinatorForm({ ...coordinatorForm, urgency: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                      >
                        <option value="Immediate">Immediate Priority</option>
                        <option value="High">High Urgency</option>
                        <option value="Medium">Medium Urgency</option>
                        <option value="Low">Low Urgency</option>
                      </select>
                    </div>
                  </div>

                  {/* Target Quantity & Unit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Target Quantity *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="1000000"
                        value={coordinatorForm.targetQuantity}
                        onChange={(e) =>
                          setCoordinatorForm({
                            ...coordinatorForm,
                            targetQuantity: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure *</label>
                      <select
                        value={coordinatorForm.unit}
                        onChange={(e) =>
                          setCoordinatorForm({ ...coordinatorForm, unit: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                      >
                        <option value="bottles">bottles</option>
                        <option value="packs">packs</option>
                        <option value="kg">kg</option>
                        <option value="boxes">boxes</option>
                        <option value="sets">sets</option>
                        <option value="liters">liters</option>
                        <option value="units">units</option>
                      </select>
                    </div>
                  </div>

                  {/* Shelter Location & District */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Shelter / Center *</label>
                      <input
                        type="text"
                        required
                        value={coordinatorForm.shelterLocation}
                        onChange={(e) =>
                          setCoordinatorForm({
                            ...coordinatorForm,
                            shelterLocation: e.target.value,
                          })
                        }
                        placeholder="e.g. Ampara Central College"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">District *</label>
                      <input
                        type="text"
                        required
                        value={coordinatorForm.district}
                        onChange={(e) =>
                          setCoordinatorForm({ ...coordinatorForm, district: e.target.value })
                        }
                        placeholder="e.g. Ampara"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                    </div>
                  </div>

                  {/* Coordinator Name & Contact */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Coordinator Name *</label>
                      <input
                        type="text"
                        required
                        value={coordinatorForm.coordinatorName}
                        onChange={(e) =>
                          setCoordinatorForm({
                            ...coordinatorForm,
                            coordinatorName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone *</label>
                      <input
                        type="text"
                        required
                        value={coordinatorForm.coordinatorContact}
                        onChange={(e) =>
                          setCoordinatorForm({
                            ...coordinatorForm,
                            coordinatorContact: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                    </div>
                  </div>

                  {/* Drop-off Location Instructions */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Specific Drop-off / Dispatch Point
                    </label>
                    <input
                      type="text"
                      value={coordinatorForm.dropOffLocation}
                      onChange={(e) =>
                        setCoordinatorForm({
                          ...coordinatorForm,
                          dropOffLocation: e.target.value,
                        })
                      }
                      placeholder="e.g. Main Gate Receiving Bay, Room 4"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency Context / Notes</label>
                    <textarea
                      rows="2"
                      value={coordinatorForm.notes}
                      onChange={(e) =>
                        setCoordinatorForm({ ...coordinatorForm, notes: e.target.value })
                      }
                      placeholder="Details about flood level, recipient demographic, etc."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creatingItem}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md text-xs sm:text-sm transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <PlusCircle size={16} />
                    <span>{creatingItem ? 'Publishing Request...' : 'Publish Supply Request to Board'}</span>
                  </button>
                </form>
              </div>

              {/* Current Inventory Table (lg:col-span-7) */}
              <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Current Inventory Quotas</h3>
                    <p className="text-xs text-slate-500">Live decrement tracking & physically inspected stock</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    {supplies.length} Requests
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-700 border-y border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Item & Location</th>
                        <th className="py-2.5 px-3">Target</th>
                        <th className="py-2.5 px-3">Pledged</th>
                        <th className="py-2.5 px-3">Received</th>
                        <th className="py-2.5 px-3">Remaining</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {supplies.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900 line-clamp-1">{item.itemName}</div>
                            <div className="text-[11px] text-slate-500">{item.shelterLocation}</div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {item.targetQuantity} {item.unit}
                          </td>
                          <td className="py-3 px-3 font-semibold text-sky-700">
                            {item.pledgedQuantity || 0}
                          </td>
                          <td className="py-3 px-3 font-semibold text-green-700">
                            {item.receivedQuantity || 0}
                          </td>
                          <td className="py-3 px-3 font-bold text-rose-700">
                            {item.remainingQuantity !== undefined ? item.remainingQuantity : item.targetQuantity - item.pledgedQuantity}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${
                                item.status === 'Fulfilled'
                                  ? 'bg-green-100 text-green-950 border-green-300'
                                  : item.status === 'Fully Pledged'
                                  ? 'bg-sky-100 text-sky-950 border-sky-300'
                                  : item.status === 'Partially Pledged'
                                  ? 'bg-indigo-100 text-indigo-950 border-indigo-300'
                                  : 'bg-amber-100 text-amber-950 border-amber-300'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Remove "${item.itemName}" and its associated pledges from the relief board?`)) {
                                  try {
                                    await deleteSupplyItem(item._id);
                                    refreshData();
                                  } catch (err) {
                                    alert(err.message || 'Failed to delete supply item');
                                  }
                                }
                              }}
                              className="text-rose-700 hover:text-rose-900 font-semibold text-xs ml-2"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FUNCTIONAL DONOR PLEDGE TRACKING INTERFACE */}
        {!loading && activeTab === 'pledges' && isCoordinatorOrAdmin && (
          <div>
            <PledgeLedgerTable
              pledges={pledges}
              isCoordinatorOrAdmin={isCoordinatorOrAdmin}
              onUpdateStatus={async (pledgeId, newStatus) => {
                await updatePledgeStatus(pledgeId, newStatus);
                refreshData();
              }}
              filterStatus={pledgeStatusFilter}
              onFilterChange={(st) => setPledgeStatusFilter(st)}
            />
          </div>
        )}
      </main>

      {/* =========================================================================
          DONOR PLEDGE MODAL
         ========================================================================= */}
      {selectedPledgeItem && (
        <PledgeModal
          item={selectedPledgeItem}
          user={user}
          onClose={() => setSelectedPledgeItem(null)}
          onPledgeSuccess={handlePledgeSuccess}
          onViewTracker={isCoordinatorOrAdmin ? () => handleTabChange('pledges') : null}
        />
      )}
    </div>
  );
}
