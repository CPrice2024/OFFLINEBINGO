import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(() => localStorage.getItem("userId") || "");
  const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "");
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("userEmail") || "");
  const [userRole, setUserRole] = useState(() => localStorage.getItem("userRole") || "");

  // Auto-sync state to localStorage
  useEffect(() => {
    userId ? localStorage.setItem("userId", userId) : localStorage.removeItem("userId");
  }, [userId]);

  useEffect(() => {
    userName ? localStorage.setItem("userName", userName) : localStorage.removeItem("userName");
  }, [userName]);

  useEffect(() => {
    userEmail ? localStorage.setItem("userEmail", userEmail) : localStorage.removeItem("userEmail");
  }, [userEmail]);

  useEffect(() => {
    userRole ? localStorage.setItem("userRole", userRole) : localStorage.removeItem("userRole");
  }, [userRole]);

  // Logout function clears everything
  const clearAuth = () => {
    setUserId("");
    setUserName("");
    setUserEmail("");
    setUserRole("");
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        setUserId,
        userName,
        setUserName,
        userEmail,
        setUserEmail,
        
        userRole,
        setUserRole,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
