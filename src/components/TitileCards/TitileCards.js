
import React, { useEffect, useState } from 'react';
import './TitileCards.css';
import { useNavigate } from 'react-router-dom';
import FavoriteButton from '../FavoriteButton/FavoriteButton';

const API = 'https://apex-streaming-backend.onrender.com/api';

const TitileCards = ({ title, searchQuery }) => {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [movieRatings, setMovieRatings] = useState({});
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch movies
        const response = await fetch(`${API}/movies`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load movies');
        }

        if (!Array.isArray(data)) {
          throw new Error('Invalid movie list received from the server.');
        }

        if (!isMounted) return;
        setMovies(data);

        // Check active subscription
        if (token) {
          try {
            const subResponse = await fetch(`${API}/subscriptions/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
            });

            if (subResponse.ok) {
              const subData = await subResponse.json();
              const sub = subData.subscription;

              const validEndDate =
                sub?.endDate &&
                new Date(sub.endDate).getTime() > Date.now();

              const active =
                subData.isActive === true ||
                (sub?.status === 'active' && validEndDate);

              if (isMounted) {
                setHasActiveSubscription(Boolean(active));
              }
            }
          } catch (subError) {
            console.error('Subscription check error:', subError);
          }
        }

        // Fetch ratings
        const ratings = {};

        await Promise.all(
          data.map(async (movie) => {
            try {
              const ratingResponse = await fetch(
                `${API}/ratings/${movie._id}`
              );

              if (!ratingResponse.ok) return;

              const ratingData = await ratingResponse.json();

              ratings[movie._id] = {
                averageRating: ratingData.averageRating || 0,
                totalRatings: ratingData.totalRatings || 0,
              };
            } catch (ratingError) {
              console.error(
                `Rating fetch error for ${movie.title}:`,
                ratingError
              );
            }
          })
        );

        if (isMounted) {
          setMovieRatings(ratings);
        }
      } catch (fetchError) {
        console.error('Fetch movies error:', fetchError);

        if (isMounted) {
          setError(
            fetchError.message || 'Unable to connect to server.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryMap = {
    'Blockbuster Movies': 'Blockbuster Movies',
    'Trending Now': 'Trending Now',
    'Action Movies': 'Action Movies',
    Comedies: 'Comedies',
    'Horror Movies': 'Horror Movies',
    'Romance Movies': 'Romance Movies',
    Documentaries: 'Documentaries',
  };

  const query = (searchQuery || '').trim().toLowerCase();

  let filteredMovies = movies;

  if (query) {
    filteredMovies = movies.filter((movie) =>
      (movie.title || '').toLowerCase().includes(query)
    );
  } else if (title && categoryMap[title]) {
    filteredMovies = movies.filter(
      (movie) => movie.category === categoryMap[title]
    );
  }

  const isPremiumMovie = (movie) =>
    movie.isPremium === true ||
    movie.isPremium === 'true' ||
    movie.isPremium === 1 ||
    movie.isPremium === '1';

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handleKeyDown = (event, movieId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleMovieClick(movieId);
    }
  };

  return (
    <section className="title-section">
      <h2 className="title-section-heading">
        {query
          ? `Search Results for "${searchQuery}"`
          : title || 'Popular on Apex'}
      </h2>

      {loading && (
        <p className="movies-message">Loading movies...</p>
      )}

      {!loading && error && (
        <p className="movies-message error">{error}</p>
      )}

      {!loading && !error && (
        <div className="title-cards">
          {filteredMovies.length === 0 ? (
            <p className="movies-message">
              {query
                ? 'No movies found.'
                : 'No movies available in this category.'}
            </p>
          ) : (
            filteredMovies.map((movie) => {
              const rating = movieRatings[movie._id];
              const premium = isPremiumMovie(movie);
              const locked = premium && !hasActiveSubscription;

              return (
                <article
                  key={movie._id}
                  className={`card ${
                    premium ? 'premium-card' : 'free-card'
                  }`}
                  onClick={() => handleMovieClick(movie._id)}
                  onKeyDown={(event) =>
                    handleKeyDown(event, movie._id)
                  }
                  role="button"
                  tabIndex={0}
                  aria-label={`${movie.title || 'Movie'}${
                    locked
                      ? ', Premium locked'
                      : ', Play available'
                  }`}
                >
                  <div className="card-poster-wrapper">
                    <img
                      src={
                        movie.posterUrl
                          ? movie.posterUrl.startsWith('http')
                            ? movie.posterUrl
                            : `https://apex-streaming-backend.onrender.com${
                                movie.posterUrl.startsWith('/')
                                  ? ''
                                  : '/'
                              }${movie.posterUrl}`
                          : '/placeholder.png'
                      }
                      alt={movie.title || 'Movie poster'}
                      loading="lazy"
                    />

                    {/* FAVORITE HEART BUTTON */}
                    <FavoriteButton movieId={movie._id} />

                    {locked && (
                      <span className="premium-badge">
                        🔒 PREMIUM
                      </span>
                    )}

                    {!premium && (
                      <span className="free-badge">FREE</span>
                    )}

                    {premium && hasActiveSubscription && (
                      <span className="premium-badge premium-unlocked">
                        ✓ PREMIUM UNLOCKED
                      </span>
                    )}
                  </div>

                  <div className="card-content">
                    <h3>{movie.title || 'Untitled Movie'}</h3>

                    <p className="card-description">
                      {movie.description ||
                        'No description available.'}
                    </p>

                    <div className="card-rating">
                      ⭐{' '}
                      {rating && rating.averageRating > 0
                        ? Number(rating.averageRating).toFixed(1)
                        : 'No ratings'}

                      {rating && rating.totalRatings > 0 && (
                        <span className="rating-count">
                          {' '}({rating.totalRatings})
                        </span>
                      )}
                    </div>

                    {locked ? (
                      <div className="premium-card-label">
                        <span>SUBSCRIBE TO WATCH</span>
                        <span aria-hidden="true">🔒</span>
                      </div>
                    ) : (
                      <div className="premium-card-label unlocked-label">
                        <span>▶ PLAY AVAILABLE</span>
                        <span aria-hidden="true">✓</span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}
    </section>
  );
};

export default TitileCards;
