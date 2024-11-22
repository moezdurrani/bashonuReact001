import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function MyProfile({ session }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      if (session) {
        setUser(session.user);
      }
      setLoading(false);
    };

    fetchUser();
  }, [session]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage('Error logging out: ' + error.message);
    } else {
      setUser(null);
      setMessage('Successfully logged out!');
      window.location.reload(); // Reload the page to reset the app state
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {!user ? (
        <div>
          <h1>Login</h1>
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
        </div>
      ) : (
        <div>
          <h1>Welcome, {user.email}</h1>
          <button onClick={handleLogout}>Logout</button>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}

export default MyProfile;
