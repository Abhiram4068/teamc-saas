import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { paymentApi } from "../../api/paymentApi";
import { useToast } from "../../utils/Toast";

export default function TenantPastPayments() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  async function fetchPaymentHistory() {
    try {
      setLoading(true);
      // Fetch subscription details or dedicated payments endpoint
      const res = await paymentApi.getPaymentHistory();

      if (res?.data?.items) {
        setPayments(res.data.items);
      }
    } catch (err) {
      showToast("Failed to load payment history.", "error");
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (statusCode) => {
    switch (statusCode) {
      case 2: // Succeeded
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-emerald-700">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>
            Paid
          </span>
        );
      case 1: // Pending
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-amber-700">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
      case 3: // Failed
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-red-700">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-500"></span>
            Failed
          </span>
        );
      case 4: // Refunded
      case 5: // PartiallyRefunded
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-blue-700">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-500"></span>
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
            {statusCode || "N/A"}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className="max-w-7xl mx-auto space-y-8 pb-20 px-8 mt-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Payment History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View and download past invoices and transaction details for your account.
          </p>
        </div>
      </div>

      {/* Table Section */}
      {payments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-slate-100">
          <svg
            className="w-12 h-12 text-slate-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No payments found
          </h3>
          <p className="text-xs text-slate-500">
            You have not made any billing transactions yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-200">
                <th
                  scope="col"
                  className="pb-3 font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Invoice ID
                </th>
                <th
                  scope="col"
                  className="pb-3 font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Billing Date
                </th>
                <th
                  scope="col"
                  className="pb-3 font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Plan
                </th>
                <th
                  scope="col"
                  className="pb-3 font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="pb-3 font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="pb-3 font-semibold text-slate-500 uppercase tracking-wider text-right"
                >
                  Invoice
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {payments.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {/* Invoice ID */}
                  <td className="py-4 font-medium text-slate-900 whitespace-nowrap">
                    {item.stripeInvoiceId || item.id || "INV-—"}
                  </td>

                  {/* Billing Date */}
                  <td className="py-4 text-slate-600 whitespace-nowrap">
                    {formatDate(item.paymentDate || item.createdAt)}
                  </td>

                  {/* Plan / Description */}
                  <td className="py-4 text-slate-700 font-medium whitespace-nowrap">
                    {item.planName || "Subscription Plan"}
                  </td>

                  {/* Amount */}
                  <td className="py-4 font-semibold text-slate-900 whitespace-nowrap">
                    ₹{Number(item.amount || 0).toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>

                  {/* Invoice PDF Link */}
                  <td className="py-4 text-right whitespace-nowrap">
                    {item.invoiceUrl ? (
                      <a
                        href={item.invoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <svg
                          className="w-3.5 h-3.5 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download PDF
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs italic">
                        Unavailable
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}