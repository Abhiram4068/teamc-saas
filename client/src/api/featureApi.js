import axiosClient from './axiosClient';

export const featureApi = {
    getFeatures: async (params = {}) => {
        const response = await axiosClient.get('/features', { params });
        return response.data;
    },
    
    createFeature: async (data) => {
        const response = await axiosClient.post('/features', data);
        return response.data;
    },
    
    getFeatureById: async (id) => {
        const response = await axiosClient.get(`/features/${id}`);
        return response.data;
    }
};
