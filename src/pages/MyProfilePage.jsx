import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

function MyProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

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
