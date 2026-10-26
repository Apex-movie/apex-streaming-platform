
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WatchHistory.css";

const API_URL = "http://localhost:5000";

const WatchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/movies/history/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Unable to load your watch history. Please try again later."
          );
        }

        const data = await response.json();

        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err.message ||
            "Something went wrong while loading your watch history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const getPosterUrl = (posterUrl) => {
    if (!posterUrl) {
      return "";
    }

    if (
      posterUrl.startsWith("http://") ||
      posterUrl.startsWith("https://")
    ) {
      return posterUrl;
    }

    return `${API_URL}${
      posterUrl.startsWith("/") ? "" : "/"
    }${posterUrl}`;
  };

  const handlePosterError = (event) => {
    event.currentTarget.style.visibility = "hidden";
  };

  if (loading) {
    return (
      <div className="watch-history-page">
        <p className="history-status">
          Loading your watch history...
        </p>
      </div>
    );
  }

  return (
    <div className="watch-history-page">
      <div className="watch-history-header">
        <h1>Watch History</h1>
        <p>All the movies you have watched, in one place.</p>
      </div>

      {error && (
        <div className="history-error" role="alert">
          <p>{error}</p>

          <button
            className="history-browse-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}

      {!error && history.length === 0 && (
        <div className="history-empty">
          <h2>Your Watch History Is Empty</h2>
          <p>
            The movies you watch will appear here.
          </p>

          <button
            onClick={() => navigate("/")}
            className="history-browse-btn"
          >
            Browse Movies
          </button>
        </div>
      )}

      {!error && history.length > 0 && (
        <div className="history-grid">
          {history.map((item) => {
            const movie = item.movie;

            if (!movie) {
              return null;
            }

            return (
              <article
                className="history-card"
                key={item._id}
                onClick={() =>
                  navigate(`/movie/${movie._id}`)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();
                    navigate(`/movie/${movie._id}`);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${movie.title}`}
              >
                {movie.posterUrl ? (
                  <img
                    src={getPosterUrl(movie.posterUrl)}
                    alt={`${movie.title} poster`}
                    className="history-poster"
                    onError={handlePosterError}
                  />
                ) : (
                  <div className="history-poster history-poster-placeholder">
                    <span>{movie.title}</span>
                  </div>
                )}

                <div className="history-card-info">
                  <h3>{movie.title}</h3>

                  <p>
                    {movie.year || "Year unavailable"}
                    {" • "}
                    {movie.duration || "Duration unavailable"}
                  </p>

                  <p className="history-watched-date">
                    Last watched:{" "}
                    {item.watchedAt
                      ? new Date(item.watchedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : "Date unavailable"}
                  </p>

                  <button
                    type="button"
                    className="history-watch-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/watch/${movie._id}`);
                    }}
                  >
                    ▶ Watch Again
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WatchHistory;
