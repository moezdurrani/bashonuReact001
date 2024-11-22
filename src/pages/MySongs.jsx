import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function MySongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMySongs = async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (user) {
      const { data, error } = await supabase
        .from('songs')
        .select('id, title, singers(name), writers(name)')
        .eq('user_id', user.id)
        .order('title', { ascending: true }); // Order songs alphabetically by title

      if (error) {
        console.error('Error fetching songs:', error);
      } else {
        setSongs(data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMySongs();
  }, []);

  if (loading) return <p>Loading your songs...</p>;

  return (
    <div>
      <h1>My Songs</h1>
      {songs.length > 0 ? (
        <ul>
          {songs.map((song) => (
            <li key={song.id}>
              <h2>{song.title}</h2>
              <p><strong>Singer:</strong> {song.singers?.name || 'Unknown'}</p>
              <p><strong>Writer:</strong> {song.writers?.name || 'Unknown'}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't uploaded any songs yet.</p>
      )}
    </div>
  );
}

export default MySongs;
