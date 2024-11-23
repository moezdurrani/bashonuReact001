import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { supabase } from "./supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import "./App.css";
import Home from "./pages/Home";
import MyProfile from "./pages/MyProfilePage";
import CurrentSong from "./pages/CurrentSong";
import CreateSong from "./pages/CreateSong";
import MySongs from "./pages/MySongs";
import About from "./pages/About";
import Contact from "./pages/Contact";
import UserSongs from "./pages/UserSongs";
import Trending from "./pages/Trending";
import logoImage from "./assets/bashonu1.png";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation(); // Get the current path

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const isActive = (path) => location.pathname === path; // Check if the path matches the current route

  return (
    <header className="header">
      <div className="logo">
        <img src={logoImage} alt="Logo" />
      </div>
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
      <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className={isActive("/") ? "active" : ""}
        >
          Home
        </Link>
        <Link
          to="/trending"
          onClick={() => setMenuOpen(false)}
          className={isActive("/trending") ? "active" : ""}
        >
          Trending
        </Link>
        <Link
          to="/about"
          onClick={() => setMenuOpen(false)}
          className={isActive("/about") ? "active" : ""}
        >
          About
        </Link>
        <Link
          to="/my-profile"
          onClick={() => setMenuOpen(false)}
          className={isActive("/my-profile") ? "active" : ""}
        >
          My Profile
        </Link>
      </nav>
    </header>
  );
}

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
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
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/user/:username" element={<UserSongs />} />
            <Route path="/trending" element={<Trending />} />
            <Route
              path="/my-profile"
              element={<MyProfile session={session} />}
            />
            <Route
              path="/song/:id"
              element={<CurrentSong session={session} />}
            />
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
