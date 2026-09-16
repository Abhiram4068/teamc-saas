import axiosClient from './axiosClient';

export const adminUserApi = {
  addTenantAdmin: async (payload) => {
    try {
      const response = await axiosClient.post('/adminuser/tenant/add-tenantadmin', payload);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw error.response.data; 
      }
      throw error;
    }
  }
};
