import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import './App.css';
import Home from './pages/Home';
import CreateSong from './pages/CreateSong';
import MyProfile from './pages/MyProfilePage';
import CurrentSong from './pages/CurrentSong';
import MySongs from './pages/MySongs'; // Import MySongs

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="app">
        {!session ? (
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
        ) : (
          <>
            <header className="header">
              <div className="logo">🎵 My Music App</div>
              <nav className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/create-song">Create Song</Link>
                <Link to="/my-profile">My Profile</Link> {/* My Profile Link */}
              </nav>
            </header>
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create-song" element={<CreateSong />} />
                <Route path="/my-profile" element={<MyProfile />} />
                <Route path="/song/:id" element={<CurrentSong />} />
                <Route path="/my-songs" element={<MySongs />} /> {/* My Songs Route */}
              </Routes>
            </main>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
