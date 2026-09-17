import React, { useState, useEffect } from 'react';
import { featureApi } from '../../api/featureApi';
import { validateFeatureForm, validateUpdateFeatureForm } from '../../validators/featureFormValidator';
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
        status: 1,
        type: 1
    });

    // View Modal state
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [isViewing, setIsViewing] = useState(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({ name: '', description: '' });
    const [editFormErrors, setEditFormErrors] = useState({});

    // Status Modal State
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusToUpdate, setStatusToUpdate] = useState(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Prevent background scroll when modal is open
    useEffect(() => {
        if (isCreateModalOpen || isViewModalOpen || isEditModalOpen || isStatusModalOpen || isDeleteModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isCreateModalOpen, isViewModalOpen, isEditModalOpen, isStatusModalOpen, isDeleteModalOpen]);

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

    const openEditModal = () => {
        setEditFormData({
            name: selectedFeature.name || '',
            description: selectedFeature.description || ''
        });
        setEditFormErrors({});
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        const { isValid, errors } = validateUpdateFeatureForm(editFormData);
        if (!isValid) {
            setEditFormErrors(errors);
            return;
        }
        setEditFormErrors({});
        
        try {
            setIsSubmitting(true);
            await featureApi.updateFeature(selectedFeature.id, editFormData);
            setIsEditModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
            showToast('Feature updated successfully!', 'success');
            handleViewFeature(selectedFeature.id);
        } catch (err) {
            console.error("Error updating feature:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to update feature.";
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            setIsSubmitting(true);
            await featureApi.updateFeatureStatus(selectedFeature.id, { status: statusToUpdate });
            setIsStatusModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
            showToast('Feature status updated successfully!', 'success');
            handleViewFeature(selectedFeature.id);
        } catch (err) {
            console.error("Error updating feature status:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to update status.";
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteFeature = async () => {
        try {
            setIsSubmitting(true);
            await featureApi.deleteFeature(selectedFeature.id);
            setIsDeleteModalOpen(false);
            setIsViewModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
            showToast('Feature deleted successfully!', 'success');
        } catch (err) {
            console.error("Error deleting feature:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to delete feature.";
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Active Features</p>
                    <p className="text-2xl font-extrabold text-white mt-1">{features.filter(f => f.status === 1).length}</p>
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
                            placeholder="Search by code or name..." 
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

            {/* Features table container */}
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-[#f8f9fa] border-b border-gray-200 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                                <th className="py-2.5 px-3 w-8 text-center">SI</th>
                                <th className="py-2.5 px-3">NAME</th>
                                <th className="py-2.5 px-3">CODE</th>
                                <th className="py-2.5 px-3">DESCRIPTION</th>
                                <th className="py-2.5 px-3">CREATED AT</th>
                                <th className="py-2.5 px-3">STATUS</th>
                                <th className="py-2.5 px-3">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-6 px-6 text-center text-gray-500">Loading features...</td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="7" className="py-6 px-6 text-center text-red-500">{error}</td>
                                </tr>
                            ) : features.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-6 px-6 text-center text-gray-500">No features found.</td>
                                </tr>
                            ) : (
                                features.map((feature, index) => (
                                    <tr key={feature.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="py-2.5 px-3 text-center text-gray-400 font-medium">{(pageNumber - 1) * pageSize + index + 1}</td>
                                        <td className="py-2.5 px-3 text-[#141824] font-semibold">
                                            <div className="truncate w-full max-w-[200px]" title={feature.name}>{feature.name}</div>
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-600 font-mono">
                                            <div className="truncate w-full max-w-[150px]" title={feature.code}>{feature.code}</div>
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-600">
                                            <div className="truncate w-full max-w-[250px]" title={feature.description || 'N/A'}>{feature.description || 'N/A'}</div>
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-600">
                                            {new Date(feature.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-2.5 px-3">{getStatusBadge(feature.status)}</td>
                                        <td className="py-2.5 px-3">
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => handleViewFeature(feature.id)}
                                                    className="text-[12px] font-medium text-teal-600 hover:text-teal-700 hover:underline focus:outline-none"
                                                >
                                                    View
                                                </button>
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
                                    onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
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
                                    onChange={(e) => setNewFeature({ ...newFeature, code: e.target.value })}
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
                                    onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 text-sm h-24 resize-none ${formErrors.description ? 'border-red-500' : 'border-gray-200'}`}
                                    placeholder="e.g. Track and manage employee attendance."
                                />
                                {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Feature Type</label>
                                <select
                                    value={newFeature.type}
                                    onChange={(e) => setNewFeature({ ...newFeature, type: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 text-sm bg-white border-gray-200"
                                >
                                    <option value={1}>Access Based (Allow/Deny access)</option>
                                    <option value={2}>Limit Based (Limit usage for a plan)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                <select
                                    value={newFeature.status}
                                    onChange={(e) => setNewFeature({ ...newFeature, status: Number(e.target.value) })}
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
                                        <div className="text-gray-500 font-medium">Type</div>
                                        <div>
                                            <span className="px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded">
                                                {selectedFeature.type === 2 ? 'Limit-Based' : 'Access-Based'}
                                            </span>
                                        </div>
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
                        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button onClick={openEditModal} className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition shadow-sm">
                                    Edit
                                </button>
                                <button onClick={() => { setStatusToUpdate(selectedFeature?.status === 1 ? 2 : 1); setIsStatusModalOpen(true); }} className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded transition shadow-sm">
                                    Change Status
                                </button>
                                <button onClick={() => setIsDeleteModalOpen(true)} className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded transition">
                                    Delete
                                </button>
                            </div>
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
            {/* Edit Feature Modal */}
            {isEditModalOpen && selectedFeature && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                        <div className="px-6 py-4 border-b border-indigo-100 bg-indigo-50/50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <i className="fa-solid fa-pen text-sm"></i>
                                </div>
                                Edit Feature
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Feature Name</label>
                                <input 
                                    type="text"
                                    value={editFormData.name}
                                    onChange={(e) => {
                                        setEditFormData({...editFormData, name: e.target.value});
                                        if (editFormErrors.name) setEditFormErrors({...editFormErrors, name: null});
                                    }}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 text-sm transition-shadow ${editFormErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                                />
                                {editFormErrors.name && <p className="text-red-500 text-[10px] mt-1">{editFormErrors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                                <textarea 
                                    value={editFormData.description}
                                    onChange={(e) => {
                                        setEditFormData({...editFormData, description: e.target.value});
                                        if (editFormErrors.description) setEditFormErrors({...editFormErrors, description: null});
                                    }}
                                    rows="3"
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 text-sm resize-none transition-shadow ${editFormErrors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                                ></textarea>
                                {editFormErrors.description && <p className="text-red-500 text-[10px] mt-1">{editFormErrors.description}</p>}
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 bg-slate-50 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSubmit}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-xs font-semibold text-white bg-[#141824] hover:bg-slate-800 rounded-lg transition shadow-sm disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Modal */}
            {isStatusModalOpen && selectedFeature && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-power-off text-2xl text-slate-600"></i>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Change Feature Status?</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Are you sure you want to change the status of <strong>{selectedFeature.name}</strong> to <span className="font-bold">{statusToUpdate === 1 ? 'Active' : 'Inactive'}</span>?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsStatusModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#141824] hover:bg-slate-800 rounded-lg transition shadow-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Updating...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && selectedFeature && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4 text-rose-600">
                                <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Feature?</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Are you sure you want to delete <strong>{selectedFeature.name}</strong>? This action will mark the feature as deleted.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteFeature}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
