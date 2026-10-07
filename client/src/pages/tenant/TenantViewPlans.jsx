import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { planApi } from "../../api/planApi";
import { subscriptionApi } from "../../api/subscriptionApi";
import { useToast } from "../../utils/Toast";
import AddCardModal from "../../components/tenant/AddCardModal";

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
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [proratedAmount, setProratedAmount] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [isFetchingCards, setIsFetchingCards] = useState(false);
  const [isCardDropdownOpen, setIsCardDropdownOpen] = useState(true);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

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

  const handlePlanSelect = async (plan) => {
    if (currentSubscription?.hasScheduledSubscription) {
      setIsScheduledModalOpen(true);
      return;
    }

    // Only show the warning modal if they are on a paid plan (rank > 1)
    if (hasActiveSubscription && currentPlanObj && currentPlanObj.rank > 1) {
      setSelectedPlanForCheckout(plan);
      setProratedAmount(null);
      setIsModalOpen(true);

      try {
        setIsPreviewing(true);
        setIsFetchingCards(true);

        const [prorationRes, cardsRes] = await Promise.all([
          subscriptionApi.previewUpgradeProration({
            planId: plan.id,
            billingCycle: currentSubscription?.billingCycle || 1,
          }).catch(() => null),
          subscriptionApi.getSavedCards().catch(() => null)
        ]);

        if (prorationRes?.success) {
          setProratedAmount(prorationRes.data.proratedAmount || 0);
        } else {
          setProratedAmount(0);
        }

        if (cardsRes?.success) {
          setSavedCards(cardsRes.data);
          if (cardsRes.data.length > 0) {
            setSelectedCardId(cardsRes.data[0].paymentMethodId);
          }
        } else {
          setSavedCards([]);
        }
      } catch (err) {
        console.error("Failed to fetch proration preview or cards:", err);
      } finally {
        setIsPreviewing(false);
        setIsFetchingCards(false);
      }
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
      showToast(
        err.response?.data?.message || "Error cancelling subscription.",
        "error",
      );
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
                className="text-sm text-red-600 hover:text-red-800 hover:underline transition-colors font-medium"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        )}

        {currentPlanObj && currentPlanObj.rank > 1 && (
          <div className="mt-6 p-4 max-w-2xl w-full text-center">
            <p className="text-sm text-slate-700 font-medium">
              <span className="text-sm text-red-500 font-bold">*</span> Before
              you proceed with a new subscription, make sure to cancel your
              current one. Else, the new subscription will only become active
              after your next billing date.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {availablePlans.map((plan) => {
          const isDowngrade = plan.rank < currentPlanObj?.rank;

          return (
            <div key={plan.id} className="flex flex-col p-8 h-full">
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
                  ₹{Number(plan.monthlyPrice).toLocaleString()} / per month
                  <br />
                  <span className="text-xs text-slate-500 font-medium">
                    (₹{Number(plan.yearlyPrice).toLocaleString()} yearly)
                  </span>
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
                          title={
                            feat.limitValue != null
                              ? `${feat.name} ${feat.limitValue}`
                              : feat.name
                          }
                        >
                          {feat.name}
                          {feat.limitValue != null && (
                            <span className="font-bold ml-1">
                              {feat.limitValue}
                            </span>
                          )}
                        </span>
                        {feat.description && (
                          <p
                            className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2"
                            title={
                              feat.limitValue != null
                                ? `${feat.description} ${feat.limitValue}`
                                : feat.description
                            }
                          >
                            {feat.description}
                            {feat.limitValue != null && (
                              <span className="font-bold ml-1">
                                {feat.limitValue}
                              </span>
                            )}
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

      {/* Official Administrative Upgrade Modal */}
      {isModalOpen && selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded border border-slate-300 shadow-xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
            {/* Header Banner */}
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-base font-semibold tracking-wide uppercase text-slate-100">
                    Upgrade to {selectedPlanForCheckout.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isUpgrading}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main Options Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Option 1: Immediate Processing */}
                <div className="bg-white border-2 border-blue-500 rounded-lg p-5 flex flex-col justify-between shadow-lg relative transition-all duration-300 z-10 h-fit min-h-[400px] scale-[1.02]">
                  {/* Recommended Ribbon */}
                  <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden pointer-events-none rounded-tr-lg">
                    <div className="absolute top-[30px] right-[-35px] w-[170px] transform rotate-45 bg-red-600 text-white text-center text-[10px] font-bold py-1 uppercase tracking-widest shadow-sm">
                      Recommended
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-slate-900 mt-1">
                          Immediate Upgrade
                        </h4>
                        <div className="relative group mt-1 flex items-center">
                          <button type="button" className="text-slate-400 hover:text-blue-600 transition-colors focus:outline-none cursor-help">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          
                          {/* Tooltip */}
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 p-3 bg-slate-800 text-slate-200 text-[10px] leading-relaxed rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                            <strong className="text-white block mb-1">How Proration Works:</strong>
                            When upgrading mid-cycle, you are credited for the unused days of your current plan, and charged for the remaining days of the new plan. The prorated amount is the exact price difference for this billing period.
                            {/* Tooltip Arrow */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 leading-relaxed mb-6 space-y-2">
                      <p>
                        Upgrade your current entitlement to <strong className="text-slate-800">{selectedPlanForCheckout?.name}</strong> effective immediately today.
                      </p>
                      <div className="-mx-5 px-5 py-2.5 bg-amber-50/80 border-y border-amber-100/80 text-[11px] font-medium text-amber-800 flex items-start gap-2">
                        <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Execution will take effect immediately upon clearance. </span>
                      </div>
                    </div>

                    <div className="mb-4 relative">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Payment Method</div>
                        <button 
                          type="button"
                          onClick={() => {
                            setIsAddCardModalOpen(true);
                            setIsCardDropdownOpen(false);
                          }}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Add card
                        </button>
                      </div>

                      {(() => {
                        const selCard = selectedCardId ? savedCards.find(c => c.paymentMethodId === selectedCardId) : null;
                        if (!selCard) {
                          return (
                            <button 
                              type="button"
                              onClick={() => setIsCardDropdownOpen(!isCardDropdownOpen)}
                              className={`w-full p-3 border-2 border-dashed rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-400 transition-colors flex items-center justify-between ${isCardDropdownOpen ? 'border-slate-400' : 'border-slate-300'}`}
                            >
                              <span className="font-medium text-sm">Choose a payment method</span>
                              <svg className={`w-4 h-4 transition-transform ${isCardDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          );
                        }
                        return (
                          <div 
                            onClick={() => setIsCardDropdownOpen(!isCardDropdownOpen)}
                            className={`p-3 border-2 rounded-lg bg-slate-50 shadow-sm flex items-center justify-between transition-all cursor-pointer hover:bg-white hover:shadow-md ${isCardDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-800 hover:border-slate-600'}`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-12 h-8 bg-white rounded border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 uppercase shadow-sm">
                                {selCard.brand === 'visa' ? 'VISA' : selCard.brand === 'mastercard' ? 'MC' : selCard.brand}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                                  {selCard.brand} •••• {selCard.last4}
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium font-mono mt-0.5">
                                  EXP: {selCard.expMonth.toString().padStart(2, "0")}/{selCard.expYear.toString().slice(2)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className={`w-4 h-4 text-slate-500 transition-transform ${isCardDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        );
                      })()}

                      {isCardDropdownOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 p-3 border border-slate-200 bg-white shadow-2xl rounded-lg text-xs space-y-2 max-h-64 overflow-y-auto custom-scrollbar z-50 ring-1 ring-slate-900/5">
                          {isFetchingCards ? (
                            <div className="text-slate-500 italic py-2 text-center">
                              Loading stored payment methods...
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {savedCards.map((card) => (
                                <label
                                  key={card.paymentMethodId}
                                  className={`flex items-center justify-between p-2.5 border rounded cursor-pointer transition-colors ${
                                    selectedCardId === card.paymentMethodId
                                      ? "border-slate-800 bg-white ring-1 ring-slate-800"
                                      : "border-slate-200 bg-white hover:border-slate-300"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      name="paymentCard"
                                      value={card.paymentMethodId}
                                      checked={selectedCardId === card.paymentMethodId}
                                      onChange={(e) => {
                                        setSelectedCardId(e.target.value);
                                        setIsCardDropdownOpen(false);
                                      }}
                                      className="text-slate-900 focus:ring-slate-800"
                                    />
                                    <div>
                                      <div className="font-semibold text-slate-800 uppercase text-[11px]">
                                        {card.brand} •••• {card.last4}
                                      </div>
                                      <div className="text-[10px] text-slate-500 font-mono">
                                        EXP: {card.expMonth.toString().padStart(2, "0")}/{card.expYear.toString().slice(2)}
                                      </div>
                                    </div>
                                  </div>
                                </label>
                              ))}

                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    {/* Financial Summary Table */}
                    <div className="p-3 mb-4 space-y-1.5 text-xs ">
                      <div className="flex justify-between text-slate-600">
                        <span>Prorated Amount:</span>
                        <span>
                          {isPreviewing ? (
                            <span className="animate-pulse">Calculating...</span>
                          ) : (
                            `₹${Number(proratedAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                        <span>TOTAL DUE TODAY:</span>
                        <span>
                          {isPreviewing
                            ? "-"
                            : `₹${Number(proratedAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </span>
                      </div>
                    </div>



                    <button
                      onClick={async () => {
                        if (!selectedCardId) {
                          showToast("Please select a payment method", "error");
                          return;
                        }
                        try {
                          setIsUpgrading(true);
                          const res =
                            await subscriptionApi.upgradeSubscriptionImmediatelyWithCard(
                              {
                                planId: selectedPlanForCheckout.id,
                                billingCycle:
                                  currentSubscription?.billingCycle || 1,
                                paymentMethodId: selectedCardId,
                              },
                            );
                          if (res?.success) {
                            showToast("Plan upgraded successfully!", "success");
                            setIsModalOpen(false);
                            navigate("/tenant/subscription-summary");
                          } else {
                            showToast(
                              res?.message || "Upgrade failed.",
                              "error",
                            );
                          }
                        } catch (err) {
                          showToast(
                            err.response?.data?.message ||
                              "Error upgrading plan.",
                            "error",
                          );
                        } finally {
                          setIsUpgrading(false);
                        }
                      }}
                      disabled={isUpgrading || !selectedCardId}
                      className={`w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wide rounded transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                        isUpgrading || !selectedCardId ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      {isUpgrading ? "PROCESSING TRANSACTION..." : "UPGRADE IMMEDIATELY"}
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-300 rounded p-5 flex flex-col justify-between shadow-2xs h-fit min-h-[400px]">
                  <div>
                    <div className="flex justify-between items-start pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-slate-900 mt-1">
                          Schedule for Next Cycle
                        </h4>
                        <div className="relative group mt-1 flex items-center">
                          <button type="button" className="text-slate-400 hover:text-blue-600 transition-colors focus:outline-none cursor-help">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          
                          {/* Tooltip */}
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 p-3 bg-slate-800 text-slate-200 text-[10px] leading-relaxed rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                            <strong className="text-white block mb-1">How Scheduled Upgrades Work:</strong>
                            Your current plan remains active until the end of your billing period. On your next billing date, you will automatically be transitioned to the new plan and charged the new rate. No payment is taken today.
                            {/* Tooltip Arrow */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 leading-relaxed mb-6 space-y-2">
                      <p>
                        Retain your current entitlement on <strong className="text-slate-800">{currentPlanObj?.name}</strong> until the current period terminates.
                      </p>
                      <div className="-mx-5 px-5 py-2.5 bg-amber-50/80 border-y border-amber-100/80 text-[11px] font-medium text-amber-800 flex items-start gap-2">
                        <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>No payment is required at this time.</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Financial Summary Table */}
                    <div className="p-3 mb-4 space-y-1.5 text-xs ">
                      <div className="flex justify-between text-slate-600">
                        <span>Due Today:</span>
                        <span>₹0.00</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                        <span>TOTAL DUE TODAY:</span>
                        <span>₹0.00</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-normal mb-4">
                      The transition will execute automatically on your next official billing date using your default primary card.
                    </p>

                    <button
                      onClick={async () => {
                        try {
                          setIsUpgrading(true);
                          const res =
                            await subscriptionApi.scheduleSubscriptionUpgrade({
                              planId: selectedPlanForCheckout.id,
                              billingCycle:
                                currentSubscription?.billingCycle || 1,
                            });
                          if (res?.success) {
                            showToast(
                              "Plan scheduled successfully!",
                              "success",
                            );
                            setIsModalOpen(false);
                            navigate("/tenant/scheduled-subscription");
                          } else {
                            showToast(
                              res?.message || "Scheduling failed.",
                              "error",
                            );
                          }
                        } catch (err) {
                          showToast(
                            err.response?.data?.message ||
                              "Error scheduling plan.",
                            "error",
                          );
                        } finally {
                          setIsUpgrading(false);
                        }
                      }}
                      disabled={isUpgrading}
                      className={`w-full py-2.5 px-4 bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 text-xs font-semibold tracking-wide rounded transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                        isUpgrading ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      {isUpgrading ? "SCHEDULING..." : "CONFIRM SCHEDULED CHANGE"}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex justify-between items-center text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                </span>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isUpgrading}
                className="px-4 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded transition-colors"
              >
                Cancel & Close
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
                  <li>
                    You will <strong>not</strong> be refunded for the remainder
                    of your billing cycle.
                  </li>
                  <li>
                    Premium features and data access will be restricted
                    immediately.
                  </li>
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
                  You already have a pending subscription update. Please wait
                  for it to take effect on your next billing cycle, or cancel
                  your current plan to proceed immediately.
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

      <AddCardModal 
        isOpen={isAddCardModalOpen} 
        onClose={() => setIsAddCardModalOpen(false)} 
        onSuccess={async () => {
          showToast("Card added successfully!", "success");
          try {
            const cardsRes = await subscriptionApi.getSavedCards();
            if (cardsRes?.success) {
              setSavedCards(cardsRes.data);
              if (cardsRes.data.length > 0) {
                // Auto-select the most recently added card (Stripe returns newest first)
                setSelectedCardId(cardsRes.data[0].paymentMethodId);
              }
            }
          } catch (err) {
            console.error("Failed to refresh cards:", err);
          }
        }}
      />
    </div>
  );
}