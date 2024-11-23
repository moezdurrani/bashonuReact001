import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./CurrentSong.css";

function CurrentSong() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [lyricsType, setLyricsType] = useState("khowar");
  const [editing, setEditing] = useState(false);

  // State for editing form
  const [title, setTitle] = useState("");
  const [khowarLyrics, setKhowarLyrics] = useState("");
  const [englishLyrics, setEnglishLyrics] = useState("");
  const [singer, setSinger] = useState("");
  const [writer, setWriter] = useState("");

  const fetchSong = async () => {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      setUserId(user?.id);

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
          user_id,
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
        setTitle(songData.title);
        setKhowarLyrics(songData.khowar_lyrics);
        setEnglishLyrics(songData.english_lyrics);
        setSinger(songData.singers?.name || "");
        setWriter(songData.writers?.name || "");

        const { data: likeData } = await supabase
          .from("song_likes")
          .select("id")
          .eq("user_id", user?.id)
          .eq("song_id", id)
          .single();

        setLiked(!!likeData);
      }
    } catch (error) {
      console.error("Unexpected error:", error.message);
    }

    setLoading(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    try {
      await supabase
        .from("songs")
        .update({
          title,
          khowar_lyrics: khowarLyrics,
          english_lyrics: englishLyrics,
          singers: { name: singer },
          writers: { name: writer },
        })
        .eq("id", id);

      setSong({
        ...song,
        title,
        khowar_lyrics: khowarLyrics,
        english_lyrics: englishLyrics,
        singers: { name: singer },
        writers: { name: writer },
      });
      setEditing(false); // Exit editing mode
      setMessage("Song updated successfully!");
    } catch (error) {
      setMessage("Error updating song: " + error.message);
    }
  };

  const handleTextareaInput = (event) => {
    const textarea = event.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleLikeToggle = async () => {
    if (!userId) {
      setMessage("You must be logged in to like or unlike a song.");
      return;
    }

    try {
      const updatedLikes = liked
        ? Math.max((song.likes || 1) - 1, 0)
        : (song.likes || 0) + 1;

      if (liked) {
        await supabase
          .from("song_likes")
          .delete()
          .eq("user_id", userId)
          .eq("song_id", id);
      } else {
        await supabase
          .from("song_likes")
          .insert({ user_id: userId, song_id: id });
      }

      await supabase.from("songs").update({ likes: updatedLikes }).eq("id", id);

      setLiked(!liked);
      setSong({ ...song, likes: updatedLikes });
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

      {editing ? (
        <form className="edit-song-form" onSubmit={handleEdit}>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <label htmlFor="singer">Singer:</label>
          <input
            type="text"
            id="singer"
            value={singer}
            onChange={(e) => setSinger(e.target.value)}
            required
          />
          <label htmlFor="writer">Writer:</label>
          <input
            type="text"
            id="writer"
            value={writer}
            onChange={(e) => setWriter(e.target.value)}
            required
          />
          <label htmlFor="khowarLyrics">Khowar Lyrics:</label>
          <textarea
            id="khowarLyrics"
            value={khowarLyrics}
            onChange={(e) => setKhowarLyrics(e.target.value)}
            required
          />
          <label htmlFor="englishLyrics">English Lyrics:</label>
          <textarea
            id="englishLyrics"
            value={englishLyrics}
            onChange={(e) => setEnglishLyrics(e.target.value)}
            required
          />
          <button type="submit">Save Changes</button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
        </form>
      ) : (
        song.user_id === userId && (
          <button onClick={() => setEditing(true)}>Edit Song</button>
        )
      )}

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
          onClick={() => navigate(`/user/${song.user_profiles?.username}`)}
          className="poster-link"
        >
          {song.user_profiles?.username || "Unknown"}
        </span>
      </p>

      <div className="likes-container">
        <i
          className={`fa-heart ${liked ? "fas liked" : "far"}`}
          onClick={handleLikeToggle}
          style={{ cursor: "pointer", fontSize: "1.5rem" }}
        ></i>
        <span>{song.likes || 0}</span>
      </div>

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
