import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../../api/axiosClient';
import { useToast } from '../../../utils/Toast';
import { formatDate } from '../../../utils/dateFormatter';

const MyLeaves = () => {
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Pagination State
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const pageSize = 10;

  // Form State
  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [totalDays, setTotalDays] = useState(0);

  // View/Cancel Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const fetchBalances = useCallback(async () => {
    try {
      const response = await axiosClient.get('/leave/my-balances');
      if (response.data.success) {
        setBalances(response.data.data.balances || []);
      }
    } catch (error) {
      console.error('Error fetching leave balances:', error);
      showToast('Failed to load leave balances.', 'error');
    }
  }, [showToast]);

  const fetchRequests = useCallback(async (page) => {
    try {
      const response = await axiosClient.get(`/leave/my-requests?pageNumber=${page}&pageSize=${pageSize}`);
      if (response.data.success) {
        setRequests(response.data.data.items || []);
        setTotalPages(response.data.data.totalPages);
        setHasNextPage(response.data.data.hasNextPage);
        setHasPreviousPage(response.data.data.hasPreviousPage);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      showToast('Failed to load leave requests.', 'error');
    }
  }, [showToast, pageSize]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBalances(), fetchRequests(pageNumber)]);
      setLoading(false);
    };
    loadData();
  }, [fetchBalances, fetchRequests, pageNumber]);

  // Calculate total days when dates change
  useEffect(() => {
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(diffDays);
      } else {
        setTotalDays(0);
      }
    } else {
      setTotalDays(0);
    }
  }, [fromDate, toDate]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    if (totalDays <= 0) {
      showToast('Please select valid dates that include business days.', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await axiosClient.post('/leave/request', {
        leaveTypeId: parseInt(leaveType),
        startDate: fromDate,
        endDate: toDate,
        reason: reason
      });

      if (response.data.success) {
        showToast('Leave request submitted successfully!', 'success');
        
        // Reset form
        setLeaveType('');
        setFromDate('');
        setToDate('');
        setReason('');
        
        // Refresh data
        await Promise.all([fetchBalances(), fetchRequests(1)]);
        setPageNumber(1);
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      showToast(error.response?.data?.message || 'Failed to submit leave request.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = (req) => {
    setSelectedRequest(req);
  };

  const closeModal = () => {
    setSelectedRequest(null);
  };

  const confirmCancel = async () => {
    if (!selectedRequest) return;
    try {
      setSubmittingCancel(true);
      const response = await axiosClient.put(`/leave/request/${selectedRequest.id}/cancel`);
      if (response.data.success) {
        showToast('Leave request cancelled successfully!', 'success');
        await Promise.all([fetchBalances(), fetchRequests(pageNumber)]);
        closeModal();
      }
    } catch (error) {
      console.error('Error cancelling leave request:', error);
      showToast(error.response?.data?.message || 'Failed to cancel leave request.', 'error');
    } finally {
      setSubmittingCancel(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 1: // Pending
        return <span className="inline-flex items-center text-xs font-bold text-yellow-600">Pending</span>;
      case 2: // Approved
        return <span className="inline-flex items-center text-xs font-bold text-green-600">Approved</span>;
      case 3: // Rejected
        return <span className="inline-flex items-center text-xs font-bold text-red-600">Rejected</span>;
      case 4: // Cancelled
        return <span className="inline-flex items-center text-xs font-bold text-gray-600">Cancelled</span>;
      default:
        return <span className="inline-flex items-center text-xs font-bold text-gray-600">Unknown</span>;
    }
  };

  if (loading && balances.length === 0) {
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
          <h1 className="text-xl font-semibold text-gray-900">Leave Management</h1>
          <p className="text-sm text-gray-500 mt-1">View your current leave balances and submit time-off requests.</p>
        </div>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {balances.map((balance, idx) => {
          const usedPercentage = balance.totalLeaves > 0 ? (balance.usedLeaves / balance.totalLeaves) * 100 : 0;
          
          return (
            <div 
              key={balance.id || idx}
              className="bg-white border border-gray-200 rounded-md p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">{balance.leaveType}</h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Year {balance.year}</span>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-semibold text-gray-900">{balance.remainingLeaves}</span>
                <span className="text-sm text-gray-500">days available</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Used: {balance.usedLeaves}</span>
                  <span>Total Allowance: {balance.totalLeaves}</span>
                </div>
                
                {/* Clean Progress Bar */}
                <div className="w-full bg-gray-100 h-1.5 rounded-none">
                  <div 
                    className="bg-blue-600 h-1.5 transition-all"
                    style={{ width: `${usedPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}

        {balances.length === 0 && (
          <div className="col-span-full p-6 text-center bg-gray-50 border border-dashed border-gray-300 rounded-md">
            <h3 className="text-sm font-medium text-gray-700">No Leave Balances Found</h3>
            <p className="text-xs text-gray-500 mt-1">Contact your HR administrator to configure your leave allowances.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 mt-8">
        
        {/* Request Leave Form */}
        <div>
          <div className="bg-white border border-gray-200 rounded-md shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-800">Submit New Request</h2>
            </div>
            
            <form onSubmit={handleRequestSubmit} className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Leave Type</label>
                  <select 
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    required
                  >
                    <option value="">Select leave type</option>
                    {balances.map(b => (
                      <option key={b.leaveTypeId} value={b.leaveTypeId}>{b.leaveType}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">From Date</label>
                  <input 
                    type="date" 
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">To Date</label>
                  <input 
                    type="date" 
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Duration</label>
                  <div className="bg-gray-50 px-3 py-2 border border-gray-200 rounded flex justify-between items-center h-[38px]">
                    <span className="text-xs text-gray-600 font-medium">Calculated:</span>
                    <span className="text-sm font-semibold text-gray-900">{totalDays} Day(s)</span>
                  </div>
                </div>

                <div className="md:col-span-2 lg:col-span-3 space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Reason</label>
                  <textarea 
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y min-h-[38px]"
                    placeholder="Provide a brief reason..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    rows="1"
                  ></textarea>
                </div>

                <div className="flex items-end h-full">
                  <button 
                    type="submit"
                    disabled={loading}
                    className={`w-full text-white text-sm font-medium py-2 px-4 rounded transition-colors ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} h-[38px]`}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Leave History Table */}
        <div>
          <div className="bg-white border border-gray-200 rounded-md shadow-sm h-full flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-800">My Leaves</h2>
              
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
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Date Range</th>
                    <th className="px-5 py-3 font-medium">Days</th>
                    <th className="px-5 py-3 font-medium">Reason</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.length > 0 ? requests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-900">{req.leaveType}</td>
                      <td className="px-5 py-3 text-gray-500">
                        {formatDate(req.startDate)} - {formatDate(req.endDate)}
                      </td>
                      <td className="px-5 py-3 text-gray-900">{req.numberOfDays}</td>
                      <td className="px-5 py-3 text-gray-500 max-w-[200px] whitespace-normal">
                        <div className="line-clamp-4 text-xs" title={req.reason}>
                          {req.reason}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button 
                          onClick={() => handleViewClick(req)}
                          className="text-xs font-medium text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 px-2 py-1 rounded-sm transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-5 py-8 text-center text-gray-500 text-sm">
                        No leave requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Details/Cancel Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-md shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Leave Request Details</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-0.5">Status</p>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-0.5">Leave Type</p>
                  <p className="text-gray-900 font-medium">{selectedRequest.leaveType}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-0.5">Duration</p>
                  <p className="text-gray-900 font-medium">{selectedRequest.numberOfDays} Day(s)</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-0.5">Dates</p>
                  <p className="text-gray-900 font-medium">{formatDate(selectedRequest.startDate)} — {formatDate(selectedRequest.endDate)}</p>
                </div>
                <div className="col-span-2 mt-1">
                  <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-1">Reason provided</p>
                  <div className="p-2.5 bg-gray-50 border border-gray-100 rounded text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedRequest.reason}
                  </div>
                </div>
                
                {selectedRequest.managerComment && (
                  <div className="col-span-2 mt-1">
                    <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-1">Manager's Note</p>
                    <div className="p-2.5 bg-blue-50/50 border border-blue-100/50 rounded text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedRequest.managerComment}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
              <button 
                onClick={closeModal}
                disabled={submittingCancel}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
              >
                Close
              </button>
              
              {(selectedRequest.status === 1 || selectedRequest.status === 2) && (
                <button 
                  onClick={confirmCancel}
                  disabled={submittingCancel}
                  className="px-3 py-1.5 border border-red-300 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100 focus:outline-none transition-colors flex items-center"
                >
                  {submittingCancel ? 'Cancelling...' : 'Cancel Request'}
                </button>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLeaves;
