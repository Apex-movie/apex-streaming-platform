
import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import AdminAIChat from '../../components/AdminAIChat/AdminAIChat';

const Dashboard = () => {
  const [movies, setMovies] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  // SUBSCRIPTION COUNTS
  const [monthlySubscribers, setMonthlySubscribers] = useState(0);
  const [yearlySubscribers, setYearlySubscribers] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // CHANGE PASSWORD STATES
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const navigate = useNavigate();

  // ADMIN USER DATA
  const adminUser = JSON.parse(localStorage.getItem('user') || 'null');

  // FETCH DATA
  useEffect(() => {
    fetchMovies();
    fetchTotalUsers();
    fetchSubscriptionStats();
  }, []);

  // FETCH MOVIES
  const fetchMovies = async () => {
    try {
      const response = await fetch('https://apex-streaming-backend.onrender.com/api/movies');
      const data = await response.json();

      if (response.ok) {
        setMovies(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    }
  };

  // FETCH TOTAL USERS
  const fetchTotalUsers = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        'https://apex-streaming-backend.onrender.com/api/users/total',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTotalUsers(data.totalUsers ?? 0);
      }
    } catch (error) {
      console.error('Failed to fetch total users:', error);
    }
  };

  // FETCH SUBSCRIPTION COUNTS
  const fetchSubscriptionStats = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        'https://apex-streaming-backend.onrender.com/api/subscriptions/stats',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMonthlySubscribers(data.monthlySubscribers ?? 0);
        setYearlySubscribers(data.yearlySubscribers ?? 0);
      } else {
        console.error(
          'Failed to fetch subscription stats:',
          data.message
        );
      }
    } catch (error) {
      console.error('Subscription stats error:', error);
    }
  };

  // REFRESH DASHBOARD DATA
  const handleRefresh = () => {
    fetchMovies();
    fetchTotalUsers();
    fetchSubscriptionStats();
  };

  // CHANGE PASSWORD
  const handleChangePassword = async () => {
    setPasswordMessage('');
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        'New password and confirm password do not match.'
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        'New password must be at least 6 characters.'
      );
      return;
    }

    try {
      setChangingPassword(true);

      const token = localStorage.getItem('token');

      const response = await fetch(
        'https://apex-streaming-backend.onrender.com/api/users/change-password',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(
          data.message || 'Failed to change password.'
        );
        return;
      }

      setPasswordMessage(
        data.message || 'Password changed successfully.'
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Change password error:', error);
      setPasswordError('Unable to connect to server.');
    } finally {
      setChangingPassword(false);
    }
  };

  // SIDEBAR NAVIGATION
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // OPEN SUPPORT MESSAGES
  const handleOpenSupportMessages = () => {
    navigate('/admin/messages');
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // DELETE MOVIE
  const handleDelete = async (movieId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this movie?'
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `https://apex-streaming-backend.onrender.com/api/movies/${movieId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to delete movie');
        return;
      }

      setMovies((prevMovies) =>
        prevMovies.filter((movie) => movie._id !== movieId)
      );
    } catch (error) {
      console.error('Delete movie error:', error);
      alert('Unable to connect to server.');
    }
  };

  // CATEGORIES
  const categories = [
    'Blockbuster Movies',
    'Trending Now',
    'Action Movies',
    'Comedies',
    'Horror Movies',
    'Romance Movies',
    'Documentaries',
  ];

  // FILTER MOVIES
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      movie.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h1 className="admin-logo">APEX</h1>

        <div className="admin-menu">
          <button
            className="active"
            onClick={() => scrollToSection('dashboard-section')}
          >
            Dashboard
          </button>

          <button onClick={() => scrollToSection('movies-section')}>
            Movies
          </button>

          <button onClick={() => scrollToSection('users-section')}>
            Users
          </button>

          {/* SUPPORT MESSAGES SIDEBAR BUTTON */}
          <button
            type="button"
            onClick={handleOpenSupportMessages}
            aria-label="Open Support Messages"
            title="Support Messages"
          >
            ✉ Support Messages
          </button>

          <button onClick={() => scrollToSection('settings-section')}>
            Settings
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        {/* HEADER */}
        <div className="admin-header" id="dashboard-section">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage your Apex platform</p>
          </div>

          <div className="admin-header-actions">
            <button className="refresh-btn" onClick={handleRefresh}>
              ↻ Refresh
            </button>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* STATS */}
        <section className="admin-section">
          <div className="section-header">
            <h2>Overview</h2>
          </div>

          <div className="stats-slider">
            <div className="stat-card">
              <span>Total Movies</span>
              <h3>{movies.length}</h3>
              <p>Movies available</p>
            </div>

            <div className="stat-card">
              <span>Total Users</span>
              <h3>{totalUsers}</h3>
              <p>Registered users</p>
            </div>

            <div className="stat-card">
              <span>Monthly Subscribers</span>
              <h3>{monthlySubscribers}</h3>
              <p>Users with 1-month plans</p>
            </div>

            <div className="stat-card">
              <span>Yearly Subscribers</span>
              <h3>{yearlySubscribers}</h3>
              <p>Users with 1-year plans</p>
            </div>

            <div className="stat-card">
              <span>Total Views</span>
              <h3>
                {movies.reduce(
                  (total, movie) => total + (movie.views || 0),
                  0
                )}
              </h3>
              <p>Total movie views</p>
            </div>

            <div className="stat-card">
              <span>Categories</span>
              <h3>
                {
                  new Set(
                    movies.map((movie) => movie.category)
                  ).size
                }
              </h3>
              <p>Movie categories</p>
            </div>
          </div>
        </section>

        {/* SUPPORT MESSAGES SECTION */}
        <section
          className="admin-section"
          id="support-messages-section"
        >
          <div className="section-header">
            <h2>Support Messages</h2>
          </div>

          <div className="admin-dashboard-support-card">
            <div
              className="admin-dashboard-support-icon"
              aria-hidden="true"
            >
              ✉
            </div>

            <div className="admin-dashboard-support-info">
              <h3>Received Messages</h3>
              <p>
                View messages received from users and reply to
                their support requests.
              </p>
            </div>

            <button
              type="button"
              className="admin-dashboard-support-button"
              onClick={handleOpenSupportMessages}
            >
              Open Inbox →
            </button>
          </div>
        </section>

        {/* MOVIE MANAGEMENT */}
        <section className="admin-section" id="movies-section">
          <div className="section-header">
            <h2>Movie Management</h2>
          </div>

          <div className="movie-search-filter">
            <input
              type="text"
              name="movie-title-filter"
              id="movie-title-filter"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              readOnly
              placeholder="🔍 Search movie..."
              value={searchTerm}
              onFocus={(e) => e.target.removeAttribute('readonly')}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <p className="movie-result-count">
            Showing {filteredMovies.length} of {movies.length} movies
          </p>

          <div className="movie-slider">
            {filteredMovies.length === 0 ? (
              <p>No movies found.</p>
            ) : (
              filteredMovies.map((movie) => (
                <div className="movie-admin-card" key={movie._id}>
                  <img
                    src={`https://apex-streaming-backend.onrender.com${movie.posterUrl}`}
                    alt={movie.title}
                    className="movie-poster"
                  />

                  <h3>{movie.title}</h3>

                  <div className="movie-admin-info">
                    <p>Category: {movie.category}</p>
                    <p>Year: {movie.year}</p>
                    <p>⭐ {movie.rating}</p>
                    <p>👁 {movie.views || 0} views</p>
                    <p>⏱ {movie.duration}</p>
                  </div>

                  <div className="movie-actions">
                    <button
                      className="edit-btn"
                      onClick={() =>
                        navigate(`/admin/edit-movie/${movie._id}`)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(movie._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* USERS SECTION */}
        <section className="admin-section" id="users-section">
          <div className="section-header">
            <h2>Users</h2>
          </div>

          <div className="stat-card">
            <span>Registered Users</span>
            <h3>{totalUsers}</h3>
            <p>Total user accounts</p>
          </div>

          <div className="stats-slider">
            <div className="stat-card">
              <span>Monthly Subscribers</span>
              <h3>{monthlySubscribers}</h3>
              <p>Users with 1-month plans</p>
            </div>

            <div className="stat-card">
              <span>Yearly Subscribers</span>
              <h3>{yearlySubscribers}</h3>
              <p>Users with 1-year plans</p>
            </div>
          </div>
        </section>

        {/* ADD MOVIE */}
        <section className="add-movie-section">
          <h2>Add New Movie</h2>

          <button
            className="add-movie-btn"
            onClick={() => navigate('/admin/add-movie')}
          >
            + Add Movie
          </button>
        </section>

        {/* SETTINGS */}
        <section className="admin-section" id="settings-section">
          <div className="section-header">
            <h2>Settings</h2>
          </div>

          <div className="settings-card">
            <div className="settings-icon">⚙️</div>

            <div className="settings-info">
              <span>Admin Account</span>
              <h3>{adminUser?.name || 'Admin'}</h3>
              <p>{adminUser?.email || 'No email available'}</p>
            </div>
          </div>

          {/* CHANGE PASSWORD */}
          <div className="change-password-card">
            <h3>Change Password</h3>

            <p className="change-password-description">
              Update your admin account password.
            </p>

            <input
              type="password"
              name="current-admin-password"
              autoComplete="current-password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <input
              type="password"
              name="new-admin-password"
              autoComplete="new-password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              type="password"
              name="confirm-admin-password"
              autoComplete="new-password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {passwordError && (
              <p className="password-error">{passwordError}</p>
            )}

            {passwordMessage && (
              <p className="password-success">{passwordMessage}</p>
            )}

            <button
              className="change-password-btn"
              onClick={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </section>
      </main>

      {/* ADMIN AI CHAT FLOATING BUTTON AND CHAT WINDOW */}
      <AdminAIChat />
    </div>
  );
};

export default Dashboard;