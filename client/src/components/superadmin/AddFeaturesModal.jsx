import React, { useState, useEffect } from 'react';
import { featureApi } from '../../api/featureApi';
import { planApi } from '../../api/planApi';
import { useToast } from '../../utils/Toast';

const FEATURE_STATUS_MAP = {
  1: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  2: { label: 'Inactive', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  3: { label: 'Draft', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default function AddFeaturesModal({
  isOpen,
  onClose,
  planId,
  planName,
  mappedFeatureIds = new Set(),
  onFeatureAdded,
}) {
  const { showToast } = useToast();

  const [systemFeatures, setSystemFeatures] = useState([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [featuresTotalCount, setFeaturesTotalCount] = useState(0);
  const [featureSearchTerm, setFeatureSearchTerm] = useState('');
  const [debouncedFeatureSearch, setDebouncedFeatureSearch] = useState('');
  const [featurePageNumber, setFeaturePageNumber] = useState(1);
  const [featurePageSize] = useState(8);
  const [internalMappedIds, setInternalMappedIds] = useState(new Set());

  // Confirmation Popup State
  const [confirmFeature, setConfirmFeature] = useState(null);
  const [isSubmittingFeature, setIsSubmittingFeature] = useState(false);

  // Sync mappedFeatureIds prop with internal state
  useEffect(() => {
    if (mappedFeatureIds instanceof Set) {
      setInternalMappedIds(new Set(mappedFeatureIds));
    } else if (Array.isArray(mappedFeatureIds)) {
      setInternalMappedIds(new Set(mappedFeatureIds));
    }
  }, [mappedFeatureIds]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFeatureSearch(featureSearchTerm);
      setFeaturePageNumber(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [featureSearchTerm]);

  // Fetch features whenever modal opens, page changes, or search changes
  useEffect(() => {
    if (isOpen) {
      fetchSystemFeatures();
    }
  }, [isOpen, featurePageNumber, featurePageSize, debouncedFeatureSearch]);

  // Lock body scroll while modal or confirmation is open
  useEffect(() => {
    if (isOpen || confirmFeature) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, confirmFeature]);

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
      console.error('Error fetching system features:', err);
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
        planId: parseInt(planId, 10),
        featureIds: [confirmFeature.id],
      };
      const response = await planApi.mapFeaturesToPlan(payload);
      if (response?.success) {
        showToast(`Feature "${confirmFeature.name}" added to plan successfully.`, 'success');
        setInternalMappedIds((prev) => new Set([...prev, confirmFeature.id]));
        setConfirmFeature(null);
        onFeatureAdded?.(confirmFeature);
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

  if (!isOpen) return null;

  return (
    <>
      {/* ADD FEATURES MODAL (Takes 3/4 of the screen) */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-hidden">
        <div className="w-full lg:w-3/4 max-w-5xl h-[85vh] max-h-[820px] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/80">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                Add Features to Plan: <span className="text-indigo-600">{planName}</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Search system features and map capabilities directly to this subscription tier.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
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
              <span>Already mapped: <strong className="text-indigo-600 font-semibold">{internalMappedIds.size}</strong></span>
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
                    const isAlreadyMapped = internalMappedIds.has(feat.id);
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
                className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
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
                className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* CONFIRMATION POPUP */}
      {confirmFeature && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-hidden animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full text-amber-600 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-gray-900">Confirm Feature Addition</h4>
                <p className="text-xs text-amber-800 mt-2 leading-relaxed">
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
                <span className="font-semibold text-indigo-600">{planName}</span>
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
    </>
  );
}
