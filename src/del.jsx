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
import Trending from './pages/Trending';
import logoImage from './assets/bashonu1.png'; // Import the logo image

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
          {/* Replace text logo with an image */}
          <Link to="/">
            <img
              src={logoImage}
              alt="My Music App Logo"
              style={{ height: '50px', objectFit: 'contain' }} // Adjust the styles as needed
            />
          </Link>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/trending">Trending</Link>
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
            <Route path="/trending" element={<Trending />} />
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
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./CurrentSong.css";

function CurrentSong() {
  const { id } = useParams(); // Get the song ID from the URL
  const navigate = useNavigate(); // Add navigate hook
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [lyricsType, setLyricsType] = useState("khowar"); // Default to Khowar lyrics

  const fetchSong = async () => {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      setUserId(user?.id);

      // Fetch song details with proper relationships
      const { data: songData, error } = await supabase
        .from("songs")
        .select(
          `
          id,
          title,
          khowar_lyrics,
          english_lyrics,
          likes,
          comments,
          singers(name),
          writers(name),
          user_profiles(username)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching song:", error.message);
        setSong(null);
      } else {
        setSong(songData);

        // Check if the user has already liked the song
        const { data: likeData } = await supabase
          .from("song_likes")
          .select("id")
          .eq("user_id", user?.id)
          .eq("song_id", id)
          .single();

        setLiked(!!likeData); // Set liked to true if likeData exists
      }
    } catch (error) {
      console.error("Unexpected error:", error.message);
    }

    setLoading(false);
  };

  const handleTextareaInput = (event) => {
    const textarea = event.target;
    textarea.style.height = "auto"; // Reset height to auto to calculate the correct scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scrollHeight
  };

  const handleLikeToggle = async () => {
    if (!userId) {
      setMessage("You must be logged in to like or unlike a song.");
      return;
    }

    try {
      if (liked) {
        // Unlike the song
        const { error: deleteError } = await supabase
          .from("song_likes")
          .delete()
          .eq("user_id", userId)
          .eq("song_id", id);

        if (deleteError) {
          throw deleteError;
        }

        // Decrement the song's like count
        const updatedLikes = Math.max((song.likes || 1) - 1, 0);
        const { error: updateError } = await supabase
          .from("songs")
          .update({ likes: updatedLikes })
          .eq("id", id);

        if (updateError) {
          throw updateError;
        }

        setLiked(false);
        setSong({ ...song, likes: updatedLikes });
      } else {
        // Like the song
        const { error: insertError } = await supabase
          .from("song_likes")
          .insert({ user_id: userId, song_id: id });

        if (insertError) {
          if (insertError.message.includes("duplicate key value")) {
            setMessage("You have already liked this song.");
            return;
          }
          throw insertError;
        }

        // Increment the song's like count
        const updatedLikes = (song.likes || 0) + 1;
        const { error: updateError } = await supabase
          .from("songs")
          .update({ likes: updatedLikes })
          .eq("id", id);

        if (updateError) {
          throw updateError;
        }

        setLiked(true);
        setSong({ ...song, likes: updatedLikes });
      }
    } catch (error) {
      setMessage("Error updating like status: " + error.message);
    }
  };

  const handleAddComment = async () => {
    if (!userId) {
      setMessage("You must be logged in to add a comment.");
      return;
    }

    if (!comment.trim()) {
      setMessage("Comment cannot be empty.");
      return;
    }

    try {
      const updatedComments = [...(song.comments || []), comment];
      const { error } = await supabase
        .from("songs")
        .update({ comments: updatedComments })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setSong({ ...song, comments: updatedComments });
      setComment("");
      setMessage("Comment added successfully!");
    } catch (error) {
      setMessage("Error adding comment: " + error.message);
    }
  };

  useEffect(() => {
    fetchSong();
  }, [id]);

  if (loading) return <p>Loading song details...</p>;

  if (!song) return <p>Song not found.</p>;

  return (
    <div className="current-song-page">
      <h1>{song.title}</h1>

      {/* Lyrics Toggle Buttons */}
      <div className="lyrics-toggle-buttons">
        <button
          onClick={() => setLyricsType("khowar")}
          className={lyricsType === "khowar" ? "active" : ""}
        >
          Khowar Lyrics
        </button>
        <button
          onClick={() => setLyricsType("english")}
          className={lyricsType === "english" ? "active" : ""}
        >
          English Lyrics
        </button>
      </div>

      {/* Display Lyrics Based on Selection */}
      <div className="lyrics-section">
        {lyricsType === "khowar" && (
          <div className="lyrics khowar-lyrics">
            <pre style={{ fontFamily: "Noto Nastaliq Urdu, serif" }}>
              {song.khowar_lyrics}
            </pre>
          </div>
        )}
        {lyricsType === "english" && (
          <div className="lyrics english-lyrics">
            <pre>{song.english_lyrics}</pre>
          </div>
        )}
      </div>

      <p>
        <strong>Singer:</strong> {song.singers?.name || "Unknown"}
      </p>
      <p>
        <strong>Writer:</strong> {song.writers?.name || "Unknown"}
      </p>
      <p>
        <strong>Posted by:</strong>{" "}
        <span
          onClick={() =>
            song?.user_profiles?.username
              ? navigate(`/user/${song.user_profiles.username}`)
              : console.log("Username not found")
          }
          className="poster-link"
        >
          {song.user_profiles?.username || "Unknown"}
        </span>
      </p>

      {/* Other Details */}
      {/* Other Details */}
      <div className="song-details">
        {/* Likes Section */}
        {/* Likes Section */}
        <div className="likes-container">
          <i
            className={`fa-heart ${liked ? "fas liked" : "far"}`}
            onClick={handleLikeToggle}
            style={{ cursor: "pointer", fontSize: "1.5rem" }}
          ></i>
          <span className="likes-count">{song.likes || 0}</span>
        </div>
      </div>

      {/* Comment Section */}
      <div>
        <h2>Comments</h2>
        <ul>
          {song.comments?.map((c, index) => (
            <li
              key={index}
              style={{
                backgroundColor: "rgb(242, 242, 242)",
                padding: "1rem",
                borderRadius: "8px",
                color: "#494949",
                marginBottom: "0.8rem",
              }}
            >
              {c}
            </li>
          ))}
        </ul>

        <textarea
          placeholder="Add a comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onInput={handleTextareaInput} // Add dynamic height adjustment
        />

        <button onClick={handleAddComment}>Add Comment</button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
}

export default CurrentSong;
