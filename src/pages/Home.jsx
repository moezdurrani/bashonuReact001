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
      .select('id, title, singers(name), writers(name)')
      .order('title', { ascending: true }); // Order songs by title alphabetically

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
      {songs.length > 0 ? (
        <ul>
        {songs.map((song) => (
          <li key={song.id}>
            <Link to={`/song/${song.id}`}>
              <h2>{song.title}</h2>
              <p>
                <strong>Singer:</strong> {song.singers?.name || 'Unknown'} |{' '}
                <strong>Writer:</strong> {song.writers?.name || 'Unknown'}
              </p>
            </Link>
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
