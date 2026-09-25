import axiosClient from '../api/axiosClient';

export const workReportApi = {
    // Work Reports
    getMyReports: async (params) => {
        const response = await axiosClient.get('/workreport', { params });
        return response.data;
    },
    
    getTeamReports: async (params) => {
        const response = await axiosClient.get('/workreport/team', { params });
        return response.data;
    },
    
    checkReportSubmitted: async (date) => {
        const response = await axiosClient.get('/workreport/check', { params: { date } });
        return response.data;
    },
    
    createReport: async (data) => {
        const payload = Array.isArray(data) ? data : [data];
        const response = await axiosClient.post('/workreport', payload);
        return response.data;
    },
    
    updateReport: async (id, data) => {
        const response = await axiosClient.put(`/workreport/${id}`, data);
        return response.data;
    },
    
    // Work Types
    getWorkTypes: async () => {
        const response = await axiosClient.get('/workreport/types');
        return response.data;
    },
    
    createWorkType: async (data) => {
        const response = await axiosClient.post('/workreport/types', data);
        return response.data;
    }
};
