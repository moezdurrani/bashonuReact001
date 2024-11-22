import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Link } from 'react-router-dom';

function MyProfile({ session }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      if (session) {
        setUser(session.user);

        // Fetch the username from user_profiles table
        const { data, error } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching username:', error.message);
        } else {
          setUsername(data?.username || 'No username set');
        }
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
          <p><strong>Username:</strong> {username}</p>
          <div style={{ marginBottom: '20px' }}>
            <Link to="/my-songs" style={{ marginRight: '10px' }}>
              View My Songs
            </Link>
            <Link to="/create-song">
              Create a Song
            </Link>
          </div>
          <button onClick={handleLogout}>Logout</button>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}

export default MyProfile;
