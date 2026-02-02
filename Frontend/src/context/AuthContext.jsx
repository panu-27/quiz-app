import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

const login = ({ token, user }) => {
  if (!token || !user) return; // 🛑 hard stop

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  setUser(user);

  if (user.role === "SUPER_ADMIN") navigate("/super");
  else if (user.role === "INSTITUTE_ADMIN") navigate("/institute-admin");
  else if (user.role === "TEACHER") navigate("/admin");
  else if (user.role === "STUDENT") navigate("/student");
  else navigate("/login");
};


  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
