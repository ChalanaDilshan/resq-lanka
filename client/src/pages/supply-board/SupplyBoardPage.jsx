import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  PackageCheck,
  HeartHandshake,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Phone,
  AlertTriangle,
  Users,
  ChevronRight,
  X,
  FileText,
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Boxes,
  ClipboardList,
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

export default function SupplyBoardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, activeRole, switchRole } = useAuth();

  // Tab State: 'board' | 'coordinator' | 'pledges'
  const tabParam = searchParams.get('tab') || 'board';
  const [activeTab, setActiveTab] = useState(tabParam);

  // Data states
  const [supplies, setSupplies] = useState([]);
  const [pledges, setPledges] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    fulfilledRequests: 0,
    pledgesCount: 0,
    totalTargetUnits: 0,
    totalPledgedUnits: 0,
    percentFulfilled: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters for public board
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Donor Pledge Modal State
  const [pledgeModalItem, setPledgeModalItem] = useState(null);
  const [pledgeForm, setPledgeForm] = useState({
    donorName: user?.name || '',
    donorEmail: user?.email || '',
    donorPhone: '077 000 0000',
    pledgedQuantity: 10,
    deliveryMethod: 'Direct Drop-off',
    donorNotes: '',
  });
  const [pledgeReceipt, setPledgeReceipt] = useState(null);
  const [pledgeSubmitting, setPledgeSubmitting] = useState(false);

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

  // Pledge filter
  const [pledgeStatusFilter, setPledgeStatusFilter] = useState('All');

  // Load all initial data
  const loadData = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Handle donor pledge submission with atomic decrement
  const handlePledgeSubmit = async (e) => {
    e.preventDefault();
    if (!pledgeModalItem) return;

    setPledgeSubmitting(true);
    try {
      const result = await submitDonorPledge(pledgeModalItem._id, pledgeForm);

      // Refresh list to show decremented count immediately
      await loadData();

      setPledgeReceipt({
        receiptId: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        item: pledgeModalItem,
        pledge: result.pledge,
        date: new Date().toLocaleString(),
      });
    } catch (error) {
      alert(error.message || 'Failed to submit pledge');
    } finally {
      setPledgeSubmitting(false);
    }
  };

  // Handle coordinator creating new supply item
  const handleCoordinatorSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess(false);

    if (!coordinatorForm.itemName.trim() || Number(coordinatorForm.targetQuantity) <= 0) {
      setCreateError('Please enter a valid item name and target quantity.');
      return;
    }

    try {
      await createSupplyRequest(coordinatorForm);
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
    }
  };

  // Filter supplies for public board
  const filteredSupplies = supplies.filter((item) => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesUrgency = urgencyFilter === 'All' || item.urgency === urgencyFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shelterLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesUrgency && matchesStatus && matchesSearch;
  });

  // Filter pledges
  const filteredPledges = pledges.filter((p) => {
    return pledgeStatusFilter === 'All' || p.status === pledgeStatusFilter;
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
              <span>Module 3: Relief Supplies & Donation Board</span>
            </div>

            {/* Quick Role Switcher Banner */}
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
                relief items, and track live deliveries to flood and earthquake-affected families.
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
                {stats.totalRequests}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Across verified shelters</div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Fulfilled Demands
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                {stats.fulfilledRequests}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">100% pledged items</div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Donor Pledges
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">
                {stats.pledgesCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Registered commitments</div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Overall Fulfillment
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                {stats.percentFulfilled}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {stats.totalPledgedUnits} of {stats.totalTargetUnits} units pledged
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
              className={`flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-xl transition ${
                activeTab === 'board'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Boxes size={18} />
              <span>Supply Request Board</span>
              <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full">
                {supplies.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('coordinator')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-xl transition ${
                activeTab === 'coordinator'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ClipboardList size={18} />
              <span>Coordinator Inventory Portal</span>
              {activeRole === 'coordinator' && (
                <span className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white font-bold rounded-full">
                  Admin
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange('pledges')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-xl transition ${
                activeTab === 'pledges'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Truck size={18} />
              <span>Donor Pledge Tracking Interface</span>
              <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full">
                {pledges.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: PUBLIC SUPPLY REQUEST BOARD & PLEDGE LOGIC
         ========================================================================= */}
      {activeTab === 'board' && (
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
                <option value="Fulfilled">Fulfilled</option>
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
            {filteredSupplies.map((item) => {
              const percent = Math.min(
                100,
                Math.round((item.pledgedQuantity / item.targetQuantity) * 100)
              );
              const isFulfilled = item.remainingQuantity === 0;

              return (
                <div
                  key={item._id}
                  className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-lg ${
                    isFulfilled
                      ? 'border-emerald-200/80 bg-emerald-50/20'
                      : item.urgency === 'Immediate'
                      ? 'border-red-200/90 hover:border-red-300'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="p-6">
                    {/* Top Row: Category & Urgency Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-lg">
                        {item.category}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            item.urgency === 'Immediate'
                              ? 'bg-red-600 text-white animate-pulse'
                              : item.urgency === 'High'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {item.urgency}
                        </span>
                        {isFulfilled && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded">
                            Fulfilled
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Item Name */}
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {item.itemName}
                    </h3>

                    {/* Destination Shelter */}
                    <div className="mt-3 flex items-start gap-2 text-xs text-slate-600">
                      <MapPin size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-800">{item.shelterLocation}</div>
                        <div className="text-[11px] text-slate-400">{item.district} District</div>
                      </div>
                    </div>

                    {/* Notes */}
                    {item.notes && (
                      <p className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed italic">
                        "{item.notes}"
                      </p>
                    )}

                    {/* Progress Bar & Item Count Logic */}
                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between items-end text-xs font-bold">
                        <div>
                          <span className="text-slate-900 font-extrabold text-base">
                            {item.pledgedQuantity}
                          </span>
                          <span className="text-slate-400"> / {item.targetQuantity} {item.unit} pledged</span>
                        </div>
                        <span
                          className={`font-black ${
                            isFulfilled ? 'text-emerald-600' : 'text-blue-600'
                          }`}
                        >
                          {percent}%
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFulfilled
                              ? 'bg-emerald-500'
                              : item.urgency === 'Immediate'
                              ? 'bg-red-500'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {/* Remaining Count Highlight (The decrement logic in action) */}
                      <div className="flex justify-between items-center pt-1 text-[11px]">
                        <span className="text-slate-500 font-medium">Remaining Needed:</span>
                        <span
                          className={`font-black text-xs ${
                            isFulfilled ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {isFulfilled
                            ? '✓ Requirement Met'
                            : `${item.remainingQuantity} ${item.unit} needed`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom / Action Footer */}
                  <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-500">
                      <span className="block font-semibold text-slate-700">
                        {item.coordinatorName}
                      </span>
                      <span>{item.coordinatorContact}</span>
                    </div>

                    {isFulfilled ? (
                      <button
                        disabled
                        className="px-4 py-2.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl cursor-default flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={15} />
                        <span>Fulfilled</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setPledgeModalItem(item);
                          setPledgeForm((prev) => ({
                            ...prev,
                            pledgedQuantity: Math.min(25, item.remainingQuantity),
                          }));
                          setPledgeReceipt(null);
                        }}
                        className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm hover:shadow flex items-center gap-1.5"
                      >
                        <HeartHandshake size={15} />
                        <span>Pledge Donation</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
      {activeTab === 'coordinator' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
          {/* Coordinator Action Notice */}
          <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-800/80 rounded-full text-xs font-semibold text-emerald-300 mb-2">
                <ShieldCheck size={14} />
                <span>Authorized Shelter Coordinator Dashboard</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                List Shelter Relief Items & Manage Inventory
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
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <PlusCircle size={17} />
                  <span>Publish Supply Request to Community Board</span>
                </button>
              </form>
            </div>

            {/* Current Inventory Table (lg:col-span-7) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Current Inventory Quotas</h3>
                  <p className="text-xs text-slate-500">Live decrement tracker & fulfillment status</p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {supplies.length} Requests
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-y border-slate-100">
                    <tr>
                      <th className="py-3 px-3">Item</th>
                      <th className="py-3 px-3">Target</th>
                      <th className="py-3 px-3">Pledged</th>
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
                          {item.pledgedQuantity}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-red-600">
                          {item.remainingQuantity}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Fulfilled'
                                ? 'bg-emerald-100 text-emerald-800'
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
                              if (confirm(`Remove ${item.itemName} from inventory board?`)) {
                                await deleteSupplyItem(item._id);
                                await loadData();
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
      {activeTab === 'pledges' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          {/* Header */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold mb-1">
                <Truck size={14} />
                <span>Pledge Dispatch & Verification Ledger</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Donor Pledge Tracking Board</h2>
              <p className="text-xs text-slate-500 mt-1">
                Track all incoming community donations from pledge commitment to warehouse delivery verification.
              </p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Filter:</span>
              <select
                value={pledgeStatusFilter}
                onChange={(e) => setPledgeStatusFilter(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Pledges</option>
                <option value="Pledged">Pledged</option>
                <option value="In Transit">In Transit</option>
                <option value="Received & Verified">Received & Verified</option>
              </select>
            </div>
          </div>

          {/* Pledges Table / Cards */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Pledge / Donor</th>
                    <th className="py-3.5 px-4">Relief Item</th>
                    <th className="py-3.5 px-4">Destination Shelter</th>
                    <th className="py-3.5 px-4">Quantity Pledged</th>
                    <th className="py-3.5 px-4">Delivery Method</th>
                    <th className="py-3.5 px-4">Fulfillment Status</th>
                    <th className="py-3.5 px-4 text-right">Coordinator Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPledges.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/80 transition">
                      {/* Donor */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{p.donorName}</div>
                        <div className="text-[11px] text-slate-400">{p.donorPhone}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.donorEmail}</div>
                      </td>

                      {/* Item */}
                      <td className="py-4 px-4 font-semibold text-slate-800">
                        {p.itemName}
                      </td>

                      {/* Shelter */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-slate-700">
                          <MapPin size={13} className="text-red-500 flex-shrink-0" />
                          <span>{p.shelterLocation}</span>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-4">
                        <span className="text-sm font-black text-blue-600">
                          {p.pledgedQuantity}
                        </span>{' '}
                        <span className="text-slate-500">{p.unit}</span>
                      </td>

                      {/* Delivery */}
                      <td className="py-4 px-4 text-slate-600 font-medium">
                        {p.deliveryMethod}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold inline-flex items-center gap-1 ${
                            p.status === 'Received & Verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'In Transit'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status === 'Received & Verified' && <CheckCircle2 size={12} />}
                          {p.status === 'In Transit' && <Truck size={12} />}
                          {p.status === 'Pledged' && <Clock size={12} />}
                          <span>{p.status}</span>
                        </span>
                      </td>

                      {/* Coordinator Actions */}
                      <td className="py-4 px-4 text-right">
                        {p.status !== 'Received & Verified' ? (
                          <button
                            type="button"
                            onClick={async () => {
                              await updatePledgeStatus(p._id, 'Received & Verified');
                              await loadData();
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition"
                          >
                            Mark Verified
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-600">
                            ✓ Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPledges.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                No donor pledges recorded matching filter.
              </div>
            )}
          </div>
        </main>
      )}

      {/* =========================================================================
          DONOR PLEDGE MODAL (Implements decrement logic + certificate)
         ========================================================================= */}
      {pledgeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden relative">
            <button
              type="button"
              onClick={() => {
                setPledgeModalItem(null);
                setPledgeReceipt(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <X size={18} />
            </button>

            {pledgeReceipt ? (
              /* Receipt View */
              <div className="p-6 sm:p-8 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={26} className="stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 text-center">
                  Thank You for Your Generous Pledge!
                </h3>
                <p className="text-xs text-slate-500 text-center">
                  Your pledge has been logged and the required quantity has been deducted from the remaining count.
                </p>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pledge Confirmation ID:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {pledgeReceipt.receiptId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pledged Item:</span>
                    <span className="font-bold text-slate-900">{pledgeReceipt.item.itemName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Pledged:</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {pledgeReceipt.pledge.pledgedQuantity} {pledgeReceipt.item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Destination Center:</span>
                    <span className="font-bold text-slate-900">
                      {pledgeReceipt.item.shelterLocation}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Drop-off Instructions:</span>
                    <span className="font-semibold text-slate-700">
                      {pledgeReceipt.item.dropOffLocation}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPledgeModalItem(null);
                      setPledgeReceipt(null);
                      handleTabChange('pledges');
                    }}
                    className="flex-1 py-3 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    View in Pledge Tracker
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPledgeModalItem(null);
                      setPledgeReceipt(null);
                    }}
                    className="px-4 py-3 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Pledge Form View */
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-1">
                  <HeartHandshake className="text-blue-600 stroke-[2.5]" size={22} />
                  <h3 className="text-xl font-bold text-slate-900">Pledge Relief Supplies</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Commit items to support displaced persons. Counts are updated live upon pledge.
                </p>

                {/* Selected Item Summary Card */}
                <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl mb-4 text-xs">
                  <div className="font-bold text-slate-900">{pledgeModalItem.itemName}</div>
                  <div className="text-slate-600 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-red-500" />
                    <span>{pledgeModalItem.shelterLocation}</span>
                  </div>
                  <div className="mt-2 flex justify-between items-center pt-2 border-t border-blue-100">
                    <span className="text-slate-500">Remaining Needed:</span>
                    <span className="font-black text-red-600 text-sm">
                      {pledgeModalItem.remainingQuantity} {pledgeModalItem.unit}
                    </span>
                  </div>
                </div>

                <form onSubmit={handlePledgeSubmit} className="space-y-3.5">
                  {/* Quantity to Pledge */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Quantity You Wish to Pledge ({pledgeModalItem.unit}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={pledgeModalItem.remainingQuantity}
                      value={pledgeForm.pledgedQuantity}
                      onChange={(e) =>
                        setPledgeForm({
                          ...pledgeForm,
                          pledgedQuantity: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Max you can pledge is {pledgeModalItem.remainingQuantity} {pledgeModalItem.unit}
                    </p>
                  </div>

                  {/* Donor Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Full Name / Organization *
                    </label>
                    <input
                      type="text"
                      required
                      value={pledgeForm.donorName}
                      onChange={(e) =>
                        setPledgeForm({ ...pledgeForm, donorName: e.target.value })
                      }
                      placeholder="e.g. Dilshan Fernando"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Contact Phone & Email */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="text"
                        required
                        value={pledgeForm.donorPhone}
                        onChange={(e) =>
                          setPledgeForm({ ...pledgeForm, donorPhone: e.target.value })
                        }
                        placeholder="077 123 4567"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={pledgeForm.donorEmail}
                        onChange={(e) =>
                          setPledgeForm({ ...pledgeForm, donorEmail: e.target.value })
                        }
                        placeholder="name@email.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Delivery Method */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Delivery Method *
                    </label>
                    <select
                      value={pledgeForm.deliveryMethod}
                      onChange={(e) =>
                        setPledgeForm({ ...pledgeForm, deliveryMethod: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Direct Drop-off">Direct Drop-off at Shelter Desk</option>
                      <option value="Volunteer Pickup">Request Volunteer Relief Pickup</option>
                      <option value="Courier / Dispatch">Third-Party Courier / Logistics Dispatch</option>
                    </select>
                  </div>

                  {/* Drop-off note */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Notes / Estimated Drop-off Time
                    </label>
                    <input
                      type="text"
                      value={pledgeForm.donorNotes}
                      onChange={(e) =>
                        setPledgeForm({ ...pledgeForm, donorNotes: e.target.value })
                      }
                      placeholder="e.g. Delivering tomorrow morning around 10 AM"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={pledgeSubmitting}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 mt-2"
                  >
                    <HeartHandshake size={16} />
                    <span>
                      {pledgeSubmitting
                        ? 'Processing Pledge...'
                        : `Confirm Pledge of ${pledgeForm.pledgedQuantity} ${pledgeModalItem.unit}`}
                    </span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
