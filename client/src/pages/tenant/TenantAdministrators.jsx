import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminUserApi } from '../../api/adminUserApi';
import { useToast } from '../../utils/Toast';
import { validateUpdateTenantAdminRequest } from '../../validators/adminUserValidator';
import { useFeatures } from '../../features/FeatureProvider';

export default function TenantAdministrators() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { features } = useFeatures();
  const adminLimitFeature = features?.find(f => f.code === 'ADMIN_LIMIT');
  const adminLimit = adminLimitFeature ? adminLimitFeature.limit : 0;

  const isLimitReached = !loading && adminLimit > 0 && admins.length >= adminLimit;

  // Modals state
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ firstName: '', lastName: '', phone: '' });
  const [editError, setEditError] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const [statusConfirmAdmin, setStatusConfirmAdmin] = useState(null);
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const [deleteConfirmAdmin, setDeleteConfirmAdmin] = useState(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await adminUserApi.getTenantAdmins();
      setAdmins(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load administrators.');
    } finally {
      setLoading(false);
    }
  };

  // --- EDIT LOGIC ---
  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setEditFormData({
      firstName: admin.firstName,
      lastName: admin.lastName,
      phone: admin.phone || ''
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingAdmin(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    const validation = validateUpdateTenantAdminRequest(editFormData);
    if (!validation.isValid) {
      setEditError(validation.errorMessage);
      return;
    }

    setIsSubmittingEdit(true);
    try {
      await adminUserApi.updateTenantAdmin(editingAdmin.id, editFormData);
      showToast('Admin updated successfully.', 'success');
      closeEditModal();
      fetchAdmins();
    } catch (err) {
      if (err.errors) {
        setEditError(Object.values(err.errors).flat().join(' '));
      } else {
        setEditError(err.message || 'Update failed.');
      }
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // --- STATUS LOGIC ---
  const handleToggleStatus = async () => {
    if (!statusConfirmAdmin) return;
    setIsSubmittingStatus(true);
    try {
      // UserStatus: 0 = Pending, 1 = Active, 2 = Inactive, 3 = Deleted
      const newStatus = statusConfirmAdmin.status === 1 ? 0 : 1; 
      await adminUserApi.updateTenantAdminStatus(statusConfirmAdmin.id, newStatus);
      showToast(`Admin status updated to ${newStatus === 1 ? 'Active' : 'Inactive'}.`, 'success');
      setStatusConfirmAdmin(null);
      fetchAdmins();
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  // --- DELETE LOGIC ---
  const handleDelete = async () => {
    if (!deleteConfirmAdmin) return;
    setIsSubmittingDelete(true);
    try {
      await adminUserApi.deleteTenantAdmin(deleteConfirmAdmin.id);
      showToast('Admin deleted successfully.', 'success');
      setDeleteConfirmAdmin(null);
      fetchAdmins();
    } catch (err) {
      showToast(err.message || 'Failed to delete admin.', 'error');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  return (
    <div
      className="max-w-7xl mx-auto space-y-8 pb-20 px-8 mt-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Administrators</h1>
            <p className="text-xs text-slate-500 mt-1">Manage organizational access and privileges.</p>
          </div>
          <button
            onClick={() => navigate('/tenant/add-admin')}
            disabled={isLimitReached}
            title={isLimitReached ? `Your plan only allows ${adminLimit} admin${adminLimit !== 1 ? 's' : ''}` : ''}
            className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-plus"></i>
            Add Admin
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-gray-400"></i>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              No administrators found
            </h3>
            <p className="text-xs text-slate-500">
              You do not have any active administrators assigned yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th scope="col" className="pb-3 font-semibold text-slate-500 uppercase tracking-wider text-left">User</th>
                  <th scope="col" className="pb-3 font-semibold text-slate-500 uppercase tracking-wider text-left">Contact</th>
                  <th scope="col" className="pb-3 font-semibold text-slate-500 uppercase tracking-wider text-left">Status</th>
                  <th scope="col" className="pb-3 font-semibold text-slate-500 uppercase tracking-wider text-left">Joined</th>
                  <th scope="col" className="pb-3 font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-9 w-9 flex-shrink-0 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                          {admin.firstName.charAt(0)}{admin.lastName.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-slate-900">{admin.firstName} {admin.lastName}</div>
                          <div className="text-slate-500 mt-0.5">Role: Tenant Admin</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <div className="text-slate-900 flex items-center gap-2">
                        <i className="fa-regular fa-envelope text-slate-400 w-3"></i> {admin.email}
                      </div>
                      <div className="text-slate-500 mt-1 flex items-center gap-2">
                        <i className="fa-solid fa-phone text-slate-400 w-3"></i> {admin.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      {admin.status === 1 ? (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-emerald-700">

                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-slate-700">
                          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-slate-500"></span>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 whitespace-nowrap text-slate-600">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-3 text-xs font-medium">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setStatusConfirmAdmin(admin)}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {admin.status === 1 ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmAdmin(admin)}
                          className="text-red-600 hover:text-red-800 hover:underline transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-md shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 flex justify-between items-center">
              <h3 className="text-base font-semibold text-slate-900">Edit Administrator</h3>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-5 pt-0">
              {editError && (
                <div className="mb-4 p-3 bg-red-50 border-l-2 border-red-500 text-sm text-red-700">
                  {editError}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={editFormData.firstName}
                      onChange={handleEditChange}
                      className="w-full bg-white border border-slate-200 rounded px-3 py-2 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={editFormData.lastName}
                      onChange={handleEditChange}
                      className="w-full bg-white border border-slate-200 rounded px-3 py-2 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 text-sm text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={editFormData.phone}
                    onChange={handleEditChange}
                    className="w-full bg-white border border-slate-200 rounded px-3 py-2 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 border border-slate-200 rounded text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 rounded text-white font-medium text-sm transition-colors flex items-center"
                >
                  {isSubmittingEdit ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Confirm Modal */}
      {statusConfirmAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-md shadow-lg w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rflex items-center justify-center flex-shrink-0 text-slate-700">
                  <i className="fa-solid rounded-full p-2 fa-circle-exclamation text-base"></i>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">Change Status?</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Are you sure you want to {statusConfirmAdmin.status === 1 ? 'deactivate' : 'activate'} <strong>{statusConfirmAdmin.firstName} {statusConfirmAdmin.lastName}</strong>?
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setStatusConfirmAdmin(null)}
                  disabled={isSubmittingStatus}
                  className="px-4 py-2 border border-slate-200 rounded text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={isSubmittingStatus}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 rounded text-white font-medium text-sm transition-colors flex items-center"
                >
                  {isSubmittingStatus ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Processing...</> : 'Confirm Change'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-md shadow-lg w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-red-700">
                  <i className="fa-solid fa-trash-can text-base"></i>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">Delete Administrator?</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    This action will revoke access for <strong>{deleteConfirmAdmin.firstName} {deleteConfirmAdmin.lastName}</strong>. You cannot easily undo this.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmAdmin(null)}
                  disabled={isSubmittingDelete}
                  className="px-4 py-2 border border-slate-200 rounded text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmittingDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium text-sm transition-colors flex items-center"
                >
                  {isSubmittingDelete ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Deleting...</> : 'Delete Admin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
