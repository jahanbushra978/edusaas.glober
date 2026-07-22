'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

const VisitorAuthContext = createContext(null);

function buildVisitorProfile(user) {
  if (!user) {
    return null;
  }

  const metadata = user.user_metadata || {};
  const email = user.email || '';
  const displayName =
    metadata.full_name ||
    metadata.name ||
    metadata.user_name ||
    metadata.preferred_name ||
    (email ? email.split('@')[0] : 'Visitor');

  return {
    id: user.id,
    email,
    displayName,
    avatarUrl: metadata.avatar_url || metadata.picture || null,
    initials: displayName.trim().charAt(0).toUpperCase() || 'V',
  };
}

export function VisitorAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [visitorUser, setVisitorUser] = useState(null);
  const [isVisitorLoading, setIsVisitorLoading] = useState(true);
  const [visitorAuthError, setVisitorAuthError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        setVisitorAuthError(error.message);
      }

      setSession(data.session || null);
      setVisitorUser(data.session?.user || null);
      setIsVisitorLoading(false);
    };

    syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession || null);
      setVisitorUser(nextSession?.user || null);
      setIsVisitorLoading(false);
      setVisitorAuthError('');
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async ({ email, password }) => {
    setVisitorAuthError('');
    const result = await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setVisitorAuthError(result.error.message);
      throw result.error;
    }

    return result;
  };

  const signUpWithEmail = async ({ fullName, email, password }) => {
    setVisitorAuthError('');
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (result.error) {
      setVisitorAuthError(result.error.message);
      throw result.error;
    }

    return result;
  };

  const signInWithGoogle = async () => {
    setVisitorAuthError('');
    const redirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;

    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (result.error) {
      setVisitorAuthError(result.error.message);
      throw result.error;
    }

    return result;
  };

  const signOutVisitor = async () => {
    setVisitorAuthError('');
    const result = await supabase.auth.signOut();

    if (result.error) {
      setVisitorAuthError(result.error.message);
      throw result.error;
    }
  };

  const value = useMemo(
    () => ({
      session,
      visitorUser,
      visitorProfile: buildVisitorProfile(visitorUser),
      isVisitorAuthenticated: !!visitorUser,
      isVisitorLoading,
      visitorAuthError,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOutVisitor,
    }),
    [session, visitorUser, isVisitorLoading, visitorAuthError],
  );

  return (
    <VisitorAuthContext.Provider value={value}>
      {children}
    </VisitorAuthContext.Provider>
  );
}

export function useVisitorAuth() {
  const context = useContext(VisitorAuthContext);

  if (!context) {
    throw new Error('useVisitorAuth must be used within a VisitorAuthProvider');
  }

  return context;
}
