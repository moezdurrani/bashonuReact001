import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function UserSongs() {
  const { username } = useParams(); // Get the username from the URL
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserSongs = async () => {
    setLoading(true);

    try {
      const { data: user, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError.message);
        setSongs([]);
        return;
      }

      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('id, title, singers(name), writers(name)')
        .eq('user_id', user.id);

      if (songsError) {
        console.error('Error fetching songs:', songsError.message);
        setSongs([]);
      } else {
        setSongs(songsData);
      }
    } catch (error) {
      console.error('Unexpected error:', error.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUserSongs();
  }, [username]);

  if (loading) return <p>Loading songs...</p>;

  if (!songs.length) return <p>No songs found for this user.</p>;

  return (
    <div>
      <h1>{username}'s Songs</h1>
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
