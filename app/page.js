'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import axios from 'axios'
import HeroSlider from '@/components/HeroSlider'
import './page.css'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get('/api/products')
      
      if (response.data && Array.isArray(response.data)) {
        const inStockProducts = response.data.filter(product => {
          const stock = typeof product.stock === 'string' 
            ? parseInt(product.stock) || 0 
            : product.stock || 0
          return stock > 0
        })
        
        if (inStockProducts.length === 0 && response.data.length > 0) {
          setProducts(response.data)
        } else {
          setProducts(inStockProducts)
        }
      } else {
        setProducts([])
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Failed to load products. Please make sure the backend server is running.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="home">
      <HeroSlider />

      <div className="instock-products-section">
        <div className="container">
          <div className="instock-header">
            <div className="instock-title-wrapper">
              <h2 className="instock-title">
                <span className="instock-orange">Explore</span> Products
              </h2>
              <button className="trending-btn">
                <span>Trending</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 4L12 8L8 12L4 8L8 4Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <Link href="/products" className="view-all-btn">
              <span>View All Products</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="loading-products">Loading products...</div>
          ) : error ? (
            <div className="no-products-message error-message">{error}</div>
          ) : products.length === 0 ? (
            <div className="no-products-message">
              No products available at the moment. 
              <Link href="/admin" style={{ marginLeft: '10px', color: '#f29222', textDecoration: 'underline' }}>
                Upload products here
              </Link>
            </div>
          ) : (
            <div className="products-scroll-wrapper">
              <button className="scroll-arrow scroll-arrow-left" onClick={scrollLeft}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <div className="products-scroll-container" ref={scrollContainerRef}>
                {products.map((product) => (
                  <div key={product.id} className="home-product-card">
                    <Link href={`/products/${product.id}`} className="product-card-link">
                      <div className="home-product-image">
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          <div className="home-product-image-placeholder">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                              <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.105 20 20 19.105 20 18V6C20 4.895 19.105 4 18 4H6C4.895 4 4 4.895 4 6V18C4 19.105 4.895 20 6 20Z" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{product.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="home-product-info">
                        <h3 className="home-product-name">{product.name}</h3>
                        <div className="home-product-price">₹ {product.price.toFixed(2)}</div>
                        <div className="home-product-min-order">Min order: {product.stock > 0 ? '1' : '0'} pieces</div>
                        <div className="home-product-actions">
                          <button className="add-to-cart-btn" onClick={(e) => { e.preventDefault(); }}>
                            <span>Add to Cart</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button className="wishlist-btn" onClick={(e) => { e.preventDefault(); }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              <button className="scroll-arrow scroll-arrow-right" onClick={scrollRight}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


