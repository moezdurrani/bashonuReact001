import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

function MySongs() {
  const [songs, setSongs] = useState([]); // Full list of user's songs
  const [filteredSongs, setFilteredSongs] = useState([]); // Filtered list of user's songs
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  const fetchMySongs = async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (user) {
      const { data, error } = await supabase
        .from('songs')
        .select(`
          id, 
          title, 
          khowar_lyrics, 
          english_lyrics, 
          singers(name), 
          writers(name)
        `)
        .eq('user_id', user.id); // Only fetch songs uploaded by the logged-in user

      if (error) {
        console.error('Error fetching songs:', error);
      } else {
        setSongs(data);
        setFilteredSongs(data); // Initialize filtered songs with all user's songs
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMySongs();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter songs based on title, singer name, or writer name
    const filtered = songs.filter((song) => {
      const titleMatch = song.title.toLowerCase().includes(query);
      const singerMatch = song.singers?.name.toLowerCase().includes(query);
      const writerMatch = song.writers?.name.toLowerCase().includes(query);
      return titleMatch || singerMatch || writerMatch;
    });

    setFilteredSongs(filtered);
  };

  if (loading) return <p>Loading your songs...</p>;

  return (
    <div>
      <h1>My Songs</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by title, singer, or writer"
        value={searchQuery}
        onChange={handleSearch}
        style={{ width: '100%', padding: '10px', marginBottom: '20px', fontSize: '16px' }}
      />

      {filteredSongs.length > 0 ? (
        <ul>
          {filteredSongs.map((song) => (
            <li key={song.id}>
              <Link to={`/song/${song.id}`}>
                <h2>{song.title}</h2>
              </Link>
              <p><strong>Singer:</strong> {song.singers?.name || 'Unknown'}</p>
              <p><strong>Writer:</strong> {song.writers?.name || 'Unknown'}</p>
              <p><strong>Khowar Lyrics:</strong> {song.khowar_lyrics}</p>
              <p><strong>English Lyrics:</strong> {song.english_lyrics}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No songs found.</p>
      )}
    </div>
  );
}

export default MySongs;
