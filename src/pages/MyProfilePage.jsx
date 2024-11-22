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
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
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
      const filePath = `profile-images/${session.user.id}.png`;
  
      // Delete any existing profile image
      await supabase.storage.from('user-images').remove([filePath]);
  
      // Upload the new profile image
      const { data, error } = await supabase.storage
        .from('user-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Overwrites existing image
          contentType: file.type, // Set MIME type for the file
        });
  
      if (error) {
        throw error;
      }
  
      // Fetch the new image URL
      const { data: imageData, error: fetchError } = await supabase
        .storage
        .from('user-images')
        .getPublicUrl(filePath);
  
      if (fetchError) {
        throw fetchError;
      }
  
      setProfileImage(imageData.publicUrl);
      setMessage('Profile image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading profile image:', error.message);
      setMessage('Error uploading profile image. Please try again.');
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
          {editingUsername ? (
            <div>
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
