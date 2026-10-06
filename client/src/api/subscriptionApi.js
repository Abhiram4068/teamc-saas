import axiosInstance from './axiosClient';

export const subscriptionApi = {
  getCurrentSubscription: async () => {
    const response = await axiosInstance.get('/Subscriptions');
    return response.data;
  },

  getScheduledSubscription: async () => {
    const response = await axiosInstance.get('/Subscriptions/scheduled');
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
  },

  cancelScheduledSubscription: async (subscriptionId) => {
    const response = await axiosInstance.post('/Subscriptions/cancel-scheduled', { subscriptionId });
    return response.data;
  },

  scheduleSubscriptionUpgrade: async (data) => {
    const response = await axiosInstance.post('/Subscriptions/upgrade-scheduled', data);
    return response.data;
  },

  previewUpgradeProration: async (data) => {
    const response = await axiosInstance.post('/Subscriptions/preview-proration', data);
    return response.data;
  },

  getSavedCards: async () => {
    const response = await axiosInstance.get('/Subscriptions/saved-cards');
    return response.data;
  },

  createSetupIntent: async () => {
    const response = await axiosInstance.post('/Subscriptions/setup-intent');
    return response.data;
  },

  upgradeSubscriptionImmediatelyWithCard: async (data) => {
    const response = await axiosInstance.post('/Subscriptions/upgrade-immediately-with-card', data);
    return response.data;
  }
};
