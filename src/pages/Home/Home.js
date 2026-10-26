
import React, { useEffect, useState } from 'react';
import './Home.css';
import Navbar from '../../components/Navbar/Navbar';
import hero_image from '../../assets/hero_image.png';
import TitileCards from '../../components/TitileCards/TitileCards';
import Footer from '../../components/Footer/Footer';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search') || '';

  const [trendingMovies, setTrendingMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [watchHistory, setWatchHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const isLoggedIn = Boolean(localStorage.getItem('token'));

  // FETCH TRENDING MOVIES
  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        const response = await fetch(`${API}/movies`);
        const data = await response.json();

        if (!response.ok || !Array.isArray(data)) {
          return;
        }

        const trending = data.filter(
          (movie) => movie.category === 'Trending Now'
        );

        setTrendingMovies(trending);
      } catch (error) {
        console.error('Fetch trending movies error:', error);
      }
    };

    fetchTrendingMovies();
  }, []);

  // FETCH WATCH HISTORY
  useEffect(() => {
    let isMounted = true;

    const fetchWatchHistory = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setWatchHistory([]);
        setHistoryLoading(false);
        return;
      }

      setHistoryLoading(true);

      try {
        const response = await fetch(`${API}/movies/history/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load watch history.');
        }

        const data = await response.json();

        if (isMounted) {
          setWatchHistory(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Watch history error:', error);
      } finally {
        if (isMounted) {
          setHistoryLoading(false);
        }
      }
    };

    fetchWatchHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  // AUTO SLIDER
  useEffect(() => {
    if (trendingMovies.length <= 1) {
      setCurrentIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingMovies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [trendingMovies]);

  // SEARCH
  const handleSearch = (event) => {
    const value = event.target.value;

    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  // PREVIOUS SLIDE
  const handlePrevious = () => {
    if (!trendingMovies.length) return;

    setCurrentIndex((prev) =>
      prev === 0 ? trendingMovies.length - 1 : prev - 1
    );
  };

  // NEXT SLIDE
  const handleNext = () => {
    if (!trendingMovies.length) return;

    setCurrentIndex((prev) => (prev + 1) % trendingMovies.length);
  };

  // OPEN MOVIE DETAILS
  const handleMovieClick = () => {
    const movie = trendingMovies[currentIndex];

    if (movie) {
      navigate(`/movie/${movie._id}`);
    }
  };

  // OPEN USER SUPPORT MESSAGES
  const handleMessagesClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    navigate('/messages');
  };

  // NORMALIZE POSTER URL
  const getPosterUrl = (posterUrl) => {
    if (!posterUrl) return '/placeholder.png';

    if (posterUrl.startsWith('http')) {
      return posterUrl;
    }

    return `http://localhost:5000${
      posterUrl.startsWith('/') ? '' : '/'
    }${posterUrl}`;
  };

  const currentMovie = trendingMovies[currentIndex];

  return (
    <div className="home">
      <Navbar />

      {/* HERO */}
      <div className="hero">
        <img
          src={hero_image}
          alt="Apex featured banner"
          className="banner-image"
        />

        {currentMovie && currentMovie.bannerUrl && (
          <img
            src={
              currentMovie.bannerUrl.startsWith('http')
                ? currentMovie.bannerUrl
                : `http://localhost:5000${
                    currentMovie.bannerUrl.startsWith('/') ? '' : '/'
                  }${currentMovie.bannerUrl}`
            }
            alt={currentMovie.title || 'Featured movie'}
            className="trending-banner"
          />
        )}

        {currentMovie ? (
          <div className="hero-content">
            <h1 className="movie-title">{currentMovie.title}</h1>

            <div className="movie-meta">
              {currentMovie.year && <span>{currentMovie.year}</span>}
              {currentMovie.year && currentMovie.duration && <span>•</span>}
              {currentMovie.duration && <span>{currentMovie.duration}</span>}
            </div>

            <p className="hero-description">
              {currentMovie.description}
            </p>

            <div className="hero-buttons">
              <button
                type="button"
                className="play-button"
                onClick={handleMovieClick}
              >
                ▶ Play
              </button>

              <button
                type="button"
                className="info-button"
                onClick={handleMovieClick}
              >
                ⓘ More Info
              </button>
            </div>
          </div>
        ) : (
          <div className="hero-content">
            <h1 className="movie-title">Welcome to Apex</h1>
            <p className="hero-description">
              Discover movies and find your next favorite story.
            </p>
          </div>
        )}

        {trendingMovies.length > 1 && (
          <>
            <button
              type="button"
              className="hero-arrow hero-left"
              onClick={handlePrevious}
              aria-label="Previous featured movie"
            >
              ❮
            </button>

            <button
              type="button"
              className="hero-arrow hero-right"
              onClick={handleNext}
              aria-label="Next featured movie"
            >
              ❯
            </button>

            <div className="hero-dots">
              {trendingMovies.map((movie, index) => (
                <button
                  type="button"
                  key={movie._id || index}
                  className={
                    index === currentIndex
                      ? 'hero-dot active'
                      : 'hero-dot'
                  }
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Show featured movie ${index + 1}`}
                  aria-current={index === currentIndex ? 'true' : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* SEARCH */}
      <div className="home-search">
        <input
          type="text"
          placeholder="🔍 Search movies..."
          aria-label="Search movies"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {/* USER SUPPORT MESSAGES BUTTON */}
      <div className="home-support-actions">
        <button
          type="button"
          className="home-messages-button"
          onClick={handleMessagesClick}
        >
          <span aria-hidden="true">✉</span>
          Messages / Support
        </button>
      </div>

      {/* WATCH HISTORY */}
      {isLoggedIn && !searchQuery && !selectedCategory && (
        <section className="home-watch-history">
          <div className="watch-history-heading">
            <div>
              <h2>Continue Watching</h2>
              <p>Pick up where you left off.</p>
            </div>

            <button
              type="button"
              className="watch-history-view-all"
              onClick={() => navigate('/history')}
            >
              View All <span aria-hidden="true">→</span>
            </button>
          </div>

          {historyLoading ? (
            <p className="watch-history-message">
              Loading your watch history...
            </p>
          ) : watchHistory.filter((item) => item.movie).length === 0 ? (
            <div className="watch-history-empty">
              <span className="history-empty-icon" aria-hidden="true">
                ▷
              </span>
              <h3>Your next favorite movie awaits</h3>
              <p>Movies you watch will appear here.</p>
            </div>
          ) : (
            <div className="watch-history-list">
              {watchHistory
                .filter((item) => item.movie)
                .slice(0, 6)
                .map((item) => {
                  const movie = item.movie;

                  return (
                    <article
                      className="watch-history-card"
                      key={item._id || movie._id}
                    >
                      <button
                        type="button"
                        className="watch-history-poster-button"
                        onClick={() => navigate(`/movie/${movie._id}`)}
                        aria-label={`View details for ${movie.title || 'movie'}`}
                      >
                        <img
                          src={getPosterUrl(movie.posterUrl)}
                          alt={movie.title || 'Movie poster'}
                          loading="lazy"
                        />

                        <span className="history-poster-play" aria-hidden="true">
                          ▶
                        </span>
                      </button>

                      <div className="watch-history-card-info">
                        <h3>{movie.title || 'Untitled Movie'}</h3>

                        {movie.year && (
                          <p className="watch-history-year">{movie.year}</p>
                        )}

                        <button
                          type="button"
                          className="watch-again-button"
                          onClick={() => navigate(`/watch/${movie._id}`)}
                        >
                          ▶ Watch Again
                        </button>
                      </div>
                    </article>
                  );
                })}
            </div>
          )}
        </section>
      )}

      {/* MOVIES */}
      <div className="more-cards">
        {searchQuery ? (
          <TitileCards
            title="Search Results"
            searchQuery={searchQuery}
          />
        ) : selectedCategory ? (
          <TitileCards title={selectedCategory} />
        ) : (
          <>
            <TitileCards title="Blockbuster Movies" />
            <TitileCards title="Trending Now" />
            <TitileCards title="Action Movies" />
            <TitileCards title="Comedies" />
            <TitileCards title="Horror Movies" />
            <TitileCards title="Romance Movies" />
            <TitileCards title="Documentaries" />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Home;
