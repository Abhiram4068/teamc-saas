import axiosClient from './axiosClient';
import { setToken, setRefreshToken, getToken, parseJwt, removeToken, removeRefreshToken } from '../utils/tokenStorage';

export const authApi = {
  publicLogin: async (email, password) => {
    try {
      const response = await axiosClient.post('auth/login', { email, password });
      const data = response.data;

      if (data && data.success && data.data && data.data.accessToken) {
        setToken(data.data.accessToken);

        if (data.data.refreshToken) {
          setRefreshToken(data.data.refreshToken);
        }

        return { success: true, data: data.data };
      } else {
        return { success: false, message: data?.message || 'Invalid response from server: Token missing.' };
      }
    } catch (error) {
      const message = error.response?.data?.message
        || 'Login failed. Please check your credentials and try again.';

      return { success: false, message };
    }
  },

  superAdminLogin: async (email, password) => {
    try {
      const response = await axiosClient.post('auth/superadmin/login', { email, password });
      const data = response.data;

      if (data && data.success && data.data && data.data.accessToken) {
        setToken(data.data.accessToken);

        if (data.data.refreshToken) {
          setRefreshToken(data.data.refreshToken);
        }

        return { success: true, data: data.data };
      } else {
        return { success: false, message: data?.message || 'Invalid response from server: Token missing.' };
      }
    } catch (error) {
      const message = error.response?.data?.message
        || 'Login failed. Please check your credentials and try again.';

      return { success: false, message };
    }
  },

  getCurrentUser: async () => {
    const token = getToken();
    if (!token) return null;

    const decoded = parseJwt(token);
    if (!decoded) return null;

    try {
      const response = await axiosClient.get('/auth/profile');
      if (response.data && response.data.success) {
        const profile = response.data.data;
        const fName = profile.firstName || '';
        const lName = profile.lastName || '';
        
        let initials = '';
        if (fName || lName) {
          initials = `${fName.charAt(0)}${lName.charAt(0)}`.toUpperCase();
        } else {
          const email = profile.email || '';
          initials = email ? email.charAt(0).toUpperCase() : 'U';
        }

        return {
          ...decoded,
          ...profile,
          initials
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      return null;
    }
  },

  logout: () => {
    removeToken();
    removeRefreshToken();
  },

  verifyCin: async (cin) => {
    try {
      const response = await axiosClient.get(`/auth/tenant/verify-cin?cin=${encodeURIComponent(cin)}`);
      return { success: true, data: response.data?.data || response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to verify CIN. Please try again.' 
      };
    }
  },

  registerTenant: async (tenantData) => {
    try {
      const response = await axiosClient.post('/auth/tenant/register', tenantData);
      return { success: true, data: response.data };
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.errors) {
        // Validation errors from backend
        return { success: false, validationErrors: error.response.data.errors, message: 'Please correct the validation errors.' };
      }
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  }
};
