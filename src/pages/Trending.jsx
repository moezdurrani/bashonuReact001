import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function Trending() {
  const [topSongs, setTopSongs] = useState([]);
  const [topSingers, setTopSingers] = useState([]);
  const [topWriters, setTopWriters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrendingData = async () => {
    setLoading(true);

    try {
      // Fetch top 5 songs by likes
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('id, title, likes, singers(name), writers(name)')
        .order('likes', { ascending: false })
        .limit(5);

      if (songsError) throw songsError;

      setTopSongs(songsData);

      // Fetch top 5 singers by total likes
      const { data: singersData, error: singersError } = await supabase
        .from('singers')
        .select('id, name, total_likes')
        .order('total_likes', { ascending: false })
        .limit(5);

      if (singersError) throw singersError;

      setTopSingers(singersData);

      // Fetch top 5 writers by total likes
      const { data: writersData, error: writersError } = await supabase
        .from('writers')
        .select('id, name, total_likes')
        .order('total_likes', { ascending: false })
        .limit(5);

      if (writersError) throw writersError;

      setTopWriters(writersData);
    } catch (error) {
      console.error('Error fetching trending data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingData();
  }, []);

  if (loading) return <p>Loading trending data...</p>;

  return (
    <div>
      <h1>Trending</h1>

      {/* Top Songs */}
      <section>
        <h2>Top 5 Songs</h2>
        <ul>
          {topSongs.map((song) => (
            <li key={song.id}>
              <strong>{song.title}</strong> - {song.likes} Likes
              <br />
              <em>Singer:</em> {song.singers?.name || 'Unknown'} | <em>Writer:</em> {song.writers?.name || 'Unknown'}
            </li>
          ))}
        </ul>
      </section>

      {/* Top Singers */}
      <section>
        <h2>Top 5 Singers</h2>
        <ul>
          {topSingers.map((singer) => (
            <li key={singer.id}>
              <strong>{singer.name}</strong> - {singer.total_likes} Total Likes
            </li>
          ))}
        </ul>
      </section>

      {/* Top Writers */}
      <section>
        <h2>Top 5 Writers</h2>
        <ul>
          {topWriters.map((writer) => (
            <li key={writer.id}>
              <strong>{writer.name}</strong> - {writer.total_likes} Total Likes
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Trending;
