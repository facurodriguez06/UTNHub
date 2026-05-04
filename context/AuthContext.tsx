"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  type User,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
});

const OWNER_ADMIN_EMAILS = new Set(["facundorodrigueezsp@gmail.com"]);

const normalizeEmail = (value?: string | null) => value?.trim().toLowerCase() ?? "";

const createAdminLoginError = () => {
  const error = new Error("Este correo está reservado para administradores y no puede usarse como usuario.");
  return Object.assign(error, { code: "auth/admin-account-not-allowed" });
};

const isAdminEmail = async (email?: string | null) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;

  if (OWNER_ADMIN_EMAILS.has(normalizedEmail)) {
    return true;
  }

  if (!db) {
    return false;
  }

  const adminDoc = await getDoc(doc(db, "admins", normalizedEmail));
  return adminDoc.exists();
};

const getProviderId = (currentUser: User | null) => currentUser?.providerData[0]?.providerId || "unknown";

const syncUserProfile = async (currentUser: User) => {
  if (!db || !currentUser.email) return;

  if (await isAdminEmail(currentUser.email)) {
    return;
  }

  const userDocRef = doc(db, "users", currentUser.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    // First time user: create profile with defaults
    await setDoc(userDocRef, {
      email: currentUser.email,
      displayName: currentUser.displayName || currentUser.email.split("@")[0] || "Usuario",
      photoURL: currentUser.photoURL || "",
      providerId: getProviderId(currentUser),
      role: "user",
      lastLoginAt: currentUser.metadata.lastSignInTime || new Date().toISOString(),
      preferredCareerId: "",
      notificationsEnabled: true,
      progress: {
        aprobadas: [],
        regulares: [],
      },
      createdAt: new Date().toISOString(),
    }, { merge: true });
    return;
  }

  // Existing user: only update transient fields, NEVER overwrite role or preferences
  await updateDoc(userDocRef, {
    email: currentUser.email,
    displayName: currentUser.displayName || currentUser.email.split("@")[0] || "Usuario",
    photoURL: currentUser.photoURL || "",
    providerId: getProviderId(currentUser),
    lastLoginAt: currentUser.metadata.lastSignInTime || new Date().toISOString(),
  });
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      try {
        if (currentUser) {
          await syncUserProfile(currentUser);
        }
      } catch (error) {
        console.error("Error creating or updating user profile in db", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    if (await isAdminEmail(result.user.email)) {
      await signOut(auth);
      throw createAdminLoginError();
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (await isAdminEmail(email)) {
      throw createAdminLoginError();
    }

    await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (await isAdminEmail(normalizedEmail)) {
      throw createAdminLoginError();
    }

    const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
    if (name && credential.user) {
      await updateProfile(credential.user, { displayName: name });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
