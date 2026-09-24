import axiosClient from './axiosClient';

export const documentApi = {
  uploadDocuments: async (formData) => {
    // axiosClient automatically handles the base URL and Auth Token.
    // We override Content-Type to multipart/form-data for file uploads.
    const response = await axiosClient.post('/Document/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDocuments: async (params) => {
    const response = await axiosClient.get('/Document', { params });
    return response.data;
  },

  getDocumentById: async (id) => {
    const response = await axiosClient.get(`/Document/${id}`);
    return response.data;
  },

  getPreviewBlobUrl: async (id) => {
    // Fetches the secure preview endpoint as a blob, so we can render it in an <img> tag without exposing the token in the URL.
    const response = await axiosClient.get(`/Document/${id}/preview`, { responseType: 'blob' });
    return URL.createObjectURL(response.data);
  },

  updateDocument: async (id, data) => {
    const response = await axiosClient.put(`/Document/${id}`, data);
    return response.data;
  },

  deleteDocument: async (id) => {
    const response = await axiosClient.delete(`/Document/${id}`);
    return response.data;
  }
};
