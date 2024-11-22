// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import MyProfile from './pages/MyProfile';
import CurrentSong from './pages/CurrentSong';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="logo">🎵 My Music App</div>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/my-profile">My Profile</Link>
            <Link to="/current-song">Song Currently Being Played</Link>
          </nav>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/current-song/:id" element={<CurrentSong />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
