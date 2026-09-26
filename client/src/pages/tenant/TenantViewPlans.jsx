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
    // Only show the warning modal if they are on a paid plan (rank > 1)
    if (hasActiveSubscription && currentPlanObj && currentPlanObj.rank > 1) {
      setSelectedPlanForCheckout(plan);
      setIsModalOpen(true);
    } else {
      navigate(`/checkout/${plan.id}?billing=yearly`);
    }
  };

  const handleCancelPlan = () => {
    showToast("Cancellation flow to be implemented.", "info");
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
          Your workspace is on the {currentPlanObj?.name || "Free plan"} !
        </h1>

        {hasActiveSubscription && (
          <div className="mt-4 flex items-center gap-6">
            <Link
              to="/tenant/subscription-summary"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
            >
              Subscription Summary
            </Link>
            <button
              onClick={handleCancelPlan}
              className="text-sm text-red-600 hover:text-blue-800 hover:text-red-800 hover:underline transition-colors font-medium"
            >
              Cancel Subscription
            </button>
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

      {/* Confirmation Modal */}
      {isModalOpen && selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-md shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Important Notice
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Before you proceed with a new subscription, make sure to cancel your current one. Else, the new subscription will only become active after your next billing date.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  navigate(
                    `/checkout/${selectedPlanForCheckout.id}?billing=yearly`,
                  );
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
              >
                Proceed with{" "}
                {selectedPlanForCheckout.rank > currentPlanObj?.rank
                  ? "Upgrade"
                  : "Downgrade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
