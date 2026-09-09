import React, { useState, useEffect } from 'react';
import { featureApi } from '../../api/featureApi';

export default function SuperAdminViewFeatures() {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                setLoading(true);
                const response = await featureApi.getFeatures({ 
                    pageNumber, 
                    pageSize,
                    searchTerm: searchTerm || undefined,
                    status: statusFilter || undefined
                });
                
                if (response?.data?.items) {
                    setFeatures(response.data.items);
                    setTotalCount(response.data.totalCount || 0);
                } else if (response?.data) { // fallback
                    setFeatures(response.data);
                    setTotalCount(response.data.length || 0);
                }
            } catch (err) {
                console.error("Error fetching features:", err);
                setError("Failed to load features.");
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchFeatures();
        }, 400); // 400ms debounce

        return () => clearTimeout(timer);
    }, [pageNumber, pageSize, searchTerm, statusFilter]);

    const getStatusBadge = (status) => {
        // Enums mapping: 1=Active, 2=Inactive, 3=Draft, 4=Archived, 5=Deleted
        switch (status) {
            case 1:
                return <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Active</span>;
            case 2:
                return <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full">Inactive</span>;
            case 3:
                return <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Draft</span>;
            case 4:
                return <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">Archived</span>;
            case 5:
                return <span className="text-xs font-semibold text-red-800 bg-red-200 px-2 py-1 rounded-full">Deleted</span>;
            default:
                return <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Unknown</span>;
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Page header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-800">Manage Features</h1>
                    <p className="text-sm text-gray-500 mt-1">Define the capabilities available in the system and control which plans unlock them.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 text-sm font-semibold text-brand-800 bg-white border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        View Plan Mapping
                    </button>
                    <button className="flex items-center gap-2 text-sm font-semibold text-white bg-brand-600 hover:bg-blue-700 px-4 py-2.5 rounded-lg shadow-sm transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Create New Feature
                    </button>
                </div>
            </div>

            {/* Summary strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Features</p>
                    <p className="text-2xl font-extrabold text-brand-800 mt-1">{features.length}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {features.filter(f => f.status === 1).length} active &middot; {features.filter(f => f.status === 3).length} draft
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categories</p>
                    <p className="text-2xl font-extrabold text-brand-800 mt-1">5</p>
                    <p className="text-xs text-gray-400 mt-1">Core HR, Security, Support...</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mapped to Plans</p>
                    <p className="text-2xl font-extrabold text-brand-800 mt-1">16</p>
                    <p className="text-xs text-green-600 font-medium mt-1">2 unmapped</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Most Gated Feature</p>
                    <p className="text-2xl font-extrabold text-brand-800 mt-1">SSO</p>
                    <p className="text-xs text-gray-400 mt-1">Enterprise only</p>
                </div>
            </div>

            {/* Features table */}
            <div className="bg-white border border-gray-200 rounded- overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-wrap gap-4">
                    <div>
                        <h2 className="text-base font-bold text-brand-800">All Features</h2>
                        <p className="text-xs text-gray-500 mt-0.5">System-wide capabilities that can be enabled per plan.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search code/name..." 
                                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 w-[200px]"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPageNumber(1); }}
                            />
                            <svg className="w-4 h-4 absolute left-2.5 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <select 
                            className="py-1.5 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 bg-white"
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
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left text-sm min-w-[980px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                <th className="p-4 w-[20%]">Name</th>
                                <th className="p-4 w-[15%]">Code</th>
                                <th className="p-4 w-[25%]">Description</th>
                                <th className="p-4 w-[15%]">Created At</th>
                                <th className="p-4 w-[15%]">Status</th>
                                <th className="p-4 w-[10%] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-4 text-center text-gray-500">Loading features...</td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="p-4 text-center text-red-500">{error}</td>
                                </tr>
                            ) : features.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-4 text-center text-gray-500">No features found.</td>
                                </tr>
                            ) : (
                                features.map((feature) => (
                                    <tr key={feature.id} className="hover:bg-gray-50/40">
                                        <td className="p-4 font-semibold text-brand-800">
                                            <div className="truncate w-full max-w-[200px]" title={feature.name}>
                                                {feature.name}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 font-mono text-xs">
                                            <div className="truncate w-full max-w-[150px]" title={feature.code}>
                                                {feature.code}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            <div className="truncate w-full max-w-[250px]" title={feature.description || 'N/A'}>
                                                {feature.description || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 text-xs">
                                            {new Date(feature.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">{getStatusBadge(feature.status)}</td>
                                        <td className="p-4 text-right">
                                            <button className="text-xs font-semibold text-brand-600 hover:underline">Edit</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl mt-4">
                <span className="text-sm text-gray-500">
                    Showing {features.length > 0 ? (pageNumber - 1) * pageSize + 1 : 0} to {Math.min(pageNumber * pageSize, totalCount)} of {totalCount} entries
                </span>
                <div className="flex items-center gap-2">
                    <button 
                        disabled={pageNumber === 1}
                        onClick={() => setPageNumber(prev => prev - 1)}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Previous
                    </button>
                    <button 
                        disabled={pageNumber * pageSize >= totalCount}
                        onClick={() => setPageNumber(prev => prev + 1)}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
