import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { employeeApi } from '../../api/employeeApi';
import { useToast } from '../../utils/Toast';
import { validateRegistrationField } from '../../validators/registerValidator';
import { formatDate, formatDateTime } from '../../utils/dateFormatter';
import { getRole } from '../../utils/tokenStorage';

const EmployeeDetails = () => {
  const { employeeId } = useParams(); // changed from userId to employeeId
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isChangeManagerModalOpen, setIsChangeManagerModalOpen] = useState(false);
  const [isChangingManager, setIsChangingManager] = useState(false);
  const [managerSearchQuery, setManagerSearchQuery] = useState('');
  const [availableManagers, setAvailableManagers] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  const [isManagerDropdownOpen, setIsManagerDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [editFormData, setEditFormData] = useState({ firstName: '', lastName: '', phoneNumber: '' });
  const [isConfirmUpdateModalOpen, setIsConfirmUpdateModalOpen] = useState(false);
  const [isConfirmCancelModalOpen, setIsConfirmCancelModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { showToast } = useToast();

  const currentRole = getRole(); // HR = 4

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await employeeApi.getEmployeeById(employeeId);
        if (response.data && response.data.data) {
          setUser(response.data.data);
        } else {
          setError('Failed to load user details.');
        }
      } catch (err) {
        console.error('Error loading user details:', err);
        setError('The user you are looking for does not exist or you don\'t have access.');
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchUserDetails();
    }
  }, [employeeId, refreshTrigger]);

  

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isChangeManagerModalOpen) {
        fetchManagers(managerSearchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [managerSearchQuery, isChangeManagerModalOpen]);

  const confirmStatusChange = async () => {
    try {
      const newIsActive = user.status !== 'Active';
      const response = await employeeApi.updateUserStatus(employeeId, newIsActive);
      if (response.data?.success) {
        setUser({ ...user, status: newIsActive ? 'Active' : 'Inactive' });
        showToast(`User status changed to ${newIsActive ? 'Active' : 'Inactive'}`, 'success');
        setRefreshTrigger(prev => prev + 1);
      } else {
        showToast(response.data?.message || 'Failed to update user status.', 'error');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showToast(err.response?.data?.message || 'Error updating user status.', 'error');
    } finally {
      setIsStatusModalOpen(false);
    }
  };

  const confirmDelete = async () => {
    setIsDeletingUser(true);
    try {
      const payload = {
        delete: true,
        rowVersion: user.rowVersion
      };
      const response = await employeeApi.deleteUser(employeeId, payload);
      if (response.data?.success) {
        showToast(response.data?.message || 'User deleted successfully.', 'success');
        setIsDeleteModalOpen(false);
        navigate('/emp/employees');
      } else {
        showToast(response.data?.message || 'Failed to delete user.', 'error');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      showToast(err.response?.data?.message || 'Error deleting user.', 'error');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const fetchManagers = async (search = '') => {
    setIsLoadingManagers(true);
    try {
      const response = await employeeApi.getManagers(search);
      if (response.data?.success && response.data?.data) {
        setAvailableManagers(response.data.data);
      }
    } catch (err) {
      showToast('Failed to load managers', 'error');
    } finally {
      setIsLoadingManagers(false);
    }
  };

  const handleOpenEditModal = () => {
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = () => {
    // Run frontend validation based on the combined form data
    const validationData = { ...user, ...editFormData };
    const formErrors = {};
    formErrors.firstName = validateRegistrationField('firstName', validationData.firstName);
    formErrors.lastName = validateRegistrationField('lastName', validationData.lastName);
    
    // Only validate phone number if provided
    if (validationData.phoneNumber && validationData.phoneNumber.trim() !== '') {
        formErrors.phoneNumber = validateRegistrationField('phoneNumber', validationData.phoneNumber);
    }
    
    // Check if any of the fields we are actively editing have errors
    const fieldsBeingEdited = ['firstName', 'lastName', 'phoneNumber'];
    const firstErrorField = fieldsBeingEdited.find(field => formErrors[field]);
    
    if (firstErrorField) {
      showToast(formErrors[firstErrorField], 'error');
      return;
    }
    
    // Calculate only the fields that actually changed
    const payload = {};
    if (editFormData.firstName !== user.firstName) payload.firstName = editFormData.firstName;
    if (editFormData.lastName !== user.lastName) payload.lastName = editFormData.lastName;
    
    const originalPhone = user.phoneNumber || '';
    if (editFormData.phoneNumber !== originalPhone) {
      payload.phoneNumber = editFormData.phoneNumber.trim() === '' ? null : editFormData.phoneNumber;
    }

    // If nothing changed, just close the modal
    if (Object.keys(payload).length === 0) {
      showToast('No changes were made.', 'info');
      setIsEditModalOpen(false);
      return;
    }

    // Open confirmation modal instead of directly updating
    setIsConfirmUpdateModalOpen(true);
  };

  const executeUpdate = async () => {
    // Recalculate payload
    const payload = {};
    if (editFormData.firstName !== user.firstName) payload.firstName = editFormData.firstName;
    if (editFormData.lastName !== user.lastName) payload.lastName = editFormData.lastName;
    const originalPhone = user.phoneNumber || '';
    if (editFormData.phoneNumber !== originalPhone) {
      payload.phoneNumber = editFormData.phoneNumber.trim() === '' ? null : editFormData.phoneNumber;
    }
    
    // Attach the concurrency token for optimistic locking
    payload.rowVersion = user.rowVersion;

    setIsUpdatingUser(true);
    try {
      const response = await employeeApi.updateEmployee(employeeId, payload);
      if (response.data?.success) {
        showToast(response.data?.message || 'User updated successfully.', 'success');
        setRefreshTrigger(prev => prev + 1);
        setIsConfirmUpdateModalOpen(false);
        setIsEditModalOpen(false);
      } else {
        showToast(response.data?.message || 'Failed to update user.', 'error');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      let errorMessage = err.response?.data?.message || 'Error updating user.';
      showToast(errorMessage, 'error');
      setIsConfirmUpdateModalOpen(false); // Close confirm, let them fix form
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleCancelClick = () => {
    // Check if there are any changes to prompt cancel confirm
    const hasChanges = 
      editFormData.firstName !== (user.firstName || '') || 
      editFormData.lastName !== (user.lastName || '') || 
      (editFormData.phoneNumber || '') !== (user.phoneNumber || '');
      
    if (hasChanges) {
      setIsConfirmCancelModalOpen(true);
    } else {
      setIsEditModalOpen(false);
    }
  };

  const executeCancel = () => {
    setIsConfirmCancelModalOpen(false);
    setIsEditModalOpen(false);
  };

  const handleOpenChangeManagerModal = async () => {
    setIsChangeManagerModalOpen(true);
    setSelectedManagerId('');
    setManagerSearchQuery('');
    setIsManagerDropdownOpen(false);
  };

  const confirmChangeManager = async () => {
    if (!selectedManagerId) {
      showToast('Please select a new reporting manager.', 'error');
      return;
    }
    
    setIsChangingManager(true);
    try {
      const response = await employeeApi.updateReportingManager(employeeId, selectedManagerId);
      if (response.data?.success) {
        showToast(response.data?.message || 'Reporting manager updated successfully.', 'success');
        setRefreshTrigger(prev => prev + 1);
        setIsChangeManagerModalOpen(false);
      } else {
        showToast(response.data?.message || 'Failed to update reporting manager.', 'error');
      }
    } catch (err) {
      console.error('Error updating manager:', err);
      showToast(err.response?.data?.message || 'Error updating reporting manager.', 'error');
    } finally {
      setIsChangingManager(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-60px)] p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="w-full min-h-[calc(100vh-60px)] p-8 flex flex-col items-center justify-center">
        <i className="fa-solid fa-circle-exclamation text-4xl text-slate-300 mb-4"></i>
        <h2 className="text-lg font-bold text-slate-600 mb-2">User Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">{error ||"The user you are looking for does not exist or you don't have access."}</p>
        <Link to="/emp/employees" className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-sm font-semibold text-xs tracking-wide uppercase hover:bg-indigo-100 transition-colors">
          Back to Employees
        </Link>
      </div>
    );
  }

  const getInitials = () => {
    if (!user.firstName || !user.lastName) return '--';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <div className="w-full min-h-screen p-8 font-sans relative bg-[#f0f2f7]">
      <div className="max-w-7xl mx-auto">
        {/* Back Navigation Bar */}
        <Link to="/emp/employees"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors uppercase tracking-wider mb-6 no-underline">
          <i className="fa-solid fa-arrow-left-long"></i> Back to Employees
        </Link>

        {/* Main Profile Shell */}
        <div className="bg-white rounded-sm shadow-sm overflow-hidden mb-6">
          {/* Minimal Branding Banner Accenting */}
          <div className="h-2 bg-indigo-500 w-full"></div>

          {/* Top Identity Block */}
          <div className="p-10 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-2xl uppercase">
                {getInitials()}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight truncate max-w-[200px] sm:max-w-[400px]" title={user.fullName || `${user.firstName} ${user.lastName}`}>
                  {user.fullName || `${user.firstName} ${user.lastName}`}
                </h1>
                <p className="text-sm text-slate-400 mt-0.5 truncate max-w-[200px] sm:max-w-[400px]" title={user.email}>{user.email}</p>
              </div>
            </div>

            {currentRole === 4 && (
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wide ${user.status === 'Active' ? 'text-emerald-600' : user.status === 'Inactive' ? 'text-rose-600' : 'text-slate-600'}`}>
                  {user.status}
                </span>

                <button 
                  onClick={handleOpenEditModal}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 border border-indigo-100 rounded-sm text-xs font-bold transition-all uppercase tracking-wider shadow-sm flex items-center gap-2">
                  <i className="fa-solid fa-pen text-[10px]"></i> Edit Profile
                </button>

                {user.status !== 'Deleted' && (
                  <button 
                    onClick={() => setIsStatusModalOpen(true)}
                    disabled={user.role === 1 || user.role === 'Admin'}
                    title={user.role === 1 || user.role === 'Admin' ? "Cannot change status of an Admin" : ""}
                    className={`px-4 py-2 bg-white border rounded-sm text-xs font-bold uppercase tracking-wider shadow-sm transition-all ${user.role === 1 || user.role === 'Admin' ? 'opacity-50 cursor-not-allowed border-slate-200 text-slate-400' : 'border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'}`}>
                    {user.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                  </button>
                )}

                <button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={user.role === 1 || user.role === 'Admin'}
                  title={user.role === 1 || user.role === 'Admin' ? "Cannot delete an Admin" : ""}
                  className={`px-4 py-2 bg-white border rounded-sm text-xs font-bold transition-all uppercase tracking-wider shadow-sm ${user.role === 1 || user.role === 'Admin' ? 'border-slate-200 text-slate-400 opacity-50 cursor-not-allowed' : 'border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'}`}>
                  Delete User
                </button>
              </div>
            )}
          </div>

          {/* Core System Properties Data Grid */}
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-6 border-b border-slate-400 pb-2">
                Profile Details
              </h3>

              <div className="space-y-5">
                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                  <span className="text-slate-400 font-medium">First Name</span>
                  <span className="text-slate-700 font-semibold text-base max-w-[150px] sm:max-w-[250px] truncate text-right" title={user.firstName}>{user.firstName}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                  <span className="text-slate-400 font-medium">Last Name</span>
                  <span className="text-slate-700 font-semibold text-base max-w-[150px] sm:max-w-[250px] truncate text-right" title={user.lastName}>{user.lastName}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                  <span className="text-slate-400 font-medium">Employee Code</span>
                  <span className="text-slate-700 font-semibold text-base max-w-[150px] sm:max-w-[250px] truncate text-right" title={user.employeeCode || '--'}>{user.employeeCode || '--'}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                  <span className="text-slate-400 font-medium">Phone Number</span>
                  <span className="text-slate-700 font-semibold text-base max-w-[150px] sm:max-w-[250px] truncate text-right" title={user.phoneNumber || '--'}>{user.phoneNumber || '--'}</span>
                </div>
                <div className="flex justify-between items-center text-sm pb-1">
                  <span className="text-slate-400 font-medium">Designation</span>
                  <span className="text-slate-700 font-semibold text-base">
                    {user.designationName || '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                  <span className="text-slate-400 font-medium whitespace-nowrap mr-2">Reporting Manager</span>
                  <div className="flex items-center gap-3 min-w-0 justify-end">
                    <span className="text-slate-700 font-semibold text-base max-w-[120px] sm:max-w-[180px] truncate text-right" title={user.managerName || '--'}>{user.managerName || '--'}</span>
                    {(currentRole === 4 && user.role !== 2 && user.role !== 'Manager') && (
                      <button 
                        onClick={handleOpenChangeManagerModal}
                        disabled={user.role === 1 || user.role === 'Admin'}
                        className={`transition-colors w-7 h-7 rounded-full flex items-center justify-center border shadow-sm ${user.role === 1 || user.role === 'Admin' ? 'text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed opacity-50' : 'text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-100'}`}
                        title={user.role === 1 || user.role === 'Admin' ? 'Cannot change reporting manager of an Admin' : 'Change Reporting Manager'}
                      >
                        <i className="fa-solid fa-pen text-[10px]"></i>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-6 border-b border-slate-400 pb-2">
                Activity Status
              </h3>

              <div className="space-y-5">
                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                  <span className="text-slate-400 font-medium">Date Joined</span>
                  <span className="text-slate-600 font-medium text-sm max-w-[150px] sm:max-w-[250px] truncate text-right" title={formatDate(user.dateOfJoining)}>
                    {formatDate(user.dateOfJoining)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                  <span className="text-slate-400 font-medium">Account Created</span>
                  <span className="text-slate-600 font-medium text-sm max-w-[150px] sm:max-w-[250px] truncate text-right" title={formatDateTime(user.createdAt)}>
                    {formatDateTime(user.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                  <span className="text-slate-400 font-medium">Last Login</span>
                  <span className="text-slate-600 font-medium text-sm max-w-[150px] sm:max-w-[250px] truncate text-right" title={formatDateTime(user.lastLogin, 'Not yet logged in')}>
                    {formatDateTime(user.lastLogin, 'Not yet logged in')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                  <span className="text-slate-400 font-medium">Last Profile Update</span>
                  <span className="text-slate-600 font-medium text-sm max-w-[150px] sm:max-w-[250px] truncate text-right" title={formatDateTime(user.updatedAt)}>
                    {formatDateTime(user.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONFIRMATION DELETE MODAL OVERLAY */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => setIsDeleteModalOpen(false)}></div>

            <div className="bg-white rounded-sm shadow-xl max-w-md w-full overflow-hidden relative z-10 transform scale-100 transition-all">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
                    <i className="fa-solid fa-trash text-base"></i>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 tracking-tight">Delete Account?</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">
                      Are you sure you want to delete <strong className="user-placeholder-name">{user.fullName || `${user.firstName} ${user.lastName}`}</strong>?
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)}
                  className="px-3 py-2 border border-slate-200 rounded-sm bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wider transition-all">
                  Cancel
                </button>
                <button onClick={confirmDelete}
                  disabled={isDeletingUser}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-sm transition-colors flex items-center gap-2 shadow-sm uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed">
                  {isDeletingUser ? (
                    <><i className="fa-solid fa-circle-notch fa-spin"></i> Deleting...</>
                  ) : (
                    "Confirm Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRMATION STATUS MODAL OVERLAY */}
        {isStatusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => setIsStatusModalOpen(false)}></div>

            <div className="bg-white rounded-sm shadow-xl max-w-md w-full overflow-hidden relative z-10 transform scale-100 transition-all">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 bg-indigo-50 border-indigo-100 text-indigo-500">
                    <i className="fa-solid fa-triangle-exclamation text-base"></i>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 tracking-tight">
                      {user.status === 'Active' ? 'Deactivate Account?' : 'Activate Account?'}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">
                      Are you sure you want to {user.status === 'Active' ? 'deactivate' : 'activate'} <strong className="user-placeholder-name">{user.fullName || `${user.firstName} ${user.lastName}`}</strong>?
                      {user.status === 'Active' ? ' This will immediately restrict their access to the system.' : ' This will instantly restore their access privileges.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setIsStatusModalOpen(false)}
                  className="px-3 py-2 border border-slate-200 rounded-sm bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wider transition-all">
                  Cancel
                </button>
                <button onClick={confirmStatusChange}
                  className="px-4 py-2 border text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-sm bg-indigo-600 border-indigo-600 hover:bg-indigo-700">
                  Confirm {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRMATION CHANGE MANAGER MODAL OVERLAY */}
        {isChangeManagerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => setIsChangeManagerModalOpen(false)}></div>

            <div className="bg-white rounded-sm shadow-xl max-w-md w-full relative z-10 transform scale-100 transition-all overflow-visible">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
                    <i className="fa-solid fa-user-tie text-base"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-800 tracking-tight">Change Reporting Manager</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2 mb-4">
                      Select a new reporting manager for <strong className="user-placeholder-name">{user.fullName || `${user.firstName} ${user.lastName}`}</strong>.
                    </p>
                    
                    <div className="space-y-1 relative">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Select Manager</label>
                      <div className="relative">
                        <div 
                          onClick={() => setIsManagerDropdownOpen(!isManagerDropdownOpen)}
                          className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm text-slate-700 cursor-pointer flex justify-between items-center bg-white hover:border-indigo-500 transition-colors"
                        >
                          {selectedManagerId ? (
                            <span>{availableManagers.find(m => m.id === selectedManagerId)?.firstName} {availableManagers.find(m => m.id === selectedManagerId)?.lastName}</span>
                          ) : (
                            <span className="text-slate-400">-- Select a Manager --</span>
                          )}
                          <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${isManagerDropdownOpen ? 'rotate-180' : ''}`}></i>
                        </div>
                        
                        {isManagerDropdownOpen && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-sm shadow-xl flex flex-col">
                            <div className="p-2 border-b border-slate-100 bg-slate-50">
                              <div className="relative">
                                <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                                <input 
                                  type="text" 
                                  placeholder="Search by name or email..."
                                  value={managerSearchQuery}
                                  onChange={(e) => setManagerSearchQuery(e.target.value)}
                                  className="w-full border border-slate-300 rounded-sm pl-7 pr-2 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto custom-scrollbar">
                              {isLoadingManagers ? (
                                <div className="p-4 text-center text-indigo-500"><i className="fa-solid fa-circle-notch fa-spin"></i></div>
                              ) : availableManagers.filter(m => m.id !== parseInt(employeeId)).length === 0 ? (
                                <div className="p-3 text-xs text-slate-500 text-center">No managers found.</div>
                              ) : (
                                availableManagers.filter(m => m.id !== parseInt(employeeId)).map(manager => (
                                  <div 
                                    key={manager.id}
                                    onClick={() => {
                                      setSelectedManagerId(manager.id);
                                      setIsManagerDropdownOpen(false);
                                      setManagerSearchQuery('');
                                    }}
                                    className={`px-3 py-2 text-sm cursor-pointer border-b border-slate-50 last:border-0 hover:bg-indigo-50 transition-colors ${selectedManagerId === manager.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700'}`}
                                  >
                                    <div className="flex flex-col">
                                      <span>{manager.firstName} {manager.lastName}</span>
                                      <span className="text-[10px] text-slate-400 font-normal">{manager.email}</span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3 rounded-b-sm">
                <button onClick={() => setIsChangeManagerModalOpen(false)}
                  className="px-3 py-2 border border-slate-200 rounded-sm bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wider transition-all">
                  Cancel
                </button>
                <button onClick={confirmChangeManager}
                  disabled={isChangingManager || !selectedManagerId || isLoadingManagers}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-sm transition-colors flex items-center gap-2 shadow-sm uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed">
                  {isChangingManager ? (
                    <><i className="fa-solid fa-circle-notch fa-spin"></i> Saving...</>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRM EDIT UPDATE MODAL OVERLAY */}
        {isConfirmUpdateModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => !isUpdatingUser && setIsConfirmUpdateModalOpen(false)}></div>

            <div className="bg-white rounded-sm shadow-xl max-w-sm w-full overflow-hidden relative z-10 transform scale-100 transition-all">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 bg-indigo-50 border-indigo-100 text-indigo-500">
                    <i className="fa-solid fa-circle-question text-base"></i>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 tracking-tight">Save Changes?</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2">
                      Are you sure you want to update this user's profile details?
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setIsConfirmUpdateModalOpen(false)}
                  disabled={isUpdatingUser}
                  className="px-3 py-2 border border-slate-200 rounded-sm bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wider transition-all">
                  No, Go Back
                </button>
                <button onClick={executeUpdate}
                  disabled={isUpdatingUser}
                  className="px-4 py-2 border text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-sm bg-indigo-600 border-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                  {isUpdatingUser ? (
                    <><i className="fa-solid fa-circle-notch fa-spin"></i> Saving...</>
                  ) : (
                    "Yes, Save"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRM CANCEL MODAL OVERLAY */}
        {isConfirmCancelModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => setIsConfirmCancelModalOpen(false)}></div>

            <div className="bg-white rounded-sm shadow-xl max-w-sm w-full overflow-hidden relative z-10 transform scale-100 transition-all">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 bg-rose-50 border-rose-100 text-rose-500">
                    <i className="fa-solid fa-triangle-exclamation text-base"></i>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 tracking-tight">Discard Changes?</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2">
                      You have unsaved changes. Are you sure you want to cancel and discard them?
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setIsConfirmCancelModalOpen(false)}
                  className="px-3 py-2 border border-slate-200 rounded-sm bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wider transition-all">
                  No, Keep Editing
                </button>
                <button onClick={executeCancel}
                  className="px-4 py-2 border text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-sm bg-rose-600 border-rose-600 hover:bg-rose-700">
                  Yes, Discard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT PROFILE MODAL */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => !isUpdatingUser && handleCancelClick()}></div>

            <div className="bg-white rounded-sm shadow-xl max-w-md w-full relative z-10 transform scale-100 transition-all overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <i className="fa-solid fa-user-pen text-xs"></i>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">Edit Profile</h3>
                </div>
                <button 
                  onClick={handleCancelClick}
                  disabled={isUpdatingUser}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">First Name <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={editFormData.firstName}
                    onChange={handleEditChange}
                    className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="Enter first name"
                  />
                </div>
                
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Last Name <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={editFormData.lastName}
                    onChange={handleEditChange}
                    className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    name="phoneNumber"
                    value={editFormData.phoneNumber}
                    onChange={handleEditChange}
                    className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="Enter 10-digit phone number"
                  />
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3 rounded-b-sm">
                <button onClick={handleCancelClick}
                  disabled={isUpdatingUser}
                  className="px-3 py-2 border border-slate-200 rounded-sm bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wider transition-all disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleSaveClick}
                  disabled={isUpdatingUser || !editFormData.firstName.trim() || !editFormData.lastName.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-sm transition-colors flex items-center gap-2 shadow-sm uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EmployeeDetails;
