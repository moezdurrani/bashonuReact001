import './App.css';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

// Replace with your Supabase Project URL and Anon Key
const supabase = createClient(
  'https://bdkcdyxshdaxpezlhlne.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJka2NkeXhzaGRheHBlemxobG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5Mjc5NzksImV4cCI6MjA0NjUwMzk3OX0.VB8mZOjzeH-gZv4OKZj9n21HtPPkfkEB8PoTmisIrHM'
);

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup the subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  // Show the login form if no session exists
  if (!session) {
    return (
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]} // Remove if you want to add social providers later
      />
    );
  }

  // Show a logged-in message if a session exists
  return (
    <div>
      <h1>Welcome!</h1>
      <p>You are logged in as: {session.user.email}</p>
      <button
        onClick={async () => {
          const { error } = await supabase.auth.signOut();
          if (error) console.error('Error signing out:', error.message);
        }}
      >
        Logout
      </button>
    </div>
  );
}
