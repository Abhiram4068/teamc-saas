import React, { useState, useEffect } from 'react';
import { employeeApi } from '../../api/employeeApi';
import { Link } from 'react-router-dom';
import { getRole } from '../../utils/tokenStorage';

const getRoleName = (roleId) => {
  switch(roleId) {
    case 3: return 'Tenant Admin';
    case 4: return 'HR';
    case 5: return 'Manager';
    case 6: return 'Employee';
    default: return 'Unknown';
  }
};

export default function TeamWorkReportsList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const parsedRole = getRole();
  
  // Pagination State
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Sorting State
  const [sortBy, setSortBy] = useState('name');
  const [sortDescending, setSortDescending] = useState(false);

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

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        ...(debouncedSearch && { SearchTerm: debouncedSearch }),
        ...(sortBy !== '' && { SortBy: sortBy }),
        SortDescending: sortDescending
      };
      const response = await employeeApi.getEmployees(params);
      
      // Axios response format varies depending on setup, usually response.data is the ApiResponse object
      const apiResponse = response.data;
      if (apiResponse && apiResponse.data) {
          setEmployees(apiResponse.data.data || []);
          setTotalRecords(apiResponse.data.totalRecords || 0);
          setTotalPages(Math.ceil((apiResponse.data.totalRecords || 0) / pageSize));
      } else {
          setEmployees([]);
          setTotalRecords(0);
          setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [pageNumber, pageSize, debouncedSearch, sortBy, sortDescending]);

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
  
  const startRecord = totalRecords === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const endRecord = Math.min(pageNumber * pageSize, totalRecords);

  return (
    <div className="flex-1 p-6 relative flex flex-col justify-between min-h-screen bg-[#f1f5f9] text-slate-700 antialiased">
      <div>
        {/* Page header */}
        <div className="bg-white rounded border border-gray-200 p-6 flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
                <nav className="flex items-center space-x-1.5 text-[11px] text-[#141824] mb-2">
                    <Link to="/emp/dashboard" className="hover:underline">Dashboard</Link>
                    <span className="text-gray-400">&gt;</span>
                    <span className="text-gray-400">Team Reports</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Work Reports</h1>
                <p className="text-sm text-slate-500 mt-1">Select an employee to view their detailed work reports.</p>
            </div>
            <div className="flex items-center gap-3">
            </div>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#141824] border border-gray-200 rounded p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Employees</p>
                <p className="text-2xl font-extrabold text-white mt-1">{totalRecords}</p>
                <p className="text-xs text-slate-400 mt-1">
                    All members in your scope
                </p>
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
                placeholder="Search by name, email, phone" 
                className="w-full bg-white text-xs text-slate-700 pl-8 pr-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:border-blue-500 shadow-sm placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-gray-200 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                <th className="py-2.5 px-3 w-8 text-center">SI</th>
                <th className="py-2.5 px-3 cursor-pointer select-none group" onClick={() => { setSortBy('name'); setSortDescending(!sortDescending); setPageNumber(1); }}>
                  <div className="flex items-center gap-1">
                    EMPLOYEE NAME 
                    <i className={`fa-solid ${sortBy === 'name' ? (sortDescending ? 'fa-sort-down text-blue-500' : 'fa-sort-up text-blue-500') : 'fa-sort text-gray-300 group-hover:text-gray-400'}`}></i>
                  </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">EMAIL </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">DEPARTMENT </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">DESIGNATION</div>
                </th>
                <th className="py-2.5 px-3 w-32 text-center">
                  <div className="flex items-center justify-center gap-1">ACTIONS</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-6 px-6 text-center text-gray-500">Loading employees...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 px-6 text-center text-gray-500">No employees found.</td>
                </tr>
              ) : (
                employees.map((emp, index) => (
                  <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 px-3 text-center text-gray-400 font-medium">{startRecord + index}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {emp.firstName?.charAt(0) || ''}{emp.lastName?.charAt(0) || ''}
                        </div>
                        <div>
                          <span className="font-semibold text-[#141824] block leading-tight">{emp.firstName} {emp.lastName}</span>
                          <span className="text-gray-400 text-[10px]">Joined: {new Date(emp.joiningDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{emp.email || '--'}</td>
                    <td className="py-2.5 px-3 text-slate-700">
                      <span className="px-2 py-1 text-gray-600 rounded text-[10px] font-medium">
                        {emp.departmentName || '--'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{emp.designationName || '--'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <Link 
                        to={`/emp/work-reports/team/${emp.userId}`} 
                        state={{ employeeName: `${emp.firstName} ${emp.lastName}`, employeeEmail: emp.email }}
                        className="text-[10px] uppercase tracking-wider font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded transition-colors shadow-sm inline-block"
                      >
                        View Reports
                      </Link>
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
