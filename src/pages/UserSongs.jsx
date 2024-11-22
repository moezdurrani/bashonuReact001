import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function UserSongs() {
  const { username } = useParams(); // Get the username from the URL
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserSongs = async () => {
    setLoading(true);

    // Fetch user ID based on the username
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !userProfile) {
      console.error('Error fetching user profile:', userError);
      setLoading(false);
      return;
    }

    // Fetch all songs by the user's ID
    const { data: userSongs, error: songError } = await supabase
      .from('songs')
      .select('id, title, singers(name), writers(name)')
      .eq('user_id', userProfile.id)
      .order('title', { ascending: true });

    if (songError) {
      console.error('Error fetching user songs:', songError);
    } else {
      setSongs(userSongs);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUserSongs();
  }, [username]);

  if (loading) return <p>Loading songs...</p>;

  return (
    <div>
      <h1>{username}</h1>
      <h2>Songs by {username}</h2>
      {songs.length > 0 ? (
        <ul>
          {songs.map((song) => (
            <li key={song.id}>
              <h3>{song.title}</h3>
              <p><strong>Singer:</strong> {song.singers?.name || 'Unknown'}</p>
              <p><strong>Writer:</strong> {song.writers?.name || 'Unknown'}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No songs found for this user.</p>
      )}
    </div>
  );
}

export default UserSongs;
