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
  },
  
  getTenantAdmins: async () => {
    try {
      const response = await axiosClient.get('/adminuser/tenant/tenantadmins');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) throw error.response.data;
      throw error;
    }
  },

  updateTenantAdmin: async (id, payload) => {
    try {
      const response = await axiosClient.patch(`/adminuser/tenant/tenantadmin/${id}`, payload);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) throw error.response.data;
      throw error;
    }
  },

  updateTenantAdminStatus: async (id, status) => {
    try {
      const response = await axiosClient.patch(`/adminuser/tenant/tenantadmin/${id}/status`, { status });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) throw error.response.data;
      throw error;
    }
  },

  deleteTenantAdmin: async (id) => {
    try {
      const response = await axiosClient.delete(`/adminuser/tenant/tenantadmin/${id}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) throw error.response.data;
      throw error;
    }
  }
};
