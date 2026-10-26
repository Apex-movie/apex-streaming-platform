
import React, { useEffect, useRef, useState } from 'react'
import './AddMovie.css'
import { useNavigate } from 'react-router-dom'

const AddMovie = () => {
  const navigate = useNavigate()

  const posterInputRef = useRef(null)
  const bannerInputRef = useRef(null)
  const videoInputRef = useRef(null)

  const initialFormData = {
    title: '',
    description: '',
    category: '',
    year: '',
    duration: '',
    isPremium: 'false'
  }

  const [formData, setFormData] = useState(initialFormData)

  const [posterFile, setPosterFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [videoFile, setVideoFile] = useState(null)

  const [posterPreview, setPosterPreview] = useState('')
  const [bannerPreview, setBannerPreview] = useState('')
  const [videoPreview, setVideoPreview] = useState('')

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return () => {
      if (posterPreview) URL.revokeObjectURL(posterPreview)
      if (bannerPreview) URL.revokeObjectURL(bannerPreview)
      if (videoPreview) URL.revokeObjectURL(videoPreview)
    }
  }, [posterPreview, bannerPreview, videoPreview])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    setError('')
    setMessage('')
  }

  const handlePosterChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid poster image.')
      e.target.value = ''
      return
    }

    setPosterFile(file)
    setPosterPreview(URL.createObjectURL(file))
    setError('')
    setMessage('')
  }

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid banner image.')
      e.target.value = ''
      return
    }

    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
    setError('')
    setMessage('')
  }

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file.')
      e.target.value = ''
      return
    }

    if (file.size > 500 * 1024 * 1024) {
      setError('Video size must be less than 500 MB.')
      e.target.value = ''
      return
    }

    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
    setError('')
    setMessage('')
  }

  // ADD MOVIE
  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setMessage('')

    if (!posterFile || !bannerFile || !videoFile) {
      setError('Please select poster, banner and movie video.')
      return
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please enter movie title and description.')
      return
    }

    const token = localStorage.getItem('token')

    if (!token) {
      setError('Please login again to add a movie.')
      return
    }

    try {
      setLoading(true)

      const data = new FormData()

      data.append('title', formData.title.trim())
      data.append('description', formData.description.trim())
      data.append('category', formData.category)
      data.append('year', formData.year)
      data.append('duration', formData.duration.trim())

      // FREE / PREMIUM OPTION
      data.append('isPremium', formData.isPremium)

      data.append('poster', posterFile)
      data.append('banner', bannerFile)
      data.append('video', videoFile)

      const response = await fetch(
        'https://apex-streaming-backend.onrender.com/api/movies',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: data
        }
      )

      const result = await response.json()

      if (!response.ok) {
        setError(result.message || 'Failed to add movie.')
        return
      }

      setMessage('Movie added successfully!')

      setFormData(initialFormData)

      setPosterFile(null)
      setBannerFile(null)
      setVideoFile(null)

      setPosterPreview('')
      setBannerPreview('')
      setVideoPreview('')

      if (posterInputRef.current) {
        posterInputRef.current.value = ''
      }

      if (bannerInputRef.current) {
        bannerInputRef.current.value = ''
      }

      if (videoInputRef.current) {
        videoInputRef.current.value = ''
      }

      setTimeout(() => {
        navigate('/admin')
      }, 1000)
    } catch (err) {
      console.error('Add movie error:', err)
      setError('Unable to connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-movie-page">
      <h1>Add New Movie</h1>

      {message && (
        <p className="success-message">{message}</p>
      )}

      {error && (
        <p className="error-message">{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        {/* MOVIE TITLE */}
        <label htmlFor="movie-title">Movie Title</label>
        <input
          id="movie-title"
          type="text"
          name="title"
          placeholder="Movie Title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        {/* DESCRIPTION */}
        <label htmlFor="movie-description">Movie Description</label>
        <textarea
          id="movie-description"
          name="description"
          placeholder="Movie Description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        {/* POSTER */}
        <label htmlFor="poster">Poster Image</label>
        <input
          id="poster"
          type="file"
          accept="image/*"
          ref={posterInputRef}
          onChange={handlePosterChange}
          required
        />

        {posterPreview && (
          <div className="new-image-preview">
            <span>Poster Preview</span>
            <img
              src={posterPreview}
              alt="Poster Preview"
              style={{
                display: 'block',
                width: '180px',
                maxWidth: '100%',
                marginTop: '10px',
                borderRadius: '8px'
              }}
            />
          </div>
        )}

        {/* BANNER */}
        <label htmlFor="banner">Banner Image</label>
        <input
          id="banner"
          type="file"
          accept="image/*"
          ref={bannerInputRef}
          onChange={handleBannerChange}
          required
        />

        {bannerPreview && (
          <div className="new-image-preview">
            <span>Banner Preview</span>
            <img
              src={bannerPreview}
              alt="Banner Preview"
              style={{
                display: 'block',
                width: '100%',
                maxWidth: '500px',
                marginTop: '10px',
                borderRadius: '8px'
              }}
            />
          </div>
        )}

        {/* VIDEO UPLOAD */}
        <label htmlFor="video">Movie Video (MP4, WebM, MOV)</label>
        <input
          id="video"
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
          ref={videoInputRef}
          onChange={handleVideoChange}
          required
        />

        {videoFile && (
          <p className="selected-video">
            Selected video: {videoFile.name}
            {' '}({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
          </p>
        )}

        {videoPreview && (
          <div className="new-image-preview">
            <span>Video Preview</span>
            <video
              src={videoPreview}
              controls
              preload="metadata"
              style={{
                display: 'block',
                width: '100%',
                maxWidth: '500px',
                marginTop: '10px',
                borderRadius: '8px'
              }}
            >
              Your browser does not support video playback.
            </video>
          </div>
        )}

        {/* CATEGORY */}
        <label htmlFor="category">Movie Category</label>
        <select
          id="category"
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

        {/* YEAR */}
        <label htmlFor="year">Release Year</label>
        <input
          id="year"
          type="number"
          name="year"
          placeholder="Year"
          min="1888"
          max={new Date().getFullYear() + 10}
          value={formData.year}
          onChange={handleChange}
          required
        />

        {/* DURATION */}
        <label htmlFor="duration">Movie Duration</label>
        <input
          id="duration"
          type="text"
          name="duration"
          placeholder="Duration (e.g. 2h 10m)"
          value={formData.duration}
          onChange={handleChange}
          required
        />

        {/* FREE / PREMIUM SELECTION */}
        <div className="movie-access-field">
          <label htmlFor="isPremium">Movie Access Type</label>

          <select
            id="isPremium"
            name="isPremium"
            value={formData.isPremium}
            onChange={handleChange}
            required
          >
            <option value="false">Normal / Free Movie</option>
            <option value="true">🔴 Premium Movie</option>
          </select>

          <small>
            {formData.isPremium === 'true'
              ? 'Premium: sirf active subscription wale users movie dekh sakenge.'
              : 'Free: sabhi users movie dekh sakenge.'}
          </small>
        </div>

        {/* SUBMIT */}
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading Movie...' : 'Add Movie'}
        </button>
      </form>

      {/* BACK */}
      <button
        type="button"
        className="back-btn"
        onClick={() => navigate('/admin')}
        disabled={loading}
      >
        ← Back to Dashboard
      </button>
    </div>
  )
}

export default AddMovie
