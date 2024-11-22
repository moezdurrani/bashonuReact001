import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function CurrentSong() {
  const { id } = useParams(); // Get the song ID from the URL
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSong = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', id)
      .single(); // Fetch a single song by ID

    if (error) {
      console.error('Error fetching song:', error);
    } else {
      setSong(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSong();
  }, [id]);

  if (loading) return <p>Loading song details...</p>;

  if (!song) return <p>Song not found.</p>;

  return (
    <div>
      <h1>{song.title}</h1>
      <p><strong>Khowar Lyrics:</strong> {song.khowar_lyrics}</p>
      <p><strong>English Lyrics:</strong> {song.english_lyrics}</p>
      <p><strong>Likes:</strong> {song.likes}</p>
    </div>
  );
}

export default CurrentSong;
