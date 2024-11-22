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
  const [newUsername, setNewUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false); // Toggle editing mode

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
          setNewUsername(data?.username || ''); // Initialize newUsername
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

  const updateUsername = async () => {
    if (!newUsername.trim()) {
      setMessage('Username cannot be empty.');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ username: newUsername })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating username:', error.message);
        setMessage('Error updating username.');
      } else {
        setUsername(newUsername); // Update the displayed username
        setIsEditing(false); // Exit editing mode
        setMessage('Username updated successfully!');
      }
    } catch (err) {
      console.error('Unexpected error:', err.message);
      setMessage('Unexpected error occurred.');
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
          <p>
            <strong>Username:</strong>{' '}
            {!isEditing ? (
              <>
                {username}{' '}
                <button onClick={() => setIsEditing(true)}>Edit Username</button>
              </>
            ) : (
              <div>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
                <button onClick={updateUsername}>Save</button>
                <button onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            )}
          </p>
          <div style={{ marginBottom: '20px' }}>
            <Link to="/my-songs" style={{ marginRight: '10px' }}>
              View My Songs
            </Link>
            <Link to="/create-song">Create a Song</Link>
          </div>
          <button onClick={handleLogout}>Logout</button>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}

export default MyProfile;
