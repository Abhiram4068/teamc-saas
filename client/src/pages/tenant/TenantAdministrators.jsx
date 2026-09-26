import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminUserApi } from '../../api/adminUserApi';
import { useToast } from '../../utils/Toast';
import { validateUpdateTenantAdminRequest } from '../../validators/adminUserValidator';

export default function TenantAdministrators() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="bg-[#f4f5f7] min-h-screen p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-[#141824] tracking-tight">Administrators</h1>
            <p className="text-xs text-gray-500 mt-1">Manage organizational access and privileges.</p>
          </div>
          <button
            onClick={() => navigate('/tenant/add-admin')}
            className="mt-4 sm:mt-0 px-5 py-2 bg-[#2b6cb0] hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-2"
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
        ) : (
          <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                    <th scope="col" className="px-6 py-3.5 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="text-gray-400 mb-2"><i className="fa-solid fa-users text-4xl"></i></div>
                        <p className="text-sm text-gray-500">No administrators found.</p>
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                              {admin.firstName.charAt(0)}{admin.lastName.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-xs font-semibold text-gray-900">{admin.firstName} {admin.lastName}</div>
                              <div className="text-[10px] text-gray-500 mt-0.5">Role: Tenant Admin</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-900 flex items-center gap-2">
                            <i className="fa-regular fa-envelope text-gray-400"></i> {admin.email}
                          </div>
                          <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-2">
                            <i className="fa-solid fa-phone text-gray-400"></i> {admin.phone || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            admin.status === 1 ? 'font-bold text-emerald-800' : 'font-bold  text-gray-800'
                          }`}>
                            {admin.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => openEditModal(admin)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Edit Admin"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                              onClick={() => setStatusConfirmAdmin(admin)}
                              className="text-gray-500 hover:text-gray-900 transition-colors"
                              title={admin.status === 1 ? 'Deactivate' : 'Activate'}
                            >
                              <i className={`fa-solid ${admin.status === 1 ? 'fa-ban' : 'fa-check-circle'}`}></i>
                            </button>
                            <button
                              onClick={() => setDeleteConfirmAdmin(admin)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Delete Admin"
                            >
                              <i className="fa-solid fa-trash"></i>
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
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Edit Administrator</h3>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6">
              {editError && (
                <div className="mb-5 p-3 bg-red-50 border-l-4 border-red-500 text-sm text-red-700">
                  {editError}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={editFormData.firstName}
                      onChange={handleEditChange}
                      className="w-full bg-white border border-gray-300 px-3.5 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-[#141824]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={editFormData.lastName}
                      onChange={handleEditChange}
                      className="w-full bg-white border border-gray-300 px-3.5 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-[#141824]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={editFormData.phone}
                    onChange={handleEditChange}
                    className="w-full bg-white border border-gray-300 px-3.5 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-[#141824]"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isSubmittingEdit}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2.5 bg-[#2b6cb0] hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600 mx-auto">
                <i className="fa-solid fa-circle-exclamation text-xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Change Status?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to {statusConfirmAdmin.status === 1 ? 'deactivate' : 'activate'} <strong>{statusConfirmAdmin.firstName} {statusConfirmAdmin.lastName}</strong>?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleToggleStatus}
                  disabled={isSubmittingStatus}
                  className="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-colors flex justify-center items-center"
                >
                  {isSubmittingStatus ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Processing...</> : 'Confirm Change'}
                </button>
                <button
                  onClick={() => setStatusConfirmAdmin(null)}
                  disabled={isSubmittingStatus}
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600 mx-auto">
                <i className="fa-solid fa-trash-can text-xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Administrator?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                This action will revoke access for <strong>{deleteConfirmAdmin.firstName} {deleteConfirmAdmin.lastName}</strong>. You cannot easily undo this.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isSubmittingDelete}
                  className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors flex justify-center items-center"
                >
                  {isSubmittingDelete ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Deleting...</> : 'Delete Admin'}
                </button>
                <button
                  onClick={() => setDeleteConfirmAdmin(null)}
                  disabled={isSubmittingDelete}
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
