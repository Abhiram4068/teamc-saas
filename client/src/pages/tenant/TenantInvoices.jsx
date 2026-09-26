import React, { useEffect, useState } from 'react';
import { billingApi } from '../../api/billingApi';
import { Download, ExternalLink, Filter, Plus, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function TenantInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await billingApi.getInvoices();
        setInvoices(data);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError('Failed to load invoices. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-700 ">
            Paid
          </span>
        );
      case 'open':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Processing
          </span>
        );
      case 'uncollectible':
      case 'void':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">Invoices</h1>
          {/* <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div> */}
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading invoices...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : invoices.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <FileText className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-700">No invoices found</p>
              <p className="text-sm mt-1">You don't have any billing history yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">

                    <th className="px-6 py-2">Invoice</th>
                    <th className="px-6 py-2">Date</th>
                    <th className="px-6 py-2">Plan Details</th>
                    <th className="px-6 py-2 text-center">Status</th>
                    <th className="px-6 py-2 text-right">Amount</th>
                    <th className="px-6 py-2 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-3">
                        <div className="font-medium text-indigo-600">
                          {invoice.number ? `#${invoice.number}` : 'Draft'}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{invoice.id}</div>
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {formatDate(invoice.created)}
                      </td>
                      <td className="px-6 py-3">
                        <div className="font-medium text-slate-700">{invoice.planName}</div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-slate-700">
                        {formatCurrency(invoice.amountPaid, invoice.currency)}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          {invoice.hostedInvoiceUrl && (
                            <a 
                              href={invoice.hostedInvoiceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-indigo-600 transition-colors"
                              title="View Invoice"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {invoice.invoicePdfUrl && (
                            <a 
                              href={invoice.invoicePdfUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-indigo-600 transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination Footer */}
          {!loading && invoices.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{invoices.length}</span> of <span className="font-medium">{invoices.length}</span> results
              </p>
              <div className="flex gap-1">
                <button className="px-3 py-1 border border-slate-200 bg-white text-slate-400 rounded hover:bg-slate-50 disabled:opacity-50" disabled>&lt;</button>
                <button className="px-3 py-1 border border-indigo-600 bg-indigo-50 text-indigo-600 rounded font-medium">1</button>
                <button className="px-3 py-1 border border-slate-200 bg-white text-slate-400 rounded hover:bg-slate-50 disabled:opacity-50" disabled>&gt;</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
