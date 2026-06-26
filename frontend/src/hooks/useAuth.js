import { useState, useEffect } from 'react';
import api from '../api';

export const useAuth = () => {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    api('/auth/me')
      .then(data => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return { user, logout };
};
