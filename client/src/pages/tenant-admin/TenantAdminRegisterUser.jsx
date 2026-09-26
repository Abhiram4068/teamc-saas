import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDepartments, getDesignations, createEmployee } from '../../api/tenantAdmin';
import Toast from '../../components/common/Toast';

export default function TenantAdminRegisterUser() {
  const navigate = useNavigate();
  
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    departmentId: '',
    designationId: '',
    joiningDate: '',
    role: 6
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await getDepartments();
        if (response?.success) {
          setDepartments(response.data || []);
        }
      } catch (error) {
        setToast({ show: true, message: 'Failed to load departments', type: 'error' });
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchDesignations = async () => {
      if (!formData.departmentId) {
        setDesignations([]);
        return;
      }
      try {
        const response = await getDesignations(formData.departmentId);
        if (response?.success) {
          setDesignations(response.data || []);
        }
      } catch (error) {
        setToast({ show: true, message: 'Failed to load designations', type: 'error' });
      }
    };
    fetchDesignations();
  }, [formData.departmentId]);

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First Name is required.';
    if (!formData.lastName.trim()) return 'Last Name is required.';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) return 'A valid email is required.';
    
    if (!formData.password || formData.password.length < 6) return 'Password must be at least 6 characters.';
    if (!formData.departmentId || parseInt(formData.departmentId) <= 0) return 'Department is required.';
    if (!formData.designationId || parseInt(formData.designationId) <= 0) return 'Designation is required.';
    if (!formData.role) return 'A valid Role is required.';

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role' || name === 'departmentId' || name === 'designationId' 
              ? (value ? parseInt(value) : '') 
              : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errorMsg = validateForm();
    if (errorMsg) {
      setToast({ show: true, message: errorMsg, type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        joiningDate: formData.joiningDate ? new Date(formData.joiningDate).toISOString() : new Date().toISOString()
      };
      
      const response = await createEmployee(payload);
      if (response.success) {
        setToast({ show: true, message: 'Employee created successfully!', type: 'success' });
        setTimeout(() => navigate('/tenant-admin/employees'), 1500);
      } else {
        setToast({ show: true, message: response.message || 'Failed to create employee', type: 'error' });
      }
    } catch (error) {
      setToast({ show: true, message: error.response?.data?.message || 'An error occurred during creation', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in relative">
      <Toast {...toast} onClose={() => setToast(prev => ({ ...prev, show: false }))} />

      <h1 className="text-[22px] font-bold text-gray-900 mb-6">Register New User</h1>

      <div className="bg-white rounded-lg p-[30px] shadow-sm max-w-[900px] border border-gray-100">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-800">Employee Details</h2>
          <p className="text-xs text-gray-500 mt-1">Enter the required information to provision a new account.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 tracking-wide uppercase mb-2">First Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. John" 
                className="w-full p-2.5 border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:border-brand-500 transition placeholder-gray-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 tracking-wide uppercase mb-2">Last Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Doe" 
                className="w-full p-2.5 border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:border-brand-500 transition placeholder-gray-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 tracking-wide uppercase mb-2">Email Address <span className="text-red-500">*</span></label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com" 
                className="w-full p-2.5 border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:border-brand-500 transition placeholder-gray-300"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 tracking-wide uppercase mb-2">Password <span className="text-red-500">*</span></label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters" 
                className="w-full p-2.5 border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:border-brand-500 transition placeholder-gray-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 tracking-wide uppercase mb-2">Phone Number</label>
              <input 
                type="text" 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="e.g. 6731000363" 
                className="w-full p-2.5 border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:border-brand-500 transition placeholder-gray-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 tracking-wide uppercase mb-2">Date of Joining</label>
              <input 
                type="date" 
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:border-brand-500 transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 tracking-wide uppercase mb-2">Department <span className="text-red-500">*</span></label>
              <select 
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:border-brand-500 bg-white"
              >
                <option value="">Select a Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 tracking-wide uppercase mb-2">Designation <span className="text-red-500">*</span></label>
              <select 
                name="designationId"
                value={formData.designationId}
                onChange={handleChange}
                disabled={!formData.departmentId}
                className="w-full p-2.5 border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:border-brand-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">Select a Designation</option>
                {designations.map(desig => (
                  <option key={desig.id} value={desig.id}>{desig.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 tracking-wide uppercase mb-2">Privilege <span className="text-red-500">*</span></label>
              <select 
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:border-brand-500 bg-white"
              >
                <option value={6}>Employee</option>
                <option value={5}>Manager</option>
                <option value={4}>HR</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button 
              type="button" 
              onClick={() => setFormData({
                firstName: '', lastName: '', email: '', password: '', phoneNumber: '', departmentId: '', designationId: '', joiningDate: '', role: 6
              })}
              className="bg-white border border-gray-200 text-gray-500 py-2 px-4 rounded-md text-xs font-semibold cursor-pointer flex items-center gap-1.5 hover:bg-gray-50 transition"
            >
              <i className="fas fa-eraser text-[10px]"></i> Clear
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/tenant-admin/employees')}
              className="bg-white border border-gray-200 text-gray-800 py-2 px-4 rounded-md text-xs font-semibold cursor-pointer hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-brand-600 text-white border-none py-2 px-4 rounded-md text-xs font-semibold cursor-pointer flex items-center gap-2 hover:bg-brand-700 transition disabled:opacity-70"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-user-check"></i>}
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
