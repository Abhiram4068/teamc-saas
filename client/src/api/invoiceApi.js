import axiosClient from './axiosClient';

export const invoiceApi = {
  getInvoices: async (params) => {
    return await axiosClient.get(`/Invoice`, { params });
  },
  getInvoiceDetails: async (paymentId) => {
    return await axiosClient.get(`/Invoice/${paymentId}`);
  },
  downloadInvoice: async (paymentId) => {
    return await axiosClient.get(`/Invoice/${paymentId}/download`, {
      responseType: 'blob'
    });
  }
};
