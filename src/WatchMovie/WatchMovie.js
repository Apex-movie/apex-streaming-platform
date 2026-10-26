
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./WatchMovie.css";

const API_URL = "http://localhost:5000";
const API = `${API_URL}/api`;

function WatchMovie() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentMovie, setCurrentMovie] = useState(null);

  // Prevent duplicate history requests for the same movie playback.
  const historyRequestRef = useRef({
    movieId: null,
    saved: false,
    pending: false,
  });

  const routeTitle = location.state?.title;
  const routeVideoSrc = location.state?.videoSrc;

  // Load movies and find the selected movie.
  useEffect(() => {
    let active = true;

    const fetchMovies = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(`${API}/movies`);
        const data = await response.json();

        if (!response.ok || !Array.isArray(data)) {
          throw new Error("Unable to load movies.");
        }

        if (!active) return;

        setMovies(data);

        const selected = data.find(
          (movie) => String(movie._id) === String(id)
        );

        if (selected) {
          setCurrentMovie(selected);
        } else {
          setCurrentMovie({
            _id: id,
            title: routeTitle || "Now Playing",
            videoUrl: routeVideoSrc || "",
          });
        }
      } catch (error) {
        console.error("Watch page error:", error);

        if (active) {
          setLoadError(
            error.message || "Unable to connect to the server."
          );

          if (routeVideoSrc) {
            setCurrentMovie({
              _id: id,
              title: routeTitle || "Now Playing",
              videoUrl: routeVideoSrc,
            });
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMovies();

    return () => {
      active = false;
    };
  }, [id, routeTitle, routeVideoSrc]);

  // Reset the playback-history guard when the movie changes.
  useEffect(() => {
    historyRequestRef.current = {
      movieId: id,
      saved: false,
      pending: false,
    };
  }, [id]);

  // Save watch history when the video actually starts playing.
  const handlePlaybackStart = async () => {
    if (!id) return;

    const currentRequest = historyRequestRef.current;

    if (
      currentRequest.movieId === id &&
      (currentRequest.saved || currentRequest.pending)
    ) {
      return;
    }

    const token = localStorage.getItem("token");

    // History is saved for logged-in users only.
    if (!token) return;

    historyRequestRef.current = {
      movieId: id,
      saved: false,
      pending: true,
    };

    try {
      const response = await fetch(`${API}/movies/${id}/view`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Unable to save watch history (${response.status}).`
        );
      }

      historyRequestRef.current = {
        movieId: id,
        saved: true,
        pending: false,
      };

      console.info("Watch history saved successfully.");
    } catch (error) {
      historyRequestRef.current = {
        movieId: id,
        saved: false,
        pending: false,
      };

      console.error("Watch history save error:", error);
    }
  };

  const getMediaUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const videoSrc =
    routeVideoSrc || getMediaUrl(currentMovie?.videoUrl);

  const currentIsPremium =
    currentMovie?.isPremium === true ||
    currentMovie?.isPremium === "true" ||
    currentMovie?.isPremium === 1 ||
    currentMovie?.isPremium === "1";

  const recommendedMovies = movies
    .filter((movie) => String(movie._id) !== String(id) && movie.posterUrl)
    .sort((a, b) => {
      if (
        a.category === currentMovie?.category &&
        b.category !== currentMovie?.category
      ) {
        return -1;
      }

      if (
        b.category === currentMovie?.category &&
        a.category !== currentMovie?.category
      ) {
        return 1;
      }

      return 0;
    });

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="watch-page">
      <header className="watch-header">
        <button
          type="button"
          className="watch-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ←
        </button>

        <button
          type="button"
          className="watch-brand"
          onClick={() => navigate("/")}
          aria-label="Apex home"
        >
          <span className="watch-brand-icon">A</span>
          <span>APEX</span>
        </button>

        <span className="watch-live-label">
          <span className="watch-live-dot" />
          NOW PLAYING
        </span>
      </header>

      <main className="watch-main">
        <div className="watch-heading">
          <p className="watch-eyebrow">APEX CINEMA</p>
          <h1>{currentMovie?.title || routeTitle || "Now Playing"}</h1>

          <div className="watch-movie-meta">
            {currentMovie?.year && <span>{currentMovie.year}</span>}
            {currentMovie?.category && <span>{currentMovie.category}</span>}
            {currentMovie?.duration && <span>{currentMovie.duration}</span>}

            {currentIsPremium && (
              <span className="watch-premium-tag">🔒 PREMIUM</span>
            )}
          </div>
        </div>

        <section className="watch-player-card">
          {videoSrc ? (
            <video
              key={videoSrc}
              className="watch-video"
              src={videoSrc}
              controls
              autoPlay
              playsInline
              preload="metadata"
              onPlay={handlePlaybackStart}
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <div className="watch-error">
              <div className="watch-error-icon">▶</div>
              <h2>Video unavailable</h2>
              <p>
                {loading
                  ? "Loading movie..."
                  : "No video link was found. Return to the movie page and try again."}
              </p>

              <button
                type="button"
                className="watch-home-btn"
                onClick={() => navigate("/home")}
              >
                Back to Home
              </button>
            </div>
          )}
        </section>

        {loadError && (
          <p className="watch-load-message">
            Unable to load movie details: {loadError}
          </p>
        )}

        {currentMovie?.description && (
          <section className="watch-description">
            <h2>About this movie</h2>
            <p>{currentMovie.description}</p>
          </section>
        )}

        <section className="watch-recommendations">
          <div className="watch-section-heading">
            <div>
              <p className="watch-eyebrow">KEEP EXPLORING</p>
              <h2>More Like This</h2>
            </div>

            <button
              type="button"
              className="watch-view-all"
              onClick={() => navigate("/home")}
            >
              View all <span>→</span>
            </button>
          </div>

          {loading ? (
            <p className="watch-muted">Loading movies...</p>
          ) : recommendedMovies.length === 0 ? (
            <p className="watch-muted">
              No other movies are available right now.
            </p>
          ) : (
            <div className="watch-movie-grid">
              {recommendedMovies.map((movie) => {
                const premium =
                  movie.isPremium === true ||
                  movie.isPremium === "true" ||
                  movie.isPremium === 1 ||
                  movie.isPremium === "1";

                return (
                  <button
                    type="button"
                    className="watch-movie-card"
                    key={movie._id}
                    onClick={() => handleMovieClick(movie._id)}
                  >
                    <div className="watch-poster-wrap">
                      <img
                        src={getMediaUrl(movie.posterUrl)}
                        alt={movie.title || "Movie poster"}
                        loading="lazy"
                      />

                      {premium && (
                        <span className="watch-card-premium">
                          🔒 PREMIUM
                        </span>
                      )}

                      <span className="watch-card-play">▶</span>
                    </div>

                    <div className="watch-card-info">
                      <h3>{movie.title}</h3>
                      <div className="watch-card-meta">
                        {movie.year && <span>{movie.year}</span>}
                        {movie.category && <span>{movie.category}</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <footer className="watch-bottom">
          <div className="watch-bottom-mark">
            <span className="watch-bottom-icon">A</span>
            <div>
              <strong>APEX ORIGINAL EXPERIENCE</strong>
              <p>Made for movie lovers.</p>
            </div>
          </div>

          <button
            type="button"
            className="watch-home-link"
            onClick={() => navigate("/home")}
          >
            Explore more movies <span>→</span>
          </button>
        </footer>
      </main>
    </div>
  );
}

export default WatchMovie;
