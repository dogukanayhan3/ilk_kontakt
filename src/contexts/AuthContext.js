import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("currentUser"); // <--- use 'currentUser'
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const logout = useCallback(async () => {
    try {
      await fetch("https://localhost:44388/api/account/logout", {
        method: "GET",
        credentials: "include",
      });
      localStorage.removeItem("currentUser");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("connectionSuggestions");
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth, bir AuthProvider bileşeni içinde kullanılmalıdır."
    );
  }
  return context;
};
