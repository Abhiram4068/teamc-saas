import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../utils/Toast';
import { workReportApi } from '../../api/workReportApi';

export default function WorkReport() {
    const location = useLocation();
    const { targetUserId } = useParams();
    const navigate = useNavigate();
    const isTeamMode = location.pathname.includes('/team');
    
    const { showToast } = useToast();
    const [workTypes, setWorkTypes] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Pagination & Filter State
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('workdate');
    const [sortDescending, setSortDescending] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);

    const todayStr = new Date().toISOString().split('T')[0];
    // Global Date State
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [isDateSubmitted, setIsDateSubmitted] = useState(false);
    const [checkingDate, setCheckingDate] = useState(false);

    const emptyEntry = {
        name: '',
        workTypeId: '',
        description: '',
        hoursSpent: ''
    };

    // Form State
    const [entries, setEntries] = useState([{ ...emptyEntry }]);
    
    // Form validation errors
    const [errors, setErrors] = useState([{}]);

    const handleEntryChange = (index, field, value) => {
        const newEntries = [...entries];
        newEntries[index][field] = value;
        setEntries(newEntries);
    };

    const addEntry = () => {
        setEntries([...entries, { ...emptyEntry }]);
        setErrors([...errors, {}]);
    };

    const removeEntry = (index) => {
        if (entries.length > 1) {
            const newEntries = [...entries];
            newEntries.splice(index, 1);
            setEntries(newEntries);
            
            const newErrors = [...errors];
            newErrors.splice(index, 1);
            setErrors(newErrors);
        }
    };

    // Fetch Work Types
    useEffect(() => {
        const fetchWorkTypes = async () => {
            try {
                const res = await workReportApi.getWorkTypes();
                if (res.success) {
                    setWorkTypes(res.data);
                }
            } catch (error) {
                console.error("Failed to load work types", error);
            }
        };
        fetchWorkTypes();
    }, []);

    // Check if report is submitted for selected date
    useEffect(() => {
        const checkDate = async () => {
            setCheckingDate(true);
            try {
                const res = await workReportApi.checkReportSubmitted(selectedDate);
                if (res.success) {
                    setIsDateSubmitted(res.data);
                }
            } catch (error) {
                console.error("Failed to check date", error);
            } finally {
                setCheckingDate(false);
            }
        };
        checkDate();
    }, [selectedDate, totalRecords]);

    // Fetch Reports
    const fetchReports = async () => {
        setLoading(true);
        try {
            const params = {
                pageNumber,
                pageSize,
                searchTerm,
                sortBy,
                sortDescending
            };
            if (isTeamMode && targetUserId) {
                params.targetUserId = targetUserId;
            }
            
            const res = isTeamMode 
                ? await workReportApi.getTeamReports(params)
                : await workReportApi.getMyReports(params);
                
            if (res.success) {
                setReports(res.data.data || []);
                setTotalRecords(res.data.totalRecords || 0);
            }
        } catch (error) {
            showToast("Failed to load work reports.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [pageNumber, pageSize, searchTerm, sortBy, sortDescending]);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDescending(!sortDescending);
        } else {
            setSortBy(field);
            setSortDescending(true);
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = entries.map(entry => {
            const errs = {};
            if (!entry.name.trim()) errs.name = "Required";
            if (!entry.workTypeId) errs.workTypeId = "Required";
            if (!entry.description.trim()) errs.description = "Required";
            if (!entry.hoursSpent || entry.hoursSpent <= 0 || entry.hoursSpent > 24) {
                errs.hoursSpent = "Invalid";
            }
            if (Object.keys(errs).length > 0) isValid = false;
            return errs;
        });
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (status) => {
        if (!validateForm()) return;
        
        try {
            const payload = entries.map(entry => ({
                ...entry,
                workDate: selectedDate,
                workTypeId: parseInt(entry.workTypeId),
                hoursSpent: parseFloat(entry.hoursSpent),
                status: status
            }));
            
            const res = await workReportApi.createReport(payload);
            
            if (res.success) {
                showToast(status === 1 ? "Reports submitted!" : "Drafts saved!", "success");
                setEntries([{ ...emptyEntry }]);
                setErrors([{}]);
                setPageNumber(1);
                fetchReports();
            } else {
                showToast(res.message || "Failed to save reports.", "error");
            }
        } catch (error) {
            showToast("An error occurred while saving.", "error");
        }
    };

    const handleSubmitDraftGroup = async (reportsInGroup) => {
        try {
            setLoading(true);
            const promises = reportsInGroup.map(report => {
                const updatePayload = {
                    workTypeId: report.workType.id,
                    name: report.name,
                    description: report.description,
                    workDate: report.workDate,
                    hoursSpent: report.hoursSpent,
                    status: 1 // Submitted
                };
                return workReportApi.updateReport(report.id, updatePayload);
            });
            
            await Promise.all(promises);
            showToast("Drafts submitted successfully!", "success");
            
            const groupDate = new Date(reportsInGroup[0].workDate).toISOString().split('T')[0];
            if (groupDate === selectedDate) {
                setIsDateSubmitted(true);
            }
            
            fetchReports();
        } catch (error) {
            console.error("Failed to submit drafts", error);
            showToast(error.response?.data?.message || "Failed to submit drafts", "error");
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(totalRecords / pageSize);

    const changeDate = (days) => {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() + days);
        const newDateStr = currentDate.toISOString().split('T')[0];
        if (newDateStr <= todayStr) {
            setSelectedDate(newDateStr);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="border-b border-gray-200 pb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        {isTeamMode ? (
                            <>
                                {location.state?.employeeName || 'Team Member'}
                                <span className="text-sm font-normal text-gray-500 ml-3">
                                    {location.state?.employeeEmail || ''}
                                </span>
                            </>
                        ) : 'Work Reports'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isTeamMode ? 'Review your team member\'s work reports.' : 'Log your daily work hours and track previous reports.'}
                    </p>
                </div>
                {isTeamMode && (
                    <button 
                        onClick={() => navigate('/emp/work-reports/team')}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        <i className="fas fa-arrow-left mr-2"></i>Back to Team List
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-6 mt-8">
                {/* Submit New Report */}
                {!isTeamMode && (
                <div>
                    <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                        
                        {/* Global Date Header */}
                        <div className="bg-slate-800 text-white px-5 py-3 flex justify-center items-center gap-6">
                            <button onClick={() => changeDate(-1)} className="hover:text-purple-200 transition-colors">
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            <div className="flex items-center gap-2 font-medium">
                                <i className="far fa-calendar-alt"></i>
                                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <button 
                                onClick={() => changeDate(1)} 
                                disabled={selectedDate >= todayStr}
                                className={`transition-colors ${selectedDate >= todayStr ? 'text-slate-600 cursor-not-allowed' : 'hover:text-purple-200'}`}
                            >
                                <i className="fas fa-arrow-right"></i>
                            </button>
                        </div>

                        {checkingDate ? (
                            <div className="p-8 text-center text-gray-500">
                                <i className="fas fa-spinner fa-spin mr-2"></i> Checking date...
                            </div>
                        ) : isDateSubmitted ? (
                            <div className="p-8 text-center">
                                <div className="mb-2">
                                    <i className="fas fa-check-circle  text-4xl"></i>
                                </div>
                                <h3 className="text-gray-900 font-medium">Reports Submitted</h3>
                                <p className="text-gray-500 text-sm mt-1">You have already submitted your work reports for {new Date(selectedDate).toLocaleDateString()}.</p>
                            </div>
                        ) : (
                            <>
                                <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                    <h2 className="text-sm font-semibold text-gray-800">Submit New Reports</h2>
                                    {errors.some(err => Object.keys(err).length > 0) && (
                                        <span className="text-red-500 text-xs">Please fill the highlighted fields.</span>
                                    )}
                                </div>
                                
                                <div className="p-5 space-y-6">
                                    {entries.map((entry, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start relative pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                    {entries.length > 1 && (
                                        <button 
                                            onClick={() => removeEntry(index)}
                                            className="absolute top-0 right-0 text-gray-400 hover:text-red-500 transition-colors p-1"
                                            title="Remove Entry"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    )}

                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-gray-700">Report Name <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            className={`w-full text-sm px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors[index]?.name ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="E.g. Weekly Sync"
                                            value={entry.name}
                                            onChange={(e) => handleEntryChange(index, 'name', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-gray-700">Work Type</label>
                                        <select 
                                            className={`w-full text-sm px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors[index]?.workTypeId ? 'border-red-500' : 'border-gray-300'}`}
                                            value={entry.workTypeId}
                                            onChange={(e) => handleEntryChange(index, 'workTypeId', e.target.value)}
                                        >
                                            <option value="">Select work type</option>
                                            {workTypes.map(type => (
                                                <option key={type.id} value={type.id}>{type.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-gray-700">Hours</label>
                                        <input 
                                            type="number" 
                                            step="0.5"
                                            className={`w-full text-sm px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors[index]?.hoursSpent ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="0.0"
                                            value={entry.hoursSpent}
                                            onChange={(e) => handleEntryChange(index, 'hoursSpent', e.target.value)}
                                        />
                                    </div>

                                    <div className="md:col-span-2 lg:col-span-4 space-y-1">
                                        <label className="block text-xs font-medium text-gray-700">Description</label>
                                        <textarea 
                                            className={`w-full text-sm px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y min-h-[38px] ${errors[index]?.description ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Brief description of work..."
                                            value={entry.description}
                                            onChange={(e) => handleEntryChange(index, 'description', e.target.value)}
                                            rows="1"
                                        ></textarea>
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-between items-center pt-2">
                                <button 
                                    onClick={addEntry} 
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Add Another Entry
                                </button>
                                
                                <div className="flex items-center gap-2 h-full">
                                    <button 
                                        onClick={(e) => { e.preventDefault(); handleSubmit(2); }} 
                                        disabled={loading}
                                        className="text-gray-700 text-sm font-medium py-2 px-4 border border-gray-300 rounded transition-colors hover:bg-gray-50 h-[38px]"
                                    >
                                        Save Drafts
                                    </button>
                                    <button 
                                        onClick={(e) => { e.preventDefault(); handleSubmit(1); }} 
                                        disabled={loading}
                                        className={`text-white text-sm font-medium py-2 px-4 rounded transition-colors ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} h-[38px] whitespace-nowrap`}
                                    >
                                        {loading ? 'Wait...' : 'Submit All'}
                                    </button>
                                </div>
                            </div>
                            </div>
                        </>
                        )}
                    </div>
                </div>
                )}

                {/* Data Table */}
                <div>
                    <div className="bg-white border border-gray-200 rounded-md shadow-sm h-full flex flex-col">
                        <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h2 className="text-sm font-semibold text-gray-800">{isTeamMode ? 'Team Reports' : 'My Reports'}</h2>
                            
                            <div className="flex items-center gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                    <input 
                                        type="text"
                                        placeholder="Search..."
                                        className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-48"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setPageNumber(1);
                                        }}
                                    />
                                </div>

                                {/* Pagination Controls (matching MyLeaves) */}
                                <div className="flex items-center space-x-2">
                                    <button 
                                        disabled={pageNumber === 1}
                                        onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                                        className={`p-1 rounded border ${pageNumber > 1 ? 'border-gray-300 text-gray-600 hover:bg-gray-50' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                    </button>
                                    <span className="text-xs text-gray-500">Page {pageNumber} of {totalPages || 1}</span>
                                    <button 
                                        disabled={pageNumber === totalPages || totalPages === 0}
                                        onClick={() => setPageNumber(prev => Math.min(prev + 1, totalPages))}
                                        className={`p-1 rounded border ${pageNumber < totalPages ? 'border-gray-300 text-gray-600 hover:bg-gray-50' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-5 py-3 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort('workdate')}>
                                            Report Name {sortBy === 'workdate' && (sortDescending ? '(Date ↓)' : '(Date ↑)')}
                                        </th>
                                        <th className="px-5 py-3 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort('worktype')}>
                                            Type {sortBy === 'worktype' && (sortDescending ? '↓' : '↑')}
                                        </th>
                                        <th className="px-5 py-3 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort('hoursspent')}>
                                            Hours {sortBy === 'hoursspent' && (sortDescending ? '↓' : '↑')}
                                        </th>
                                        <th className="px-5 py-3 font-medium">Description</th>
                                        <th className="px-5 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-5 py-8 text-center text-gray-500 text-sm">
                                                <i className="fas fa-spinner fa-spin mr-2"></i> Loading...
                                            </td>
                                        </tr>
                                    ) : reports.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-5 py-8 text-center text-gray-500 text-sm">
                                                No work reports found.
                                            </td>
                                        </tr>
                                    ) : (
                                        reports.map((group, groupIdx) => (
                                            <React.Fragment key={groupIdx}>
                                                <tr className="bg-indigo-50 border-y border-indigo-100">
                                                    <td colSpan="4" className="px-5 py-2.5 font-semibold text-indigo-900 text-xs">
                                                        <i className="far fa-calendar-alt mr-2 text-indigo-500"></i>
                                                        {new Date(group.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </td>
                                                    <td className="px-5 py-2.5 whitespace-nowrap">
                                                        {group.status === 1 ? (
                                                            <span className="inline-flex items-center text-xs font-bold text-green-600 px-2 py-0.5 rounded">Submitted</span>
                                                        ) : (
                                                            <div className="flex items-center gap-3">
                                                                <span className="inline-flex items-center text-xs font-bold text-amber-600 px-2 py-0.5 rounded">Draft</span>
                                                                {!isTeamMode && (
                                                                    <button 
                                                                        onClick={() => handleSubmitDraftGroup(group.reports)}
                                                                        className="text-[10px] uppercase tracking-wider font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded transition-colors shadow-sm"
                                                                    >
                                                                        Submit
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                        <span className="ml-3 text-xs font-bold text-indigo-600">({group.totalHours} Hrs)</span>
                                                    </td>
                                                </tr>
                                                {group.reports.map((report, idx) => (
                                                    <tr key={report.id} className={`${idx === group.reports.length - 1 ? 'border-b-2 border-gray-200' : 'border-b border-gray-100'} hover:bg-gray-50 transition-colors`}>
                                                        <td className="px-5 py-3 text-gray-900 pl-10 font-medium">
                                                            {report.name}
                                                        </td>
                                                        <td className="px-5 py-3 text-gray-600 text-sm">
                                                            {report.workType?.name}
                                                        </td>
                                                        <td className="px-5 py-3 text-gray-900 font-medium">
                                                            {report.hoursSpent}
                                                        </td>
                                                        <td colSpan="2" className="px-5 py-3 text-gray-500 max-w-[300px] whitespace-normal">
                                                            <div className="line-clamp-2 text-xs" title={report.description}>
                                                                {report.description}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
