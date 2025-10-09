import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const register = (userData) => {
    setUser(userData); // Save registration details
  };

  const login = (loginData) => {
    if (
      user &&
      user.idNumber === loginData.idNumber &&
      user.accountNumber === loginData.accountNumber &&
      user.password === loginData.password
    ) {
      return true; // Login successful
    }
    return false; // Login failed
  };

  return (
    <AuthContext.Provider value={{ user, register, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}