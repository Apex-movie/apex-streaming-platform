
import React, { useEffect, useState } from "react";
import "./FavoriteButton.css";

const API_URL = "https://apex-streaming-backend.onrender.com/api";

export default function FavoriteButton({ movieId }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const checkFavorite = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setChecking(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/movies/favorites/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Could not load favorites.");
        }

        const data = await response.json();

        if (active && Array.isArray(data)) {
          setIsFavorite(
            data.some(
              (item) =>
                String(item.movie?._id) === String(movieId)
            )
          );
        }
      } catch (error) {
        console.error("Favorite status error:", error);
      } finally {
        if (active) setChecking(false);
      }
    };

    checkFavorite();

    return () => {
      active = false;
    };
  }, [movieId]);

  const toggleFavorite = async (event) => {
    event?.stopPropagation();

    const token = localStorage.getItem("token");

    if (!token) {
      window.location.assign("/login");
      return;
    }

    if (loading || checking) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/movies/favorites/${movieId}`,
        {
          method: isFavorite ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to update favorite.");
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Favorite update error:", error);
      window.alert(error.message || "Unable to update favorite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`favorite-button ${isFavorite ? "is-favorite" : ""}`}
      onClick={toggleFavorite}
      disabled={loading || checking}
      aria-label={
        isFavorite ? "Remove from favorites" : "Add to favorites"
      }
      aria-pressed={isFavorite}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <span aria-hidden="true">
        {isFavorite ? "♥" : "♡"}
      </span>
    </button>
  );
}
