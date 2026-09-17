import React, { useState, useEffect } from 'react';
import { superadminApi } from '../../api/superadminApi';
import Breadcrumb from '../../components/common/Breadcrumb';
import { Link } from 'react-router-dom';
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

  // Status Filter State
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
  
  const startRecord = (pageNumber - 1) * pageSize + 1;
  const endRecord = Math.min(pageNumber * pageSize, totalRecords);

  return (
    <div className="flex-1 p-6 relative flex flex-col justify-between min-h-screen bg-[#f1f5f9] text-slate-700 antialiased">
      <div>
        {/* Page header */}
        <div className="bg-white rounded border border-gray-200 p-6 flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
                <nav className="flex items-center space-x-1.5 text-[11px] text-[#141824] mb-2">
                    <Link to="/superadmin/dashboard" className="hover:underline">Dashboard</Link>
                    <span className="text-gray-400">&gt;</span>
                    <span className="text-gray-400">Tenants</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tenants</h1>
                <p className="text-sm text-slate-500 mt-1">Manage your registered organizations and users</p>
            </div>
            <div className="flex items-center gap-3">
            </div>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#141824] border border-gray-200 rounded p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Tenants</p>
                <p className="text-2xl font-extrabold text-white mt-1">{totalRecords}</p>
                <p className="text-xs text-slate-400 mt-1">
                    {tenants.filter(t => t.status === 1).length} active &middot; {tenants.filter(t => t.status === 0).length} pending
                </p>
            </div>
            <div className="bg-[#141824] border border-[#252c40] rounded p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Active </p>
                <p className="text-2xl font-extrabold text-white mt-1">{tenants.filter(t => t.status === 1).length}</p>
                <p className="text-xs text-slate-400 mt-1">Currently active</p>
            </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-end gap-3 mb-4">
          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <div className="relative w-56">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-[10px] text-gray-400"></i>
              <input 
                type="text" 
                placeholder="Search by name" 
                className="w-full bg-white text-xs text-slate-700 pl-8 pr-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:border-blue-500 shadow-sm placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
                className="bg-white border border-gray-200 text-slate-600 text-xs px-2.5 py-1.5 rounded shadow-sm focus:outline-none focus:border-blue-500 appearance-none"
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPageNumber(1); }}
            >
              <option value="">All Status</option>
              <option value="0">Pending</option>
              <option value="1">Active</option>
              <option value="2">Inactive</option>
            </select>
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-gray-200 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                <th className="py-2.5 px-3 w-8 text-center">SI</th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">ORGANIZATION </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">EMAIL </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">PHONE </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">CONTACT NAME </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">DATE</div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">ACTIONS</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-6 px-6 text-center text-gray-500">Loading tenants...</td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 px-6 text-center text-gray-500">No tenants found.</td>
                </tr>
              ) : (
                tenants.map((tenant, index) => (
                  <tr key={tenant.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 px-3 text-center text-gray-400 font-medium">{startRecord + index}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2.5">
                        <div>
                          <a href="#" className="font-semibold text-[#141824] hover:underline block leading-tight">{tenant.companyName}</a>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-gray-400 text-[10px]">CIN: {tenant.cin || 'N/A'}</span>
                            {tenant.status === 1 ? (
                              <span className="text-emerald-600 text-[10px] font-bold px-1">Active</span>
                            ) : tenant.status === 0 ? (
                              <span className="text-amber-600 text-[10px] font-bold px-1">Pending</span>
                            ) : (
                              <span className="text-gray-500 text-[10px] font-bold px-1">Inactive</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{tenant.email || '--'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{tenant.phoneNumber || '--'}</td>
                    <td className="py-2.5 px-3 text-slate-700">{(tenant.firstName || tenant.lastName) ? `${tenant.firstName} ${tenant.lastName}`.trim() : '--'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{new Date(tenant.createdAt).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-3">
                        <Link to="#" className="text-[12px] font-medium text-teal-600 hover:text-teal-700 hover:underline focus:outline-none">View</Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <div>
            {totalRecords > 0 ? `${startRecord} to ${endRecord} Items of ${totalRecords}` : '0 Items'}
          </div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={handlePrevPage}
              disabled={pageNumber === 1}
              className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-chevron-left text-[8px]"></i>
            </button>
            <button className="w-6 h-6 flex items-center justify-center rounded bg-[#141824] text-white font-medium text-xs">{pageNumber}</button>
            {pageNumber < totalPages && (
              <button 
                onClick={handleNextPage}
                className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-slate-600 hover:bg-gray-50 text-xs"
              >
                {pageNumber + 1}
              </button>
            )}
            <button 
              onClick={handleNextPage}
              disabled={pageNumber >= totalPages}
              className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-slate-600 hover:bg-gray-50 text-xs disabled:cursor-not-allowed disabled:text-gray-300"
            >
              <i className="fa-solid fa-chevron-right text-[8px]"></i>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
