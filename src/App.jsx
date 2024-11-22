import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import './App.css';
import Home from './pages/Home';
import MyProfile from './pages/MyProfilePage';
import CurrentSong from './pages/CurrentSong';
import CreateSong from './pages/CreateSong';
import MySongs from './pages/MySongs';
import About from './pages/About';
import Contact from './pages/Contact';
import UserSongs from './pages/UserSongs';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    fetchSession();

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
        <header className="header">
          <div className="logo">🎵 My Music App</div>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/my-profile">My Profile</Link>
          </nav>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/user/:username" element={<UserSongs />} />
            <Route
              path="/my-profile"
              element={<MyProfile session={session} />}
            />
            <Route path="/song/:id" element={<CurrentSong session={session} />} />
            <Route
              path="/create-song"
              element={session ? <CreateSong session={session} /> : <Home />}
            />
            <Route
              path="/my-songs"
              element={session ? <MySongs session={session} /> : <Home />}
            />
            <Route path="/user/:username" element={<UserSongs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
