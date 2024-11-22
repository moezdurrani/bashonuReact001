import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function CreateSong() {
  const [title, setTitle] = useState('');
  const [khowarLyrics, setKhowarLyrics] = useState('');
  const [englishLyrics, setEnglishLyrics] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (user) {
      const { error } = await supabase.from('songs').insert({
        title,
        khowar_lyrics: khowarLyrics,
        english_lyrics: englishLyrics,
        user_id: user.id,
      });

      if (error) {
        setMessage('Error uploading song: ' + error.message);
      } else {
        setMessage('Song uploaded successfully!');
        setTitle('');
        setKhowarLyrics('');
        setEnglishLyrics('');
      }
    }
  };

  return (
    <div>
      <h1>Create a New Song</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Song Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Khowar Lyrics"
          value={khowarLyrics}
          onChange={(e) => setKhowarLyrics(e.target.value)}
          required
        />
        <textarea
          placeholder="English Lyrics"
          value={englishLyrics}
          onChange={(e) => setEnglishLyrics(e.target.value)}
          required
        />
        <button type="submit">Upload Song</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateSong;
