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
  const [userId, setUserId] = useState(null); // Logged-in user ID

  // Edit Song Fields
  const [title, setTitle] = useState('');
  const [khowarLyrics, setKhowarLyrics] = useState('');
  const [englishLyrics, setEnglishLyrics] = useState('');

  const fetchSong = async () => {
    setLoading(true);

    // Fetch logged-in user's ID
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    setUserId(user?.id);

    // Fetch song details, including singer and writer names
    const { data: songData, error } = await supabase
      .from('songs')
      .select('id, title, khowar_lyrics, english_lyrics, likes, comments, singers(name), writers(name), user_id')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching song:', error);
    } else {
      setSong(songData);
      setTitle(songData.title);
      setKhowarLyrics(songData.khowar_lyrics);
      setEnglishLyrics(songData.english_lyrics);

      // Check if the user has liked this song
      const { data: likeData } = await supabase
        .from('song_likes')
        .select('*')
        .eq('user_id', user?.id)
        .eq('song_id', id)
        .single();

      setLiked(!!likeData);
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
      <p><strong>Singer:</strong> {song.singers?.name || 'Unknown'}</p>
      <p><strong>Writer:</strong> {song.writers?.name || 'Unknown'}</p>
      <p><strong>Khowar Lyrics:</strong> {song.khowar_lyrics}</p>
      <p><strong>English Lyrics:</strong> {song.english_lyrics}</p>
      <p><strong>Likes:</strong> {song.likes}</p>

      {/* Like Button */}
      <button onClick={() => setLiked(!liked)}>
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
        <button onClick={() => handleComment()}>Add Comment</button>
      </div>

      {/* Edit Song Section */}
      {userId === song.user_id && (
        <div>
          {!editing ? (
            <button onClick={() => setEditing(true)}>Edit Song</button>
          ) : (
            <form onSubmit={handleEdit}>
              <label>Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <label>Khowar Lyrics:</label>
              <textarea
                value={khowarLyrics}
                onChange={(e) => setKhowarLyrics(e.target.value)}
                required
              />
              <label>English Lyrics:</label>
              <textarea
                value={englishLyrics}
                onChange={(e) => setEnglishLyrics(e.target.value)}
                required
              />
              <button type="submit">Save Changes</button>
              <button type="button" onClick={() => setEditing(false)}>Cancel</button>
            </form>
          )}
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}

export default CurrentSong;
