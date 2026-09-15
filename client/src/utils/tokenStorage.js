export const getToken = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const setToken = (token) => localStorage.setItem('accessToken', token);
export const setRefreshToken = (token) => localStorage.setItem('refreshToken', token);
export const removeToken = () => localStorage.removeItem('accessToken');
export const removeRefreshToken = () => localStorage.removeItem('refreshToken');

export const parseJwt = (token) => {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to parse JWT", error);
    return null;
  }
};

export const getRole = () => {
  const token = getToken();
  if (!token) return null;
  const decoded = parseJwt(token);
  // Extract role claim (standard 'role' or Microsoft identity claim URI)
  const roleClaim = decoded?.role || decoded?.Role || decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  const userRole = typeof roleClaim === 'string' ? parseInt(roleClaim, 10) : roleClaim;
  return userRole;
};
