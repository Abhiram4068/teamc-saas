import axiosClient from './axiosClient';

export const dashboardApi = {
  getTenantDashboard: async () => {
    return await axiosClient.get(`/Tenant/dashboard`);
  }
};
