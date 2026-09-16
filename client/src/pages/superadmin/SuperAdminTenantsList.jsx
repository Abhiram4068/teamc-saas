import React, { useState, useEffect } from 'react';
import { superadminApi } from '../../api/superadminApi';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function SuperAdminTenantsList() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Pagination State
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Status Filter State (optional based on your TenantStatus enum, typically 1=Active, etc)
  const [status, setStatus] = useState('');

  // Handle Search Debounce
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPageNumber(1); // Reset to page 1 on new search
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const params = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        ...(debouncedSearch && { SearchTerm: debouncedSearch }),
        ...(status !== '' && { Status: status })
      };
      const response = await superadminApi.getTenants(params);
      
      if (response.data && response.data.data) {
          setTenants(response.data.data);
          setTotalRecords(response.data.totalRecords);
          setTotalPages(response.data.totalPages);
      } else {
          setTenants([]);
          setTotalRecords(0);
          setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching tenants:", error);
      // toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [pageNumber, pageSize, debouncedSearch, status]);

  const handlePrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNumber < totalPages) {
      setPageNumber(pageNumber + 1);
    }
  };
  
  // Calculate display range
  const startRecord = (pageNumber - 1) * pageSize + 1;
  const endRecord = Math.min(pageNumber * pageSize, totalRecords);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f1f5f9] min-h-screen">
      {/* Page header */}
      <div className="bg-white rounded border border-gray-200 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Breadcrumb items={[
            { label: 'Home', to: '/superadmin/dashboard' },
            { label: 'Tenants' }
          ]} />
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Manage Tenants</h1>
          <p className="text-sm text-gray-400 mt-1">View and manage all registered tenants, their statuses, and contact information.</p>
        </div>
      </div>

      {/* Tenants table container */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-wrap gap-4">
          <div className="relative flex-1 max-w-2xl">
            <input
              type="text"
              placeholder="Search by company name, contact name, email, or phone..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          
          <div className="flex items-center gap-6">
            <select
              className="py-2 px-3 pr-8 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500 bg-white text-gray-600 min-w-[120px]"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPageNumber(1); }}
            >
              <option value="">All Statuses</option>
              <option value="0">Pending</option>
              <option value="1">Active</option>
              <option value="2">Inactive</option>
              <option value="3">Suspended</option>
            </select>
            
            <div className="flex flex-col items-end justify-center border-l border-gray-200 pl-6 h-full">
              <div className="flex items-center text-sm text-gray-600 gap-2">
                <span>Page {pageNumber} of {totalPages || 1}</span>
                <div className="flex items-center">
                  <button
                    disabled={pageNumber === 1}
                    onClick={handlePrevPage}
                    className="p-1 hover:bg-gray-100 rounded text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    disabled={pageNumber >= totalPages}
                    onClick={handleNextPage}
                    className="p-1 hover:bg-gray-100 rounded text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
              <span className="text-[11px] text-gray-400 mt-0.5">
                Showing {tenants.length} of {totalRecords} results
              </span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[980px]">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
                <th className="py-3 px-6">TENANT</th>
                <th className="py-3 px-6">PRIMARY CONTACT</th>
                <th className="py-3 px-6">EMAIL</th>
                <th className="py-3 px-6">PHONE</th>
                <th className="py-3 px-6">STATUS</th>
                <th className="py-3 px-6">CREATED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-6 px-6 text-center text-gray-500">Loading tenants...</td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 px-6 text-center text-gray-500">No tenants found.</td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2 px-6 text-gray-800 font-semibold text-[13px]">
                      <div className="flex flex-col">
                        <span className="truncate w-full max-w-[200px]" title={tenant.companyName}>{tenant.companyName}</span>
                        <span className="text-gray-400 font-normal text-[11px]">CIN: {tenant.cin}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-gray-600 text-[13px]">
                      <div className="truncate w-full max-w-[150px]" title={(tenant.firstName || tenant.lastName) ? `${tenant.firstName} ${tenant.lastName}`.trim() : '--'}>
                        {(tenant.firstName || tenant.lastName) ? `${tenant.firstName} ${tenant.lastName}`.trim() : '--'}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-gray-600 text-[13px]">
                      <div className="truncate w-full max-w-[180px]" title={tenant.email || '--'}>
                        {tenant.email || '--'}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-gray-600 text-[13px] font-mono">
                      {tenant.phoneNumber || '--'}
                    </td>
                    <td className="py-3 px-6">
                      {tenant.status === 1 ? (
                        <span className="text-[11px] font-semibold text-emerald-700  px-2 py-1 rounded-full">Active</span>
                      ) : tenant.status === 0 ? (
                        <span className="text-[11px] font-semibold text-amber-700  px-2 py-1 rounded-full">Pending</span>
                      ) : (
                        < span className="text-[11px] font-semibold text-red-700  px-2 py-1 rounded-full">Inactive</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-gray-600 text-[13px]">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
