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
    }
};
