
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FavoriteButton from "../../components/FavoriteButton/FavoriteButton";
import "./Favorites.css";

const API_URL = "http://localhost:5000";

export default function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFavorites = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/movies/favorites/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load your favorite movies.");
      }

      const data = await response.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const getPosterUrl = (posterUrl) => {
    if (!posterUrl) return "";

    if (
      posterUrl.startsWith("http://") ||
      posterUrl.startsWith("https://")
    ) {
      return posterUrl;
    }

    return `${API_URL}${posterUrl.startsWith("/") ? "" : "/"}${posterUrl}`;
  };

  return (
    <main className="favorites-page">
      <div className="favorites-container">

        {/* Top Navigation */}
        <nav className="favorites-topbar">
          <button
            type="button"
            className="favorites-home-button"
            onClick={() => navigate("/home")}
          >
            <span aria-hidden="true">⌂</span>
            <span>Home</span>
          </button>

          <div className="favorites-brand">
            <span className="favorites-brand-icon">A</span>
            <span>APEX</span>
          </div>

          <span className="favorites-nav-label">
            MY COLLECTION
          </span>
        </nav>

        {/* Page Header */}
        <header className="favorites-header">
          <p className="favorites-eyebrow">YOUR COLLECTION</p>

          <h1 className="favorites-title">
            <span className="favorites-title-icon" aria-hidden="true">
              ♥
            </span>
            Favorite Movies
          </h1>

          <p className="favorites-description">
            Your favorite movies, all in one place.
          </p>

          {!loading && !error && favorites.length > 0 && (
            <span className="favorites-count">
              {favorites.length}{" "}
              {favorites.length === 1 ? "MOVIE" : "MOVIES"}
            </span>
          )}
        </header>

        {/* Loading */}
        {loading && (
          <div className="favorites-status">
            <span className="favorites-spinner" />
            <p>Loading your collection...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="favorites-empty">
            <div className="favorites-empty-heart">!</div>
            <h2>Couldn't load favorites</h2>
            <p>{error}</p>

            <button
              type="button"
              className="favorites-action"
              onClick={loadFavorites}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty Collection */}
        {!loading && !error && favorites.length === 0 && (
          <div className="favorites-empty">
            <div className="favorites-empty-heart" aria-hidden="true">
              ♡
            </div>

            <h2>Your collection is waiting</h2>

            <p>
              Tap the heart on any movie and it will appear here.
            </p>

            <button
              type="button"
              className="favorites-action"
              onClick={() => navigate("/home")}
            >
              Browse Movies
            </button>
          </div>
        )}

        {/* Movie Grid */}
        {!loading && !error && favorites.length > 0 && (
          <section className="favorites-grid">
            {favorites.map((item) => {
              const movie = item.movie;

              if (!movie || typeof movie !== "object") return null;

              return (
                <article className="favorite-card" key={item._id}>
                  <button
                    type="button"
                    className="favorite-card-poster"
                    onClick={() => navigate(`/movie/${movie._id}`)}
                    aria-label={`View ${movie.title}`}
                  >
                    {movie.posterUrl ? (
                      <img
                        src={getPosterUrl(movie.posterUrl)}
                        alt={`${movie.title} poster`}
                        loading="lazy"
                      />
                    ) : (
                      <span className="favorite-poster-placeholder">
                        {movie.title}
                      </span>
                    )}

                    <span className="favorite-poster-overlay">
                      View Movie
                    </span>
                  </button>

                  <div className="favorite-card-info">
                    <div className="favorite-card-title-row">
                      <h2>{movie.title}</h2>
                      <FavoriteButton movieId={movie._id} />
                    </div>

                    <p className="favorite-card-meta">
                      {movie.year || "Year unavailable"}
                      {movie.category ? ` · ${movie.category}` : ""}
                    </p>

                    <button
                      type="button"
                      className="favorite-watch-button"
                      onClick={() => navigate(`/watch/${movie._id}`)}
                    >
                      <span aria-hidden="true">▶</span>
                      Watch Again
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Bottom Navigation */}
        {!loading && favorites.length > 0 && (
          <div className="favorites-bottom">
            <button
              type="button"
              className="favorites-back-button"
              onClick={() => navigate("/home")}
            >
              ← Back to Home
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
