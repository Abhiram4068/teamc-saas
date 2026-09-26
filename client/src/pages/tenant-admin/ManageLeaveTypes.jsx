import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../utils/Toast';

const ManageLeaveTypes = () => {
  const { showToast } = useToast();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/leave/types');
      if (response.data.success) {
        setLeaveTypes(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching leave types:', error);
      showToast('Failed to fetch leave types.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsEditMode(false);
    setSelectedType(null);
    setName('');
    setDescription('');
    setIsActive(true);
    setShowModal(true);
  };

  const handleEdit = (type) => {
    setIsEditMode(true);
    setSelectedType(type);
    setName(type.name);
    setDescription(type.description || '');
    setIsActive(type.isActive);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave type?')) return;
    
    try {
      const response = await axiosClient.delete(`/leave/types/${id}`);
      if (response.data.success) {
        showToast('Leave type deleted successfully.', 'success');
        fetchLeaveTypes();
      }
    } catch (error) {
      console.error('Error deleting leave type:', error);
      showToast(error.response?.data?.message || 'Failed to delete leave type.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      showToast('Name is required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { name, description, isActive };
      let response;
      
      if (isEditMode) {
        response = await axiosClient.put(`/leave/types/${selectedType.id}`, payload);
      } else {
        response = await axiosClient.post('/leave/types', payload);
      }

      if (response.data.success) {
        showToast(`Leave type ${isEditMode ? 'updated' : 'created'} successfully!`, 'success');
        fetchLeaveTypes();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error saving leave type:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        showToast(errorMessages.join(' '), 'error');
      } else {
        showToast(error.response?.data?.message || 'Failed to save leave type.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && leaveTypes.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="w-8 h-8 border-4 border-[#0d121d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Leave Types</h1>
          <p className="text-sm text-gray-500 mt-1">Create and modify the leave types available to your tenant.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-black hover:bg-gray-800 text-white text-sm font-medium py-2 px-4 rounded transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Add Leave Type
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaveTypes.map(type => (
                <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{type.name}</td>
                  <td className="px-6 py-4 text-gray-500">{type.description || <span className="italic text-gray-400">None</span>}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      type.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {type.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleEdit(type)}
                      className="text-blue-600 hover:text-blue-900 text-xs font-medium mr-4"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(type.id)}
                      className="text-red-600 hover:text-red-900 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {leaveTypes.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                    No leave types found. Click "Add Leave Type" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-md shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-base font-semibold text-gray-900">
                {isEditMode ? 'Edit Leave Type' : 'Create Leave Type'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    maxLength={100}
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black outline-none transition-shadow"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sick Leave, Annual Leave"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black outline-none transition-shadow resize-none h-24"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of when this leave should be used..."
                  />
                </div>

                {isEditMode && (
                  <div className="flex items-center pt-2">
                    <input 
                      id="isActive"
                      type="checkbox"
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                      Active (available for allocation and requests)
                    </label>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent bg-black text-white rounded text-sm font-medium hover:bg-gray-800 focus:outline-none transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save Leave Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLeaveTypes;
