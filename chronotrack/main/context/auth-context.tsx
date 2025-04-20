"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

interface User {
  id: string;
  name: string;
  isAdmin: boolean;
}

interface AuthContextType {
  authenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  setAuthenticated: (value: boolean, user?: User | null) => void;
  resetSessionTimeout: () => void;
  login: (pin: string) => Promise<boolean>;
  adminLogin: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Use localStorage to persist authentication state
const AUTH_STORAGE_KEY = "time-tracker-auth"
const ADMIN_TOKEN_KEY = "time-tracker-admin-token"
const LAST_ACTIVITY_KEY = "time-tracker-last-activity"
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key'; // In production, use a secure environment variable

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticatedState] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Use ref instead of state to avoid re-renders
  const lastActivityRef = useRef<number>(Date.now())

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
      const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY)
      const storedLastActivity = localStorage.getItem(LAST_ACTIVITY_KEY)

      if (adminToken) {
        try {
          // Verify the admin JWT token
          const decoded = jwt.verify(adminToken, JWT_SECRET) as { id: string, name: string, isAdmin: boolean };
          setAuthenticatedState(true);
          setUser({
            id: decoded.id,
            name: decoded.name,
            isAdmin: true
          });
          setIsAdmin(true);
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          console.error('Invalid admin token:', error);
        }
      } else if (storedAuth === "true") {
        // Regular user authentication
        const userData = localStorage.getItem('time-tracker-user');
        const parsedUser = userData ? JSON.parse(userData) : null;
        
        // Check if the session has timed out
        const lastActivityTime = storedLastActivity ? Number.parseInt(storedLastActivity, 10) : 0
        const now = Date.now()
        const inactiveTime = now - lastActivityTime

        // If inactive for more than 90 seconds, log out
        if (inactiveTime > 90 * 1000) {
          setAuthenticatedState(false)
          setUser(null)
          localStorage.removeItem(AUTH_STORAGE_KEY)
          localStorage.removeItem('time-tracker-user')
          localStorage.removeItem(LAST_ACTIVITY_KEY)
        } else {
          setAuthenticatedState(true)
          setUser(parsedUser);
          lastActivityRef.current = lastActivityTime
        }
      }
    }
  }, [])

  // Update localStorage when auth state changes
  const setAuthenticated = useCallback((value: boolean, newUser: User | null = null) => {
    setAuthenticatedState(value)
    setUser(newUser)
    setIsAdmin(newUser?.isAdmin || false)
    
    if (typeof window !== "undefined") {
      if (value && newUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, "true")
        localStorage.setItem('time-tracker-user', JSON.stringify(newUser))
        
        const now = Date.now()
        localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
        lastActivityRef.current = now
        
        // If admin, create and store JWT token
        if (newUser.isAdmin) {
          const token = jwt.sign(
            { id: newUser.id, name: newUser.name, isAdmin: true },
            JWT_SECRET,
            { expiresIn: '7d' } // Admin token lasts for 7 days
          );
          localStorage.setItem(ADMIN_TOKEN_KEY, token);
        }
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        localStorage.removeItem('time-tracker-user')
        localStorage.removeItem(LAST_ACTIVITY_KEY)
        localStorage.removeItem(ADMIN_TOKEN_KEY)
      }
    }
  }, [])

  // Reset the session timeout without causing re-renders
  const resetSessionTimeout = useCallback(() => {
    // Only reset timeout for non-admin users
    if (isAdmin) return;
    
    const now = Date.now()
    lastActivityRef.current = now
    if (typeof window !== "undefined" && authenticated && !isAdmin) {
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
    }
  }, [authenticated, isAdmin])

  // Check for session timeout (only for non-admin users)
  useEffect(() => {
    if (!authenticated || isAdmin) return

    const interval = setInterval(() => {
      if (typeof window !== "undefined") {
        const now = Date.now()
        const inactiveTime = now - lastActivityRef.current

        // If inactive for more than 90 seconds, log out
        if (inactiveTime > 90 * 1000) {
          setAuthenticated(false)
        }
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [authenticated, isAdmin, setAuthenticated])

  // Add global click handler to reset timeout on any user activity
  useEffect(() => {
    if (!authenticated || isAdmin) return

    const handleActivity = () => {
      resetSessionTimeout()
    }

    window.addEventListener("click", handleActivity)
    window.addEventListener("keydown", handleActivity)
    window.addEventListener("mousemove", handleActivity)
    window.addEventListener("touchstart", handleActivity)

    return () => {
      window.removeEventListener("click", handleActivity)
      window.removeEventListener("keydown", handleActivity)
      window.removeEventListener("mousemove", handleActivity)
      window.removeEventListener("touchstart", handleActivity)
    }
  }, [authenticated, isAdmin, resetSessionTimeout])

  // Login function for regular user
  const login = async (pin: string): Promise<boolean> => {
    try {
      // In a real app, you would verify the PIN against the database
      // For now, we'll use the hardcoded PIN from the database setup
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_admin', false)
        .limit(1);
      
      if (error || !users || users.length === 0) {
        console.error('Error fetching user:', error);
        return false;
      }
      
      const user = users[0];
      
      // In a real app, you would use bcrypt.compare to verify the PIN
      // For demo purposes, we'll just check against the PIN we set up
      const isCorrect = pin === '2216'; // This should match the PIN we set in the database
      
      if (isCorrect) {
        setAuthenticated(true, {
          id: user.id,
          name: user.name,
          isAdmin: false
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Admin login function
  const adminLogin = async (password: string): Promise<boolean> => {
    try {
      // In a real app, you would verify the password against the database
      // For now, we'll use a hardcoded password
      const { data: admins, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_admin', true)
        .limit(1);
      
      if (error || !admins || admins.length === 0) {
        console.error('Error fetching admin:', error);
        return false;
      }
      
      const admin = admins[0];
      
      // In a real app, you would use bcrypt.compare to verify the password
      // For demo purposes, we'll just check against a hardcoded password
      const isCorrect = password === 'admin123'; // This should be a secure password in production
      
      if (isCorrect) {
        setAuthenticated(true, {
          id: admin.id,
          name: admin.name,
          isAdmin: true
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      authenticated, 
      user, 
      isAdmin, 
      setAuthenticated, 
      resetSessionTimeout,
      login,
      adminLogin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
