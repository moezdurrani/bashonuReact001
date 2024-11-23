import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./UserSongs.css";

function UserSongs() {
  const { username } = useParams(); // Get the username from the URL
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [error, setError] = useState("");

  const fetchUserSongs = async () => {
    setLoading(true);
    setError(""); // Reset error message

    try {
      // Fetch user data including profile image URL
      const { data: user, error: userError } = await supabase
        .from("user_profiles")
        .select("id, profile_image_url")
        .eq("username", username)
        .single();

      if (userError) {
        console.error("Error fetching user:", userError.message);
        setError("User not found.");
        setSongs([]);
        return;
      }

      // Set the user's profile image URL
      if (user.profile_image_url) {
        const { data: imageUrlData } = supabase.storage
          .from("user-images")
          .getPublicUrl(user.profile_image_url);
        setProfileImageUrl(imageUrlData.publicUrl);
      } else {
        setProfileImageUrl("https://via.placeholder.com/150"); // Default image
      }

      // Fetch songs associated with the user
      const { data: songsData, error: songsError } = await supabase
        .from("songs")
        .select("id, title, singers(name), writers(name)")
        .eq("user_id", user.id);

      if (songsError) {
        console.error("Error fetching songs:", songsError.message);
        setSongs([]);
      } else {
        setSongs(songsData);
      }
    } catch (error) {
      console.error("Unexpected error:", error.message);
      setError("An unexpected error occurred. Please try again later.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUserSongs();
  }, [username]);

  if (loading) return <p>Loading songs...</p>;

  if (error) return <p>{error}</p>;

  if (!songs.length) return <p>No songs found for this user.</p>;

  return (
    <div class="user-songs-page">
      <h1>{username}'s Songs</h1>
      {/* Display user profile image */}
      <img
        src={profileImageUrl || "https://via.placeholder.com/150"}
        alt={`${username}'s Profile`}
        style={{
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          marginBottom: "20px",
        }}
      />
      <ul>
        {songs.map((song) => (
          <li key={song.id}>
            <Link to={`/song/${song.id}`}>
              {song.title} - Singer: {song.singers?.name || "Unknown"}, Writer:{" "}
              {song.writers?.name || "Unknown"}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserSongs;
