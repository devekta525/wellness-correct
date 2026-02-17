export interface User {
  email: string;
  role: string;
  name: string;
  loginTime: string;
}

export const getUserFromCookie = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='));
  
  if (!userCookie) return null;
  
  try {
    const userData = JSON.parse(userCookie.split('=')[1]);
    return userData;
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return null;
  }
};

export const setUserCookie = (user: User): void => {
  if (typeof window === 'undefined') return;
  
  const userData = JSON.stringify(user);
  document.cookie = `user=${userData}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
};

export const removeUserCookie = (): void => {
  if (typeof window === 'undefined') return;
  
  document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

export const logout = (): void => {
  removeUserCookie();
  window.location.href = '/logout';
};

export const isAuthenticated = (): boolean => {
  return getUserFromCookie() !== null;
};

export const hasRole = (requiredRole: string): boolean => {
  const user = getUserFromCookie();
  return user?.role === requiredRole;
};

export const hasAnyRole = (roles: string[]): boolean => {
  const user = getUserFromCookie();
  return user ? roles.includes(user.role) : false;
};
