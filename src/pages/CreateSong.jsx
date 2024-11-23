import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './CreateSong.css';

function CreateSong() {
  const [title, setTitle] = useState('');
  const [khowarLyrics, setKhowarLyrics] = useState('');
  const [englishLyrics, setEnglishLyrics] = useState('');
  const [singerName, setSingerName] = useState('');
  const [writerName, setWriterName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      setMessage('You must be logged in to create a song.');
      return;
    }

    try {
      let singerId, writerId;

      // Check if the singer exists; if not, create them
      const { data: singerData, error: singerError } = await supabase
        .from('singers')
        .select('id')
        .eq('name', singerName)
        .single();

      if (singerError && singerError.code !== 'PGRST116') {
        // PGRST116 means no single record found, which is expected if the singer doesn't exist
        throw singerError;
      }

      if (singerData) {
        singerId = singerData.id; // Singer exists
      } else {
        // Create the singer
        const { data: newSinger, error: newSingerError } = await supabase
          .from('singers')
          .insert({ name: singerName, created_by: user.id })
          .select('id')
          .single();

        if (newSingerError) throw newSingerError;

        singerId = newSinger.id;
      }

      // Check if the writer exists; if not, create them
      const { data: writerData, error: writerError } = await supabase
        .from('writers')
        .select('id')
        .eq('name', writerName)
        .single();

      if (writerError && writerError.code !== 'PGRST116') {
        // PGRST116 means no single record found, which is expected if the writer doesn't exist
        throw writerError;
      }

      if (writerData) {
        writerId = writerData.id; // Writer exists
      } else {
        // Create the writer
        const { data: newWriter, error: newWriterError } = await supabase
          .from('writers')
          .insert({ name: writerName, created_by: user.id })
          .select('id')
          .single();

        if (newWriterError) throw newWriterError;

        writerId = newWriter.id;
      }

      // Insert the song with the linked singer and writer
      const { error: songError } = await supabase.from('songs').insert({
        title,
        khowar_lyrics: khowarLyrics,
        english_lyrics: englishLyrics,
        singer_id: singerId,
        writer_id: writerId,
        user_id: user.id,
      });

      if (songError) throw songError;

      setMessage('Song created successfully!');
      setTitle('');
      setKhowarLyrics('');
      setEnglishLyrics('');
      setSingerName('');
      setWriterName('');
    } catch (error) {
      console.error('Error creating song:', error.message);
      setMessage('Error creating song: ' + error.message);
    }
  };

  return (
    <div className="create-song-page">
      <h1>Create a New Song</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Song Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Singer Name"
          value={singerName}
          onChange={(e) => setSingerName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Writer Name"
          value={writerName}
          onChange={(e) => setWriterName(e.target.value)}
          required
        />
        <textarea
          className="urdu-lyrics-input"
          placeholder="Khowar Lyrics (Urdu)"
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
        <button type="submit">Create Song</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateSong;
