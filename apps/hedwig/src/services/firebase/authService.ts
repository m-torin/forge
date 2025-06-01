import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type Auth,
  type AuthError,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAuth,
  GoogleAuthProvider,
  linkWithCredential,
  OAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
  type User,
  type UserCredential,
} from 'firebase/auth';
// React hooks
import { useEffect, useState } from 'react';
// HOC for protected components
import React from 'react';
import { Platform } from 'react-native';

import { app } from '../../config/firebase';
import { SentryService } from '../sentryService';

export interface AuthUser {
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  photoURL: string | null;
  uid: string;
}

export class FirebaseAuthService {
  private static auth: Auth = getAuth(app);
  private static currentUser: User | null = null;
  private static authStateListeners = new Set<(user: AuthUser | null) => void>();

  /**
   * Initialize auth service
   */
  static initialize(): void {
    // Set up auth state observer
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      const authUser = user ? this.mapFirebaseUser(user) : null;
      
      // Notify all listeners
      this.authStateListeners.forEach(listener => listener(authUser));
      
      // Store auth state
      if (user) {
        AsyncStorage.setItem('authUser', JSON.stringify(authUser));
      } else {
        AsyncStorage.removeItem('authUser');
      }
    });
  }

  /**
   * Map Firebase user to AuthUser
   */
  private static mapFirebaseUser(user: User): AuthUser {
    return {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
      photoURL: user.photoURL,
    };
  }

  /**
   * Sign up with email and password
   */
  static async signUpWithEmail(
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthUser> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Update display name if provided
      if (displayName && credential.user) {
        await updateProfile(credential.user, { displayName });
      }
      
      // Send verification email
      await this.sendVerificationEmail();
      
      return this.mapFirebaseUser(credential.user);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-auth-signup');
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sign in with email and password
   */
  static async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      return this.mapFirebaseUser(credential.user);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-auth-signin');
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sign in with Google
   */
  static async signInWithGoogle(): Promise<AuthUser> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      let credential: UserCredential;
      
      if (Platform.OS === 'web') {
        credential = await signInWithPopup(this.auth, provider);
      } else {
        // For mobile, you would need to use expo-auth-session
        throw new Error('Google sign-in not implemented for mobile yet');
      }
      
      return this.mapFirebaseUser(credential.user);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-auth-google');
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sign in with Apple
   */
  static async signInWithApple(): Promise<AuthUser> {
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');

      let credential: UserCredential;
      
      if (Platform.OS === 'web') {
        credential = await signInWithPopup(this.auth, provider);
      } else {
        // For mobile, you would need to use expo-apple-authentication
        throw new Error('Apple sign-in not implemented for mobile yet');
      }
      
      return this.mapFirebaseUser(credential.user);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-auth-apple');
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sign in anonymously
   */
  static async signInAnonymously(): Promise<AuthUser> {
    try {
      const credential = await signInAnonymously(this.auth);
      return this.mapFirebaseUser(credential.user);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-auth-anonymous');
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Link anonymous account with email
   */
  static async linkAnonymousWithEmail(
    email: string,
    password: string
  ): Promise<AuthUser> {
    try {
      if (!this.currentUser || !this.currentUser.isAnonymous) {
        throw new Error('No anonymous user to link');
      }

      const credential = EmailAuthProvider.credential(email, password);
      const userCredential = await linkWithCredential(this.currentUser, credential);
      
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-auth-link');
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      await AsyncStorage.removeItem('authUser');
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-auth-signout');
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-auth-reset');
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Send verification email
   */
  static async sendVerificationEmail(): Promise<void> {
    try {
      if (this.currentUser && !this.currentUser.emailVerified) {
        await sendEmailVerification(this.currentUser);
      }
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-auth-verify');
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> {
    try {
      if (!this.currentUser) throw new Error('No user logged in');
      
      await updateProfile(this.currentUser, updates);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-auth-update-profile');
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Update email
   */
  static async updateUserEmail(newEmail: string): Promise<void> {
    try {
      if (!this.currentUser) throw new Error('No user logged in');
      
      await updateEmail(this.currentUser, newEmail);
      await this.sendVerificationEmail();
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-auth-update-email');
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Update password
   */
  static async updateUserPassword(newPassword: string): Promise<void> {
    try {
      if (!this.currentUser) throw new Error('No user logged in');
      
      await updatePassword(this.currentUser, newPassword);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-auth-update-password');
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Reauthenticate user
   */
  static async reauthenticate(password: string): Promise<void> {
    try {
      if (!this.currentUser || !this.currentUser.email) {
        throw new Error('No user logged in');
      }
      
      const credential = EmailAuthProvider.credential(
        this.currentUser.email,
        password
      );
      
      await reauthenticateWithCredential(this.currentUser, credential);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-auth-reauth');
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Get current user
   */
  static getCurrentUser(): AuthUser | null {
    return this.currentUser ? this.mapFirebaseUser(this.currentUser) : null;
  }

  /**
   * Check if user is logged in
   */
  static isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  /**
   * Add auth state listener
   */
  static addAuthStateListener(
    listener: (user: AuthUser | null) => void
  ): () => void {
    this.authStateListeners.add(listener);
    
    // Call immediately with current state
    listener(this.getCurrentUser());
    
    return () => {
      this.authStateListeners.delete(listener);
    };
  }

  /**
   * Handle auth errors
   */
  private static handleAuthError(error: AuthError): Error {
    const errorMessages: Record<string, string> = {
      'auth/invalid-credential': 'Invalid credentials',
      'auth/invalid-email': 'Invalid email address',
      'auth/account-exists-with-different-credential': 'Account exists with different sign-in method',
      'auth/email-already-in-use': 'This email is already registered',
      'auth/network-request-failed': 'Network error. Please check your connection',
      'auth/operation-not-allowed': 'Operation not allowed',
      'auth/requires-recent-login': 'Please sign in again to perform this action',
      'auth/too-many-requests': 'Too many attempts. Please try again later',
      'auth/user-disabled': 'This account has been disabled',
      'auth/user-not-found': 'No account found with this email',
      'auth/weak-password': 'Password is too weak',
      'auth/wrong-password': 'Incorrect password',
    };

    const message = errorMessages[error.code] || error.message;
    return new Error(message);
  }

  /**
   * Wait for auth to be ready
   */
  static async waitForAuth(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  /**
   * Get ID token
   */
  static async getIdToken(forceRefresh = false): Promise<string | null> {
    try {
      if (!this.currentUser) return null;
      
      return await this.currentUser.getIdToken(forceRefresh);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-auth-token');
      return null;
    }
  }

  /**
   * Get ID token result
   */
  static async getIdTokenResult(forceRefresh = false): Promise<any> {
    try {
      if (!this.currentUser) return null;
      
      return await this.currentUser.getIdTokenResult(forceRefresh);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-auth-token-result');
      return null;
    }
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = FirebaseAuthService.addAuthStateListener((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    isAuthenticated: !!user,
    loading,
    sendPasswordReset: FirebaseAuthService.sendPasswordReset.bind(FirebaseAuthService),
    signIn: FirebaseAuthService.signInWithEmail.bind(FirebaseAuthService),
    signInAnonymously: FirebaseAuthService.signInAnonymously.bind(FirebaseAuthService),
    signInWithApple: FirebaseAuthService.signInWithApple.bind(FirebaseAuthService),
    signInWithGoogle: FirebaseAuthService.signInWithGoogle.bind(FirebaseAuthService),
    signOut: FirebaseAuthService.signOut.bind(FirebaseAuthService),
    signUp: FirebaseAuthService.signUpWithEmail.bind(FirebaseAuthService),
    updateProfile: FirebaseAuthService.updateUserProfile.bind(FirebaseAuthService),
    user,
  };
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P & { auth: ReturnType<typeof useAuth> }>,
  options?: {
    requireAuth?: boolean;
    requireVerified?: boolean;
    redirectTo?: string;
  }
): React.ComponentType<P> {
  return (props: P) => {
    const auth = useAuth();

    if (auth.loading) {
      return null; // Or a loading component
    }

    if (options?.requireAuth && !auth.isAuthenticated) {
      // Handle redirect or show login
      return null;
    }

    if (options?.requireVerified && auth.user && !auth.user.emailVerified) {
      // Handle email verification requirement
      return null;
    }

    return React.createElement(Component, { ...props, auth });
  };
}