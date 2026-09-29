import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ticketApi } from '../../api/ticketApi';
import axiosClient from '../../api/axiosClient';
import { getEmail, getRole } from '../../utils/tokenStorage';

const TicketDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const fetchTicket = async () => {
    try {
      setIsLoading(true);
      const response = await ticketApi.getTicketById(id);
      if (response && response.success) {
        setTicket(response.data);
      } else {
        setTicket(response);
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
      setTicket(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  if (isLoading) {
    return <div className="p-6 text-slate-500">Loading ticket details...</div>;
  }

  if (!ticket) {
    return <div className="p-6 text-red-500">Ticket not found or access denied.</div>;
  }

  const getStatusText = (status) => {
    switch (status) {
      case 1: return 'Open';
      case 2: return 'Solved';
      case 3: return 'Escalated';
      case 4: return 'Closed';
      default: return 'Unknown';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Critical';
      default: return 'Unknown';
    }
  };

  const attachments = ticket.imageUrl ? ticket.imageUrl.split(',') : [];

  const handleStatusChange = (e) => {
    setPendingStatus(parseInt(e.target.value));
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = async () => {
    try {
      setIsUpdatingStatus(true);
      await ticketApi.updateTicketStatus(id, pendingStatus);
      await fetchTicket();
      setIsStatusModalOpen(false);
    } catch (error) {
      console.error('Failed to update status', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) return;
    try {
      setIsReplying(true);
      await ticketApi.replyToTicket(id, { message: replyMessage });
      setReplyMessage('');
      await fetchTicket();
    } catch (error) {
      console.error('Failed to post reply', error);
    } finally {
      setIsReplying(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 1: return 'bg-red-50 text-red-600'; // Open
      case 2: return 'bg-blue-50 text-blue-600'; // Solved
      case 3: return 'bg-orange-50 text-orange-600'; // Escalated
      case 4: return 'bg-emerald-50 text-emerald-700'; // Closed
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    const namePart = email.split('@')[0];
    const parts = namePart.split('.');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return namePart.substring(0, 2).toUpperCase();
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen flex-1">
      <div className="w-full">
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <button 
            onClick={() => navigate(-1)} 
            className="hover:text-slate-900 transition-colors flex items-center"
            title="Go Back"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
          </button>
          <span className="font-semibold text-slate-700">Ticket #{id}</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{ticket.subject}</h1>
        </div>

        {/* Ticket Details & Attachments Split */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          
          {/* Left Column: Ticket Details */}
          <div className="flex-1 bg-white rounded-md border border-slate-200 shadow-sm">
            <div className="p-5 border-b border-slate-100 flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold overflow-hidden">
                  {getInitials(ticket.raisedByEmail)}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{ticket.raisedByEmail}</div>
                  <div className="text-slate-500 text-xs mt-0.5">Created {new Date(ticket.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="p-6 text-sm text-slate-700">
              <p className="mb-8 text-[13px] leading-relaxed">
                {ticket.description}
              </p>

              {/* Ticket Properties */}
              <div className="border-t border-slate-100 pt-2">
                <div className="grid grid-cols-2 gap-x-12 gap-y-0 text-[13px]">
                  {/* Row 1 */}
                  <div className="flex justify-between items-center py-3.5 border-b border-slate-100">
                    <span className="text-slate-500">Priority</span>
                    <span className="font-medium text-red-600">{getPriorityText(ticket.priority)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3.5 border-b border-slate-100">
                    <span className="text-slate-500">Assigned To</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{ticket.assignedToEmail || 'Unassigned'}</span>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="flex justify-between items-center py-3.5 border-b border-slate-100">
                    <span className="text-slate-500">Category</span>
                    <span className="font-medium text-slate-700">{ticket.category}</span>
                  </div>
                  <div className="flex justify-between items-center py-3.5 border-b border-slate-100">
                    <span className="text-slate-500">Status</span>
                    <div className="relative inline-flex items-center">
                      <select
                        value={ticket.status}
                        onChange={handleStatusChange}
                        disabled={isUpdatingStatus}
                        className={`pl-3 pr-8 py-1 rounded-full text-xs font-medium cursor-pointer focus:outline-none appearance-none ${getStatusBadgeClass(ticket.status)} hover:opacity-90 transition-opacity`}
                      >
                        <option value="1" className="bg-white text-slate-800">Open</option>
                        {(!(ticket.raisedByEmail === getEmail() && ticket.assignedToEmail !== getEmail() && getRole() !== 1)) && (
                          <>
                            <option value="2" className="bg-white text-slate-800">Solved</option>
                            <option value="3" className="bg-white text-slate-800">Escalated</option>
                          </>
                        )}
                        <option value="4" className="bg-white text-slate-800">Closed</option>
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-3 text-[9px] pointer-events-none text-current opacity-70"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Attachments */}
          <div className="w-full lg:w-80 bg-white rounded-md border border-slate-200 shadow-sm shrink-0 flex flex-col">
            <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-800 flex justify-between items-center">
              <span>Attachments</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">{attachments.length}</span>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-3">
              {attachments.length === 0 ? (
                <p className="text-xs text-slate-500">No attachments</p>
              ) : (
                attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 border border-slate-200 rounded hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 flex items-center justify-center text-indigo-500 shrink-0">
                      <i className="fa-solid fa-file"></i>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors">{file}</p>
                    </div>
                    <a 
                      href={`${axiosClient.defaults.baseURL}/Tickets/download/${file}`} 
                      download 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <i className="fa-solid fa-download text-sm"></i>
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="flex justify-between items-center mb-4 mt-8">
          <h3 className="font-bold text-sm text-slate-800">Replies <span className="text-slate-500 font-normal ml-1">({ticket.replies?.length || 0})</span></h3>

        </div>

        {ticket.replies && ticket.replies.length > 0 ? ticket.replies.map((reply) => (
          <div key={reply.id} className="bg-white rounded-md border border-slate-200 shadow-sm mb-6">
            <div className="p-6 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 shrink-0 flex items-center justify-center text-blue-700 font-bold overflow-hidden uppercase">
                 {reply.replyByEmail.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-semibold text-slate-900 text-[13px]">{reply.replyByEmail}</div>
                    <div className="text-slate-400 text-[11px] mt-1">{new Date(reply.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <p className="text-[13px] text-slate-700 whitespace-pre-wrap">{reply.message}</p>
                
                {reply.imageUrl && (
                  <div className="mt-3 flex gap-2">
                    {reply.imageUrl.split(',').map((img, idx) => (
                      <div key={idx} className="text-xs text-blue-600">
                        <i className="fa-solid fa-paperclip"></i> {img}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className="text-slate-500 text-sm mb-6 text-center py-6 bg-white border border-slate-200 rounded-md">No replies yet.</div>
        )}

        {/* Comment Input */}
        <div className="flex gap-3 items-start mb-10 mt-6">
          <textarea 
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            disabled={isReplying}
            className="flex-1 bg-white border border-slate-300 rounded-md p-3 min-h-[80px] text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#ff0066] focus:border-[#ff0066] resize-y"
            placeholder="Add a reply..."
          />
          <button 
            onClick={handleReply}
            disabled={isReplying || !replyMessage.trim()}
            className="px-5 py-2.5 bg-[#ff0066] hover:bg-[#e0005a] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-[13px] font-medium transition-colors shadow-sm whitespace-nowrap"
          >
             {isReplying ? 'Posting...' : 'Reply'}
          </button>
        </div>

      </div>

      {/* Confirm Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Confirm Change</h2>
              <button 
                onClick={() => setIsStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isUpdatingStatus}
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-[13px] text-slate-700 mb-6">
                Are you sure you want to change the status of this ticket to <span className="font-semibold text-slate-900">{getStatusText(pendingStatus)}</span>?
              </p>
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsStatusModalOpen(false)}
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-[13px] font-medium rounded transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmStatusChange}
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 bg-[#ff0066] hover:bg-[#e0005a] text-white text-[13px] font-medium rounded transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdatingStatus ? (
                    <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
                  ) : (
                    'Confirm Change'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TicketDetails;
