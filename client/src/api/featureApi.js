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
    },

    updateFeature: async (id, data) => {
        const response = await axiosClient.patch(`/features/${id}`, data);
        return response.data;
    },

    updateFeatureStatus: async (id, data) => {
        const response = await axiosClient.patch(`/features/${id}/status`, data);
        return response.data;
    },

    deleteFeature: async (id) => {
        const response = await axiosClient.delete(`/features/${id}`);
        return response.data;
    }
};
