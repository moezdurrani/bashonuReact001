import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function MyProfile() {
  const [user, setUser] = useState(null); // User information
  const [songs, setSongs] = useState([]); // User's songs
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfileAndSongs = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);

        // Fetch the user's songs
        const { data: userSongs, error } = await supabase
          .from('songs')
          .select(`
            id, 
            title, 
            khowar_lyrics, 
            english_lyrics, 
            singers(name), 
            writers(name)
          `)
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error fetching user songs:', error);
        } else {
          setSongs(userSongs);
        }
      }
      setLoading(false);
    };

    fetchProfileAndSongs();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage('Error logging out: ' + error.message);
    } else {
      window.location.reload(); // Reload the page to reset the app state
    }
  };

  if (loading) return <p>Loading profile and songs...</p>;

  return (
    <div>
      <h1>My Profile</h1>

      {/* User Profile Information */}
      {user ? (
        <div>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>
          <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px 20px' }}>
            Logout
          </button>
        </div>
      ) : (
        <p>No user is logged in.</p>
      )}

      <hr />

      {/* User's Songs */}
      <h2>My Songs</h2>
      {songs.length > 0 ? (
        <ul>
          {songs.map((song) => (
            <li key={song.id}>
              <h3>{song.title}</h3>
              <p><strong>Singer:</strong> {song.singers?.name || 'Unknown'}</p>
              <p><strong>Writer:</strong> {song.writers?.name || 'Unknown'}</p>
              <p><strong>Khowar Lyrics:</strong> {song.khowar_lyrics}</p>
              <p><strong>English Lyrics:</strong> {song.english_lyrics}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't uploaded any songs yet.</p>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}

export default MyProfile;
