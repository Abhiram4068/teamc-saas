import axiosClient from './axiosClient';

export const ticketApi = {
  createTicket: async (formData) => {
    const response = await axiosClient.post('/Tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyTickets: async () => {
    const response = await axiosClient.get('/Tickets/my-tickets');
    return response.data;
  },

  getAssignedTickets: async (params) => {
    const response = await axiosClient.get('/Tickets/assigned', { params });
    return response.data;
  },

  getTenantTickets: async () => {
    const response = await axiosClient.get('/Tickets/tenant');
    return response.data;
  },

  getTicketById: async (id) => {
    const response = await axiosClient.get(`/Tickets/${id}`);
    return response.data;
  },

  replyToTicket: async (id, data) => {
    const response = await axiosClient.post(`/Tickets/${id}/reply`, data);
    return response.data;
  },

  updateTicketStatus: async (id, status) => {
    const response = await axiosClient.put(`/Tickets/${id}/status`, { status });
    return response.data;
  }
};
