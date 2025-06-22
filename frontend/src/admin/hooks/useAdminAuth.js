import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin-token') || '');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('admin-token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      localStorage.removeItem('admin-token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  const login = async (credentials) => {
    const res = await axios.post('/api/auth/login', credentials);
    if (res.data && res.data.token) {
      setToken(res.data.token);
    }
    return res.data;
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/users/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch admin profile', err);
    }
  };

  const logout = () => {
    setToken('');
  };

  return (
    <AdminAuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
