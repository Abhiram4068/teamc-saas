import React, { useState, useEffect } from 'react';
import { featureApi } from '../../api/featureApi';
import { validateFeatureForm } from '../../validators/featureFormValidator';
import { useToast } from '../../utils/Toast';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function SuperAdminViewFeatures() {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [formErrors, setFormErrors] = useState({});
    const { showToast } = useToast();
    const [newFeature, setNewFeature] = useState({
        name: '',
        code: '',
        description: '',
        status: 1
    });
    
    // View Modal state
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [isViewing, setIsViewing] = useState(false);

    // Prevent background scroll when modal is open
    useEffect(() => {
        if (isCreateModalOpen || isViewModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isCreateModalOpen, isViewModalOpen]);

    // Debounce search input
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch when page, size, filter, debounced search, or refresh trigger changes
    useEffect(() => {
        fetchFeatures();
    }, [pageNumber, pageSize, statusFilter, debouncedSearchTerm, refreshTrigger]);

    async function fetchFeatures() {
        try {
            setLoading(true);
            const response = await featureApi.getFeatures({ 
                pageNumber, 
                pageSize,
                searchTerm: debouncedSearchTerm || undefined,
                status: statusFilter || undefined
            });
            
            if (response?.data?.items) {
                setFeatures(response.data.items);
                setTotalCount(response.data.totalCount || 0);
            } else if (response?.data) {
                setFeatures(response.data);
                setTotalCount(response.data.length || 0);
            }
        } catch (err) {
            console.error("Error fetching features:", err);
            setError("Failed to load features.");
        } finally {
            setLoading(false);
        }
    }

    const handleCreateFeature = async (e) => {
        e.preventDefault();
        
        const { isValid, errors } = validateFeatureForm(newFeature);
        if (!isValid) {
            setFormErrors(errors);
            return;
        }
        
        setFormErrors({});
        try {
            setIsSubmitting(true);
            await featureApi.createFeature(newFeature);
            setIsCreateModalOpen(false);
            setNewFeature({ name: '', code: '', description: '', status: 1 });
            setRefreshTrigger(prev => prev + 1);
            showToast('Feature created successfully!', 'success');
        } catch (err) {
            console.error("Error creating feature:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to create feature.";
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewFeature = async (id) => {
        try {
            setIsViewing(true);
            setSelectedFeature(null);
            setIsViewModalOpen(true);
            const response = await featureApi.getFeatureById(id);
            if (response.success && response.data) {
                setSelectedFeature(response.data);
            } else {
                showToast("Invalid response format.", 'error');
                setIsViewModalOpen(false);
            }
        } catch (err) {
            console.error("Error fetching feature details:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch feature details.";
            showToast(errorMessage, 'error');
            setIsViewModalOpen(false);
        } finally {
            setIsViewing(false);
        }
    };

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

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f1f5f9] min-h-screen">
            {/* Page header */}
            <div className="bg-white rounded border border-gray-200 p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <Breadcrumb items={[
                        { label: 'Home', to: '/superadmin/dashboard' },
                        { label: 'Features' }
                    ]} />
                    <h1 className="text-2xl font-bold text-gray-800 mt-2">Manage Features</h1>
                    <p className="text-sm text-gray-400 mt-1">Define the capabilities available in the system and control which plans unlock them.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded hover:bg-gray-50 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Dashboard Overview
                    </button>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 text-sm font-semibold text-white bg-[#141824] hover:bg-[#252c40] px-4 py-2 rounded shadow-sm transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Create New Feature
                    </button>
                </div>
            </div>

            {/* Summary strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#141824] border border-[#252c40] rounded p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Features</p>
                    <p className="text-2xl font-extrabold text-white mt-1">{features.length}</p>
                    <p className="text-xs text-slate-400 mt-1">
                        {features.filter(f => f.status === 1).length} active &middot; {features.filter(f => f.status === 3).length} draft
                    </p>
                </div>
                <div className="bg-[#141824] border border-[#252c40] rounded p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Categories</p>
                    <p className="text-2xl font-extrabold text-white mt-1">5</p>
                    <p className="text-xs text-slate-400 mt-1">Core HR, Security, Support...</p>
                </div>
                <div className="bg-[#141824] border border-[#252c40] rounded p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Mapped to Plans</p>
                    <p className="text-2xl font-extrabold text-white mt-1">16</p>
                    <p className="text-xs text-emerald-400 font-medium mt-1">2 unmapped</p>
                </div>
                <div className="bg-[#141824] border border-[#252c40] rounded p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Most Gated Feature</p>
                    <p className="text-2xl font-extrabold text-white mt-1">SSO</p>
                    <p className="text-xs text-slate-400 mt-1">Enterprise only</p>
                </div>
            </div>

            {/* Features table container */}
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-wrap gap-4">
                    <div className="relative flex-1 max-w-2xl">
                        <input 
                            type="text" 
                            placeholder="Search by code or name..." 
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-brand-500"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPageNumber(1); }}
                        />
                        <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <div className="flex items-center gap-6">
                        <select 
                            className="py-2 px-3 pr-8 text-sm border border-gray-200 rounded focus:outline-none focus:border-brand-500 bg-white text-gray-600 min-w-[120px]"
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
                                Showing {features.length} of {totalCount} results
                            </span>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[980px]">
                        <thead>
                            <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                <th className="py-3 px-6 w-[20%]">NAME</th>
                                <th className="py-3 px-6 w-[15%]">CODE</th>
                                <th className="py-3 px-6 w-[25%]">DESCRIPTION</th>
                                <th className="py-3 px-6 w-[15%]">CREATED AT</th>
                                <th className="py-3 px-6 w-[15%]">STATUS</th>
                                <th className="py-3 px-6 w-[10%] text-center">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-6 px-6 text-center text-gray-500">Loading features...</td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="py-6 px-6 text-center text-red-500">{error}</td>
                                </tr>
                            ) : features.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-6 px-6 text-center text-gray-500">No features found.</td>
                                </tr>
                            ) : (
                                features.map((feature) => (
                                    <tr key={feature.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-6 text-gray-800 font-medium text-[13px]">
                                            <div className="truncate w-full max-w-[200px]" title={feature.name}>
                                                {feature.name}
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-gray-600 text-[13px]">
                                            <div className="truncate w-full max-w-[150px]" title={feature.code}>
                                                {feature.code}
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-gray-600 text-[13px]">
                                            <div className="truncate w-full max-w-[250px]" title={feature.description || 'N/A'}>
                                                {feature.description || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-gray-500 text-[13px]">
                                            {new Date(feature.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-6">{getStatusBadge(feature.status)}</td>
                                        <td className="py-3 px-6 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button 
                                                    onClick={() => handleViewFeature(feature.id)}
                                                    className="text-[12px] font-medium text-emerald-600 hover:underline"
                                                >
                                                    View
                                                </button>
                                                <button className="text-[12px] font-medium text-blue-600 hover:underline">
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Feature Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">Create New Feature</h2>
                            <button onClick={() => { setIsCreateModalOpen(false); setFormErrors({}); }} className="text-gray-400 hover:text-gray-600 transition">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateFeature} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newFeature.name}
                                    onChange={(e) => setNewFeature({...newFeature, name: e.target.value})}
                                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 text-sm ${formErrors.name ? 'border-red-500' : 'border-gray-200'}`}
                                    placeholder="e.g. Attendance Management"
                                />
                                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Code</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newFeature.code}
                                    onChange={(e) => setNewFeature({...newFeature, code: e.target.value})}
                                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 text-sm ${formErrors.code ? 'border-red-500' : 'border-gray-200'}`}
                                    placeholder="e.g. ATTENDANCE"
                                />
                                {formErrors.code && <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                <textarea 
                                    required
                                    value={newFeature.description}
                                    onChange={(e) => setNewFeature({...newFeature, description: e.target.value})}
                                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 text-sm h-24 resize-none ${formErrors.description ? 'border-red-500' : 'border-gray-200'}`}
                                    placeholder="e.g. Track and manage employee attendance."
                                />
                                {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                <select 
                                    value={newFeature.status}
                                    onChange={(e) => setNewFeature({...newFeature, status: Number(e.target.value)})}
                                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 text-sm bg-white ${formErrors.status ? 'border-red-500' : 'border-gray-200'}`}
                                >
                                    <option value={1}>Active</option>
                                    <option value={3}>Draft</option>
                                </select>
                                {formErrors.status && <p className="text-red-500 text-xs mt-1">{formErrors.status}</p>}
                            </div>
                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                                <button 
                                    type="button" 
                                    onClick={() => { setIsCreateModalOpen(false); setFormErrors({}); }}
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 border border-transparent rounded transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-[#141824] hover:bg-[#252c40] rounded shadow-sm disabled:opacity-50 transition"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Feature'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Feature Modal */}
            {isViewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <h2 className="text-lg font-bold text-gray-800">Feature Details</h2>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            {isViewing || !selectedFeature ? (
                                <div className="flex justify-center items-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                                </div>
                            ) : (
                                <div className="space-y-5 text-sm">
                                    <div className="grid grid-cols-[120px_1fr] gap-4 border-b border-gray-50 pb-4">
                                        <div className="text-gray-500 font-medium">Name</div>
                                        <div className="text-gray-800 font-semibold">{selectedFeature.name}</div>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] gap-4 pb-4">
                                        <div className="text-gray-500 font-medium">Code</div>
                                        <div className="text-gray-800 font-mono text-xs px-2 py-1 inline-block w-max">{selectedFeature.code}</div>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] gap-4 border-b border-gray-50 pb-4">
                                        <div className="text-gray-500 font-medium">Status</div>
                                        <div>{getStatusBadge(selectedFeature.status)}</div>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] gap-4 border-b border-gray-50 pb-4">
                                        <div className="text-gray-500 font-medium">Description</div>
                                        <div className="text-gray-700 whitespace-pre-wrap break-words max-h-48 overflow-y-auto border border-gray-200 p-3 bg-gray-50">
                                            {selectedFeature.description || 'No description provided.'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] gap-4 border-b border-gray-50 pb-4">
                                        <div className="text-gray-500 font-medium">Created By</div>
                                        <div className="text-gray-800">{selectedFeature.createdBy || 'Unknown'}</div>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] gap-4">
                                        <div className="text-gray-500 font-medium">Created At</div>
                                        <div className="text-gray-800">{new Date(selectedFeature.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end">
                            <button 
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 border border-gray-200 rounded transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
