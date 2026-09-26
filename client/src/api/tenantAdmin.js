import axiosClient from './axiosClient';

export const getDepartments = async () => {
  const response = await axiosClient.get(`/departments`);
  return response.data;
};

export const getDesignations = async (departmentId) => {
  const response = await axiosClient.get(`/departments/${departmentId}/designations`);
  return response.data;
};

export const getEmployees = async (params) => {
  const response = await axiosClient.get(`/tenantadminuser/employee`, {
    params
  });
  return response.data;
};

export const createEmployee = async (data) => {
  const response = await axiosClient.post(`/tenantadminuser/employee`, data);
  return response.data;
};
