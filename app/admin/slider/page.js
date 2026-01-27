'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import axios from 'axios'
import { checkAuth, logout } from '@/lib/auth'
import './page.css'

export default function SliderAdmin() {
  const pathname = usePathname()
  const router = useRouter()
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [editingSlide, setEditingSlide] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: null
  })

  useEffect(() => {
    verifyAuth()
  }, [])

  const verifyAuth = async () => {
    const isAuth = await checkAuth()
    if (!isAuth) {
      router.push('/admin/login')
      return
    }
    setAuthenticated(true)
    setCheckingAuth(false)
    fetchSlides()
  }

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
    router.refresh()
  }

  const fetchSlides = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/slider')
      setSlides(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load slider images')
      console.error('Error fetching slides:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, image: file })
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    
    if (!formData.image) {
      setError('Please select an image file')
      return
    }

    try {
      setUploading(true)
      setError(null)
      setMessage(null)

      const reader = new FileReader()
      reader.readAsDataURL(formData.image)
      reader.onload = async () => {
        const base64String = reader.result
        
        try {
          await axios.post('/api/slider/upload', {
            image: base64String,
            title: formData.title,
            subtitle: formData.subtitle
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
          })

          setMessage('Slider image uploaded successfully!')
          setFormData({ title: '', subtitle: '', image: null })
          document.getElementById('image-input').value = ''
          fetchSlides()
          setUploading(false)
        } catch (err) {
          const errorMessage = err.response?.data?.error || err.message || 'Failed to upload image'
          setError(errorMessage)
          console.error('Upload error:', err)
          setUploading(false)
        }
      }
      reader.onerror = () => {
        setError('Failed to read image file')
        setUploading(false)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to upload image'
      setError(errorMessage)
      console.error('Upload error:', err)
      setUploading(false)
    }
  }

  const handleEdit = (slide) => {
    setEditingSlide(slide.id)
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      image: null
    })
  }

  const handleUpdate = async (id) => {
    try {
      setError(null)
      setMessage(null)

      const updateData = {
        title: formData.title,
        subtitle: formData.subtitle
      }

      await axios.put(`/api/slider/${id}`, updateData)
      setMessage('Slide updated successfully!')
      setEditingSlide(null)
      setFormData({ title: '', subtitle: '', image: null })
      fetchSlides()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update slide')
      console.error('Update error:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) {
      return
    }

    try {
      setError(null)
      await axios.delete(`/api/slider/${id}`)
      setMessage('Slide deleted successfully!')
      fetchSlides()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete slide')
      console.error('Delete error:', err)
    }
  }

  const cancelEdit = () => {
    setEditingSlide(null)
    setFormData({ title: '', subtitle: '', image: null })
  }

  if (checkingAuth) {
    return (
      <div className="slider-admin-page">
        <div className="container">
          <div className="slider-admin-loading">Checking authentication...</div>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  if (loading) {
    return <div className="slider-admin-loading">Loading slider images...</div>
  }

  return (
    <div className="slider-admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Manage Hero Slider</h1>
            <p className="admin-subtitle">Upload and manage background images for the hero slider</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>

        <div className="admin-menu">
          <Link href="/admin" className={`admin-menu-item ${pathname === '/admin' ? 'active' : ''}`}>
            Products
          </Link>
          <Link href="/admin/slider" className={`admin-menu-item ${pathname === '/admin/slider' ? 'active' : ''}`}>
            Hero Slider
          </Link>
        </div>

        <div className="slider-upload-section">
          <h2>{editingSlide ? 'Edit Slide' : 'Add New Slide'}</h2>
          <form onSubmit={editingSlide ? (e) => { e.preventDefault(); handleUpdate(editingSlide); } : handleUpload}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter slide title"
                required={!editingSlide}
              />
            </div>

            <div className="form-group">
              <label htmlFor="subtitle">Subtitle</label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="Enter slide subtitle"
                required={!editingSlide}
              />
            </div>

            {!editingSlide && (
              <div className="form-group">
                <label htmlFor="image-input">Image</label>
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required={!editingSlide}
                />
              </div>
            )}

            <div className="form-actions">
              {editingSlide ? (
                <>
                  <button type="submit" className="btn btn-primary">Update Slide</button>
                  <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
              )}
            </div>
          </form>

          {message && (
            <div className="message success">{message}</div>
          )}

          {error && (
            <div className="message error">{error}</div>
          )}
        </div>

        <div className="slides-list">
          <h2>Current Slides ({slides.length})</h2>
          {slides.length === 0 ? (
            <div className="no-slides">No slides available. Upload your first slide above.</div>
          ) : (
            <div className="slides-grid">
              {slides.map((slide) => (
                <div key={slide.id} className="slide-card">
                  <div className="slide-preview">
                    <img 
                      src={slide.image} 
                      alt={slide.title}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x250?text=Image+Not+Found'
                      }}
                    />
                  </div>
                  <div className="slide-info">
                    <h3>{slide.title}</h3>
                    <p>{slide.subtitle}</p>
                  </div>
                  <div className="slide-actions">
                    <button 
                      className="btn btn-edit" 
                      onClick={() => handleEdit(slide)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-delete" 
                      onClick={() => handleDelete(slide.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


