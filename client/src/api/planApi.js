import axiosClient from './axiosClient';

export const planApi = {
    getPlans: async (params = {}) => {
        const response = await axiosClient.get('/plans', { params });
        return response.data;
    },
    
    createPlan: async (data) => {
        const response = await axiosClient.post('/plans', data);
        return response.data;
    },
    
    getPlanById: async (id) => {
        const response = await axiosClient.get(`/plans/${id}`);
        return response.data;
    },

    mapFeaturesToPlan: async (data) => {
        const response = await axiosClient.post('/plans/map-features', data);
        return response.data;
    },

    getPlanFeatures: async (planId) => {
        const response = await axiosClient.get(`/plans/${planId}/features`);
        return response.data;
    },

    removePlanFeature: async (planId, featureId) => {
        const response = await axiosClient.delete(`/plans/${planId}/features/${featureId}`);
        return response.data;
    },

    getPublicPlans: async () => {
        const response = await axiosClient.get('/public/plans');
        return response.data;
    }
};
