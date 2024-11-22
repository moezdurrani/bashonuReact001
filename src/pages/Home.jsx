import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom'; // Import Link for navigation

function Home() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSongs = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('songs').select('*');

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
            <li key={song.id}>
              <Link to={`/song/${song.id}`}> {/* Link to CurrentSong page */}
                <h2>{song.title}</h2>
              </Link>
              <p>Khowar Lyrics: {song.khowar_lyrics}</p>
              <p>English Lyrics: {song.english_lyrics}</p>
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
