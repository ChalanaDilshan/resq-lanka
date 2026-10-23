import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  PackageCheck,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
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
  const { user, activeRole, switchRole } = useAuth();

  // Active Tab derived directly from URL parameters & route
  const activeTab =
    location.pathname === '/coordinator'
      ? 'coordinator'
      : searchParams.get('tab') || 'board';

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

  const isCoordinatorOrAdmin =
    activeRole === 'coordinator' ||
    activeRole === 'administrator' ||
    user?.role === 'coordinator' ||
    user?.role === 'administrator';

  // Load all initial data from backend API
  const loadData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [itemsData, pledgesData, statsData] = await Promise.all([
        fetchSupplyItems(),
        fetchAllPledges(),
        fetchSupplyStats(),
      ]);
      setSupplies(itemsData);
      setPledges(pledgesData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading supply data:', err);
      setFetchError(err.message || 'Unable to load relief supply data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeRole]);

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  // Handle donor pledge submission
  const handlePledgeSuccess = async (itemId, pledgePayload) => {
    const result = await submitDonorPledge(itemId, pledgePayload);
    await loadData();
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
      await loadData();
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* =========================================================================
          TOP BANNER: RELIEF SUPPLY & DONATION COORDINATION
         ========================================================================= */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb / Category */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-semibold">
              <PackageCheck size={14} className="stroke-[2.5]" />
              <span>Module 3: Relief Supplies & Verified Donor Pledges</span>
            </div>

            {/* Role Switcher Pill */}
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3.5 py-1.5 rounded-2xl text-xs">
              <span className="text-slate-400 font-medium">Viewing as:</span>
              <span className="font-bold text-white capitalize bg-blue-600 px-2 py-0.5 rounded-lg">
                {activeRole}
              </span>
              <div className="flex gap-1 ml-2">
                {['citizen', 'volunteer', 'coordinator'].map((r) => (
                  <button
                    key={r}
                    onClick={() => switchRole(r)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                      activeRole === r
                        ? 'bg-white text-slate-900 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                Disaster Relief Supply Board
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mt-2 leading-relaxed">
                Connect directly with certified shelter coordinators. View urgent inventory needs, pledge essential
                relief items, and verify physically received stock arriving at flood and disaster staging centers.
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleTabChange('coordinator')}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-emerald-600/30"
              >
                <PlusCircle size={17} className="stroke-[2.5]" />
                <span>Coordinator: List Needed Items</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Supply Requests
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                {stats.totalRequests || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {stats.totalTargetUnits ? `${stats.totalTargetUnits} units target quota` : 'Across active centers'}
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Community Pledged
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">
                {stats.totalPledgedUnits || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {stats.percentPledged || 0}% of target quota pledged
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Physically In Stock
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                {stats.totalReceivedUnits || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Verified received at shelter desks
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Physical Fulfillment Rate
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                {stats.percentFulfilled || 0}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {stats.fulfilledRequests || 0} of {stats.totalRequests || 0} requests fully received
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          NAVIGATION TABS
         ========================================================================= */}
      <div className="sticky top-20 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 sm:space-x-8 overflow-x-auto scrollbar-none py-3">
            <button
              onClick={() => handleTabChange('board')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-bold rounded-xl transition ${
                activeTab === 'board'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Boxes size={18} />
              <span>Public Supply Request Board</span>
              <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full">
                {supplies.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('coordinator')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-bold rounded-xl transition ${
                activeTab === 'coordinator'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ClipboardList size={18} />
              <span>Coordinator Inventory Portal</span>
              {isCoordinatorOrAdmin && (
                <span className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white font-bold rounded-full">
                  Admin
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange('pledges')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-bold rounded-xl transition ${
                activeTab === 'pledges'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Truck size={18} />
              <span>Donor Pledge Tracking Ledger</span>
              <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full">
                {pledges.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <RefreshCw size={36} className="mx-auto text-blue-600 animate-spin mb-3" />
          <p className="text-sm font-bold text-slate-700">Connecting to Relief Supply Inventory...</p>
        </div>
      )}

      {fetchError && !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
              <span>{fetchError} Showing cached relief catalog data.</span>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 1: PUBLIC SUPPLY REQUEST BOARD & PLEDGE LOGIC
         ========================================================================= */}
      {!loading && activeTab === 'board' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Search & Category Filter Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-grow w-full">
                <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search item (e.g. Drinking Water, Rice, Baby Formula), shelter or notes..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open (Needs Pledges)</option>
                <option value="Partially Pledged">Partially Pledged</option>
                <option value="Fully Pledged">Fully Pledged (In Pipeline)</option>
                <option value="Fulfilled">Fulfilled (In Stock)</option>
              </select>

              {/* Urgency Filter */}
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500"
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
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1 flex-shrink-0">
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
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex-shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSupplies.map((item) => (
              <SupplyItemCard
                key={item._id}
                item={item}
                onPledgeClick={(it) => setSelectedPledgeItem(it)}
              />
            ))}
          </div>

          {filteredSupplies.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 mt-6">
              <Boxes size={40} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">No supply items match your search.</h3>
              <p className="text-xs text-slate-400 mt-1">
                Try selecting a different category or clearing filters.
              </p>
            </div>
          )}
        </main>
      )}

      {/* =========================================================================
          TAB 2: COORDINATOR INVENTORY & ITEM REQUEST FORM (Admin / Coordinator)
         ========================================================================= */}
      {!loading && activeTab === 'coordinator' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
          {/* Coordinator Action Notice */}
          <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-800/80 rounded-full text-xs font-semibold text-emerald-300 mb-2">
                <ShieldCheck size={14} />
                <span>Authorized Shelter Coordinator Dashboard</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                List Shelter Relief Items & Manage Inventory Quotas
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
                Publish verified humanitarian supply requests for your assigned shelter or staging area. Donors
                across Sri Lanka will see these items immediately on the public board.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form: List Needed Items (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <PlusCircle className="text-emerald-600 stroke-[2.5]" size={22} />
                <h3 className="text-xl font-bold text-slate-900">List Needed Supply Item</h3>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Fill in the item details and initial target quota.
              </p>

              {createSuccess && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                  <span>Supply item request published to community board successfully!</span>
                </div>
              )}

              {createError && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCoordinatorSubmit} className="space-y-4">
                {/* Item Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Category & Urgency */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      value={coordinatorForm.category}
                      onChange={(e) =>
                        setCoordinatorForm({ ...coordinatorForm, category: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Level *</label>
                    <select
                      value={coordinatorForm.urgency}
                      onChange={(e) =>
                        setCoordinatorForm({ ...coordinatorForm, urgency: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Quantity *</label>
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
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Unit of Measure *</label>
                    <select
                      value={coordinatorForm.unit}
                      onChange={(e) =>
                        setCoordinatorForm({ ...coordinatorForm, unit: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Shelter / Center *</label>
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
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">District *</label>
                    <input
                      type="text"
                      required
                      value={coordinatorForm.district}
                      onChange={(e) =>
                        setCoordinatorForm({ ...coordinatorForm, district: e.target.value })
                      }
                      placeholder="e.g. Ampara"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Coordinator Name & Contact */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Coordinator Name *</label>
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
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
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
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Drop-off Location Instructions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Context / Notes</label>
                  <textarea
                    rows="2"
                    value={coordinatorForm.notes}
                    onChange={(e) =>
                      setCoordinatorForm({ ...coordinatorForm, notes: e.target.value })
                    }
                    placeholder="Details about flood level, recipient demographic, etc."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingItem}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <PlusCircle size={17} />
                  <span>{creatingItem ? 'Publishing Request...' : 'Publish Supply Request to Community Board'}</span>
                </button>
              </form>
            </div>

            {/* Current Inventory Table (lg:col-span-7) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Current Inventory Quotas</h3>
                  <p className="text-xs text-slate-500">Live decrement tracker & physically verified stock</p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {supplies.length} Requests
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-y border-slate-100">
                    <tr>
                      <th className="py-3 px-3">Item & Location</th>
                      <th className="py-3 px-3">Target</th>
                      <th className="py-3 px-3">Pledged</th>
                      <th className="py-3 px-3">Received</th>
                      <th className="py-3 px-3">Remaining</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {supplies.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900 line-clamp-1">{item.itemName}</div>
                          <div className="text-[11px] text-slate-400">{item.shelterLocation}</div>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800">
                          {item.targetQuantity} {item.unit}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-blue-600">
                          {item.pledgedQuantity || 0}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-emerald-600">
                          {item.receivedQuantity || 0}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-red-600">
                          {item.remainingQuantity !== undefined ? item.remainingQuantity : item.targetQuantity - item.pledgedQuantity}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Fulfilled'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'Fully Pledged'
                                ? 'bg-purple-100 text-purple-800'
                                : item.status === 'Partially Pledged'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Remove "${item.itemName}" and its associated pledges from the relief board?`)) {
                                try {
                                  await deleteSupplyItem(item._id);
                                  await loadData();
                                } catch (err) {
                                  alert(err.message || 'Failed to delete supply item');
                                }
                              }
                            }}
                            className="text-red-500 hover:text-red-700 font-semibold text-xs ml-2"
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
        </main>
      )}

      {/* =========================================================================
          TAB 3: FUNCTIONAL DONOR PLEDGE TRACKING INTERFACE
         ========================================================================= */}
      {!loading && activeTab === 'pledges' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <PledgeLedgerTable
            pledges={pledges}
            isCoordinatorOrAdmin={isCoordinatorOrAdmin}
            onUpdateStatus={async (pledgeId, newStatus) => {
              await updatePledgeStatus(pledgeId, newStatus);
              await loadData();
            }}
            filterStatus={pledgeStatusFilter}
            onFilterChange={(st) => setPledgeStatusFilter(st)}
          />
        </main>
      )}

      {/* =========================================================================
          DONOR PLEDGE MODAL
         ========================================================================= */}
      {selectedPledgeItem && (
        <PledgeModal
          item={selectedPledgeItem}
          user={user}
          onClose={() => setSelectedPledgeItem(null)}
          onPledgeSuccess={handlePledgeSuccess}
          onViewTracker={() => handleTabChange('pledges')}
        />
      )}
    </div>
  );
}
