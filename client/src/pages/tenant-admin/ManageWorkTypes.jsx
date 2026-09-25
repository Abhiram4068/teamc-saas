import React, { useState, useEffect } from 'react';
import { workReportApi } from '../../api/workReportApi';
import { useToast } from '../../utils/Toast';

const ManageWorkTypes = () => {
  const { showToast } = useToast();
  const [workTypes, setWorkTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkTypes();
  }, []);

  const fetchWorkTypes = async () => {
    setLoading(true);
    try {
      const response = await workReportApi.getWorkTypes();
      if (response.success) {
        setWorkTypes(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching work types:', error);
      showToast('Failed to fetch work types.', 'error');
    } finally {
      setLoading(false);
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
      const payload = { name, description };
      const response = await workReportApi.createWorkType(payload);

      if (response.success) {
        showToast(`Work report type created successfully!`, 'success');
        setName('');
        setDescription('');
        fetchWorkTypes();
      }
    } catch (error) {
      console.error('Error saving work type:', error);
      showToast(error.response?.data?.message || 'Failed to save work type.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && workTypes.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Work Report Types</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage the work report types available to your tenant.</p>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Work Type</h2>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Project Work"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black sm:text-sm"
                    required
                />
            </div>
            <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black sm:text-sm"
                />
            </div>
            <button
                type="submit"
                disabled={submitting}
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm font-medium h-[38px]"
            >
                {submitting ? 'Adding...' : 'Add Type'}
            </button>
        </form>
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
              {workTypes.map(type => (
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
                </tr>
              ))}
              {workTypes.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                    No work types found. Add a work type above to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageWorkTypes;
