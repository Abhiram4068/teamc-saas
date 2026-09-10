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
            case 1: return <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">Active</span>;
            case 2: return <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full">Inactive</span>;
            case 3: return <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Draft</span>;
            case 4: return <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">Archived</span>;
            case 5: return <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full">Deleted</span>;
            default: return <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Unknown</span>;
        }
    };

    const getCurrencySymbol = (currencyEnum) => {
        switch(currencyEnum) {
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
                        to="/superadmin/plans/public-pricing"
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded hover:bg-gray-50 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        View Public Pricing Page
                    </Link>
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
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Subscribed Tenants</p>
                    <p className="text-2xl font-extrabold text-white mt-1">1,106</p>
                    <p className="text-xs text-emerald-400 font-medium mt-1">+4.2% this month</p>
                </div>
                <div className="bg-[#141824] border border-[#252c40] rounded p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">MRR from Plans</p>
                    <p className="text-2xl font-extrabold text-white mt-1">&#8377;12.4L</p>
                    <p className="text-xs text-red-400 font-medium mt-1">-0.6% this month</p>
                </div>
                <div className="bg-[#141824] border border-[#252c40] rounded p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Most Popular</p>
                    <p className="text-2xl font-extrabold text-white mt-1">Premium</p>
                    <p className="text-xs text-slate-400 mt-1">612 tenants on this tier</p>
                </div>
            </div>

            {/* Plans table container */}
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-wrap gap-4">
                    <div className="relative flex-1 max-w-2xl">
                        <input 
                            type="text" 
                            placeholder="Search by plan code or name..." 
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPageNumber(1); }}
                        />
                        <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <div className="flex items-center gap-6">
                        <select 
                            className="py-2 px-3 pr-8 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500 bg-white text-gray-600 min-w-[120px]"
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
                        
                        <div className="flex flex-col items-end justify-center border-l border-gray-200 pl-6 h-full">
                            <div className="flex items-center text-sm text-gray-600 gap-2">
                                <span>Page {pageNumber} of {Math.ceil(totalCount / pageSize) || 1}</span>
                                <div className="flex items-center">
                                    <button 
                                        disabled={pageNumber === 1}
                                        onClick={() => setPageNumber(prev => prev - 1)}
                                        className="p-1 hover:bg-gray-100 rounded text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button 
                                        disabled={pageNumber * pageSize >= totalCount}
                                        onClick={() => setPageNumber(prev => prev + 1)}
                                        className="p-1 hover:bg-gray-100 rounded text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>
                            <span className="text-[11px] text-gray-400 mt-0.5">
                                Showing {plans.length} of {totalCount} results
                            </span>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[980px]">
                        <thead>
                            <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
                                <th className="py-3 px-6">NAME</th>
                                <th className="py-3 px-6">CODE</th>
                                <th className="py-3 px-6">DESCRIPTION</th>
                                <th className="py-3 px-6">STATUS</th>
                                <th className="py-3 px-6">MONTHLY</th>
                                <th className="py-3 px-6">YEARLY</th>
                                <th className="py-3 px-6">TRIAL</th>
                                <th className="py-3 px-6 text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="py-6 px-6 text-center text-gray-500">Loading plans...</td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="8" className="py-6 px-6 text-center text-red-500">{error}</td>
                                </tr>
                            ) : plans.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-6 px-6 text-center text-gray-500">No plans found.</td>
                                </tr>
                            ) : (
                                plans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-6 text-gray-800 font-semibold text-[13px]">
                                            <div className="truncate w-full max-w-[150px]" title={plan.name}>{plan.name}</div>
                                        </td>
                                        <td className="py-3 px-6 text-gray-600 text-[13px] font-mono">
                                            <div className="truncate w-full max-w-[120px]" title={plan.code}>{plan.code}</div>
                                        </td>
                                        <td className="py-3 px-6 text-gray-600 text-[13px]">
                                            <div className="truncate w-full max-w-[200px]" title={plan.description || 'N/A'}>
                                                {plan.description || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="py-3 px-6">{getStatusBadge(plan.status)}</td>
                                        <td className="py-3 px-6 text-gray-600 text-[13px]">
                                            <div className="truncate w-full max-w-[80px]" title={plan.monthlyPrice === 0 ? 'Free' : `${getCurrencySymbol(plan.currency)}${plan.monthlyPrice.toFixed(2)}`}>
                                                {plan.monthlyPrice === 0 ? 'Free' : `${getCurrencySymbol(plan.currency)}${plan.monthlyPrice.toFixed(2)}`}
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-gray-600 text-[13px]">
                                            <div className="truncate w-full max-w-[80px]" title={plan.yearlyPrice === 0 ? 'Free' : `${getCurrencySymbol(plan.currency)}${plan.yearlyPrice.toFixed(2)}`}>
                                                {plan.yearlyPrice === 0 ? 'Free' : `${getCurrencySymbol(plan.currency)}${plan.yearlyPrice.toFixed(2)}`}
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-gray-600 text-[13px]">
                                            <div className="truncate w-full max-w-[80px]" title={plan.trialPeriodDays ? `${plan.trialPeriodDays} days` : '—'}>
                                                {plan.trialPeriodDays ? `${plan.trialPeriodDays} days` : <>&mdash;</>}
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <Link
                                                    to={`/superadmin/plans/${plan.id}`}
                                                    className="text-[12px] font-medium text-emerald-600 hover:underline"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    to={`/superadmin/plans/${plan.id}/edit`}
                                                    className="text-[12px] font-medium text-blue-600 hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
        </div>
    );
}
