import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { request, restoreSession, setAccess } from '../api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // On load, ask the server to restore the session from the HttpOnly refresh cookie.
  useEffect(() => {
    restoreSession().then((d) => d && setUser(d.user)).finally(() => setReady(true));
    const lost = () => setUser(null); // refresh failed mid-session: the session ended
    window.addEventListener('gg:signed-out', lost);
    return () => window.removeEventListener('gg:signed-out', lost);
  }, []);

  const enter = useCallback(async (path, body) => {
    const d = await request(path, { method: 'POST', body });
    setAccess(d.token);
    setUser(d.user);
  }, []);
  const logout = useCallback(async () => {
    await request('/auth/logout', { method: 'POST' }).catch(() => {});
    setAccess(null);
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, setUser, ready, logout, login: (b) => enter('/auth/login', b), register: (b) => enter('/auth/register', b) }}>{children}</Ctx.Provider>;
}
