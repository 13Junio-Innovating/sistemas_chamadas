import { createContext, useContext, useEffect, useState } from "react";
import { getSupabase } from "../services/supabase";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }

    const { data: subscription } = sb.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        setUser({ id: u.id, name: u.user_metadata?.name || u.email || "", email: u.email || "" });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    sb.auth.getSession().then(({ data }) => {
      const s = data?.session;
      if (s?.user) {
        const u = s.user;
        setUser({ id: u.id, name: u.user_metadata?.name || u.email || "", email: u.email || "" });
      }
      setLoading(false);
    });

    return () => {
      subscription.subscription?.unsubscribe?.();
    };
  }, []);

  async function login(email, password) {
    const sb = getSupabase();
    if (!sb) throw new Error("Supabase não configurado");
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const u = data.user;
    setUser({ id: u.id, name: u.user_metadata?.name || u.email || "", email: u.email || "" });
    return u;
  }

  async function logout() {
    const sb = getSupabase();
    if (!sb) return;
    await sb.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {loading ? <div>Carregando...</div> : children}
    </AuthContext.Provider>
  );
}
