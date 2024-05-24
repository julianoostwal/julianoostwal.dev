"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import firebase_app from '@/firebase/config';

// Initialize Firebase auth instance
const auth = getAuth( firebase_app );

// Create the authentication context
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// Custom hook to access the authentication context
export const useAuth = () => useContext( AuthContext );

export function AuthContextProvider ({children}: { children: ReactNode }) {
  // Set up state to track the authenticated user and loading status
  const [ user, setUser ] = useState<User | null>( null );
  const [ loading, setLoading ] = useState( true );

  useEffect( () => {
    // Subscribe to the authentication state changes
    const unsubscribe = onAuthStateChanged( auth, ( user ) => {
      if ( user ) {
        // User is signed in
        setUser( user );
      } else {
        // User is signed out
        setUser( null );
      }
      // Set loading to false once authentication state is determined
      setLoading( false );
    } );

    // Unsubscribe from the authentication state changes when the component is unmounted
    return () => unsubscribe();
  }, [] );

  // Provide the authentication context to child components
  return (
    <AuthContext.Provider value={{ user, loading }}>
        {children}
    </AuthContext.Provider>
  );
}

