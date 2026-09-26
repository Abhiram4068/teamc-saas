import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployees } from '../../api/tenantAdmin';
import Toast from '../../components/common/Toast';

export default function TenantAdminEmployees() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Pagination & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDescending, setSortDescending] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await getEmployees({
        searchTerm,
        sortBy,
        sortDescending,
        pageNumber,
        pageSize
      });
      if (response?.success && response?.data) {
        setEmployees(response.data.data || []);
        setTotalCount(response.data.totalRecords || 0);
      } else {
        setToast({ show: true, message: response.message || 'Failed to fetch employees', type: 'error' });
      }
    } catch (error) {
      setToast({ show: true, message: 'An error occurred while fetching employees', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Debounce search term
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPageNumber(1); // Reset to first page on search change
      fetchEmployees();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortDescending, pageNumber, pageSize]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDescending(!sortDescending);
    } else {
      setSortBy(field);
      setSortDescending(false);
    }
    setPageNumber(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const handlePrevPage = () => {
    if (pageNumber > 1) setPageNumber(pageNumber - 1);
  };

  const handleNextPage = () => {
    if (pageNumber < totalPages) setPageNumber(pageNumber + 1);
  };

  const getRoleName = (roleValue) => {
    switch(roleValue) {
      case 1: return 'SUPERADMIN';
      case 2: return 'TENANT';
      case 3: return 'TENANT ADMIN';
      case 4: return 'HR';
      case 5: return 'MANAGER';
      case 6: return 'EMPLOYEE';
      default: return 'UNKNOWN';
    }
  };

  return (
    <div className="animate-fade-in relative">
      <Toast {...toast} onClose={() => setToast(prev => ({ ...prev, show: false }))} />

      {/* Header Card */}
      <div className="bg-white rounded-lg p-6 flex justify-between items-center shadow-sm mb-6 border border-gray-100">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">User Profiles</h1>
          <p className="text-[13px] text-gray-500">Manage user credentials, operational roles, and access statuses across the system.</p>
        </div>
        <button 
          onClick={() => navigate('/tenant-admin/dashboard')}
          className="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-md text-[13px] font-semibold cursor-pointer flex items-center gap-2 hover:bg-gray-50 transition"
        >
          <i className="fas fa-arrow-left"></i> Dashboard Overview
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 px-5 flex justify-between items-center border-b border-gray-100">
          <div className="relative w-[600px]">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email or phone number..."
              className="w-full py-2 px-3 pl-8 border border-gray-100 bg-gray-50 rounded-md text-xs outline-none focus:border-brand-500 transition"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-gray-400">Page {pageNumber} of {totalPages}</span>
            <div className="flex gap-1 text-gray-400 text-[10px]">
              <i 
                className={`fas fa-chevron-left cursor-pointer hover:text-gray-600 ${pageNumber === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handlePrevPage}
              ></i>
              <i 
                className={`fas fa-chevron-right cursor-pointer hover:text-gray-600 ${pageNumber === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleNextPage}
              ></i>
            </div>
            <span className="text-[11px] text-gray-500">Showing <b>{employees.length}</b> of <b>{totalCount}</b> results</span>
          </div>
        </div>

        <table className="w-full text-left border-collapse relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <i className="fas fa-circle-notch fa-spin text-brand-500 text-2xl"></i>
            </div>
          )}
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-5 text-[10px] font-bold text-gray-500 tracking-wide border-b border-gray-100 cursor-pointer" onClick={() => handleSort('id')}>
                EMP CODE <i className="fas fa-sort text-[8px] ml-1"></i>
              </th>
              <th className="py-3 px-5 text-[10px] font-bold text-gray-500 tracking-wide border-b border-gray-100">
                NAME 
              </th>
              <th className="py-3 px-5 text-[10px] font-bold text-gray-500 tracking-wide border-b border-gray-100">
                EMAIL ADDRESS
              </th>
              <th className="py-3 px-5 text-[10px] font-bold text-gray-500 tracking-wide border-b border-gray-100 cursor-pointer" onClick={() => handleSort('department')}>
                DEPARTMENT <i className="fas fa-sort text-[8px] ml-1"></i>
              </th>
              <th className="py-3 px-5 text-[10px] font-bold text-gray-500 tracking-wide border-b border-gray-100 cursor-pointer" onClick={() => handleSort('designation')}>
                DESIGNATION <i className="fas fa-sort text-[8px] ml-1"></i>
              </th>
              <th className="py-3 px-5 text-[10px] font-bold text-gray-500 tracking-wide border-b border-gray-100 cursor-pointer" onClick={() => handleSort('role')}>
                ROLE <i className="fas fa-sort text-[8px] ml-1"></i>
              </th>
              <th className="py-3 px-5 text-[10px] font-bold text-gray-500 tracking-wide border-b border-gray-100">ACTION</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-xs">
            {employees.length === 0 && !loading ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500">No employees found.</td>
              </tr>
            ) : (
              employees.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0">
                  <td className="py-3.5 px-5 text-gray-400">EMP-{user.id}</td>
                  <td className="py-3.5 px-5 font-semibold text-gray-900">{user.firstName} {user.lastName}</td>
                  <td className="py-3.5 px-5">{user.email}</td>
                  <td className="py-3.5 px-5">{user.departmentName || '-'}</td>
                  <td className="py-3.5 px-5">{user.designationName || '-'}</td>
                  <td className="py-3.5 px-5">
                    <span className="font-bold text-[11px] text-brand-600">
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <button className="bg-green-50 text-green-700 border border-green-200 py-1.5 px-3 rounded text-[11px] font-semibold hover:bg-green-100 transition">
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
