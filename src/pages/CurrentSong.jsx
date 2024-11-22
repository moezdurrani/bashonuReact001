import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function CurrentSong() {
  const { id } = useParams(); // Get the song ID from the URL
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false); // Track if the user has liked the song
  const [comment, setComment] = useState(''); // Track the new comment input
  const [message, setMessage] = useState('');

  const fetchSong = async () => {
    setLoading(true);

    // Fetch song details
    const { data: songData, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching song:', error);
    } else {
      setSong(songData);

      // Check if the user has already liked the song
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { data: likeData } = await supabase
        .from('song_likes')
        .select('*')
        .eq('user_id', session?.user.id)
        .eq('song_id', id)
        .single();

      setLiked(!!likeData); // Set liked to true if a record exists
    }

    setLoading(false);
  };

  const handleLike = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setMessage('You must be logged in to like a song.');
      return;
    }

    if (liked) {
      setMessage('You have already liked this song.');
      return;
    }

    try {
      // Add a like to the song
      const { error: likeError } = await supabase.from('song_likes').insert({
        user_id: session.user.id,
        song_id: id,
      });

      if (likeError) throw likeError;

      // Increment the like count in the songs table
      const { error: updateError } = await supabase
        .from('songs')
        .update({ likes: (song.likes || 0) + 1 })
        .eq('id', id);

      if (updateError) throw updateError;

      setLiked(true); // Mark as liked
      setSong({ ...song, likes: (song.likes || 0) + 1 }); // Update local state
      setMessage('You liked this song!');
    } catch (error) {
      setMessage('Error liking the song: ' + error.message);
    }
  };

  const handleComment = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setMessage('You must be logged in to comment.');
      return;
    }

    if (!comment.trim()) {
      setMessage('Comment cannot be empty.');
      return;
    }

    try {
      // Add the comment to the comments array
      const { error: commentError } = await supabase
        .from('songs')
        .update({
          comments: [...(song.comments || []), comment],
        })
        .eq('id', id);

      if (commentError) throw commentError;

      setSong({
        ...song,
        comments: [...(song.comments || []), comment], // Update local state
      });
      setComment(''); // Clear the input
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
    <div>
      <h1>{song.title}</h1>
      <p><strong>Khowar Lyrics:</strong> {song.khowar_lyrics}</p>
      <p><strong>English Lyrics:</strong> {song.english_lyrics}</p>
      <p><strong>Likes:</strong> {song.likes}</p>

      {/* Like Button */}
      <button onClick={handleLike} disabled={liked}>
        {liked ? 'Liked' : 'Like'}
      </button>

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
        <button onClick={handleComment}>Add Comment</button>
      </div>

      {/* Message */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default CurrentSong;
