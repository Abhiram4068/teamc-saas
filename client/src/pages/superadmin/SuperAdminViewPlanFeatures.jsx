import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planApi } from '../../api/planApi';
import { useToast } from '../../utils/Toast';
import Breadcrumb from '../../components/common/Breadcrumb';
import AddFeaturesModal from '../../components/superadmin/AddFeaturesModal';

const FEATURE_STATUS_CONFIG = {
  true: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  false: { label: 'Disabled', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export default function SuperAdminViewPlanFeatures() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [plan, setPlan] = useState(null);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddFeatureModalOpen, setIsAddFeatureModalOpen] = useState(false);

  useEffect(() => {
    fetchPlanAndFeatures();
  }, [id]);

  async function fetchPlanAndFeatures() {
    try {
      setLoading(true);
      const [planRes, featuresRes] = await Promise.all([
        planApi.getPlanById(id),
        planApi.getPlanFeatures ? planApi.getPlanFeatures(id) : Promise.resolve(null),
      ]);

      if (planRes?.success && planRes?.data) {
        setPlan(planRes.data);
      } else {
        showToast('Plan details not found.', 'error');
        navigate('/superadmin/plans');
        return;
      }

      if (featuresRes?.success && Array.isArray(featuresRes?.data)) {
        setFeatures(featuresRes.data);
      } else if (Array.isArray(featuresRes)) {
        setFeatures(featuresRes);
      } else {
        setFeatures([]);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load plan features.';
      showToast(msg, 'error');
      navigate('/superadmin/plans');
    } finally {
      setLoading(false);
    }
  }

  const totalConfiguredFeatures = useMemo(() => {
    if (features.length > 0 && features[0]?.totalFeatures !== undefined) {
      return features[0].totalFeatures;
    }
    return plan?.featureCount ?? features.length;
  }, [features, plan]);

  const mappedFeatureIds = useMemo(() => {
    return new Set(features.map((f) => f.featureId || f.id));
  }, [features]);

  const activeFeaturesCount = useMemo(() => {
    return features.filter((f) => f.isEnabled).length;
  }, [features]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const planDisplayName = plan?.name || features[0]?.planName || 'Plan';
  const planDisplayCode = plan?.code || features[0]?.planCode || '—';

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f1f5f9] min-h-screen">
      
      {/* Page Header with Breadcrumb */}
      <div className="bg-white rounded border border-gray-200 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Home', to: '/superadmin/dashboard' },
              { label: 'Plans', to: '/superadmin/plans' },
              { label: planDisplayName, to: `/superadmin/plans/${id}` },
              { label: 'Features' },
            ]}
          />
          {loading ? (
            <div className="h-8 flex items-center gap-3 mt-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-400">Loading plan metadata...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 mt-2">
              <h1 className="text-2xl font-bold text-gray-800">{planDisplayName} Features</h1>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                {planDisplayCode}
              </span>
            </div>
          )}
        </div>

        {!loading && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/superadmin/plans/${id}`)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Overview
            </button>
            <button
              onClick={() => setIsAddFeatureModalOpen(true)}
              className="flex items-center gap-2 text-sm font-semibold text-white bg-slate-900 px-4 py-2 rounded hover:bg-slate-800 transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add / Manage Features
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-7 h-7 border-[3px] border-slate-800 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500 font-medium tracking-wide">Fetching plan features...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Top Dashboard Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Total Features */}
            <div className="bg-slate-900 border border-slate-800 p-5 shadow-2xs relative overflow-hidden text-white">
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <span>Total Configured Features</span>
                <span className="p-1 bg-white/10 rounded text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-white">{totalConfiguredFeatures}</span>
                <span className="text-xs text-slate-300 font-normal">
                  {totalConfiguredFeatures === 1 ? 'feature' : 'features'}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Total features mapped to this plan</p>
            </div>

            {/* Target Plan Identifier */}
            <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                <span>Associated Plan</span>
                <span className="p-1 bg-indigo-50 rounded text-indigo-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-lg font-bold tracking-tight text-slate-900 truncate">{planDisplayName}</span>
              </div>
            </div>

          </div>

          {/* Feature Data Table */}
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Plan Feature Entitlements</h2>
              <span className="text-xs text-slate-500 font-mono">
                Total Configured: <strong className="text-slate-800">{totalConfiguredFeatures}</strong>
              </span>
            </div>

            {features.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-xs">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-medium text-gray-600">No features currently mapped to this plan.</span>
                  <button
                    onClick={() => setIsAddFeatureModalOpen(true)}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 transition cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Features Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-slate-50/50 text-gray-500 font-medium uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-5">Feature Name</th>
                      <th className="py-3 px-5">Code Identifier</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5">Description</th>
                      <th className="py-3 px-5 text-right">Mapped Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-slate-700">
                    {features.map((feature, idx) => {
                      const isEnabled = feature.isEnabled ?? true;
                      const statusStyle = FEATURE_STATUS_CONFIG[isEnabled] || FEATURE_STATUS_CONFIG[true];

                      return (
                        <tr key={feature.id || feature.featureId || idx} className="hover:bg-slate-50/60 transition">
                          
                          {/* Name */}
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-slate-900">
                              {feature.featureName || feature.name || 'Unnamed Feature'}
                            </div>
                          </td>

                          {/* Feature Code */}
                          <td className="py-3.5 px-5 font-mono text-[11px] text-slate-600">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                              {feature.featureCode || feature.code || '—'}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${statusStyle.color}`}>
                              {statusStyle.label}
                            </span>
                          </td>

                          {/* Description */}
                          <td className="py-3.5 px-5 text-gray-500 max-w-sm">
                            <div className="line-clamp-2" title={feature.featureDescription || feature.description || ''}>
                              {feature.featureDescription || feature.description || <span className="text-gray-300 italic">No description provided</span>}
                            </div>
                          </td>

                          {/* Mapped Date */}
                          <td className="py-3.5 px-5 text-right font-mono text-[11px] text-slate-500">
                            {formatDate(feature.createdAt)}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ADD FEATURES MODAL */}
      <AddFeaturesModal
        isOpen={isAddFeatureModalOpen}
        onClose={() => setIsAddFeatureModalOpen(false)}
        planId={id}
        planName={planDisplayName}
        mappedFeatureIds={mappedFeatureIds}
        onFeatureAdded={() => {
          fetchPlanAndFeatures();
        }}
      />

    </div>
  );
}