
import React, { useEffect, useState } from 'react';
import './EditMovie.css';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const EditMovie = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    year: '',
    duration: '',
    isPremium: 'false',
  });

  const [posterFile, setPosterFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const [currentPoster, setCurrentPoster] = useState('');
  const [currentBanner, setCurrentBanner] = useState('');
  const [currentVideo, setCurrentVideo] = useState('');

  const [posterPreview, setPosterPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getMediaUrl = (path) => {
    if (!path) return '';

    return path.startsWith('http')
      ? path
      : `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // FETCH MOVIE DETAILS
  useEffect(() => {
    let isMounted = true;

    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_URL}/api/movies`);
        const movies = await response.json();

        if (!response.ok) {
          throw new Error(movies.message || 'Failed to fetch movie.');
        }

        if (!Array.isArray(movies)) {
          throw new Error('Invalid movie data received.');
        }

        const selectedMovie = movies.find(
          (movie) => movie._id === id
        );

        if (!selectedMovie) {
          throw new Error('Movie not found.');
        }

        if (!isMounted) return;

        setFormData({
          title: selectedMovie.title || '',
          description: selectedMovie.description || '',
          category: selectedMovie.category || '',
          year: selectedMovie.year ?? '',
          duration: selectedMovie.duration || '',
          isPremium:
            selectedMovie.isPremium === true ||
            selectedMovie.isPremium === 'true'
              ? 'true'
              : 'false',
        });

        setCurrentPoster(selectedMovie.posterUrl || '');
        setCurrentBanner(selectedMovie.bannerUrl || '');
        setCurrentVideo(selectedMovie.videoUrl || '');
      } catch (err) {
        console.error('Fetch movie error:', err);

        if (isMounted) {
          setError(err.message || 'Unable to connect to server.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMovie();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // CLEAN UP PREVIEW URLS
  useEffect(() => {
    return () => {
      if (posterPreview) URL.revokeObjectURL(posterPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [posterPreview, bannerPreview, videoPreview]);

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError('');
    setSuccess('');
  };

  // POSTER CHANGE
  const handlePosterChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid poster image.');
      e.target.value = '';
      return;
    }

    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
    setError('');
    setSuccess('');
  };

  // BANNER CHANGE
  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid banner image.');
      e.target.value = '';
      return;
    }

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setError('');
    setSuccess('');
  };

  // VIDEO CHANGE
  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file.');
      e.target.value = '';
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setError('');
    setSuccess('');
  };

  // UPDATE MOVIE
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');

    if (!token) {
      setError('You are not logged in. Please login again.');
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();

      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('category', formData.category);
      data.append('year', String(formData.year));
      data.append('duration', formData.duration.trim());

      // FREE / PREMIUM OPTION
      data.append('isPremium', formData.isPremium);

      if (posterFile) {
        data.append('poster', posterFile);
      }

      if (bannerFile) {
        data.append('banner', bannerFile);
      }

      if (videoFile) {
        data.append('video', videoFile);
      }

      const response = await fetch(
        `${API_URL}/api/movies/${id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update movie.');
      }

      setSuccess('Movie updated successfully!');

      setTimeout(() => {
        navigate('/admin');
      }, 1200);
    } catch (err) {
      console.error('Update movie error:', err);
      setError(err.message || 'Unable to connect to server.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-movie-page">
        <h1>Loading movie...</h1>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="edit-movie-page">
        <h1>Error</h1>
        <p className="error-message">{error}</p>
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate('/admin')}
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="edit-movie-page">
      <h1>Edit Movie</h1>

      {success && <p className="success-message">{success}</p>}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="movie-title">Movie Title</label>
        <input
          id="movie-title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Movie Title"
          required
        />

        <label htmlFor="movie-description">Description</label>
        <textarea
          id="movie-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Movie Description"
          required
        />

        {/* FREE / PREMIUM */}
        <label htmlFor="movie-premium">Movie Access Plan</label>
        <select
          id="movie-premium"
          name="isPremium"
          value={formData.isPremium}
          onChange={handleChange}
          required
        >
          <option value="false">🟢 Free Movie</option>
          <option value="true">🔒 Apex Premium</option>
        </select>

        <p className="premium-help-text">
          Premium movies par Premium badge dikhega. Subscription ke
          bina access rokne ke liye backend protection bhi zaroori hai.
        </p>

        <label>Current Poster</label>
        {currentPoster ? (
          <img
            src={getMediaUrl(currentPoster)}
            alt="Current poster"
            className="edit-current-poster"
          />
        ) : (
          <p>No poster available.</p>
        )}

        <label htmlFor="poster-file">Replace Poster</label>
        <input
          id="poster-file"
          type="file"
          accept="image/*"
          onChange={handlePosterChange}
        />

        {posterPreview && (
          <div className="new-image-preview">
            <span>New Poster Preview</span>
            <img
              src={posterPreview}
              alt="New poster preview"
              className="edit-new-poster"
            />
          </div>
        )}

        <label>Current Banner</label>
        {currentBanner ? (
          <img
            src={getMediaUrl(currentBanner)}
            alt="Current banner"
            className="edit-current-banner"
          />
        ) : (
          <p>No banner available.</p>
        )}

        <label htmlFor="banner-file">Replace Banner</label>
        <input
          id="banner-file"
          type="file"
          accept="image/*"
          onChange={handleBannerChange}
        />

        {bannerPreview && (
          <div className="new-image-preview">
            <span>New Banner Preview</span>
            <img
              src={bannerPreview}
              alt="New banner preview"
              className="edit-new-banner"
            />
          </div>
        )}

        <label>Current Video</label>
        {currentVideo ? (
          <video
            controls
            preload="metadata"
            className="edit-current-video"
            src={getMediaUrl(currentVideo)}
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '500px',
              marginBottom: '15px',
            }}
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <p>No video available. Select a video to add one.</p>
        )}

        <label htmlFor="video-file">
          Upload New Video (MP4, WebM, MOV)
        </label>
        <input
          id="video-file"
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
          onChange={handleVideoChange}
        />

        {videoPreview && (
          <div className="new-image-preview">
            <span>New Video Preview</span>
            <video
              src={videoPreview}
              controls
              preload="metadata"
              style={{
                display: 'block',
                width: '100%',
                maxWidth: '500px',
                marginTop: '10px',
              }}
            >
              Your browser does not support video playback.
            </video>
          </div>
        )}

        <label htmlFor="movie-category">Category</label>
        <select
          id="movie-category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          <option value="Blockbuster Movies">Blockbuster Movies</option>
          <option value="Trending Now">Trending Now</option>
          <option value="Action Movies">Action Movies</option>
          <option value="Comedies">Comedies</option>
          <option value="Horror Movies">Horror Movies</option>
          <option value="Romance Movies">Romance Movies</option>
          <option value="Documentaries">Documentaries</option>
        </select>

        <label htmlFor="movie-year">Year</label>
        <input
          id="movie-year"
          type="number"
          name="year"
          value={formData.year}
          onChange={handleChange}
          placeholder="Year"
          min="1888"
          required
        />

        <label htmlFor="movie-duration">Duration</label>
        <input
          id="movie-duration"
          type="text"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          placeholder="Duration (e.g. 2h 10m)"
          required
        />

        <button type="submit" disabled={saving}>
          {saving ? 'Updating Movie...' : 'Update Movie'}
        </button>
      </form>

      <button
        type="button"
        className="back-btn"
        onClick={() => navigate('/admin')}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
};

export default EditMovie;
