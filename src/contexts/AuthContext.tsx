"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
  type Auth,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import { googleProvider } from "@/lib/firebase";
import type { UserProfile, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || "";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = !!(user?.email && user.email === SUPER_ADMIN_EMAIL);

  const role: UserRole = isSuperAdmin
    ? "superadmin"
    : (userProfile?.role as UserRole) || "user";

  const isAdmin = role === "admin" || role === "superadmin";

  // Fetch or create user profile in Firestore
  const fetchOrCreateProfile = useCallback(async (firebaseUser: User) => {
    try {
      const { getFirebaseDb } = await import("@/lib/firebase");
      const db = getFirebaseDb();
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserProfile({
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          phone: data.phone || "",
          address: data.address || "",
          role: data.role || "user",
          createdAt: data.createdAt?.toDate?.() || new Date(),
        });
      } else {
        // Create new user profile
        const newProfile: Record<string, unknown> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "",
          photoURL: firebaseUser.photoURL || "",
          phone: "",
          address: "",
          role: "user",
          createdAt: serverTimestamp(),
        };

        await setDoc(userRef, newProfile);

        setUserProfile({
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "",
          photoURL: firebaseUser.photoURL || "",
          phone: "",
          address: "",
          role: "user",
          createdAt: new Date(),
        });
      }
    } catch (e) {
      console.warn("Could not fetch or create profile. Firebase might not be configured.");
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    let unsubscribe = () => {};
    
    const initAuth = async () => {
      try {
        const { getFirebaseAuth } = await import("@/lib/firebase");
        const auth = getFirebaseAuth();
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          setUser(firebaseUser);
          if (firebaseUser) {
            try {
              await fetchOrCreateProfile(firebaseUser);
            } catch (error) {
              console.error("Error fetching user profile:", error);
            }
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        });
      } catch (e) {
        console.warn("Could not initialize Firebase Auth. API key missing?");
        setLoading(false);
      }
    };
    
    initAuth();

    return () => unsubscribe();
  }, [fetchOrCreateProfile]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { getFirebaseAuth } = await import("@/lib/firebase");
      const auth = getFirebaseAuth();
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { getFirebaseAuth } = await import("@/lib/firebase");
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchOrCreateProfile(user);
    }
  }, [user, fetchOrCreateProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        role,
        isAdmin,
        isSuperAdmin,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
