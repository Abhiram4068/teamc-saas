import axiosClient from './axiosClient';

export const employeeApi = {
  getEmployees: (params) => axiosClient.get('/tenantemployee/employees', { params }),
  getDashboardSummary: () => axiosClient.get('/tenantemployee/dashboard'),
  
  // Employee Profile Management
  getEmployeeById: (id) => axiosClient.get(`/tenantemployee/employees/${id}`),
  updateEmployee: (id, payload) => axiosClient.put(`/tenantemployee/employees/${id}`, payload),
  updateUserStatus: (id, isActive) => axiosClient.put(`/tenantemployee/employees/${id}/status`, { isActive }),
  deleteUser: (id, payload) => axiosClient.delete(`/tenantemployee/employees/${id}`, { data: payload }),
  updateReportingManager: (id, managerId) => axiosClient.put(`/tenantemployee/employees/${id}/manager`, { managerId }),
  getManagers: (search = '') => axiosClient.get('/tenantemployee/managers', { params: { search } })
};
