import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function Home() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSong, setNewSong] = useState({
    title: '',
    khowar_lyrics: '',
    english_lyrics: '',
  });

  // Fetch songs created by the logged-in user
  const fetchSongs = async () => {
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
    fetchSongs();
  }, []);

  // Handle song creation
  const handleCreateSong = async (e) => {
    e.preventDefault();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (user) {
      const { error } = await supabase.from('songs').insert({
        ...newSong,
        user_id: user.id, // Associate the song with the logged-in user
      });

      if (error) {
        console.error('Error creating song:', error);
      } else {
        setNewSong({ title: '', khowar_lyrics: '', english_lyrics: '' });
        fetchSongs(); // Refresh the song list
      }
    }
  };

  if (loading) return <p>Loading songs...</p>;

  return (
    <div>
      <h1>Your Songs</h1>
      <form onSubmit={handleCreateSong}>
        <input
          type="text"
          placeholder="Title"
          value={newSong.title}
          onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Khowar Lyrics"
          value={newSong.khowar_lyrics}
          onChange={(e) =>
            setNewSong({ ...newSong, khowar_lyrics: e.target.value })
          }
          required
        />
        <textarea
          placeholder="English Lyrics"
          value={newSong.english_lyrics}
          onChange={(e) =>
            setNewSong({ ...newSong, english_lyrics: e.target.value })
          }
          required
        />
        <button type="submit">Add Song</button>
      </form>
      {songs.length > 0 ? (
        <ul>
          {songs.map((song) => (
            <li key={song.id}>
              <h2>{song.title}</h2>
              <p><strong>Khowar Lyrics:</strong> {song.khowar_lyrics}</p>
              <p><strong>English Lyrics:</strong> {song.english_lyrics}</p>
              <p><strong>Likes:</strong> {song.likes}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have not created any songs yet.</p>
      )}
    </div>
  );
}

export default Home;
