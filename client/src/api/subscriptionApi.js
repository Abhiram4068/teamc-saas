import axiosInstance from './axiosClient';

export const subscriptionApi = {
  getCurrentSubscription: async () => {
    const response = await axiosInstance.get('/Subscriptions');
    return response.data;
  },
  
  getMyPlanFeatures: async () => {
    const response = await axiosInstance.get('/Plans/myfeatures');
    return response.data;
  },
  
  createCheckoutSession: async (data) => {
    const response = await axiosInstance.post('/Subscriptions/checkout', data);
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await axiosInstance.post('/Subscriptions/cancel');
    return response.data;
  }
};
