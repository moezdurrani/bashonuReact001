import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function CurrentSong() {
  const { id } = useParams(); // Get the song ID from the URL
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [editing, setEditing] = useState(false); // Toggle editing mode
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  // Edit Song Fields
  const [title, setTitle] = useState('');
  const [khowarLyrics, setKhowarLyrics] = useState('');
  const [englishLyrics, setEnglishLyrics] = useState('');

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
      setTitle(songData.title);
      setKhowarLyrics(songData.khowar_lyrics);
      setEnglishLyrics(songData.english_lyrics);

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

  const handleLikeToggle = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setMessage('You must be logged in to like or unlike a song.');
      return;
    }

    try {
      if (liked) {
        // Unlike the song
        const { error: unlikeError } = await supabase
          .from('song_likes')
          .delete()
          .eq('user_id', session.user.id)
          .eq('song_id', id);

        if (unlikeError) throw unlikeError;

        const { error: decrementError } = await supabase
          .from('songs')
          .update({ likes: Math.max((song.likes || 1) - 1, 0) })
          .eq('id', id);

        if (decrementError) throw decrementError;

        setLiked(false);
        setSong({ ...song, likes: Math.max((song.likes || 1) - 1, 0) });
        setMessage('You unliked this song.');
      } else {
        // Like the song
        const { error: likeError } = await supabase.from('song_likes').insert({
          user_id: session.user.id,
          song_id: id,
        });

        if (likeError) throw likeError;

        const { error: incrementError } = await supabase
          .from('songs')
          .update({ likes: (song.likes || 0) + 1 })
          .eq('id', id);

        if (incrementError) throw incrementError;

        setLiked(true);
        setSong({ ...song, likes: (song.likes || 0) + 1 });
        setMessage('You liked this song!');
      }
    } catch (error) {
      setMessage('Error updating like status: ' + error.message);
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
      const { error: commentError } = await supabase
        .from('songs')
        .update({
          comments: [...(song.comments || []), comment],
        })
        .eq('id', id);

      if (commentError) throw commentError;

      setSong({
        ...song,
        comments: [...(song.comments || []), comment],
      });
      setComment('');
      setMessage('Comment added successfully!');
    } catch (error) {
      setMessage('Error adding comment: ' + error.message);
    }
  };

  const handleDeleteComment = async (indexToDelete) => {
    try {
      const updatedComments = song.comments.filter(
        (_, index) => index !== indexToDelete
      );

      const { error: deleteError } = await supabase
        .from('songs')
        .update({ comments: updatedComments })
        .eq('id', id);

      if (deleteError) throw deleteError;

      setSong({ ...song, comments: updatedComments });
      setMessage('Comment deleted successfully!');
    } catch (error) {
      setMessage('Error deleting comment: ' + error.message);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('songs')
        .update({
          title,
          khowar_lyrics: khowarLyrics,
          english_lyrics: englishLyrics,
        })
        .eq('id', id);

      if (error) throw error;

      setSong({ ...song, title, khowar_lyrics: khowarLyrics, english_lyrics: englishLyrics });
      setEditing(false); // Exit editing mode
      setMessage('Song updated successfully!');
    } catch (error) {
      setMessage('Error updating song: ' + error.message);
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
      <button onClick={handleLikeToggle}>
        {liked ? 'Unlike' : 'Like'}
      </button>

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

      {/* Edit Song Button */}
      {!editing && (
        <button onClick={() => setEditing(true)}>Edit Song</button>
      )}

      {/* Edit Song Form */}
      {editing && (
        <form onSubmit={handleEdit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            value={khowarLyrics}
            onChange={(e) => setKhowarLyrics(e.target.value)}
            required
          />
          <textarea
            value={englishLyrics}
            onChange={(e) => setEnglishLyrics(e.target.value)}
            required
          />
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}

export default CurrentSong;
