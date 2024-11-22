import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

function MyProfile() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(''); // Current username
  const [newUsername, setNewUsername] = useState(''); // Input for updating username
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch the user's profile, including username
  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        // Fetch the username from the user_profiles table
        const { data, error } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching username:', error.message);
        } else {
          setUsername(data?.username || 'Not set'); // Display "Not set" if no username exists
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  // Handle username update
  const handleUsernameUpdate = async (e) => {
    e.preventDefault();

    if (!newUsername.trim()) {
      setMessage('Username cannot be empty.');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ username: newUsername.trim() })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setUsername(newUsername.trim());
      setNewUsername('');
      setMessage('Username updated successfully!');
    } catch (error) {
      setMessage('Error updating username: ' + error.message);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage('Error logging out: ' + error.message);
    } else {
      window.location.reload(); // Reload the page to reset the app state
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <div className="profile-content">
        <h1>My Profile</h1>
        {user ? (
          <div>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Username:</strong> {username}</p>
            <form onSubmit={handleUsernameUpdate}>
              <label>
                Update Username:
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  style={{ marginLeft: '10px' }}
                />
              </label>
              <button type="submit" style={{ marginLeft: '10px' }}>
                Update
              </button>
            </form>
          </div>
        ) : (
          <p>No user is logged in.</p>
        )}

        {/* My Songs Link */}
        <Link to="/my-songs" style={{ fontSize: '18px', color: 'blue', textDecoration: 'underline', display: 'block', marginBottom: '10px' }}>
          View My Songs
        </Link>

        {/* Create Song Link */}
        <Link to="/create-song" style={{ fontSize: '18px', color: 'blue', textDecoration: 'underline', display: 'block' }}>
          Create a Song
        </Link>
      </div>

      <button
        onClick={handleLogout}
        className="logout-button"
      >
        Logout
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default MyProfile;
