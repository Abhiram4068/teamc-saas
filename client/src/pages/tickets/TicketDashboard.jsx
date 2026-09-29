import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ticketApi } from '../../api/ticketApi';
import Toast from '../../components/common/Toast';

const TicketDashboard = () => {
  const location = useLocation();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Filtering State
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    // Parse default status filter from URL
    if (location.pathname.includes('/escalated')) setStatusFilter('escalated');
    else if (location.pathname.includes('/open')) setStatusFilter('open');
    else if (location.pathname.includes('/resolved')) setStatusFilter('solved');
    else setStatusFilter('');
    
    // Reset to page 1 on route change
    setPageNumber(1);
  }, [location.pathname]);

  // Debounced Search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== searchInput) {
        setSearch(searchInput);
        setPageNumber(1);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, search]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const params = { pageNumber, pageSize };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      // Currently, always fetching assigned tickets per requirements
      const response = await ticketApi.getAssignedTickets(params);
      
      if (response && response.success) {
        if (response.data && Array.isArray(response.data.data)) {
          // It's a PagedResponseDto
          setTickets(response.data.data);
          setTotalRecords(response.data.totalRecords || 0);
        } else {
          setTickets(response.data || []);
          setTotalRecords(response.data?.length || 0);
        }
      } else if (Array.isArray(response)) {
        setTickets(response);
        setTotalRecords(response.length);
      }
    } catch (error) {
      console.error(error);
      setToast({ show: true, message: 'Failed to fetch tickets.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [pageNumber, pageSize, search, statusFilter]);

  // Listen for custom ticketCreated event
  useEffect(() => {
    const handleTicketCreated = () => {
      fetchTickets();
    };
    window.addEventListener('ticketCreated', handleTicketCreated);
    return () => window.removeEventListener('ticketCreated', handleTicketCreated);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPageNumber(1);
  };


  return (
    <>
      {/* Page Title & Primary Action */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-slate-900">Tickets</h1>
          <p className="text-xs text-slate-500 mt-1">Manage, assign, and resolve support requests from your team.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-6 text-xs font-semibold">
        <button 
          onClick={() => { setStatusFilter(''); setPageNumber(1); }} 
          className={`pb-2 ${statusFilter === '' ? 'text-[#ff0066] border-b-2 border-[#ff0066]' : 'text-slate-500 hover:text-slate-800'}`}
        >
          All Tickets
        </button>
        <button 
          onClick={() => { setStatusFilter('open'); setPageNumber(1); }} 
          className={`pb-2 ${statusFilter === 'open' ? 'text-[#ff0066] border-b-2 border-[#ff0066]' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Open
        </button>
        <button 
          onClick={() => { setStatusFilter('solved'); setPageNumber(1); }} 
          className={`pb-2 ${statusFilter === 'solved' ? 'text-[#ff0066] border-b-2 border-[#ff0066]' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Solved
        </button>
        <button 
          onClick={() => { setStatusFilter('escalated'); setPageNumber(1); }} 
          className={`pb-2 ${statusFilter === 'escalated' ? 'text-[#ff0066] border-b-2 border-[#ff0066]' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Escalated
        </button>
        <button 
          onClick={() => { setStatusFilter('closed'); setPageNumber(1); }} 
          className={`pb-2 ${statusFilter === 'closed' ? 'text-[#ff0066] border-b-2 border-[#ff0066]' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Closed
        </button>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input 
              type="text" 
              placeholder="Search subject or description..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-white border border-slate-300 rounded-md pl-8 pr-3 py-1 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 w-72"
            />
            <i className="fa-solid fa-search absolute left-2.5 top-1.5 text-slate-400 text-[10px]"></i>
            <button type="submit" className="hidden">Search</button>
          </form>

        </div>
      </div>

      {/* TICKETS TABLE */}
      <div className="w-full bg-white rounded-md border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] bg-slate-50">
              <th className="p-3 w-10 whitespace-nowrap">Ticket ID</th>
              <th className="p-3">Subject</th>
              <th className="p-3 w-32">Category</th>
              <th className="p-3 w-24">Status</th>
              <th className="p-3 w-24">Priority</th>
              <th className="p-3 w-32">Raised By</th>
              <th className="p-3 w-32">Assigned To</th>
              <th className="p-3 w-32">Created At</th>
              <th className="p-3 w-24 text-center">Attachments</th>
              <th className="p-3 w-24 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            
            {isLoading ? (
              <tr>
                <td colSpan="10" className="p-8 text-center text-slate-500">Loading tickets...</td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan="10" className="p-8 text-center text-slate-500">No tickets found.</td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-slate-700 font-medium">#{ticket.id}</td>
                  <td className="p-3">
                    <div className="text-slate-900 font-medium">{ticket.subject}</div>
                  </td>
                  <td className="p-3 text-slate-700">{ticket.category}</td>
                  <td className="p-3">
                    {ticket.status === 1 && <span className="bg-red-50 text-red-600 w-20 inline-block text-center py-1 rounded-full text-xs font-medium">Open</span>}
                    {ticket.status === 2 && <span className="bg-blue-50 text-blue-600 w-20 inline-block text-center py-1 rounded-full text-xs font-medium">Solved</span>}
                    {ticket.status === 3 && <span className="bg-orange-50 text-orange-600 w-20 inline-block text-center py-1 rounded-full text-xs font-medium">Escalated</span>}
                    {ticket.status === 4 && <span className="bg-emerald-50 text-emerald-700 w-20 inline-block text-center py-1 rounded-full text-xs font-medium">Closed</span>}
                  </td>
                  <td className="p-3">
                    {ticket.priority === 1 && <span className="text-[#8b9b32] text-xs font-medium">Low</span>}
                    {ticket.priority === 2 && <span className="text-amber-500 text-xs font-medium">Medium</span>}
                    {ticket.priority === 3 && <span className="text-[#c24f48] text-xs font-medium">High</span>}
                    {ticket.priority === 4 && <span className="text-[#c24f48] text-xs font-medium">Critical</span>}
                  </td>
                  <td className="p-3 text-slate-700">{ticket.raisedByEmail}</td>
                  <td className="p-3 text-slate-700">{ticket.assignedToEmail || <a href="#" className="text-orange-500 hover:underline">Assign</a>}</td>
                  <td className="p-3 text-slate-700">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-center text-slate-500">
                    <i className="fa-solid fa-paperclip mr-1"></i> {ticket.attachmentsCount || 0}
                  </td>
                  <td className="p-3 text-right">
                    <Link to={`/tickets/${ticket.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-xs">View Ticket</Link>
                  </td>
                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Showing <span className="font-medium text-slate-700">{tickets.length > 0 ? (pageNumber - 1) * pageSize + 1 : 0}</span> to <span className="font-medium text-slate-700">{Math.min(pageNumber * pageSize, totalRecords)}</span> of <span className="font-medium text-slate-700">{totalRecords}</span> tickets
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber === 1}
            className="px-3 py-1 border border-slate-300 rounded text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button 
            onClick={() => setPageNumber(p => p + 1)}
            disabled={pageNumber * pageSize >= totalRecords}
            className="px-3 py-1 border border-slate-300 rounded text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>



      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
    </>
  );
};

export default TicketDashboard;
