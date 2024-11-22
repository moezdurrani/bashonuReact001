// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

function Home() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase.from('songs').select('*');
      if (error) {
        console.error('Error fetching songs:', error);
      } else {
        setSongs(data);
      }
    };

    fetchSongs();
  }, []);

  return (
    <div>
      <h1>Song List</h1>
      {songs.length > 0 ? (
        <ul>
          {songs.map((song) => (
            <li key={song.id}>
              <h2>
                <Link to={`/current-song/${song.id}`}>{song.title}</Link>
              </h2>
              <p><strong>Likes:</strong> {song.likes}</p>
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
