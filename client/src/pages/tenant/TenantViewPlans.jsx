import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { planApi } from "../../api/planApi";
import { subscriptionApi } from "../../api/subscriptionApi";
import Breadcrumb from "../../components/common/Breadcrumb";
import { useToast } from "../../utils/Toast";

export default function TenantViewPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isScheduledModalOpen, setIsScheduledModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicPlans();
  }, []);

  async function fetchPublicPlans() {
    try {
      setLoading(true);

      const [plansRes, subRes] = await Promise.all([
        planApi.getAvailablePlans(),
        subscriptionApi.getCurrentSubscription().catch(() => null),
      ]);

      if (plansRes?.success && Array.isArray(plansRes.data)) {
        // Sort plans by rank
        const sortedPlans = [...plansRes.data].sort((a, b) => a.rank - b.rank);
        setPlans(sortedPlans);
      } else {
        setPlans([]);
      }

      if (subRes?.success && subRes?.data?.hasActiveSubscription) {
        setHasActiveSubscription(true);
        setCurrentSubscription(subRes.data);
      }
    } catch (err) {
      showToast("Failed to load plans.", "error");
    } finally {
      setLoading(false);
    }
  }

  const handlePlanSelect = (plan) => {
    if (currentSubscription?.hasScheduledSubscription) {
      setIsScheduledModalOpen(true);
      return;
    }

    // Only show the warning modal if they are on a paid plan (rank > 1)
    if (hasActiveSubscription && currentPlanObj && currentPlanObj.rank > 1) {
      setSelectedPlanForCheckout(plan);
      setIsModalOpen(true);
    } else {
      navigate(`/checkout/${plan.id}?billing=yearly`);
    }
  };

  const handleCancelPlan = async () => {
    try {
      setIsCancelling(true);
      const res = await subscriptionApi.cancelSubscription();
      if (res?.success) {
        showToast("Subscription cancelled successfully.", "success");
        setIsCancelModalOpen(false);
        fetchPublicPlans();
      } else {
        showToast(res?.message || "Failed to cancel subscription.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Error cancelling subscription.", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Determine plans based on rank
  let currentPlanObj = plans.find((p) => p.id === currentSubscription?.planId);
  if (!currentPlanObj && plans.length > 0) {
    // Default to the lowest rank plan if no active subscription or plan not found
    currentPlanObj = plans[0];
  }

  const availablePlans = plans.filter((p) => p.id !== currentPlanObj?.id);

  return (
    <div
      className="max-w-7xl mx-auto space-y-6 pb-20 px-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex flex-col items-center pt-8 mb-12">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight text-center">
          Your workspace is on the {currentPlanObj?.name || "Free plan"}
        </h1>

        {hasActiveSubscription && (
          <div className="mt-4 flex items-center gap-6">
            <Link
              to="/tenant/subscription-summary"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
            >
              Subscription Summary
            </Link>
            {currentPlanObj?.rank > 1 && (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="text-sm text-red-600 hover:text-blue-800 hover:text-red-800 hover:underline transition-colors font-medium"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        )}

        {currentPlanObj && currentPlanObj.rank > 1 && (
          <div className="mt-6 p-4 max-w-2xl w-full text-center">
            <p className="text-sm text-slate-700 font-medium">
              <span className="text-sm text-red-500 font-bold">*</span> Before you proceed with a new subscription, make sure to cancel your current one. Else, the new subscription will only become active after your next billing date.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {availablePlans.map((plan) => {
          const isDowngrade = plan.rank < currentPlanObj?.rank;

          return (
            <div
              key={plan.id}
              className="flex flex-col p-8  h-full"
            >
              <div className="text-center mb-6">
                <h3 
                  className="text-xl font-bold text-slate-900"
                  title={plan.name}
                >
                  {plan.name}
                </h3>
                <div 
                  className="text-sm font-semibold text-slate-700 mt-2"
                  title={`₹${Number(plan.monthlyPrice).toLocaleString()} / per month (₹${Number(plan.yearlyPrice).toLocaleString()} yearly)`}
                >
                  ₹{Number(plan.monthlyPrice).toLocaleString()} / per month<br/>
                  <span className="text-xs text-slate-500 font-medium">(₹{Number(plan.yearlyPrice).toLocaleString()} yearly)</span>
                </div>
                <p 
                  className="text-sm text-slate-500 mt-4 h-16 line-clamp-3"
                  title={plan.description}
                >
                  {plan.description}
                </p>
              </div>

              <button
                onClick={() => handlePlanSelect(plan)}
                className={`w-full py-3 px-4 text-white font-bold rounded-md transition-colors shadow-sm mb-8 ${
                  isDowngrade
                    ? "bg-slate-800 hover:bg-slate-900"
                    : "bg-[#007a5a] hover:bg-[#148567]"
                }`}
              >
                {isDowngrade
                  ? `Downgrade To ${plan.name.replace(" Plan", "")}`
                  : `Upgrade To ${plan.name.replace(" Plan", "")}`}
              </button>

              <div className="w-full flex-1">
                <p className="text-sm font-bold text-slate-800 mb-5">
                  With {plan.name}, your team gets:
                </p>
                <ul className="space-y-4">
                  {plan.features?.map((feat, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-[#007a5a] mr-3 shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <div>
                        <span 
                          className="text-sm font-semibold text-slate-700 line-clamp-1"
                          title={feat.limitValue != null ? `${feat.name} ${feat.limitValue}` : feat.name}
                        >
                          {feat.name}
                          {feat.limitValue != null && <span className="font-bold ml-1">{feat.limitValue}</span>}
                        </span>
                        {feat.description && (
                          <p 
                            className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2"
                            title={feat.limitValue != null ? `${feat.description} ${feat.limitValue}` : feat.description}
                          >
                            {feat.description}
                            {feat.limitValue != null && <span className="font-bold ml-1">{feat.limitValue}</span>}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade Options Modal */}
      {isModalOpen && selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-md shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Upgrade to {selectedPlanForCheckout.name}
            </h3>
            
            <div className="space-y-4">
              <button
                onClick={async () => {
                  try {
                    setIsUpgrading(true);
                    const res = await subscriptionApi.upgradeSubscriptionImmediately({ 
                      planId: selectedPlanForCheckout.id, 
                      billingCycle: currentSubscription?.billingCycle || 1 
                    });
                    if (res?.success) {
                      showToast("Plan upgraded successfully!", "success");
                      setIsModalOpen(false);
                      navigate("/tenant/subscription-summary");
                    } else {
                      showToast(res?.message || "Upgrade failed.", "error");
                    }
                  } catch (err) {
                    showToast(err.response?.data?.message || "Error upgrading plan.", "error");
                  } finally {
                    setIsUpgrading(false);
                  }
                }}
                disabled={isUpgrading}
                className="w-full text-left p-4 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors group relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 group-hover:text-emerald-700">Start Today</span>
                  <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">Recommended</span>
                </div>
                <p className="text-sm text-slate-600">
                  Pay the prorated difference today. {selectedPlanForCheckout.name} features become active immediately.
                </p>
              </button>

              <button
                onClick={async () => {
                  try {
                    setIsUpgrading(true);
                    const res = await subscriptionApi.scheduleSubscriptionUpgrade({ 
                      planId: selectedPlanForCheckout.id, 
                      billingCycle: currentSubscription?.billingCycle || 1 
                    });
                    if (res?.success) {
                      showToast("Plan scheduled successfully!", "success");
                      setIsModalOpen(false);
                      navigate("/tenant/scheduled-subscription");
                    } else {
                      showToast(res?.message || "Scheduling failed.", "error");
                    }
                  } catch (err) {
                    showToast(err.response?.data?.message || "Error scheduling plan.", "error");
                  } finally {
                    setIsUpgrading(false);
                  }
                }}
                disabled={isUpgrading}
                className="w-full text-left p-4 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-colors group"
              >
                <div className="font-bold text-slate-900 group-hover:text-blue-700 mb-1">
                  Start on Next Billing Date
                </div>
                <p className="text-sm text-slate-600">
                  No charge today. Continue your current {currentPlanObj?.name} until your billing period ends, then {selectedPlanForCheckout.name} will begin.
                </p>
              </button>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isUpgrading}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
            {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Cancel Subscription?
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Are you sure you want to cancel your active subscription?
              </p>
              <div className="p-4">
                <ul className="text-xs text-red-800 list-disc list-inside space-y-1.5">
                  <li>Your plan will instantly revert to the Free Plan.</li>
                  <li>You will <strong>not</strong> be refunded for the remainder of your billing cycle.</li>
                  <li>Premium features and data access will be restricted immediately.</li>
                </ul>
              </div>
            </div>
            <div className="p-4 flex justify-end gap-3">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCancelling}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelPlan}
                disabled={isCancelling}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Subscription Modal */}
      {isScheduledModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-md shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Scheduled Plan Exists
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  You already have a pending subscription update. Please wait for it to take effect on your next billing cycle, or cancel your current plan to proceed immediately.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsScheduledModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                Close
              </button>
              <Link
                to="/tenant/scheduled-subscription"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                View Scheduled Plan
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
}
