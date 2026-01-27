'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import './page.css'

export default function ProductDetail() {
  const params = useParams()
  const id = params.id
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/products/${id}`)
      setProduct(response.data)
      setError(null)
    } catch (err) {
      setError('Product not found')
      console.error('Error fetching product:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading product details...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container">
        <div className="error">{error || 'Product not found'}</div>
        <Link href="/products" className="back-link">← Back to Products</Link>
      </div>
    )
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <Link href="/products" className="back-link">← Back to Products</Link>
        
        <div className="product-detail">
          <div className="product-detail-image">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <div className="product-detail-image-placeholder">
                {product.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="product-detail-info">
            <h1>{product.name}</h1>
            
            <div className="product-detail-meta">
              <span className="product-detail-category">{product.category || 'Uncategorized'}</span>
              <span className="product-detail-sku">SKU: {product.sku || 'N/A'}</span>
            </div>

            <div className="product-detail-price">
              ${product.price.toFixed(2)}
            </div>

            <div className={`product-detail-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
            </div>

            {product.description && (
              <div className="product-detail-description">
                <h3>Description</h3>
                <p>{product.description}</p>
              </div>
            )}

            <div className="product-detail-actions">
              <button 
                className="btn btn-primary" 
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button className="btn btn-secondary">Request Quote</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


