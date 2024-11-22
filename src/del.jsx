import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function CurrentSong() {
  const { id } = useParams(); // Get the song ID from the URL
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const fetchSong = async () => {
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      setUserId(user?.id);

      // Fetch song details, including username of the poster
      const { data: songData, error } = await supabase
        .from('songs')
        .select(`
          id,
          title,
          khowar_lyrics,
          english_lyrics,
          likes,
          comments,
          singers(name),
          writers(name),
          user_profiles(username)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching song:', error.message);
        setSong(null);
      } else {
        console.log('Fetched song data:', songData);
        setSong(songData);
      }
    } catch (error) {
      console.error('Unexpected error:', error.message);
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
      <p>
        <strong>Posted by:</strong>{' '}
        <span
          onClick={() =>
            song?.user_id === userId ? navigate('/my-profile') : navigate(`/user/${song.user_profiles?.username}`)
          }
          style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {song.user_profiles?.username || 'Unknown'}
        </span>
      </p>
      <p><strong>Singer:</strong> {song.singers?.name || 'Unknown'}</p>
      <p><strong>Writer:</strong> {song.writers?.name || 'Unknown'}</p>
      <p><strong>Khowar Lyrics:</strong> {song.khowar_lyrics}</p>
      <p><strong>English Lyrics:</strong> {song.english_lyrics}</p>
      <p><strong>Likes:</strong> {song.likes}</p>

      <button onClick={() => setLiked(!liked)}>{liked ? 'Unlike' : 'Like'}</button>

      <div>
        <h2>Comments</h2>
        <ul>
          {song.comments?.map((c, index) => (
            <li key={index}>
              {c} <button onClick={() => console.log('Delete comment')}>Delete</button>
            </li>
          ))}
        </ul>
        <textarea
          placeholder="Add a comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button onClick={() => console.log('Add comment')}>Add Comment</button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
}

export default CurrentSong;
