import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import { planApi } from '../../api/planApi';

export default function SuperAdminViewPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);


    // Debounce search input
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch when page, size, filter, or debounced search changes
    useEffect(() => {
        fetchPlans();
    }, [pageNumber, pageSize, statusFilter, debouncedSearchTerm]);

    async function fetchPlans() {
        try {
            setLoading(true);
            const response = await planApi.getPlans({
                pageNumber,
                pageSize,
                searchTerm: debouncedSearchTerm || undefined,
                status: statusFilter || undefined
            });

            if (response?.data?.items) {
                setPlans(response.data.items);
                setTotalCount(response.data.totalCount || 0);
            } else if (response?.data) {
                setPlans(response.data);
                setTotalCount(response.data.length || 0);
            }
        } catch (err) {
            console.error("Error fetching plans:", err);
            setError("Failed to load plans.");
        } finally {
            setLoading(false);
        }
    }


    const getStatusBadge = (status) => {
        // Enums mapping: 1=Active, 2=Inactive, 3=Draft, 4=Archived, 5=Deleted
        switch (status) {
            case 1: return <span className="text-xs font-semibold text-emerald-700">Active</span>;
            case 2: return <span className="text-xs font-semibold text-red-700">Inactive</span>;
            case 3: return <span className="text-xs font-semibold text-gray-600">Draft</span>;
            case 4: return <span className="text-xs font-semibold text-amber-700">Archived</span>;
            case 5: return <span className="text-xs font-semibold text-red-700">Deleted</span>;
            default: return <span className="text-xs font-semibold text-gray-600">Unknown</span>;
        }
    };

    const getCurrencySymbol = (currencyEnum) => {
        switch (currencyEnum) {
            case 1: return '₹';
            case 2: return '$';
            case 3: return '€';
            case 4: return '£';
            default: return '₹';
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f1f5f9] min-h-screen">
            {/* Page header */}
            <div className="bg-white rounded border border-gray-200 p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <Breadcrumb items={[
                        { label: 'Home', to: '/superadmin/dashboard' },
                        { label: 'Plans' }
                    ]} />
                    <h1 className="text-2xl font-bold text-gray-800 mt-2">Manage Plans</h1>
                    <p className="text-sm text-gray-400 mt-1">Control what tenants see on the public pricing page and what each tier unlocks.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/superadmin/create-plan/"
                        className="flex items-center gap-2 text-sm font-semibold text-white bg-[#141824] hover:bg-[#252c40] px-4 py-2 rounded shadow-sm transition"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Create New Plan
                    </Link>
                </div>
            </div>

            {/* Summary strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#141824] border border-[#252c40] rounded p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Plans</p>
                    <p className="text-2xl font-extrabold text-white mt-1">{plans.length}</p>
                    <p className="text-xs text-slate-400 mt-1">
                        {plans.filter(p => p.status === 1).length} active &middot; {plans.filter(p => p.status === 3).length} draft
                    </p>
                </div>
                <div className="bg-[#141824] border border-[#252c40] rounded p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Active Plans</p>
                    <p className="text-2xl font-extrabold text-white mt-1">{plans.filter(p => p.status === 1).length}</p>
                    <p className="text-xs text-slate-400 mt-1">Currently active</p>
                </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center justify-end gap-3 mb-4">
                <div className="flex items-center space-x-2">
                    <div className="relative w-56">
                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-[10px] text-gray-400"></i>
                        <input 
                            type="text" 
                            placeholder="Search by plan code or name..." 
                            className="w-full bg-white text-xs text-slate-700 pl-8 pr-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:border-blue-500 shadow-sm placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPageNumber(1); }}
                        />
                    </div>
                    <select
                        className="bg-white border border-gray-200 text-slate-600 text-xs px-2.5 py-1.5 rounded shadow-sm focus:outline-none focus:border-blue-500 appearance-none"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPageNumber(1); }}
                    >
                        <option value="">All Status</option>
                        <option value="1">Active</option>
                        <option value="2">Inactive</option>
                        <option value="3">Draft</option>
                        <option value="4">Archived</option>
                        <option value="5">Deleted</option>
                    </select>
                </div>
            </div>

            {/* Plans table container */}
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-[#f8f9fa] border-b border-gray-200 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                                <th className="py-2.5 px-3 w-8 text-center">SI</th>
                                <th className="py-2.5 px-3">NAME</th>
                                <th className="py-2.5 px-3">CODE</th>
                                <th className="py-2.5 px-3">DESCRIPTION</th>
                                <th className="py-2.5 px-3">STATUS</th>
                                <th className="py-2.5 px-3">MONTHLY</th>
                                <th className="py-2.5 px-3">YEARLY</th>
                                <th className="py-2.5 px-3">TRIAL</th>
                                <th className="py-2.5 px-3">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="py-6 px-6 text-center text-gray-500">Loading plans...</td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="9" className="py-6 px-6 text-center text-red-500">{error}</td>
                                </tr>
                            ) : plans.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-6 px-6 text-center text-gray-500">No plans found.</td>
                                </tr>
                            ) : (
                                plans.map((plan, index) => (
                                    <tr key={plan.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="py-2.5 px-3 text-center text-gray-400 font-medium">{(pageNumber - 1) * pageSize + index + 1}</td>
                                        <td className="py-2.5 px-3 text-[#141824] font-semibold">{plan.name}</td>
                                        <td className="py-2.5 px-3 text-slate-600 font-mono">{plan.code}</td>
                                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-[200px]" title={plan.description}>{plan.description || 'N/A'}</td>
                                        <td className="py-2.5 px-3">{getStatusBadge(plan.status)}</td>
                                        <td className="py-2.5 px-3 text-slate-600">
                                            {plan.monthlyPrice === 0 ? 'Free' : `${getCurrencySymbol(plan.currency)}${plan.monthlyPrice.toFixed(2)}`}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-600">
                                            {plan.yearlyPrice === 0 ? 'Free' : `${getCurrencySymbol(plan.currency)}${plan.yearlyPrice.toFixed(2)}`}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-600">
                                            {plan.trialPeriodDays ? `${plan.trialPeriodDays} days` : <>&mdash;</>}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    to={`/superadmin/plans/${plan.id}`}
                                                    className="text-[12px] font-medium text-teal-600 hover:text-teal-700 hover:underline focus:outline-none"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION BAR */}
                <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-white text-xs text-gray-500">
                    <div>
                        {totalCount > 0 ? `${(pageNumber - 1) * pageSize + 1} to ${Math.min(pageNumber * pageSize, totalCount)} Items of ${totalCount}` : '0 Items'}
                    </div>
                    <div className="flex items-center space-x-1">
                        <button 
                            onClick={() => setPageNumber(prev => prev - 1)}
                            disabled={pageNumber === 1}
                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed"
                        >
                            <i className="fa-solid fa-chevron-left text-[8px]"></i>
                        </button>
                        <button className="w-6 h-6 flex items-center justify-center rounded bg-[#141824] text-white font-medium text-xs">{pageNumber}</button>
                        {(pageNumber * pageSize) < totalCount && (
                            <button 
                                onClick={() => setPageNumber(prev => prev + 1)}
                                className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-slate-600 hover:bg-gray-50 text-xs"
                            >
                                {pageNumber + 1}
                            </button>
                        )}
                        <button 
                            onClick={() => setPageNumber(prev => prev + 1)}
                            disabled={pageNumber * pageSize >= totalCount}
                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-slate-600 hover:bg-gray-50 text-xs disabled:cursor-not-allowed disabled:text-gray-300"
                        >
                            <i className="fa-solid fa-chevron-right text-[8px]"></i>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
