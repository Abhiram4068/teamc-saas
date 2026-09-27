import axiosClient from './axiosClient';

export const paymentApi = {
  getPaymentHistory: async (params) => {
    return await axiosClient.get('/Payment/history', { params });
  }
};
