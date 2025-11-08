import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  userRole: 'doctor' | 'patient' | null;
  userId: string | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    role: 'doctor' | 'patient',
    additionalData: SignUpData
  ) => Promise<{ error: Error | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

interface DoctorSignUpData {
  name: string;
  specialty?: string;
  license_number?: string;
}

interface PatientSignUpData {
  name: string;
  birth_date?: string;
  gender?: string;
}

type SignUpData = DoctorSignUpData | PatientSignUpData;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'doctor' | 'patient' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // ✅ IMPROVED: Prevent race conditions with cached promise
  const loadingRoleRef = useRef(false);
  const loadRolePromiseRef = useRef<Promise<void> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    async function initAuth() {
      try {
        setLoading(true);
        setError(null);

        // Use getSession instead of getUser for better reliability
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session?.user && isMountedRef.current) {
          setUser(session.user);
          await loadUserRole(session.user.id);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMountedRef.current) {
          setError(err as Error);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    }

    initAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMountedRef.current) return;

        console.log('Auth state changed:', event);

        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          await loadUserRole(currentUser.id);
        } else {
          // User signed out
          setUserRole(null);
          setUserId(null);
        }
      }
    );

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadUserRole(authUserId: string, retries = 3): Promise<void> {
    // ✅ IMPROVED: If there's already a role load in progress, return that promise
    // This ensures only one load happens at a time and callers wait for the same result
    if (loadRolePromiseRef.current) {
      console.log('Role load already in progress, waiting for existing promise...');
      return loadRolePromiseRef.current;
    }

    // Create a new promise for this load operation
    loadRolePromiseRef.current = (async () => {
      loadingRoleRef.current = true;

    try {
      // Retry logic to handle race conditions
      for (let attempt = 0; attempt < retries; attempt++) {
        // Check doctors table
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('id')
          .eq('id', authUserId)
          .maybeSingle();

        if (doctorError && doctorError.code !== 'PGRST116') {
          // PGRST116 = no rows returned, which is fine
          throw doctorError;
        }

        if (doctorData && isMountedRef.current) {
          setUserRole('doctor');
          setUserId(doctorData.id);
          return;
        }

        // Check patients table
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('id')
          .eq('id', authUserId)
          .maybeSingle();

        if (patientError && patientError.code !== 'PGRST116') {
          throw patientError;
        }

        if (patientData && isMountedRef.current) {
          setUserRole('patient');
          setUserId(patientData.id);
          return;
        }

        // If not found and still have retries, wait before retrying
        if (attempt < retries - 1) {
          console.log(`User profile not found, retrying... (attempt ${attempt + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
        }
      }

      // After all retries, mark error
      console.warn(
        'User authenticated but not found in doctors or patients tables:',
        authUserId
      );

      if (isMountedRef.current) {
        setUserRole(null);
        setUserId(null);
        setError(new Error('Perfil de usuario no encontrado. Por favor contacta soporte.'));
      }
      } catch (err) {
        console.error('Error loading user role:', err);

        if (isMountedRef.current) {
          setUserRole(null);
          setUserId(null);
          setError(err as Error);
        }
      } finally {
        loadingRoleRef.current = false;
        // Clean up the cached promise
        loadRolePromiseRef.current = null;
      }
    })();

    // Return the promise so callers can await it
    return loadRolePromiseRef.current;
  }

  async function signIn(
    email: string,
    password: string
  ): Promise<{ error: Error | null }> {
    try {
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check for specific error types
        if (error.message.includes('Email not confirmed')) {
          return {
            error: new Error(
              'Tu email aún no ha sido confirmado. Por favor revisa tu correo y confirma tu dirección de email.'
            ),
          };
        }
        return { error };
      }

      // Verify email is confirmed
      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        return {
          error: new Error(
            'Tu email aún no ha sido confirmado. Por favor revisa tu correo y confirma tu dirección de email.'
          ),
        };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  async function signUp(
    email: string,
    password: string,
    role: 'doctor' | 'patient',
    additionalData: SignUpData
  ): Promise<{ error: Error | null; needsConfirmation?: boolean }> {
    try {
      setError(null);

      // Validate required data
      if (!additionalData.name || additionalData.name.trim() === '') {
        return { error: new Error('El nombre es requerido') };
      }

      // Configure email redirect URL for confirmation
      const redirectUrl = `${window.location.origin}/auth/callback`;

      // Create user in Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name: additionalData.name,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (authError) {
        return { error: authError };
      }

      if (!data.user) {
        return { error: new Error('No se pudo crear el usuario') };
      }

      // Check if email confirmation is needed
      const needsEmailConfirmation = !data.user.email_confirmed_at;

      // Insert into corresponding table
      const table = role === 'doctor' ? 'doctors' : 'patients';
      const { error: insertError } = await supabase.from(table).insert({
        id: data.user.id,
        email,
        ...additionalData,
      });

      if (insertError) {
        console.error('Failed to create user profile:', insertError);

        // Try to sign out to prevent orphaned state
        await supabase.auth.signOut();

        return {
          error: new Error(
            'No se pudo crear el perfil de usuario. Por favor intenta nuevamente o contacta soporte.'
          ),
        };
      }

      return { error: null, needsConfirmation: needsEmailConfirmation };
    } catch (err) {
      return { error: err as Error };
    }
  }

  async function signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();

      if (isMountedRef.current) {
        setUser(null);
        setUserRole(null);
        setUserId(null);
        setError(null);
      }
    } catch (err) {
      console.error('Sign out error:', err);
      if (isMountedRef.current) {
        setError(err as Error);
      }
    }
  }

  async function refreshUserRole(): Promise<void> {
    if (user?.id) {
      await loadUserRole(user.id);
    }
  }

  const value = {
    user,
    userRole,
    userId,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}