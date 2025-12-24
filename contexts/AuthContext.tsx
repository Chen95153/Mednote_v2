
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  AuthError
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebaseConfig';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  apiKey: string | null;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveApiKey: (key: string) => Promise<void>;
  removeApiKey: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to fetch API Key from Firestore
  const fetchUserApiKey = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setApiKey(docSnap.data().geminiApiKey || null);
      } else {
        setApiKey(null);
      }
    } catch (error) {
      console.error("Error fetching API key:", error);
      setApiKey(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserApiKey(currentUser.uid);
      } else {
        setApiKey(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      
      let errorMessage = "Login failed. Please try again.";
      
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = "設定錯誤：尚未在 Firebase Console 啟用驗證服務。\n請前往 Authentication 頁面點擊 'Get Started'。";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "權限錯誤：尚未啟用 Google 登入。\n請前往 Firebase Console > Authentication > Sign-in method 開啟 Google。";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = `網域未授權 (Unauthorized Domain)\n\n目前的網址 (${window.location.hostname}) 尚未加入 Firebase 白名單。\n請前往 Firebase Console > Authentication > Settings > Authorized domains 新增此網域。`;
      } else if (error.code === 'auth/popup-closed-by-user') {
        return; // Ignore user closing popup
      } else if (error.message) {
        errorMessage = `Login failed: ${error.message}`;
      }

      setError(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setApiKey(null);
      setError(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const saveApiKey = async (key: string) => {
    if (!user) return;
    try {
      // Store in Firestore under the user's document
      await setDoc(doc(db, 'users', user.uid), { 
        geminiApiKey: key,
        updatedAt: new Date().toISOString(),
        email: user.email 
      }, { merge: true });
      setApiKey(key);
    } catch (error) {
      console.error("Error saving API key:", error);
      throw error;
    }
  };

  const removeApiKey = async () => {
    if (!user) return;
    try {
        await setDoc(doc(db, 'users', user.uid), { 
            geminiApiKey: null,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        setApiKey(null);
    } catch (error) {
        console.error("Error removing API key:", error);
        throw error;
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, apiKey, error, signInWithGoogle, signOut, saveApiKey, removeApiKey, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
