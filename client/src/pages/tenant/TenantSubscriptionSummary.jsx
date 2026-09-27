import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { subscriptionApi } from "../../api/subscriptionApi";
import { planApi } from "../../api/planApi";
import { useToast } from "../../utils/Toast";

export default function TenantSubscriptionSummary() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [subRes, plansRes] = await Promise.all([
        subscriptionApi.getCurrentSubscription(),
        planApi.getAvailablePlans(),
      ]);

      if (subRes?.success && subRes?.data) {
        setSubscription(subRes.data);

        if (plansRes?.success && Array.isArray(plansRes.data)) {
          const plan = plansRes.data.find((p) => p.id === subRes.data.planId);
          setCurrentPlan(plan);
        }
      }
    } catch (err) {
      showToast("Failed to load subscription details.", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);
      const res = await subscriptionApi.cancelSubscription();
      if (res?.success) {
        showToast("Subscription cancelled successfully.", "success");
        setIsCancelModalOpen(false);
        fetchData();
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
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!subscription || !subscription.hasActiveSubscription) {
    return (
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            No Active Subscription
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            You are currently on the free plan or your subscription has expired.
          </p>
          <Link
            to="/tenant/plans"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            View Available Plans
          </Link>
        </div>
      </div>
    );
  }

  // Fallback mocks for UI purposes in case backend doesn't provide them yet
  const invoices = subscription.payments || [
    {
      id: "INV-2026-09",
      date: subscription.startDate || "2026-09-26",
      amount: currentPlan?.yearlyPrice || 49999,
      status: "Paid",
      pdfUrl: "#",
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className="max-w-7xl mx-auto space-y-8 pb-20 px-8 mt-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header Section */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Subscription Summary
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of your current subscription plan and billing information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Left Column: Plan Summary */}
        <div className="md:col-span-2 space-y-6 md:pr-8 mb-8 md:mb-0">
          <div className="overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-bold text-slate-900">
                    {currentPlan.name}
                  </h2>
                  <span className="inline-flex items-center px-2 py-0.5  text-xs font-medium text-emerald-700 ">
                    Active
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  You are currently subscribed to the{" "}
                  <strong className="text-slate-700">
                    {currentPlan?.name || "Premium Plan"}
                  </strong>
                  .
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">
                  ₹{Number(subscription.planPrice || 0).toLocaleString()}
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  {subscription.billingCycle === 1 || subscription.billingCycle === 'Monthly' ? "per month" : "per year"}
                </div>
              </div>
            </div>

            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 tracking-wider mb-1">
                    Current Billing Cycle
                  </p>
                  <p className="text-xs font-medium text-slate-900">
                    {formatDate(subscription.currentPeriodStart)} -{" "}
                    {formatDate(subscription.currentPeriodEnd)}
                  </p>
                  <p className="text-xs font-medium text-slate-900">({subscription.billingCycle === 1 || subscription.billingCycle === 'Monthly' ? "Monthly" : "Yearly"})</p>
                  
                  
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 tracking-wider mb-1">
                    Next Billing Date
                  </p>
                  <p className="text-xs font-medium text-slate-900">
                    {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500  tracking-wider mb-1">
                    Member Since
                  </p>
                  <p className="text-xs font-medium text-slate-900">
                    {formatDate(subscription.subscribedOn)}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Link
                  to="/tenant/plans"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Change Plan
                </Link>
                {currentPlan?.rank > 1 && (
                  <button
                    className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline transition-colors"
                    onClick={() => setIsCancelModalOpen(true)}
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Included Features */}
          {currentPlan?.features && currentPlan.features.length > 0 && (
            <div className="rounded-lg p-6">
              <h2 className="text-base font-bold text-slate-900 mb-6">
                Included Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                {currentPlan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start">
                    <svg
                      className="w-4 h-4 text-emerald-600 mr-3 shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-slate-700 block line-clamp-2" title={feat.limitValue != null ? `${feat.name} ${feat.limitValue}` : feat.name}>
                        {feat.name}
                        {feat.limitValue != null && (
                          <span className="font-bold ml-1">{feat.limitValue}</span>
                        )}
                      </span>
                      {feat.description && (
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-3" title={feat.limitValue != null ? `${feat.description || ""} ${feat.limitValue}`.trim() : feat.description}>
                          {feat.description} {feat.limitValue != null && (
                          <span className="font-bold ml-1">{feat.limitValue}</span>
                        )}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Billing Info */}
        <div className="space-y-6 md:border-l border-slate-300 md:pl-8">
          <div className="rounded-lg p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Billing Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500  tracking-wider mb-1">
                  Organization
                </p>
                <p className="text-sm text-slate-700">
                  {subscription.organizationName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500  tracking-wider mb-1">
                  Address
                </p>
                <p className="text-sm text-slate-700">
                  {subscription.address || "No address provided"}
                  <br />
                  {subscription.city && subscription.state
                    ? `${subscription.city}, ${subscription.state} ${subscription.pincode || ""}`
                    : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Need help?
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              If you have questions about your billing, plan features, or need
              to discuss custom enterprise requirements, we're here to help.
            </p>
            <a
              href="mailto:support@teamo.com"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
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
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
