
import React, { useState } from 'react';
import './Navbar.css';
import logo from '../../assets/logo.png';
import profile from '../../assets/Profile.png';
import search from '../../assets/search.svg';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  // Login status
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('token')
  );

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');

    setIsLoggedIn(false);
    navigate('/login');
  };

  // Login
  const handleLogin = () => {
    navigate('/login');
  };

  // Category navigation
  const handleCategoryClick = (category) => {
    navigate(`/home?category=${encodeURIComponent(category)}`);
  };

  // Subscription navigation
  const handleSubscription = () => {
    navigate('/subscription');
  };

  // Favorites navigation
  const handleFavorites = () => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    navigate('/favorites');
  };

  // Search
  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) return;

    navigate(`/home?search=${encodeURIComponent(searchTerm.trim())}`);
    setSearchOpen(false);
  };

  return (
    <nav className="navbar">

      {/* LEFT SIDE */}
      <div className="navbar-left">
        <img
          src={logo}
          alt="Apex Logo"
          className="logo"
          onClick={() => navigate('/home')}
        />

        <ul>
          <li onClick={() => navigate('/home')}>Home</li>

          <li onClick={() => handleCategoryClick('Blockbuster Movies')}>
            Blockbuster Movies
          </li>

          <li onClick={() => handleCategoryClick('Trending Now')}>
            Trending Now
          </li>

          <li onClick={() => handleCategoryClick('Action Movies')}>
            Action Movies
          </li>

          <li onClick={() => handleCategoryClick('Comedies')}>
            Comedies
          </li>

          <li onClick={() => handleCategoryClick('Horror Movies')}>
            Horror Movies
          </li>

          <li onClick={() => handleCategoryClick('Romance Movies')}>
            Romance Movies
          </li>

          <li onClick={() => handleCategoryClick('Documentaries')}>
            Documentaries
          </li>

          {/* FAVORITES */}
          <li
            className="favorites-nav-link"
            onClick={handleFavorites}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleFavorites();
              }
            }}
          >
            <span className="favorites-heart">♥</span> Favorites
          </li>
        </ul>
      </div>

      {/* RIGHT SIDE */}
      <div className="navbar-right">

        {/* PREMIUM BUTTON */}
        <button
          type="button"
          className="premium-nav-button"
          onClick={handleSubscription}
        >
          <span className="premium-star">✦</span>
          <span>Premium</span>
        </button>

        {/* SEARCH */}
        <div className="search-container">
          {searchOpen && (
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search movie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                aria-label="Search movies"
              />
            </form>
          )}

          <button
            type="button"
            className="search-toggle"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Toggle movie search"
          >
            <img
              src={search}
              alt=""
              className="search-icon"
            />
          </button>
        </div>

        {/* PROFILE */}
        <div className="profile">
          <img
            src={profile}
            alt="Profile"
            className="profile-icon"
          />

          <div className="dropdown">
            {isLoggedIn ? (
              <>
                <span onClick={handleSubscription}>
                  Premium Plans
                </span>

                <span onClick={handleFavorites}>
                  ♥ Favorites
                </span>

                <span onClick={handleLogout}>
                  Logout
                </span>
              </>
            ) : (
              <>
                <span onClick={handleSubscription}>
                  Premium Plans
                </span>

                <span onClick={handleLogin}>
                  Login
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
