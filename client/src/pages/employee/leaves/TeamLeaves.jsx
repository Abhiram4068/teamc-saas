import React, { useState, useEffect } from 'react';
import axiosClient from '../../../api/axiosClient';
import { useToast } from '../../../utils/Toast';
import { formatDate } from '../../../utils/dateFormatter';

const TeamLeaves = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // View/Review Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchTeamRequests();
  }, [pageNumber, pageSize]);

  const fetchTeamRequests = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/leave/team-requests', {
        params: { pageNumber, pageSize }
      });
      if (response.data.success) {
        setRequests(response.data.data.items || []);
        setTotalCount(response.data.data.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching team leave requests:', error);
      showToast('Failed to fetch team leave requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = (req) => {
    setSelectedRequest(req);
    setReviewComment('');
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setReviewComment('');
  };

  const submitReview = async (action) => {
    if (!selectedRequest) return;

    setSubmittingReview(true);
    try {
      const endpoint = action === 'Approve' ? 'approve' : 'reject';
      const response = await axiosClient.put(`/leave/request/${selectedRequest.id}/${endpoint}`, {
        comment: reviewComment
      });

      if (response.data.success) {
        showToast(`Leave request ${action.toLowerCase()}d successfully.`, 'success');
        fetchTeamRequests();
        closeModal();
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing leave request:`, error);
      showToast(error.response?.data?.message || `Failed to ${action.toLowerCase()} leave request.`, 'error');
    } finally {
      setSubmittingReview(false);
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

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const hasNextPage = pageNumber < totalPages;
  const hasPreviousPage = pageNumber > 1;

  if (loading && requests.length === 0) {
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
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Team Leave Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage leave requests from your team.</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-800">Requests</h2>
          
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
                <th className="px-5 py-3 font-medium">Employee</th>
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
                  <td className="px-5 py-3 text-gray-900 font-medium">{req.employeeName}</td>
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
                  <td colSpan="7" className="px-5 py-8 text-center text-gray-500 text-sm">
                    No leave requests found for your team.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details/Review Modal */}
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
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs mb-4">
                <div>
                  <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-0.5">Employee</p>
                  <p className="font-medium text-gray-900">{selectedRequest.employeeName}</p>
                </div>
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
                <div className="col-span-2">
                  <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-0.5">Dates</p>
                  <p className="text-gray-900 font-medium">{formatDate(selectedRequest.startDate)} — {formatDate(selectedRequest.endDate)}</p>
                </div>
                <div className="col-span-2 mt-1">
                  <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-1">Reason provided</p>
                  <div className="bg-gray-50 p-2.5 rounded border border-gray-100 text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedRequest.reason}
                  </div>
                </div>
                
                {selectedRequest.managerComment && (
                  <div className="col-span-2 mt-1">
                    <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-1">Manager's Note</p>
                    <div className="bg-blue-50/50 p-2.5 rounded border border-blue-100/50 text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedRequest.managerComment}
                    </div>
                  </div>
                )}
              </div>

              {selectedRequest.status === 1 && (
                <div className="border-t border-gray-200 pt-4">
                  <label htmlFor="reviewComment" className="block text-xs font-medium text-gray-700 mb-1">
                    Add Note (Optional)
                  </label>
                  <textarea
                    id="reviewComment"
                    rows="2"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Provide a comment regarding your decision..."
                  ></textarea>
                </div>
              )}
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
              <button 
                onClick={closeModal}
                disabled={submittingReview}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
              >
                Close
              </button>
              
              {selectedRequest.status === 1 && (
                <>
                  <button 
                    onClick={() => submitReview('Reject')}
                    disabled={submittingReview}
                    className="px-3 py-1.5 border border-red-300 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100 focus:outline-none transition-colors flex items-center"
                  >
                    Reject Request
                  </button>
                  <button 
                    onClick={() => submitReview('Approve')}
                    disabled={submittingReview}
                    className="px-3 py-1.5 border border-transparent bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 focus:outline-none transition-colors flex items-center"
                  >
                    {submittingReview ? 'Processing...' : 'Approve Request'}
                  </button>
                </>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamLeaves;
