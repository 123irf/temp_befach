'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import './HeroSlider.css'

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      const response = await axios.get('/api/slider')
      if (response.data && response.data.length > 0) {
        setSlides(response.data)
      } else {
        setSlides([
          {
            id: '1',
            image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&h=1080&fit=crop',
            title: 'Welcome to BEFACH',
            subtitle: 'Empowering Your Business Growth'
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching slides:', error)
      setSlides([
        {
          id: '1',
          image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&h=1080&fit=crop',
          title: 'Welcome to BEFACH',
          subtitle: 'Empowering Your Business Growth'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slides.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  if (loading) {
    return <div className="hero-slider-loading">Loading...</div>
  }

  if (slides.length === 0) {
    return null
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  return (
    <div className="hero-slider">
      <div className="slider-container">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="slide-overlay"></div>
            <div className="slide-content">
              <h1 className="slide-title">{slide.title}</h1>
              <p className="slide-subtitle">{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="slider-arrow slider-arrow-left" onClick={goToPrevious}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button className="slider-arrow slider-arrow-right" onClick={goToNext}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="slider-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}


