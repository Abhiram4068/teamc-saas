import axios from 'axios';
import { getToken, getRefreshToken, setToken, setRefreshToken, removeToken, removeRefreshToken } from '../utils/tokenStorage';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5150/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically attach the token to all requests
axiosClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Prevent multiple refresh requests when multiple API calls fail simultaneously
let isRefreshing = false;
let failedQueue = [];

//queue to attach the new access token to all the earlier failed requests
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor to handle global API responses
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we receive a 401 Unauthorized and haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {

      // Prevent infinite loops if the login/refresh APIs themselves fail with 401
      if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/login')) {
        return Promise.reject(error);
      }

      // If another request is currently refreshing the token, wait in the queue
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        removeToken();
        removeRefreshToken();
        //redirect to login page using event
        window.dispatchEvent(new CustomEvent('global-navigate', {
          detail: { path: '/login', options: { replace: true } }
        }));
        return Promise.reject(error);
      }

      try {
        // Call the refresh API using raw axios to bypass these interceptors temporarily
        const response = await axios.post(`${axiosClient.defaults.baseURL}/auth/refresh`, {
          refreshToken: refreshToken
        });

        // Match the same backend response structure: { success: true, data: { accessToken: "..." } }
        const newAccessToken = response.data?.data?.accessToken;
        const newRefreshToken = response.data?.data?.refreshToken;

        if (newAccessToken) {
          setToken(newAccessToken);
          if (newRefreshToken) setRefreshToken(newRefreshToken);

          processQueue(null, newAccessToken);

          // Replay the original failed request with the new token
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          return axiosClient(originalRequest);
        } else {
          throw new Error('Missing access token in refresh response');
        }
      } catch (err) {
        // Refresh failed (e.g. refresh token expired)
        processQueue(err, null);
        removeToken();
        removeRefreshToken();
        //redirect to login page using event
        window.dispatchEvent(new CustomEvent('global-navigate', {
          detail: { path: '/login', options: { replace: true } }
        }));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden specifically to show a UI toast message
    if (error.response?.status === 403) {
      window.dispatchEvent(
        new CustomEvent('global-toast', {
          detail: { message: "You don't have permission to access this resource.", type: 'error' }
        })
      );
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
