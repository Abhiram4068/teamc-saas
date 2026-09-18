import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { planApi } from '../../api/planApi';
import { subscriptionApi } from '../../api/subscriptionApi';
import Breadcrumb from '../../components/common/Breadcrumb';
import { useToast } from '../../utils/Toast';

function getCurrencySymbol(currency) {
  switch (currency) {
    case 1: return '₹';
    case 2: return '$';
    case 3: return '€';
    case 4: return '£';
    default: return '₹';
  }
}

export default function TenantViewPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAnnual, setIsAnnual] = useState(true);
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handlePlanSelect = (plan) => {
    if (hasActiveSubscription) {
      setSelectedPlanForCheckout(plan);
      setIsModalOpen(true);
    } else {
      navigate(`/checkout/${plan.id}?billing=${isAnnual ? 'yearly' : 'monthly'}`);
    }
  };

  const toggleFeatures = (planId) => {
    setExpandedPlanId(prev => prev === planId ? null : planId);
  };

  useEffect(() => {
    fetchPublicPlans();
  }, []);

  async function fetchPublicPlans() {
    try {
      setLoading(true);
      
      // Fetch both plans and current subscription status in parallel
      const [plansRes, subRes] = await Promise.all([
        planApi.getAvailablePlans(),
        subscriptionApi.getCurrentSubscription().catch(() => null)
      ]);

      if (plansRes?.success && Array.isArray(plansRes.data)) {
        setPlans(plansRes.data);
      } else {
        setPlans([]);
      }

      if (subRes?.success && subRes?.data?.hasActiveSubscription) {
        setHasActiveSubscription(true);
      }

    } catch (err) {
      showToast('Failed to load plans.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/tenant/dashboard' },
          { label: 'Explore Plans' },
        ]}
      />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Upgrade Your Plan</h1>
        <p className="text-slate-500 mt-2 text-sm max-w-2xl mx-auto">
          Choose the right plan for your organization. Unlock new features, get higher limits, and scale your operations effortlessly.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mt-6 gap-3">
          <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
          <button
            type="button"
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 bg-brand-600"
            role="switch"
            aria-checked={isAnnual}
            onClick={() => setIsAnnual(!isAnnual)}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
          </button>
          <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
            Annually <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Save 20%</span>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="relative flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6 md:p-8 flex-1">
                <h3
                  title={plan.name}
                  className="text-xl font-bold tracking-tight truncate text-brand-800"
                >
                  {plan.name}
                </h3>
                
                {/* Description with fixed height for perfect vertical alignment */}
                <p
                  title={plan.description || 'Essential tools and capabilities designed for modern workforce operations.'}
                  className="text-xs mt-1.5 h-9 line-clamp-2 leading-relaxed text-slate-500"
                >
                  {plan.description || 'Essential tools and capabilities designed for modern workforce operations.'}
                </p>

                {/* Pricing Block */}
                <div className="my-5">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      title={`${getCurrencySymbol(plan.currency)} ${Number(isAnnual ? plan.yearlyPrice : plan.monthlyPrice).toLocaleString()} ${isAnnual ? '/ year' : '/ month'}`}
                      className="text-3xl font-extrabold tracking-tight truncate text-brand-800"
                    >
                      {getCurrencySymbol(plan.currency)} {Number(isAnnual ? plan.yearlyPrice : plan.monthlyPrice).toLocaleString()}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {isAnnual ? '/ year' : '/ month'}
                    </span>
                  </div>

                  <span className="text-xs block mt-1 text-slate-500">
                    {isAnnual ? 'Billed annually' : 'Billed monthly'}
                  </span>
                  
                  {/* Always allocate h-7 (28px) so cards without trial maintain identical vertical button alignment */}
                  <div className="h-7 mt-2.5 flex items-center">
                    {plan.trialPeriodDays > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 text-emerald-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {plan.trialPeriodDays}-day free trial included
                      </span>
                    ) : (
                      <div className="h-full w-full" aria-hidden="true" />
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  disabled={plan.transitionType === 'CURRENT PLAN'}
                  className={`block text-center w-full text-sm font-semibold py-2.5 rounded-md transition mb-6 shadow-xs ${
                    plan.transitionType === 'CURRENT PLAN'
                      ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                      : 'bg-[#EFF6FF] hover:bg-blue-50 text-brand-600 cursor-pointer'
                  }`}
                >
                  {plan.transitionType === 'CURRENT PLAN'
                    ? 'Current Plan'
                    : plan.transitionType === 'UPGRADE'
                    ? `Upgrade to ${plan.name}`
                    : plan.transitionType === 'DOWNGRADE'
                    ? `Downgrade to ${plan.name}`
                    : `View ${plan.name}`}
                </button>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <button 
                    onClick={() => toggleFeatures(plan.id)}
                    className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider mb-4 text-slate-500 hover:text-slate-700 transition"
                  >
                    <span>What's included</span>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${expandedPlanId === plan.id ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {expandedPlanId === plan.id && (
                    <ul className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      {plan.features && plan.features.length > 0 ? (
                        plan.features.map((feat) => (
                          <li key={feat.id || feat.featureId} className="flex items-start gap-3">
                            <svg
                              className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                              <span className="font-semibold block text-sm text-slate-700">
                                {feat.name}
                              </span>
                              {feat.description && (
                                <span className="text-xs block mt-0.5 text-slate-500">
                                  {feat.description}
                                </span>
                              )}
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm italic text-slate-400">
                          No features listed.
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {isModalOpen && selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full  flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Active Subscription Exists</h3>
                <p className="text-sm text-slate-600 mt-1">
                  You already have an active subscription. If you confirm to upgrade or choose another plan, <strong className="font-semibold">your current active subscription will be downgraded or cancelled.</strong>
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  navigate(`/checkout/${selectedPlanForCheckout.id}?billing=${isAnnual ? 'yearly' : 'monthly'}`);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-md transition-colors shadow-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
