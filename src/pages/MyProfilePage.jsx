import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom'; // Import Link

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
    <div>
      <h1>My Profile</h1>

      {/* User Profile Information */}
      {user ? (
        <div>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>
          <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px 20px' }}>
            Logout
          </button>
        </div>
      ) : (
        <p>No user is logged in.</p>
      )}

      <hr />

      {/* Link to My Songs */}
      <h2>My Songs</h2>
      <Link to="/my-songs" style={{ fontSize: '18px', color: 'blue', textDecoration: 'underline' }}>
        View My Songs
      </Link>

      {message && <p>{message}</p>}
    </div>
  );
}

export default MyProfile;
