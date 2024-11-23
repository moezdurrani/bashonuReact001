import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Link } from 'react-router-dom';
import './MyProfilePage.css';

function MyProfile({ session }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session) {
        setUser(session.user);

        const { data: userProfile, error: userProfileError } = await supabase
          .from('user_profiles')
          .select('username, profile_image_url')
          .eq('id', session.user.id)
          .single();

        if (userProfileError) {
          console.error('Error fetching username:', userProfileError.message);
        } else {
          setUsername(userProfile?.username || 'No username set');

          if (userProfile.profile_image_url) {
            const { data: publicUrlData } = supabase.storage
              .from('user-images')
              .getPublicUrl(userProfile.profile_image_url);
            setProfileImage(publicUrlData.publicUrl);
          } else {
            setProfileImage('https://via.placeholder.com/150');
          }
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [session]);

  const handleEditUsername = async () => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ username: newUsername })
        .eq('id', user.id);

      if (error) throw error;

      setUsername(newUsername);
      setNewUsername('');
      setEditingUsername(false);
      setMessage('Username updated successfully!');
    } catch (error) {
      console.error('Error updating username:', error.message);
      setMessage('Error updating username.');
    }
  };

  const handleUploadProfileImage = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    try {
      const filePath = `${session.user.id}/profile.jpg`;

      await supabase.storage.from('user-images').remove([filePath]);

      const { error: uploadError } = await supabase.storage
        .from('user-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ profile_image_url: filePath })
        .eq('id', session.user.id);

      if (updateError) {
        throw updateError;
      }

      const { data: imageData } = supabase.storage
        .from('user-images')
        .getPublicUrl(filePath);

      setProfileImage(`${imageData.publicUrl}?t=${new Date().getTime()}`);
      setMessage('Profile image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading profile image:', error.message);
      setMessage('Error uploading profile image. Please try again.');
    }
  };

  const handleDeleteProfileImage = async () => {
    try {
      const filePath = `${session.user.id}/profile.jpg`;

      const { error: deleteError } = await supabase.storage
        .from('user-images')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ profile_image_url: null })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setProfileImage('https://via.placeholder.com/150');
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
      window.location.reload();
    }
  };

  if (loading) return <p className="loading-message">Loading...</p>;

  return (
    <div className="my-profile-page">
      {!user ? (
        <div className="login-container">
          <h1>Login</h1>
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
        </div>
      ) : (
        <div>
          <h1>Welcome, {user.email}</h1>
          <p>
            <strong>Username:</strong> {username}
          </p>
          {editingUsername ? (
            <div className="edit-controls">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
              />
              <button onClick={handleEditUsername}>Save</button>
              <button onClick={() => setEditingUsername(false)}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setEditingUsername(true)}>Edit Username</button>
          )}
          <div className="profile-container">
            <img
              src={profileImage}
              alt="Profile"
              className="profile-image"
            />
            <div>
              <label htmlFor="profile-image-upload">
                Upload New Profile Image:
              </label>
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleUploadProfileImage}
              />
              <button onClick={handleDeleteProfileImage}>
                Delete Profile Image
              </button>
            </div>
          </div>
          <div className="profile-links">
            <Link to="/my-songs">View My Songs</Link>
            <Link to="/create-song">Create a Song</Link>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
          <p className="message">{message}</p>
        </div>
      )}
    </div>
  );
}

export default MyProfile;
