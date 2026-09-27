import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { paymentApi } from "../../api/paymentApi";
import { invoiceApi } from "../../api/invoiceApi";
import { useToast } from "../../utils/Toast";

export default function TenantPastPayments() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { showToast } = useToast();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPaymentHistory();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pageNumber, sortColumn, sortOrder, statusFilter]);

  async function fetchPaymentHistory() {
    try {
      const params = {
        searchTerm,
        pageNumber,
        pageSize,
        sortColumn,
        sortOrder,
        status: statusFilter !== "" ? Number(statusFilter) : null
      };
      const res = await paymentApi.getPaymentHistory(params);

      if (res?.data?.items) {
        setPayments(res.data.items);
        setTotalCount(res.data.totalCount || 0);
      } else if (res?.data?.data?.items) {
        setPayments(res.data.data.items);
        setTotalCount(res.data.data.totalCount || 0);
      }
    } catch (err) {
      showToast("Failed to load payment history.", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : sortOrder === "desc" ? "" : "asc");
      if (sortOrder === "desc") setSortColumn("");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
    setPageNumber(1);
  };



  const handleViewInvoiceDetails = (paymentId) => {
    navigate(`/tenant/invoices/${paymentId}`);
  };

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
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search plan or invoice..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPageNumber(1);
              }}
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="relative shrink-0 w-full sm:w-40">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageNumber(1);
              }}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-1.5 pl-3 pr-8 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
            >
              <option value="">All Status</option>
              <option value="2">Paid</option>
              <option value="1">Pending</option>
              <option value="3">Failed</option>
              <option value="4">Refunded</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {payments.length === 0 ? (
        <div className="p-12 text-center ">
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
                  Payment ID
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('paymentdate')}
                  className="pb-3 font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none group transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Billing Date
                    {sortColumn === 'paymentdate' ? (
                      <span className="text-blue-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    ) : (
                      <span className="text-slate-300 transition-opacity">↕</span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('planname')}
                  className="pb-3 font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none group transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Plan
                    {sortColumn === 'planname' ? (
                      <span className="text-blue-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    ) : (
                      <span className="text-slate-300 transition-opacity">↕</span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('amount')}
                  className="pb-3 font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none group transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Amount
                    {sortColumn === 'amount' ? (
                      <span className="text-blue-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    ) : (
                      <span className="text-slate-300 transition-opacity">↕</span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('status')}
                  className="pb-3 font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none group transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortColumn === 'status' ? (
                      <span className="text-blue-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    ) : (
                      <span className="text-slate-300 transition-opacity">↕</span>
                    )}
                  </div>
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
                    {item.status === 2 ? (
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleViewInvoiceDetails(item.id)}
                          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors bg-transparent border-none cursor-pointer"
                          title="View Details"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      </div>
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

      {/* Pagination Footer */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-1 gap-4">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-900">{(pageNumber - 1) * pageSize + 1}</span> to{" "}
            <span className="font-semibold text-slate-900">{Math.min(pageNumber * pageSize, totalCount)}</span> of{" "}
            <span className="font-semibold text-slate-900">{totalCount}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}
              disabled={pageNumber === 1}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setPageNumber(p => p + 1)}
              disabled={pageNumber * pageSize >= totalCount}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}