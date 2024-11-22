// src/pages/CurrentSong.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function CurrentSong() {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSong = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('songs').select('*').eq('id', id).single();
      if (error) {
        console.error('Error fetching song details:', error);
      } else {
        setSong(data);
      }
      setLoading(false);
    };

    fetchSong();
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!song) {
    return <p>Song not found.</p>;
  }

  return (
    <div>
      <h1>{song.title}</h1>
      <p><strong>Singer ID:</strong> {song.singer_id}</p>
      <p><strong>Writer ID:</strong> {song.writer_id}</p>
      <p><strong>Likes:</strong> {song.likes}</p>
      <p><strong>Khowar Lyrics:</strong> {song.khowar_lyrics}</p>
      <p><strong>English Lyrics:</strong> {song.english_lyrics}</p>
      <p><strong>Comments:</strong></p>
      <ul>
        {song.comments?.map((comment, index) => (
          <li key={index}>{comment}</li>
        ))}
      </ul>
    </div>
  );
}

export default CurrentSong;
