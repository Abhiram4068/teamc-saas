import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoiceApi } from "../../api/invoiceApi";
import { useToast } from "../../utils/Toast";
import html2pdf from "html2pdf.js";

export default function TenantInvoiceView() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [paymentId]);

  async function fetchInvoiceDetails() {
    try {
      setLoading(true);
      const res = await invoiceApi.getInvoiceDetails(paymentId);
      if (res?.data?.success && res?.data?.data) {
        setInvoice(res.data.data);
      } else if (res?.data) {
        setInvoice(res.data);
      }
    } catch (err) {
      showToast("Failed to fetch invoice details.", "error");
      navigate("/tenant/invoices");
    } finally {
      setLoading(false);
    }
  }

  const handleDownload = () => {
    const element = document.getElementById("invoice-document");
    const opt = {
      margin: 0.5,
      filename: `Invoice_${invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-12 text-center text-slate-500">Invoice not found.</div>
    );
  }

  const invoiceNumber =
    invoice.stripeInvoiceId ||
    `INV-${invoice.paymentId?.substring(0, 8).toUpperCase()}`;

  return (
    <div
      className="w-full mx-auto space-y-6 pb-20 px-4 sm:px-8 mt-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <button
            onClick={() => navigate("/tenant/invoices")}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2 font-medium"
          >
            &larr; Back to Invoices
          </button>
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
            Invoice No: {invoiceNumber}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-sm"
          >
            <svg
              className="w-3.5 h-3.5"
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
            Download Invoice
          </button>
        </div>
      </div>

      {/* Invoice Document Body */}
      <div id="invoice-document" className="bg-slate-50/50 border border-slate-100 rounded-xl p-8 sm:p-12 print:border-none print:p-0">
        {/* Invoice Title for PDF */}
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-xl font-extrabold text-slate-900 tracking-widest uppercase">
            Teamo Subscription Invoice
          </h2>
        </div>

        {/* Top Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 bg-slate-100 p-6 ">
          {/* Col 1: Invoice Details */}
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Invoice No:
              </p>
              <p className="text-xs font-medium text-slate-900  px-2 py-1  inline-block">
                {invoiceNumber}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Invoice Date:
              </p>
              <p className="text-xs font-medium text-slate-900">
                {formatDate(invoice.paymentDate)}
              </p>
            </div>
          </div>

          {/* Col 2: Sold By */}
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Sold By:
              </p>
              <p className="text-xs font-semibold text-slate-900">Teamo</p>
              <p className="text-xs text-slate-600 mt-1">
                123 Tech Valley Road,
                <br />
                Silicon Valley, CA 94025
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Order Date:
              </p>
              <p className="text-xs font-medium text-slate-900">
                {formatDate(invoice.paymentDate)}
              </p>
            </div>
          </div>

          {/* Col 3: Billing Address */}
          <div className="space-y-4 md:col-span-2">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Billing Address:
              </p>
              <p className="text-xs font-semibold text-slate-900">
                {invoice.companyName || invoice.tenantName}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {invoice.address || "Address not provided"}
              </p>
              {invoice.pincode && (
                <p className="text-xs text-slate-600">{invoice.pincode}</p>
              )}
              <p className="text-xs text-slate-600 mt-3">{invoice.userEmail}</p>
              {invoice.userPhone && (
                <p className="text-xs text-slate-600">{invoice.userPhone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-200/60 text-slate-700">
                <th className="px-4 py-3 font-semibold rounded-l-lg w-16">
                  SL NO.
                </th>
                <th className="px-4 py-3 font-semibold">Plan Name</th>
                <th className="px-4 py-3 font-semibold text-right">
                  Monthly Price
                </th>
                <th className="px-4 py-3 font-semibold text-right">
                  Yearly Price
                </th>
                <th className="px-4 py-3 font-semibold text-right">Quantity</th>
                <th className="px-4 py-3 font-semibold text-right">Tax</th>
                <th className="px-4 py-3 font-semibold text-right rounded-r-lg">
                  Total Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-4 text-slate-500">1</td>
                <td className="px-4 py-4 font-medium text-slate-900">
                  {invoice.planName} Subscription
                </td>
                <td className="px-4 py-4 text-slate-600 text-right">
                  {invoice.currency}{" "}
                  {Number(invoice.monthlyPrice || 0).toFixed(2)}
                </td>
                <td className="px-4 py-4 text-slate-600 text-right">
                  {invoice.currency}{" "}
                  {Number(invoice.yearlyPrice || 0).toFixed(2)}
                </td>
                <td className="px-4 py-4 text-slate-600 text-right">1</td>
                <td className="px-4 py-4 text-slate-600 text-right">
                  {invoice.currency} 0.00
                </td>
                <td className="px-4 py-4 text-slate-900 font-medium text-right">
                  {invoice.currency} {Number(invoice.amount).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex flex-col items-end space-y-4">
          <div className="w-full md:w-1/2 lg:w-1/3 bg-slate-200/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-600">
                Subtotal
              </span>
              <span className="text-xs font-medium text-slate-900">
                {invoice.currency} {Number(invoice.amount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-slate-600">
                Discount
              </span>
              <span className="text-xs font-medium text-slate-900">
                - {invoice.currency} 0.00
              </span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-300/50">
              <span className="text-sm font-bold text-slate-900">
                Grand Total
              </span>
              <span className="text-sm font-bold text-slate-900">
                {invoice.currency} {Number(invoice.amount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
