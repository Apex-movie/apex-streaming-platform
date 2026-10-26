
import React, { useEffect, useState } from 'react';
import './MovieDetails.css';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedRating, setSelectedRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [ratingMessage, setRatingMessage] = useState('');

  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

  const token = localStorage.getItem('token');

  const isPremiumMovie = (item) =>
    item?.isPremium === true ||
    item?.isPremium === 'true' ||
    item?.isPremium === 1 ||
    item?.isPremium === '1';

  // FETCH MOVIE
  useEffect(() => {
    let mounted = true;

    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_URL}/api/movies`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load movies.');
        }

        if (!Array.isArray(data)) {
          throw new Error('Invalid movie data received.');
        }

        if (!mounted) return;

        setMovies(data);

        const selectedMovie = data.find((item) => item._id === id);

        if (!selectedMovie) {
          setError('Movie not found.');
          setMovie(null);
          return;
        }

        setMovie(selectedMovie);
      } catch (err) {
        console.error('Movie details error:', err);

        if (mounted) {
          setError(err.message || 'Unable to connect to server.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMovies();

    return () => {
      mounted = false;
    };
  }, [id]);

  // CHECK ACTIVE SUBSCRIPTION
  useEffect(() => {
    let mounted = true;

    const checkSubscription = async () => {
      if (!token) {
        setHasSubscription(false);
        return;
      }

      setSubscriptionLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/api/subscriptions/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        const data = await response.json();

        if (!mounted) return;

        // Backend should return isActive: true only for an active plan.
        const active =
          response.ok &&
          (data.isActive === true ||
            data.subscription?.status === 'active') &&
          (!data.subscription?.endDate ||
            new Date(data.subscription.endDate) > new Date());

        setHasSubscription(active);
      } catch (err) {
        console.error('Subscription check error:', err);

        if (mounted) setHasSubscription(false);
      } finally {
        if (mounted) setSubscriptionLoading(false);
      }
    };

    checkSubscription();

    return () => {
      mounted = false;
    };
  }, [token]);

  // FETCH RATINGS
  useEffect(() => {
    let mounted = true;

    const fetchRating = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/ratings/${id}`
        );

        const data = await response.json();

        if (response.ok && mounted) {
          setAverageRating(data.averageRating || 0);
          setTotalRatings(data.totalRatings || 0);
        }
      } catch (err) {
        console.error('Fetch rating error:', err);
      }
    };

    if (id) fetchRating();

    return () => {
      mounted = false;
    };
  }, [id]);

  // PLAY MOVIE
  const handlePlay = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!movie?.videoUrl) {
      setError('Is movie ki video URL available nahi hai.');
      return;
    }

    // Premium movie needs an active subscription.
    if (isPremiumMovie(movie)) {
      if (subscriptionLoading) {
        setError('Subscription check ho raha hai. Please wait.');
        return;
      }

      if (!hasSubscription) {
        navigate('/subscription', {
          state: {
            returnTo: `/movie/${movie._id}`,
            movieTitle: movie.title,
          },
        });
        return;
      }
    }

    const videoSrc = movie.videoUrl.startsWith('http')
      ? movie.videoUrl
      : `${API_URL}${movie.videoUrl.startsWith('/') ? '' : '/'}${movie.videoUrl}`;

    // Open player.
    navigate(`/watch/${movie._id}`, {
      state: {
        videoSrc,
        title: movie.title,
      },
    });

    // Update view count.
    try {
      const response = await fetch(
        `${API_URL}/api/movies/${movie._id}/view`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        setMovie((prev) => ({
          ...prev,
          views: data.views,
        }));
      }
    } catch (err) {
      console.error('View count update failed:', err);
    }
  };

  // SUBMIT RATING
  const handleRating = async (ratingValue) => {
    const authToken = localStorage.getItem('token');

    if (!authToken) {
      navigate('/login');
      return;
    }

    try {
      setSelectedRating(ratingValue);
      setRatingMessage('');

      const response = await fetch(
        `${API_URL}/api/ratings/${movie._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ rating: ratingValue }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setRatingMessage(data.message || 'Failed to submit rating.');
        return;
      }

      setAverageRating(data.averageRating || 0);
      setTotalRatings(data.totalRatings || 0);
      setRatingMessage('Rating submitted successfully!');
    } catch (err) {
      console.error('Rating error:', err);
      setRatingMessage('Unable to submit rating.');
    }
  };

  // RELATED MOVIES
  const relatedMovies = movie
    ? movies.filter(
        (item) =>
          item.category === movie.category &&
          item._id !== movie._id
      )
    : [];

  const handleRelatedMovie = (movieId) => {
    navigate(`/movie/${movieId}`);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <div className="movie-details-page">
        <h1>Loading movie...</h1>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-details-page">
        <h1>Movie Not Found</h1>
        <p>{error}</p>

        <button
          type="button"
          className="details-back-btn"
          onClick={() => navigate('/home')}
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  const premium = isPremiumMovie(movie);

  const getMediaUrl = (path) => {
    if (!path) return '';

    return path.startsWith('http')
      ? path
      : `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <div className="movie-details-page">
      <button
        type="button"
        className="details-back-btn"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* BANNER */}
      <div className="movie-details-image">
        <img
          src={getMediaUrl(movie.bannerUrl || movie.posterUrl)}
          alt={movie.title}
        />

        {premium && (
          <span className="details-premium-badge">
            🔒 APEX PREMIUM
          </span>
        )}
      </div>

      {/* MOVIE DETAILS */}
      <div className="movie-details-content">
        <h1>{movie.title}</h1>

        <div className="movie-meta">
          <span>{movie.year}</span>
          <span>{movie.duration}</span>
          <span>{movie.category}</span>
          <span className={premium ? 'premium-meta' : 'free-meta'}>
            {premium ? '🔒 PREMIUM' : 'FREE'}
          </span>
        </div>

        <p className="movie-details-description">
          {movie.description}
        </p>

        {/* PLAY / SUBSCRIBE */}
        {premium && !hasSubscription ? (
          <div className="premium-access-box">
            <h2>🔒 Apex Premium Movie</h2>
            <p>
              Is movie ko dekhne ke liye active Apex Premium
              subscription chahiye.
            </p>

            <button
              type="button"
              className="movie-premium-btn"
              onClick={() => {
                if (!token) {
                  navigate('/login');
                } else {
                  navigate('/subscription', {
                    state: {
                      returnTo: `/movie/${movie._id}`,
                      movieTitle: movie.title,
                    },
                  });
                }
              }}
            >
              Get Apex Premium
            </button>

            {subscriptionLoading && (
              <p>Subscription status check ho raha hai...</p>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="movie-play-btn"
            onClick={handlePlay}
            disabled={subscriptionLoading}
          >
            {subscriptionLoading ? 'Checking Subscription...' : '▶ Play Movie'}
          </button>
        )}

        {/* RATING */}
        <div className="movie-rating-section">
          <h2>Rate This Movie</h2>

          <div className="rating-buttons">
            {[1, 2, 3, 4, 5].map((ratingValue) => (
              <button
                type="button"
                key={ratingValue}
                className={
                  ratingValue <= selectedRating
                    ? 'rating-star active'
                    : 'rating-star'
                }
                onClick={() => handleRating(ratingValue)}
                aria-label={`Rate ${ratingValue} stars`}
              >
                ★
              </button>
            ))}
          </div>

          <p className="average-rating">
            ⭐ Average Rating:{' '}
            {averageRating > 0
              ? Number(averageRating).toFixed(1)
              : 'No ratings yet'}

            {totalRatings > 0 && ` (${totalRatings} ratings)`}
          </p>

          {ratingMessage && (
            <p className="rating-message">{ratingMessage}</p>
          )}
        </div>

        {/* RELATED MOVIES */}
        {relatedMovies.length > 0 && (
          <section className="related-movies-section">
            <h2>More Like This</h2>

            <div className="related-movies">
              {relatedMovies.map((relatedMovie) => {
                const relatedPremium = isPremiumMovie(relatedMovie);

                return (
                  <div
                    className={`related-movie-card ${
                      relatedPremium ? 'related-premium-card' : ''
                    }`}
                    key={relatedMovie._id}
                    onClick={() => handleRelatedMovie(relatedMovie._id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter' ||
                        event.key === ' '
                      ) {
                        event.preventDefault();
                        handleRelatedMovie(relatedMovie._id);
                      }
                    }}
                  >
                    <div className="related-poster-wrapper">
                      <img
                        src={getMediaUrl(relatedMovie.posterUrl)}
                        alt={relatedMovie.title}
                        loading="lazy"
                      />

                      {relatedPremium && (
                        <span className="related-premium-badge">
                          🔒 PREMIUM
                        </span>
                      )}
                    </div>

                    <div className="related-movie-info">
                      <h3>{relatedMovie.title}</h3>
                      <div className="related-movie-meta">
                        <span>{relatedMovie.year}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
