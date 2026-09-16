import axiosClient from './axiosClient';

export const billingApi = {
  getInvoices: async () => {
    const response = await axiosClient.get('/Billing/invoices');
    return response.data?.data || response.data || [];
  },
};
