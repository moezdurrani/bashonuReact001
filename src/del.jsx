import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { supabase } from '../supabaseClient';

function CurrentSong() {
  const { id } = useParams(); // Get the song ID from the URL
  const navigate = useNavigate(); // Initialize useNavigate
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null); // Logged-in user ID

  // Edit Song Fields
  const [title, setTitle] = useState('');
  const [khowarLyrics, setKhowarLyrics] = useState('');
  const [englishLyrics, setEnglishLyrics] = useState('');

  const fetchSong = async () => {
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      setUserId(user?.id);

      // Fetch song details with proper relationships
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
          user_profiles(username) -- Supabase now recognizes the relationship
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

  const handleLikeToggle = async () => {
    if (!userId) {
      setMessage('You must be logged in to like or unlike a song.');
      return;
    }

    try {
      if (liked) {
        // Unlike the song
        await supabase.from('song_likes').delete().eq('user_id', userId).eq('song_id', id);
        await supabase.from('songs').update({ likes: Math.max((song.likes || 1) - 1, 0) }).eq('id', id);

        setLiked(false);
        setSong({ ...song, likes: Math.max((song.likes || 1) - 1, 0) });
        setMessage('You unliked this song.');
      } else {
        // Like the song
        await supabase.from('song_likes').insert({ user_id: userId, song_id: id });
        await supabase.from('songs').update({ likes: (song.likes || 0) + 1 }).eq('id', id);

        setLiked(true);
        setSong({ ...song, likes: (song.likes || 0) + 1 });
        setMessage('You liked this song!');
      }
    } catch (error) {
      setMessage('Error updating like status: ' + error.message);
    }
  };

  const handleComment = async () => {
    if (!userId) {
      setMessage('You must be logged in to comment.');
      return;
    }

    if (!comment.trim()) {
      setMessage('Comment cannot be empty.');
      return;
    }

    try {
      const updatedComments = [...(song.comments || []), comment];
      await supabase.from('songs').update({ comments: updatedComments }).eq('id', id);

      setSong({ ...song, comments: updatedComments });
      setComment('');
      setMessage('Comment added successfully!');
    } catch (error) {
      setMessage('Error adding comment: ' + error.message);
    }
  };

  const handleDeleteComment = async (indexToDelete) => {
    try {
      const updatedComments = song.comments.filter((_, index) => index !== indexToDelete);
      await supabase.from('songs').update({ comments: updatedComments }).eq('id', id);

      setSong({ ...song, comments: updatedComments });
      setMessage('Comment deleted successfully!');
    } catch (error) {
      setMessage('Error deleting comment: ' + error.message);
    }
  };

  useEffect(() => {
    fetchSong();
  }, [id]);

  if (loading) return <p>Loading song details...</p>;

  if (!song) return <p>Song not found.</p>;

  return (
    <div>
      <h1>{song.title}</h1>
      <p><strong>Singer:</strong> {song.singers?.name || 'Unknown'}</p>
      <p><strong>Writer:</strong> {song.writers?.name || 'Unknown'}</p>
      <p>
        <strong>Posted by:</strong>{' '}
        <span
          onClick={() =>
            song?.user_profiles?.username
              ? navigate(`/user/${song.user_profiles.username}`)
              : console.log('Username not found')
          }
          style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {song.user_profiles?.username || 'Unknown'}
        </span>
      </p>
      <p><strong>Khowar Lyrics:</strong> {song.khowar_lyrics}</p>
      <p><strong>English Lyrics:</strong> {song.english_lyrics}</p>
      <p><strong>Likes:</strong> {song.likes}</p>

      {/* Like Button */}
      <button onClick={handleLikeToggle}>{liked ? 'Unlike' : 'Like'}</button>

      {/* Comment Section */}
      <div>
        <h2>Comments</h2>
        <ul>
          {song.comments?.map((c, index) => (
            <li key={index}>
              {c}
              <button onClick={() => handleDeleteComment(index)}>Delete</button>
            </li>
          ))}
        </ul>
        <textarea
          placeholder="Add a comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button onClick={handleComment}>Add Comment</button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
}

export default CurrentSong;
