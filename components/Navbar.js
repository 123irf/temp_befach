'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from './Logo'
import './Navbar.css'

function NavbarContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  useEffect(() => {
    const query = searchParams.get('q') || ''
    setSearchQuery(query)
  }, [searchParams])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/products')
    }
    setIsSearchExpanded(false)
  }

  const handleSearchIconClick = () => {
    setIsSearchExpanded(!isSearchExpanded)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Logo />
        <div className="navbar-right">
          <ul className="navbar-menu">
            <li>
              <Link href="/" className="navbar-link">Home</Link>
            </li>
            <li>
              <Link href="/products" className="navbar-link">Products</Link>
            </li>
          </ul>
          
          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="navbar-search-desktop">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input-desktop"
            />
            <button type="submit" className="search-button-desktop" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </form>

          {/* Mobile Search Icon */}
          <button 
            onClick={handleSearchIconClick}
            className="search-icon-mobile"
            aria-label="Toggle search"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Expanded Search Bar */}
      {isSearchExpanded && (
        <div className="navbar-search-mobile-expanded">
          <form onSubmit={handleSearch} className="search-form-mobile">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input-mobile"
              autoFocus
            />
            <button type="submit" className="search-button-mobile" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
            <button 
              type="button"
              onClick={() => setIsSearchExpanded(false)}
              className="search-close-mobile"
              aria-label="Close search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </form>
        </div>
      )}
    </nav>
  )
}

export default function Navbar() {
  return (
    <Suspense fallback={
      <nav className="navbar">
        <div className="navbar-container">
          <Logo />
          <div className="navbar-right">
            <ul className="navbar-menu">
              <li>
                <Link href="/" className="navbar-link">Home</Link>
              </li>
              <li>
                <Link href="/products" className="navbar-link">Products</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    }>
      <NavbarContent />
    </Suspense>
  )
}


