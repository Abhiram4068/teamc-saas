import React, { useState, useEffect } from 'react';
import { subscriptionApi } from '../../api/subscriptionApi';
import { useToast } from '../../utils/Toast';
import Breadcrumb from '../../components/common/Breadcrumb';

const STATUS_CONFIG = {
  1: { label: 'Pending', color: 'text-amber-700' },
  2: { label: 'Active', color: 'text-emerald-700' },
  3: { label: 'Past Due', color: 'text-rose-700' },
  4: { label: 'Cancelled', color: 'text-slate-700' },
  5: { label: 'Expired', color: 'text-rose-700' },
};

export default function TenantMyPlan() {
  const { showToast } = useToast();
  const [subscription, setSubscription] = useState(null);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuresLoading, setFeaturesLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setFeaturesLoading(true);
      
      const subPromise = subscriptionApi.getCurrentSubscription();
      const featPromise = subscriptionApi.getMyPlanFeatures();
      
      const [subRes, featRes] = await Promise.allSettled([subPromise, featPromise]);

      if (subRes.status === 'fulfilled' && subRes.value?.success && subRes.value?.data?.hasActiveSubscription) {
        setSubscription(subRes.value.data);
      }

      if (featRes.status === 'fulfilled' && featRes.value?.success && featRes.value?.data) {
        setFeatures(featRes.value.data);
      }
    } catch (err) {
      showToast('Failed to load plan details.', 'error');
    } finally {
      setLoading(false);
      setFeaturesLoading(false);
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDaysRemaining = (endDateString) => {
    if (!endDateString) return 0;
    const end = new Date(endDateString);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Main Header */}
      <div className="bg-white rounded-md p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {subscription?.planName ? `${subscription.planName} Plan` : 'Subscription Overview'}
            </h1>
            {subscription && (
              <span className={`px-2.5 py-0.5 text-xs font-semibold ${STATUS_CONFIG[subscription.status]?.color || 'bg-slate-100 text-slate-700'}`}>
                {STATUS_CONFIG[subscription.status]?.label || 'Unknown'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition shadow-sm flex items-center gap-2">
            <i className="fa-regular fa-pen-to-square text-xs"></i>
            Change Plan
          </button>
          <button className="px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50/50 border border-rose-100 rounded-md hover:bg-rose-100/50 transition flex items-center gap-2">
            <i className="fa-regular fa-trash-can text-xs"></i>
            Cancel Plan
          </button>
        </div>
      </div>

      {subscription ? (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Plan Card */}
            <div className="bg-white rounded-md p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Active Tier</p>
                <div className="text-2xl font-bold text-slate-900">{subscription.planName}</div>
              </div>
            </div>

            {/* Cycle Status */}
            <div className="bg-white rounded-md p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Time Remaining</p>
                <div className="text-2xl font-bold text-slate-900">
                  {calculateDaysRemaining(subscription.currentPeriodEnd)} <span className="text-sm font-normal text-slate-500">Days</span>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white rounded-md p-5 border border-slate-200/80 shadow-sm flex items-center justify-between sm:col-span-2 lg:col-span-1">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Billing Status</p>
                <div className="text-2xl font-bold text-slate-900">
                  {STATUS_CONFIG[subscription.status]?.label || 'Active'}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Plan Specifications */}
            <div className="lg:col-span-2 bg-white rounded-md border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Specifications</h2>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <span className="text-sm font-medium text-slate-500">Subscription ID</span>
                  <span className="text-sm font-mono text-slate-800 sm:col-span-2 break-all">{subscription.id}</span>
                </div>
                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <span className="text-sm font-medium text-slate-500">Plan Identifier</span>
                  <span className="text-sm text-slate-800 sm:col-span-2 font-semibold">{subscription.planName}</span>
                </div>
                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <span className="text-sm font-medium text-slate-500">Subscribed On</span>
                  <span className="text-sm text-slate-800 sm:col-span-2 font-semibold">{formatDate(subscription.subscribedOn)}</span>
                </div>
                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <span className="text-sm font-medium text-slate-500">Billing Cycle Scope</span>
                  <div className="text-sm text-slate-800 sm:col-span-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 w-12">From:</span>
                      <span className="font-medium">{formatDate(subscription.currentPeriodStart)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 w-12">To:</span>
                      <span className="font-medium text-slate-900">{formatDate(subscription.currentPeriodEnd)}</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <span className="text-sm font-medium text-slate-500">Auto Renewal</span>
                  <span className="text-sm text-slate-800 sm:col-span-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                      Enabled
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Billing & Support Info */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden h-fit">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subscription Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Current Status</span>
                  <span className="font-semibold text-slate-900">{STATUS_CONFIG[subscription.status]?.label}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Payment History</span>
                  <a href={`/tenant/${subscription.id}/payments`} className="font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition">
                    View Past Payments <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </a>
                </div>
                <hr className="border-slate-100" />
                <div className="pt-2">
                  <p className="text-xs text-slate-500 mb-3">
                    Need custom features or higher limits for your organization?
                  </p>
                  <button className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
                    Contact Support Team
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-md border border-slate-200/80 shadow-sm overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Features Included</h2>
            </div>
            <div className="p-6">
              {featuresLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : features && features.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feat) => {
                    const desc = feat.featureDescription && feat.featureDescription !== feat.featureName && feat.featureDescription !== feat.featureCode
                                  ? feat.featureDescription
                                  : `${feat.featureName} capability included in this plan.`;
                    return (
                      <li key={feat.id || feat.featureId} className="flex items-start gap-3">
                        <svg className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                          <span className="font-semibold text-slate-900 block text-sm">{feat.featureName}</span>
                          <span className="text-slate-500 text-xs mt-1 block">{desc}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 italic">No features listed for this plan.</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-12 text-center">
          <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <i className="fa-regular fa-folder-open text-xl"></i>
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">No Active Subscription</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            You currently do not have an active subscription assigned to your account.
          </p>
          <button className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-sm">
            Explore Available Plans
          </button>
        </div>
      )}
    </div>
  );
}