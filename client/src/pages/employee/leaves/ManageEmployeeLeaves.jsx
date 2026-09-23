import React, { useState, useEffect } from 'react';
import axiosClient from '../../../api/axiosClient';
import { useToast } from '../../../utils/Toast';

const ManageEmployeeLeaves = () => {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Allocation Modal State
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Form State
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [totalDays, setTotalDays] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Unique leave types derived from all balances
  const [availableLeaveTypes, setAvailableLeaveTypes] = useState([]);

  useEffect(() => {
    fetchEmployeeBalances();
  }, [pageNumber, pageSize]);

  const fetchEmployeeBalances = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/leave/balances', {
        params: { pageNumber, pageSize }
      });
      if (response.data.success) {
        const items = response.data.data.items || [];
        setEmployees(items);
        setTotalPages(response.data.data.totalPages || 1);
        
        // Extract unique leave types for the dropdown
        const typesMap = new Map();
        items.forEach(emp => {
          emp.balances?.forEach(b => {
            if (!typesMap.has(b.leaveTypeId)) {
              typesMap.set(b.leaveTypeId, b.leaveType);
            }
          });
        });
        setAvailableLeaveTypes(Array.from(typesMap, ([id, name]) => ({ id, name })));
      }
    } catch (error) {
      console.error('Error fetching employee leaves:', error);
      showToast('Failed to fetch employee leave balances.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateClick = (employee) => {
    setSelectedEmployee(employee);
    setLeaveTypeId('');
    setTotalDays('');
    setShowAllocateModal(true);
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !leaveTypeId || totalDays === '') return;

    setSubmitting(true);
    try {
      const currentYear = new Date().getFullYear();
      const response = await axiosClient.post('/leave/balances', {
        employeeId: selectedEmployee.employeeId,
        leaveTypeId: parseInt(leaveTypeId),
        totalDays: parseFloat(totalDays),
        year: currentYear
      });

      if (response.data.success) {
        showToast('Leave balance updated successfully!', 'success');
        fetchEmployeeBalances();
        setShowAllocateModal(false);
      }
    } catch (error) {
      console.error('Error allocating leave:', error);
      
      // Handle FluentValidation errors from backend
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        showToast(errorMessages.join(' '), 'error');
      } else {
        showToast(error.response?.data?.message || 'Failed to update leave balance.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const hasNextPage = pageNumber < totalPages;
  const hasPreviousPage = pageNumber > 1;

  if (loading && employees.length === 0) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Manage Employee Leaves</h1>
          <p className="text-sm text-gray-500 mt-1">Review and allocate leave balances for employees.</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-800">Employees</h2>
          
          {/* Pagination Controls */}
          <div className="flex items-center space-x-2">
            <button 
              disabled={!hasPreviousPage}
              onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
              className={`p-1 rounded border ${hasPreviousPage ? 'border-gray-300 text-gray-600 hover:bg-gray-50' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <span className="text-xs text-gray-500">Page {pageNumber} of {totalPages}</span>
            <button 
              disabled={!hasNextPage}
              onClick={() => setPageNumber(prev => Math.min(prev + 1, totalPages))}
              className={`p-1 rounded border ${hasNextPage ? 'border-gray-300 text-gray-600 hover:bg-gray-50' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 font-medium">Employee Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Current Balances</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.length > 0 ? employees.map(emp => (
                <tr key={emp.employeeId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-gray-900 font-medium">{emp.employeeName}</td>
                  <td className="px-5 py-4 text-gray-500">{emp.email}</td>
                  <td className="px-5 py-4 text-gray-500">{emp.designation || 'N/A'}</td>
                  <td className="px-5 py-4">
                    {emp.balances && emp.balances.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {emp.balances.map(b => (
                          <div key={b.leaveTypeId} className="text-xs">
                            <span className="font-medium text-gray-700">{b.leaveType}:</span> {b.remainingLeaves} remaining (of {b.totalLeaves})
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No balances allocated</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => handleAllocateClick(emp)}
                      className="text-xs font-medium text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-sm transition-colors"
                    >
                      Update Leaves
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-gray-500 text-sm">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocate Modal */}
      {showAllocateModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-md shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-base font-semibold text-gray-900">Update Leave Balance</h3>
              <button onClick={() => setShowAllocateModal(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleAllocateSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Employee</p>
                  <p className="text-sm text-gray-500">{selectedEmployee.employeeName} ({selectedEmployee.email})</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                  <select 
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={leaveTypeId}
                    onChange={(e) => setLeaveTypeId(e.target.value)}
                    required
                  >
                    <option value="">Select a leave type</option>
                    {availableLeaveTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                    {availableLeaveTypes.length === 0 && (
                      <option value="1">Annual Leave (Default ID 1)</option>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Allocated Days</label>
                  <input 
                    type="number"
                    step="0.5"
                    min="0"
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={totalDays}
                    onChange={(e) => setTotalDays(e.target.value)}
                    placeholder="e.g. 20"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">This will overwrite the total allowed days for the selected leave type.</p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 focus:outline-none transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmployeeLeaves;
