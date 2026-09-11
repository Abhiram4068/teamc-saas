import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planApi } from '../../api/planApi';
import { featureApi } from '../../api/featureApi';
import { useToast } from '../../utils/Toast';
import Breadcrumb from '../../components/common/Breadcrumb';

const STATUS_CONFIG = {
  1: { label: 'Active', color: 'text-emerald-600' },
  2: { label: 'Inactive', color: 'text-red-500' },
  3: { label: 'Draft', color: 'text-amber-600' },
  4: { label: 'Archived', color: 'text-indigo-500' },
  5: { label: 'Deleted', color: 'text-rose-600' },
};

const FEATURE_STATUS_MAP = {
  1: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  2: { label: 'Inactive', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  3: { label: 'Draft', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const CURRENCY_SYMBOL = { 1: '₹', 2: '$', 3: '€', 4: '£' };

export default function SuperAdminViewDetailedPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Add Features Modal State
  const [isAddFeatureModalOpen, setIsAddFeatureModalOpen] = useState(false);
  const [systemFeatures, setSystemFeatures] = useState([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [featuresTotalCount, setFeaturesTotalCount] = useState(0);
  const [featureSearchTerm, setFeatureSearchTerm] = useState('');
  const [debouncedFeatureSearch, setDebouncedFeatureSearch] = useState('');
  const [featurePageNumber, setFeaturePageNumber] = useState(1);
  const [featurePageSize] = useState(8);
  const [mappedFeatureIds, setMappedFeatureIds] = useState(new Set());

  // Feature Add Confirmation Popup State
  const [confirmFeature, setConfirmFeature] = useState(null);
  const [isSubmittingFeature, setIsSubmittingFeature] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  // Debounce search term for features modal
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFeatureSearch(featureSearchTerm);
      setFeaturePageNumber(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [featureSearchTerm]);

  // Fetch features whenever modal is open or pagination/search changes
  useEffect(() => {
    if (isAddFeatureModalOpen) {
      fetchSystemFeatures();
    }
  }, [isAddFeatureModalOpen, featurePageNumber, featurePageSize, debouncedFeatureSearch]);

  // Lock body scroll when any modal is active
  useEffect(() => {
    if (isAddFeatureModalOpen || confirmFeature) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAddFeatureModalOpen, confirmFeature]);

  async function fetchPlan() {
    try {
      setLoading(true);
      const response = await planApi.getPlanById(id);
      if (response?.success && response?.data) {
        setPlan(response.data);
      } else {
        showToast('Plan not found.', 'error');
        navigate('/superadmin/plans');
        return;
      }

      // Also retrieve currently mapped features to keep track of added items
      try {
        const featRes = await planApi.getPlanFeatures?.(id);
        if (featRes?.data && Array.isArray(featRes.data)) {
          const ids = featRes.data.map((f) => f.featureId || f.id);
          setMappedFeatureIds(new Set(ids));
        }
      } catch (featErr) {
        console.error('Failed to load plan features mapping:', featErr);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load plan.';
      showToast(msg, 'error');
      navigate('/superadmin/plans');
    } finally {
      setLoading(false);
    }
  }

  async function fetchSystemFeatures() {
    try {
      setFeaturesLoading(true);
      const response = await featureApi.getFeatures({
        pageNumber: featurePageNumber,
        pageSize: featurePageSize,
        searchTerm: debouncedFeatureSearch || undefined,
      });

      if (response?.data?.items) {
        setSystemFeatures(response.data.items);
        setFeaturesTotalCount(response.data.totalCount || 0);
      } else if (response?.data) {
        setSystemFeatures(response.data);
        setFeaturesTotalCount(response.data.length || 0);
      }
    } catch (err) {
      console.error('Error fetching features:', err);
      showToast('Failed to load system features.', 'error');
    } finally {
      setFeaturesLoading(false);
    }
  }

  async function handleAddFeatureConfirm() {
    if (!confirmFeature) return;
    try {
      setIsSubmittingFeature(true);
      const payload = {
        planId: parseInt(id, 10),
        featureIds: [confirmFeature.id],
      };
      const response = await planApi.mapFeaturesToPlan(payload);
      if (response?.success) {
        showToast(`Feature "${confirmFeature.name}" added to plan successfully.`, 'success');
        setMappedFeatureIds((prev) => new Set([...prev, confirmFeature.id]));
        setConfirmFeature(null);
        // Refresh plan data so feature count updates immediately
        fetchPlan();
      } else {
        showToast(response?.message || 'Failed to add feature.', 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add feature to plan.';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingFeature(false);
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);
      const response = await planApi.updatePlanStatus?.(id, newStatus);
      if (response?.success) {
        setPlan((prev) => ({ ...prev, status: newStatus }));
        showToast('Plan status updated successfully.', 'success');
      } else {
        setPlan((prev) => ({ ...prev, status: newStatus }));
        showToast('Plan status updated.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      setIsUpdating(true);
      await planApi.deletePlan?.(id);
      showToast('Plan deleted successfully.', 'success');
      navigate('/superadmin/plans');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete plan.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatPrice = (price, currency) => {
    if (price === 0 || price === undefined) return 'Free';
    const sym = CURRENCY_SYMBOL[currency] || '₹';
    return `${sym}${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // No early return — always render the page shell to prevent breadcrumb flicker

  if (!plan && !loading) return null;

  const statusConfig = plan ? (STATUS_CONFIG[plan.status] || STATUS_CONFIG[3]) : null;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f1f5f9] min-h-screen">

      {/* Page header */}
      <div className="bg-white rounded border border-gray-200 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Home', to: '/superadmin/dashboard' },
              { label: 'Plans', to: '/superadmin/plans' },
              { label: plan?.name || '...' },
            ]}
          />
          {loading ? (
            <div className="h-8 flex items-center gap-3 mt-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-400">Loading...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mt-2">
                <h1 className="text-2xl font-bold text-gray-800">{plan.name}</h1>
                <span className={`text-sm font-semibold ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-xs font-mono text-gray-400 mt-1">CODE: {plan.code}</p>
            </>
          )}
        </div>

        {!loading && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddFeatureModalOpen(true)}
              className="flex items-center gap-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 px-4 py-2 rounded transition shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Features to {plan?.name}
            </button>
            <button
              onClick={() => navigate(`/superadmin/plans/${id}/edit`)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Plan
            </button>
            <button
              onClick={handleDelete}
              disabled={isUpdating}
              className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded hover:bg-red-100 transition disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Plan
            </button>
          </div>
        )}
      </div>

      {/* Rest of content — only when loaded */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-7 h-7 border-[3px] border-slate-800 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500 font-medium tracking-wide">Fetching plan details...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Primary KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Monthly Card */}
            <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-2xs relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                  <span>Monthly Billing</span>
                  <span className="p-1 bg-slate-100 rounded text-slate-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-slate-900">{formatPrice(plan.monthlyPrice, plan.currency)}</span>
                  <span className="text-xs text-slate-500 font-normal">/ mo</span>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-400">Standard recurring monthly commitment</p>
            </div>

            {/* Yearly Card */}
            <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-2xs relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                  <span>Annual Billing</span>
                  <span className="p-1 bg-emerald-50 rounded text-emerald-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-slate-900">{formatPrice(plan.yearlyPrice, plan.currency)}</span>
                  <span className="text-xs text-slate-500 font-normal">/ yr</span>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-400">Discounted upfront annual billing cycle</p>
            </div>

            {/* Trial Card */}
            <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-2xs relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                  <span>Trial Provision</span>
                  <span className="p-1 bg-amber-50 rounded text-amber-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-slate-900">
                    {plan.trialPeriodDays ? plan.trialPeriodDays : '0'}
                  </span>
                  <span className="text-xs text-slate-500 font-normal">{plan.trialPeriodDays === 1 ? 'day' : 'days'}</span>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-400">
                {plan.trialPeriodDays ? 'Evaluation window before billing starts' : 'Immediate payment required on signup'}
              </p>
            </div>

            {/* Total Features Card */}
            <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-2xs relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                  <span>Total Features</span>
                  <span className="p-1 bg-indigo-50 rounded text-indigo-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-slate-900">
                    {plan.featureCount ?? 0}
                  </span>
                  <span className="text-xs text-slate-500 font-normal">
                    {plan.featureCount === 1 ? 'feature' : 'features'}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Capabilities</span>
                <button
                  type="button"
                  onClick={() => navigate(`/superadmin/plans/${id}/features`)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition group cursor-pointer"
                >
                  <span>View all features</span>
                  <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>

          </div>

          {/* Main Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Configuration Summary */}
              <div className="bg-white border border-gray-200 rounded overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Plan Specifications</h2>
                </div>

                <dl className="divide-y divide-gray-100 text-xs">
                  <div className="px-5 py-3.5 grid grid-cols-3 gap-4">
                    <dt className="font-medium text-gray-500">Plan Name</dt>
                    <dd className="col-span-2 text-gray-800 font-semibold">{plan.name}</dd>
                  </div>

                  <div className="px-5 py-3.5 grid grid-cols-3 gap-4">
                    <dt className="font-medium text-gray-500">System Identifier</dt>
                    <dd className="col-span-2 text-slate-800 font-mono text-[11px]">{plan.code}</dd>
                  </div>

                  <div className="px-5 py-3.5 grid grid-cols-3 gap-4">
                    <dt className="font-medium text-gray-500">Active Version</dt>
                    <dd className="col-span-2 text-slate-800">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono border border-slate-200">
                        v{plan.version || '1.0'}
                      </span>
                    </dd>
                  </div>

                  <div className="px-5 py-3.5 grid grid-cols-3 gap-4">
                    <dt className="font-medium text-gray-500">Lifecycle Scope</dt>
                    <dd className="col-span-2 text-slate-800 space-y-1">
                      <div><span className="text-slate-400">From:</span> {formatDate(plan.effectiveFrom)}</div>
                      <div>
                        <span className="text-slate-400">To:</span>{' '}
                        {plan.effectiveTo ? formatDate(plan.effectiveTo) : <span className="text-slate-400 italic">Indefinite (No Expiration)</span>}
                      </div>
                    </dd>
                  </div>

                  <div className="px-5 py-3.5 grid grid-cols-3 gap-4">
                    <dt className="font-medium text-gray-500">Description</dt>
                    <dd className="col-span-2 text-slate-700 leading-relaxed break-words overflow-wrap-anywhere">
                      {plan.description || <span className="text-slate-400 italic">No description attached to this plan.</span>}
                    </dd>
                  </div>
                </dl>
              </div>

            </div>

            {/* Right Column: Controls & Audit */}
            <div className="space-y-6">

              {/* Audit History Card */}
              <div className="bg-white border border-gray-200 rounded overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Audit History</h2>
                </div>
                <dl className="divide-y divide-gray-100 text-xs">
                  <div className="px-5 py-3.5 grid grid-cols-3 gap-4">
                    <dt className="font-medium text-gray-500">Created By</dt>
                    <dd className="col-span-2 text-slate-800 font-medium break-words">{plan.createdBy || 'System Administrator'}</dd>
                  </div>
                  <div className="px-5 py-3.5 grid grid-cols-3 gap-4">
                    <dt className="font-medium text-gray-500">Created At</dt>
                    <dd className="col-span-2 text-slate-800 font-mono text-[11px]">{formatDate(plan.createdAt)}</dd>
                  </div>
                  <div className="px-5 py-3.5 grid grid-cols-3 gap-4">
                    <dt className="font-medium text-gray-500">Last Updated</dt>
                    <dd className="col-span-2 text-slate-800 font-mono text-[11px]">
                      {plan.updatedAt ? formatDate(plan.updatedAt) : <span className="text-slate-400 font-sans italic">Never updated</span>}
                    </dd>
                  </div>
                </dl>
              </div>

            </div>{/* end right col */}

          </div>{/* end main grid */}

        </>
      )}{/* end loading ternary */}

      {/* ADD FEATURES MODAL (Takes 3/4 of the screen) */}
      {isAddFeatureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-hidden">
          <div className="w-full lg:w-3/4 max-w-5xl h-[85vh] max-h-[820px] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  Add Features to Plan: <span className="text-indigo-600">{plan?.name}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Search system features and map capabilities directly to this subscription tier.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFeatureModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search & Statistics Bar */}
            <div className="px-6 py-3.5 border-b border-gray-100 bg-white flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={featureSearchTerm}
                  onChange={(e) => setFeatureSearchTerm(e.target.value)}
                  placeholder="Search features by name or code"
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                {featureSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setFeatureSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-500 flex items-center gap-2">
                <span>Total system features: <strong className="text-gray-800 font-semibold">{featuresTotalCount}</strong></span>
                <span className="text-gray-300">•</span>
                <span>Already mapped: <strong className="text-indigo-600 font-semibold">{mappedFeatureIds.size}</strong></span>
              </div>
            </div>

            {/* Features Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-6">FEATURE NAME</th>
                    <th className="py-3 px-6">CODE</th>
                    <th className="py-3 px-6">STATUS</th>
                    <th className="py-3 px-6">DESCRIPTION</th>
                    <th className="py-3 px-6 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {featuresLoading ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-gray-500">Loading system features...</span>
                        </div>
                      </td>
                    </tr>
                  ) : systemFeatures.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="font-medium text-gray-600">
                            {debouncedFeatureSearch ? `No features found matching "${debouncedFeatureSearch}".` : 'No features found in system.'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    systemFeatures.map((feat) => {
                      const isAlreadyMapped = mappedFeatureIds.has(feat.id);
                      const statusInfo = FEATURE_STATUS_MAP[feat.status] || { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

                      return (
                        <tr key={feat.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-6 font-semibold text-gray-800">
                            <div>{feat.name}</div>
                          </td>
                          <td className="py-3 px-6 font-mono text-[11px] text-slate-900">
                            <span className="px-2 py-0.5">
                              {feat.code}
                            </span>
                          </td>
                          <td className="py-3 px-6">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-gray-500 max-w-xs truncate" title={feat.description || 'No description'}>
                            {feat.description || <span className="text-gray-300 italic">No description</span>}
                          </td>
                          <td className="py-3 px-6 text-right">
                            {isAlreadyMapped ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold text-emerald-700 cursor-default">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Added
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmFeature(feat)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded transition shadow-2xs cursor-pointer"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Pagination Footer */}
            <div className="px-6 py-3 border-t border-gray-200 bg-slate-50 flex items-center justify-between text-xs text-gray-500">
              <div>
                Showing {systemFeatures.length > 0 ? ((featurePageNumber - 1) * featurePageSize + 1) : 0} to{' '}
                {Math.min(featurePageNumber * featurePageSize, featuresTotalCount)} of {featuresTotalCount} features
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={featurePageNumber <= 1 || featuresLoading}
                  onClick={() => setFeaturePageNumber((prev) => Math.max(prev - 1, 1))}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <span className="font-semibold text-gray-700">
                  Page {featurePageNumber} of {Math.max(Math.ceil(featuresTotalCount / featurePageSize), 1)}
                </span>
                <button
                  type="button"
                  disabled={featurePageNumber >= Math.ceil(featuresTotalCount / featurePageSize) || featuresLoading}
                  onClick={() => setFeaturePageNumber((prev) => prev + 1)}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP */}
      {confirmFeature && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-hidden animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full text-amber-600  flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-gray-900">Confirm Feature Addition</h4>
                <p className="text-xs text-amber-800  mt-2 leading-relaxed">
                  Are you sure that you want to add this feature? This will be seen by the tenants while visiting this feature/plan.
                </p>
              </div>
            </div>

            {/* Feature details card */}
            <div className="p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Feature Name:</span>
                <span className="font-bold text-gray-800">{confirmFeature.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Code Identifier:</span>
                <span className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rx ">
                  {confirmFeature.code}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Target Plan:</span>
                <span className="font-semibold text-indigo-600">{plan?.name}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmittingFeature}
                onClick={() => setConfirmFeature(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingFeature}
                onClick={handleAddFeatureConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingFeature ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <span>Yes, Add Feature</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
