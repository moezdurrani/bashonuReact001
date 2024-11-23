import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './CurrentSong.css';


function CurrentSong() {
  const { id } = useParams(); // Get the song ID from the URL
  const navigate = useNavigate(); // Add navigate hook
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [lyricsType, setLyricsType] = useState('khowar'); // Default to Khowar lyrics

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
          user_profiles(username)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching song:', error.message);
        setSong(null);
      } else {
        setSong(songData);

        // Check if the user has already liked the song
        const { data: likeData } = await supabase
          .from('song_likes')
          .select('id')
          .eq('user_id', user?.id)
          .eq('song_id', id)
          .single();

        setLiked(!!likeData); // Set liked to true if likeData exists
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
        const { error: deleteError } = await supabase
          .from('song_likes')
          .delete()
          .eq('user_id', userId)
          .eq('song_id', id);

        if (deleteError) {
          throw deleteError;
        }

        // Decrement the song's like count
        const { error: updateError } = await supabase
          .from('songs')
          .update({ likes: Math.max((song.likes || 1) - 1, 0) })
          .eq('id', id);

        if (updateError) {
          throw updateError;
        }

        setLiked(false);
        setSong({ ...song, likes: Math.max((song.likes || 1) - 1, 0) });
        setMessage('You unliked this song.');
      } else {
        // Like the song
        const { error: insertError } = await supabase
          .from('song_likes')
          .insert({ user_id: userId, song_id: id });

        if (insertError) {
          if (insertError.message.includes('duplicate key value')) {
            setMessage('You have already liked this song.');
            return;
          }
          throw insertError;
        }

        // Increment the song's like count
        const { error: updateError } = await supabase
          .from('songs')
          .update({ likes: (song.likes || 0) + 1 })
          .eq('id', id);

        if (updateError) {
          throw updateError;
        }

        setLiked(true);
        setSong({ ...song, likes: (song.likes || 0) + 1 });
        setMessage('You liked this song!');
      }
    } catch (error) {
      setMessage('Error updating like status: ' + error.message);
    }
  };

  const handleAddComment = async () => {
    if (!userId) {
      setMessage('You must be logged in to add a comment.');
      return;
    }

    if (!comment.trim()) {
      setMessage('Comment cannot be empty.');
      return;
    }

    try {
      const updatedComments = [...(song.comments || []), comment];
      const { error } = await supabase
        .from('songs')
        .update({ comments: updatedComments })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setSong({ ...song, comments: updatedComments });
      setComment('');
      setMessage('Comment added successfully!');
    } catch (error) {
      setMessage('Error adding comment: ' + error.message);
    }
  };

  useEffect(() => {
    fetchSong();
  }, [id]);

  if (loading) return <p>Loading song details...</p>;

  if (!song) return <p>Song not found.</p>;

  return (
    
    <div className="current-song-page">
  <h1>{song.title}</h1>

  {/* Lyrics Toggle Buttons */}
  <div className="lyrics-toggle-buttons">
    <button
      onClick={() => setLyricsType('khowar')}
      className={lyricsType === 'khowar' ? 'active' : ''}
    >
      Khowar Lyrics
    </button>
    <button
      onClick={() => setLyricsType('english')}
      className={lyricsType === 'english' ? 'active' : ''}
    >
      English Lyrics
    </button>
  </div>

  {/* Display Lyrics Based on Selection */}
  <div className="lyrics-section">
    {lyricsType === 'khowar' && (
      <div className="lyrics khowar-lyrics">
        <pre style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>
          {song.khowar_lyrics}
        </pre>
      </div>
    )}
    {lyricsType === 'english' && (
      <div className="lyrics english-lyrics">
        <pre>{song.english_lyrics}</pre>
      </div>
    )}
  </div>

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

  {/* Other Details */}
  <div className="song-details">
    <p><strong>Likes:</strong> {song.likes}</p>
    <button onClick={handleLikeToggle}>{liked ? 'Unlike' : 'Like'}</button>
  </div>

  {/* Comment Section */}
  <div>
    <h2>Comments</h2>
    <ul>
      {song.comments?.map((c, index) => (
        <li key={index}>{c}</li>
      ))}
    </ul>
    <textarea
      placeholder="Add a comment"
      value={comment}
      onChange={(e) => setComment(e.target.value)}
    />
    <button onClick={handleAddComment}>Add Comment</button>
  </div>

  {message && <p>{message}</p>}
</div>



  );

}

export default CurrentSong;
