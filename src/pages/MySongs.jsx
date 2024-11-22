import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom'; // Import Link for navigation

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
        .select('*')
        .eq('user_id', user.id);

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
              <Link to={`/song/${song.id}`}> {/* Link to CurrentSong page */}
                <h2>{song.title}</h2>
              </Link>
              <p>Khowar Lyrics: {song.khowar_lyrics}</p>
              <p>English Lyrics: {song.english_lyrics}</p>
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
