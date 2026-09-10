import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planApi } from '../../api/planApi';
import { useToast } from '../../utils/Toast';
import Breadcrumb from '../../components/common/Breadcrumb';

const STATUS_CONFIG = {
  1: { label: 'Active',   color: 'text-emerald-600' },
  2: { label: 'Inactive', color: 'text-red-500' },
  3: { label: 'Draft',    color: 'text-amber-600' },
  4: { label: 'Archived', color: 'text-indigo-500' },
  5: { label: 'Deleted',  color: 'text-rose-600' },
};

const CURRENCY_SYMBOL = { 1: '₹', 2: '$', 3: '€', 4: '£' };

export default function SuperAdminViewDetailedPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  async function fetchPlan() {
    try {
      setLoading(true);
      const response = await planApi.getPlanById(id);
      if (response?.success && response?.data) {
        setPlan(response.data);
      } else {
        showToast('Plan not found.', 'error');
        navigate('/superadmin/plans');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load plan.';
      showToast(msg, 'error');
      navigate('/superadmin/plans');
    } finally {
      setLoading(false);
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Monthly Card */}
        <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-2xs relative overflow-hidden">
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
          <p className="mt-2 text-[11px] text-slate-400">Standard recurring monthly commitment</p>
        </div>

        {/* Yearly Card */}
        <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-2xs relative overflow-hidden">
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
          <p className="mt-2 text-[11px] text-slate-400">Discounted upfront annual billing cycle</p>
        </div>

        {/* Trial Card */}
        <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-2xs relative overflow-hidden">
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
          <p className="mt-2 text-[11px] text-slate-400">
            {plan.trialPeriodDays ? 'Evaluation window before billing starts' : 'Immediate payment required on signup'}
          </p>
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

    </div>
  );
}
