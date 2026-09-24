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
  }
};
