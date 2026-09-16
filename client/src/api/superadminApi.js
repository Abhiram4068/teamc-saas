import axiosClient from './axiosClient';

export const superadminApi = {
  getTenants: (params) => {
    return axiosClient.get('/Superadmin/tenants', { params });
  }
};
