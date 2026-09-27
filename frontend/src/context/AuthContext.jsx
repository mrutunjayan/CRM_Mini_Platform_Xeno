import { createContext, useContext, useState } from 'react';
import { api, sendJson } from '../api.js';

const AuthContext = createContext(null);

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('mini-crm-user') || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  async function signIn(path, credentials) {
    const result = await api(path, sendJson('POST', credentials));
    localStorage.setItem('mini-crm-token', result.token);
    localStorage.setItem('mini-crm-user', JSON.stringify(result.user));
    setUser(result.user);
  }

  function signOut() {
    localStorage.removeItem('mini-crm-token');
    localStorage.removeItem('mini-crm-user');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}