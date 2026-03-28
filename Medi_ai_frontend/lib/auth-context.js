"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getAllUsers } from "./services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto-load first patient from backend on mount
  useEffect(() => {
    async function loadPatient() {
      try {
        // Try localStorage first for speed
        const saved = localStorage.getItem("mediai_session");
        if (saved) {
          const { user: u, patient: p } = JSON.parse(saved);
          if (u && p) {
            setUser(u);
            setPatient(p);
            setLoading(false);
            return;
          }
        }

        // Fetch patients from backend
        const data = await getAllUsers("patient");
        const patients = Array.isArray(data) ? data : data?.patients || [];

        if (patients.length > 0) {
          const firstUser = patients[0];
          // Now login to get the full profile
          const { login } = await import("./services/authService");
          const result = await login(firstUser.email, "patient");
          setUser(result.user);
          setPatient(result.profile);
          localStorage.setItem(
            "mediai_session",
            JSON.stringify({ user: result.user, patient: result.profile })
          );
        } else {
          setError("No patients found in database. Seed data first.");
        }
      } catch (err) {
        console.error("Auto-load patient failed:", err);
        setError(err.message);
      }
      setLoading(false);
    }
    loadPatient();
  }, []);

  const switchPatient = async (email) => {
    setLoading(true);
    try {
      const { login } = await import("./services/authService");
      const result = await login(email, "patient");
      setUser(result.user);
      setPatient(result.profile);
      localStorage.setItem(
        "mediai_session",
        JSON.stringify({ user: result.user, patient: result.profile })
      );
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const value = {
    user,
    patient,
    loading,
    error,
    isAuthenticated: !!user,
    patientId: patient?.id || null,
    switchPatient,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
