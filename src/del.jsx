import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function UserSongs() {
  const { username } = useParams(); // Get the username from the URL
  const [songs, setSongs] = useState([]);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserSongsAndImage = async () => {
    setLoading(true);
    setError(''); // Reset error message

    try {
      console.log(`Fetching user data for username: ${username}`); // Debug log

      // Fetch user profile
      const { data: user, error: userError } = await supabase
        .from('user_profiles')
        .select('id, profile_image_url')
        .eq('username', username)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError.message);
        setError('User not found.');
        setSongs([]);
        setLoading(false);
        return;
      }

      console.log('User data fetched:', user); // Debug log

      // Try fetching profile image
      if (user.profile_image_url) {
        console.log(`Fetching profile image for user: ${username}`); // Debug log
        try {
          const { data: publicUrl } = supabase.storage
            .from('user-images')
            .getPublicUrl(user.profile_image_url);

          setProfileImageUrl(publicUrl.publicUrl);
        } catch (imageError) {
          console.error('Error fetching profile image:', imageError.message);
          setProfileImageUrl('/default-profile.png'); // Fallback to default
        }
      } else {
        console.log('No profile image found for user, using default image.');
        setProfileImageUrl('/default-profile.png'); // Fallback
      }

      // Fetch songs by user
      console.log(`Fetching songs for user ID: ${user.id}`); // Debug log
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('id, title, singers(name), writers(name)')
        .eq('user_id', user.id);

      if (songsError) {
        console.error('Error fetching songs:', songsError.message);
        setError('Error fetching songs.');
        setSongs([]);
      } else {
        console.log('Songs data fetched:', songsData); // Debug log
        setSongs(songsData);
      }
    } catch (fetchError) {
      console.error('Unexpected error:', fetchError.message); // Debug log
      setError('An unexpected error occurred.');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUserSongsAndImage();
  }, [username]);

  if (loading) return <p>Loading songs...</p>;

  if (error) return <p>{error}</p>;

  if (!songs.length) return <p>No songs found for this user.</p>;

  return (
    <div>
      <h1>{username}'s Songs</h1>
      {profileImageUrl && (
        <div style={{ marginBottom: '20px' }}>
          <img
            src={profileImageUrl}
            alt={`${username}'s profile`}
            style={{ width: '100px', height: '100px', borderRadius: '50%' }}
          />
        </div>
      )}
      <ul>
        {songs.map((song) => (
          <li key={song.id}>
            <Link to={`/song/${song.id}`}>
              {song.title} - Singer: {song.singers?.name || 'Unknown'}, Writer: {song.writers?.name || 'Unknown'}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserSongs;
