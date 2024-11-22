import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

function Home() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSongs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('songs')
      .select(`
        id, 
        title, 
        singers(name), 
        writers(name)
      `);

    if (error) {
      console.error('Error fetching songs:', error);
    } else {
      setSongs(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  if (loading) return <p>Loading songs...</p>;

  return (
    <div>
      <h1>All Songs</h1>
      {songs.length > 0 ? (
        <ul>
          {songs.map((song) => (
            <li key={song.id} style={{ marginBottom: '20px', listStyle: 'none' }}>
              <Link to={`/song/${song.id}`}>
                <h2>{song.title}</h2>
              </Link>
              <p><strong>Singer:</strong> {song.singers?.name || 'Unknown'}</p>
              <p><strong>Writer:</strong> {song.writers?.name || 'Unknown'}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No songs found.</p>
      )}
    </div>
  );
}

export default Home;
