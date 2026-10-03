import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { subscriptionApi } from "../../api/subscriptionApi";
import { planApi } from "../../api/planApi";
import { useToast } from "../../utils/Toast";

export default function TenantScheduledSubscription() {
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
        subscriptionApi.getScheduledSubscription(),
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
      showToast("Failed to load scheduled subscription details.", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);
      const res = await subscriptionApi.cancelScheduledSubscription(
        subscription.id,
      );

      if (res?.success) {
        if (res.data?.refundId) {
          showToast(`Refund initiated (ID: ${res.data.refundId})`, "success");
        } else {
          showToast(
            "Scheduled subscription cancelled successfully.",
            "success",
          );
        }
        setIsCancelModalOpen(false);
        navigate("/payment/refund");
      } else {
        showToast(
          res?.message || "Failed to cancel scheduled subscription.",
          "error",
        );
      }
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Error cancelling scheduled subscription.",
        "error",
      );
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

  if (!subscription || !subscription.hasScheduledSubscription) {
    return (
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            No Scheduled Subscription
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            You don't have any upcoming subscription changes scheduled at this
            time.
          </p>
          <Link
            to="/tenant/plans"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            View Available Plans
          </Link>
        </div>
      </div>
    );
  }

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
          Scheduled Subscription
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your upcoming plan changes and payments.
        </p>
      </div>

      <div className="mb-8 py-2.5 px-4 rounded bg-yellow-50 border border-yellow-200 flex items-start">
        <i className="fa-solid fa-circle-info text-yellow-600 mt-0.5 mr-3"></i>
        <div className="flex-1">
          <p className="text-xs text-yellow-800 leading-snug text-justify">
            <strong>This subscription is scheduled.</strong> Your new plan will
            automatically become active on{" "}
            <strong>{formatDate(subscription.currentPeriodStart)}</strong>. You
            have already secured this plan with your payment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Left Column: Plan Summary */}
        <div className="md:col-span-2 space-y-6 md:pr-8 mb-8 md:mb-0">
          <div className="overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-bold text-slate-900">
                    {currentPlan?.name || subscription.planName}
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    Scheduled for {formatDate(subscription.currentPeriodStart)}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  You are scheduled to upgrade to the{" "}
                  <strong className="text-slate-700">
                    {currentPlan?.name ||
                      subscription.planName ||
                      "Premium Plan"}
                  </strong>
                  .
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">
                  ₹{Number(subscription.planPrice || 0).toLocaleString()}
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  {subscription.billingCycle === 1 ||
                  subscription.billingCycle === "Monthly"
                    ? "per month"
                    : "per year"}
                </div>
              </div>
            </div>

            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 tracking-wider mb-1">
                    Starts On
                  </p>
                  <p className="text-xs font-medium text-slate-900">
                    {formatDate(subscription.currentPeriodStart)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 tracking-wider mb-1">
                    Next Billing Cycle
                  </p>
                  <p className="text-xs font-medium text-slate-900">
                    {subscription.billingCycle === 1 ||
                    subscription.billingCycle === "Monthly"
                      ? "Monthly"
                      : "Yearly"}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline transition-colors"
                  onClick={() => setIsCancelModalOpen(true)}
                >
                  Cancel Scheduled Subscription
                </button>
              </div>
            </div>
          </div>

          {/* Included Features */}
          {currentPlan?.features && currentPlan.features.length > 0 && (
            <div className="rounded-lg p-6 bg-slate-50 border border-slate-100">
              <h2 className="text-base font-bold text-slate-900 mb-6">
                Upcoming Features
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
        <div className="space-y-6 md:border-l border-slate-200 md:pl-8">
          <div className=" p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Payment Status
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 tracking-wider mb-1">
                  Status
                </p>
                <p className="text-sm font-medium text-emerald-600 capitalize">
                  {subscription.paymentStatus || "Succeeded"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 tracking-wider mb-1">
                  Amount Paid
                </p>
                <p className="text-sm font-medium text-slate-700">
                  ₹
                  {Number(
                    subscription.amountPaid || subscription.planPrice || 0,
                  ).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 tracking-wider mb-1">
                  Payment Date
                </p>
                <p className="text-sm text-slate-700">
                  {formatDate(
                    subscription.paymentDate || subscription.subscribedOn,
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 bg-slate-50 border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Need help?
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              If you have questions about your upcoming plan change or need a
              refund, our support team is ready to assist.
            </p>
            <Link
              to="/tickets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden p-1">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Cancel Scheduled Subscription?
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Are you sure you want to cancel your scheduled upgrade to{" "}
                <strong>{currentPlan?.name}</strong>?
              </p>
              <div className="p-4 ">
                <p className="text-sm text-red-800">
                  Because this subscription hasn't started yet, you will be
                  issued a <strong>full refund</strong> of ₹
                  {Number(
                    subscription.amountPaid || subscription.planPrice || 0,
                  ).toLocaleString()}{" "}
                .
                </p>
              </div>
            </div>
            <div className="p-4 flex justify-end gap-3 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCancelling}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel & Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
