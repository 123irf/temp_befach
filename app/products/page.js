'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import './page.css'

export default function Products() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Read search query from URL
    const query = searchParams.get('q') || ''
    setSearchQuery(query)
    fetchProducts()
  }, [searchParams])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredProducts(filtered)
    }
  }, [searchQuery, products])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    // Update URL without page reload
    if (value.trim()) {
      router.push(`/products?q=${encodeURIComponent(value.trim())}`, { scroll: false })
    } else {
      router.push('/products', { scroll: false })
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/products')
      setProducts(response.data)
      setFilteredProducts(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load products. Please try again later.')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading products...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="products-page">
      <div className="container">
        <h1>Products</h1>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search products by name, description, category, or SKU..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-products">
            {searchQuery ? 'No products found matching your search.' : 'No products available.'}
          </div>
        ) : (
          <>
            <div className="products-count">
              Showing {filteredProducts.length} of {products.length} products
            </div>
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="product-card"
                >
                  <div className="product-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div className="product-image-placeholder">
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-category">{product.category || 'Uncategorized'}</p>
                    <p className="product-sku">SKU: {product.sku || 'N/A'}</p>
                    <div className="product-footer">
                      <span className="product-price">${product.price.toFixed(2)}</span>
                      <span className={`product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}


