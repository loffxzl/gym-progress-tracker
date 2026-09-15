import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi.js";
import { useAuth } from "./AuthContext.jsx";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const { user, updateUser } = useAuth();

  // Load initial theme from localStorage or user settings, default 'DARK'
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("theme") || user?.theme || "DARK";
  });

  // Sync state if user settings load late from backend
  useEffect(() => {
    if (user?.theme && !localStorage.getItem("theme")) {
      setThemeState(user.theme);
      localStorage.setItem("theme", user.theme);
    }
  }, [user]);

  // Apply root DOM dark class
  useEffect(() => {
    const root = document.documentElement;
    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (theme === "DARK" || (theme === "SYSTEM" && isSystemDark)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const changeTheme = async (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    // Sync with backend database if logged in
    if (user) {
      try {
        const res = await authApi.updateProfile({ theme: newTheme });
        if (res.data?.data) {
          updateUser({ theme: newTheme });
        }
      } catch (err) {
        console.warn("Theme backend sync warning:", err);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
