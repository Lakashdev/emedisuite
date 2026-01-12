import { createContext, useContext, useMemo, useState } from "react";
import { getUser, clearAuth, setUser as persistUser } from "../utils/authStorage";
import * as auth from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());

  const value = useMemo(
    () => ({
      user,
      isAuthed: !!user,

      async register(payload) {
        const data = await auth.register(payload);
        if (data.user) setUser(data.user);
        return data;
      },

      async login(payload) {
        const data = await auth.login(payload);

        // If backend does not return user, fetch /me
        if (!data.user) {
          const me = await auth.me();
          persistUser(me);
          setUser(me);
        } else {
          setUser(data.user);
        }

        return data;
      },

      logout() {
        clearAuth();
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
