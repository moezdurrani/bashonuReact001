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
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session) {
        setUser(session.user);

        // Fetch username
        const { data: userProfile, error: userProfileError } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        if (userProfileError) {
          console.error('Error fetching username:', userProfileError.message);
        } else {
          setUsername(userProfile?.username || 'No username set');
        }

        // Fetch profile image
        const { data: profileImageData, error: profileImageError } = await supabase
          .storage
          .from('user-images')
          .download(`profile-images/${session.user.id}.png`);

        if (profileImageError) {
          console.log('No profile image found, using default.');
          setProfileImage(null);
        } else {
          const url = URL.createObjectURL(profileImageData);
          setProfileImage(url);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [session]);

  const handleUploadProfileImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const { error: uploadError } = await supabase.storage
        .from('user-images')
        .upload(`profile-images/${session.user.id}.png`, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      setMessage('Profile image uploaded successfully.');
      const { data: newProfileImage, error: downloadError } = await supabase
        .storage
        .from('user-images')
        .download(`profile-images/${session.user.id}.png`);

      if (downloadError) throw downloadError;

      const url = URL.createObjectURL(newProfileImage);
      setProfileImage(url);
    } catch (error) {
      console.error('Error uploading profile image:', error.message);
      setMessage('Error uploading profile image.');
    }
  };

  const handleDeleteProfileImage = async () => {
    try {
      const { error: deleteError } = await supabase.storage
        .from('user-images')
        .remove([`profile-images/${session.user.id}.png`]);

      if (deleteError) throw deleteError;

      setProfileImage(null);
      setMessage('Profile image deleted successfully.');
    } catch (error) {
      console.error('Error deleting profile image:', error.message);
      setMessage('Error deleting profile image.');
    }
  };

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
          <img
            src={profileImage || 'https://via.placeholder.com/150'}
            alt="Profile"
            style={{ width: '150px', height: '150px', borderRadius: '50%' }}
          />
          <div>
            <label htmlFor="profile-image-upload">Upload New Profile Image:</label>
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              onChange={handleUploadProfileImage}
            />
            <button onClick={handleDeleteProfileImage}>Delete Profile Image</button>
          </div>
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
