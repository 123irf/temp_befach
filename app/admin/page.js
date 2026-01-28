'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import axios from 'axios'
import './page.css'

const ITEMS_PER_PAGE = 25

export default function Admin() {
  const pathname = usePathname()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  
  // Product list state
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [deleting, setDeleting] = useState(false)
  const selectAllCheckboxRef = useRef(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/products')
      setProducts(response.data)
    } catch (err) {
      setError('Failed to fetch products')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop().toLowerCase()
      if (['csv', 'xlsx', 'xls'].includes(fileExt)) {
        setFile(selectedFile)
        setError(null)
        setMessage(null)
      } else {
        setError('Please select a CSV or Excel file (.csv, .xlsx, .xls)')
        setFile(null)
      }
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a file to upload')
      return
    }

    setUploading(true)
    setError(null)
    setMessage(null)

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      try {
        const base64String = reader.result.split(',')[1]
        
        const response = await axios.post('/api/products/upload', {
          file: base64String,
          filename: file.name
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        setMessage(`Successfully uploaded ${response.data.count} product(s). Total products: ${response.data.total}`)
        setFile(null)
        document.getElementById('file-input').value = ''
        fetchProducts() // Refresh product list
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to upload file. Please try again.')
        console.error('Upload error:', err)
      } finally {
        setUploading(false)
      }
    }
    reader.onerror = () => {
      setError('Failed to read file')
      setUploading(false)
    }
  }

  const handleSelectAll = (e) => {
    const currentPageProducts = getCurrentPageProducts()
    if (e.target.checked) {
      const newSelected = new Set(selectedProducts)
      currentPageProducts.forEach(product => newSelected.add(product.id))
      setSelectedProducts(newSelected)
    } else {
      const newSelected = new Set(selectedProducts)
      currentPageProducts.forEach(product => newSelected.delete(product.id))
      setSelectedProducts(newSelected)
    }
  }

  const handleSelectProduct = (productId) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const handleDeleteSelected = async () => {
    if (selectedProducts.size === 0) {
      setError('Please select at least one product to delete')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedProducts.size} product(s)?`)) {
      return
    }

    setDeleting(true)
    setError(null)
    setMessage(null)

    try {
      const response = await axios.delete('/api/products', {
        data: { ids: Array.from(selectedProducts) }
      })
      
      setMessage(`Successfully deleted ${response.data.deletedCount} product(s). Total products: ${response.data.total}`)
      setSelectedProducts(new Set())
      fetchProducts()
      
      // Reset to first page if current page is empty
      const totalPages = Math.ceil((products.length - response.data.deletedCount) / ITEMS_PER_PAGE)
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete products')
      console.error('Delete error:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteSingle = async (productId, productName) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return
    }

    setDeleting(true)
    setError(null)
    setMessage(null)

    try {
      const response = await axios.delete(`/api/products/${productId}`)
      setMessage(`Successfully deleted product. Total products: ${response.data.total}`)
      setSelectedProducts(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
      fetchProducts()
      
      // Reset to first page if current page is empty
      const totalPages = Math.ceil((products.length - 1) / ITEMS_PER_PAGE)
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete product')
      console.error('Delete error:', err)
    } finally {
      setDeleting(false)
    }
  }

  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return products.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE)
  const currentPageProducts = getCurrentPageProducts()
  const allCurrentPageSelected = currentPageProducts.length > 0 && 
    currentPageProducts.every(p => selectedProducts.has(p.id))
  const someCurrentPageSelected = currentPageProducts.some(p => selectedProducts.has(p.id))

  // Set indeterminate state for select all checkbox
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = someCurrentPageSelected && !allCurrentPageSelected
    }
  }, [someCurrentPageSelected, allCurrentPageSelected])

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Admin Panel</h1>
            <p className="admin-subtitle">Manage your B2B platform</p>
          </div>
        </div>
        
        <div className="admin-menu">
          <Link href="/admin" className={`admin-menu-item ${pathname === '/admin' ? 'active' : ''}`}>
            Products
          </Link>
          <Link href="/admin/slider" className={`admin-menu-item ${pathname === '/admin/slider' ? 'active' : ''}`}>
            Hero Slider
          </Link>
        </div>

        {/* Upload Section */}
        <div className="admin-section">
          <h2>Upload Products</h2>
          <p className="admin-subtitle">Upload products via CSV or Excel file</p>

          <div className="admin-upload-section">
            <form onSubmit={handleUpload} className="upload-form">
              <div className="file-input-wrapper">
                <label htmlFor="file-input" className="file-label">
                  Choose File
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="file-input"
                />
                {file && (
                  <div className="file-name">
                    Selected: {file.name}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!file || uploading}
                className="btn btn-upload"
              >
                {uploading ? 'Uploading...' : 'Upload Products'}
              </button>
            </form>

            {message && (
              <div className="message success">
                {message}
              </div>
            )}

            {error && (
              <div className="message error">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Product List Section */}
        <div className="admin-section">
          <div className="admin-list-header">
            <h2>Products ({products.length})</h2>
            {selectedProducts.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="btn btn-delete-bulk"
              >
                {deleting ? 'Deleting...' : `Delete Selected (${selectedProducts.size})`}
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="empty-state">No products found. Upload products to get started.</div>
          ) : (
            <>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="checkbox-col">
                        <input
                          type="checkbox"
                          checked={allCurrentPageSelected}
                          ref={selectAllCheckboxRef}
                          onChange={handleSelectAll}
                          className="select-all-checkbox"
                        />
                      </th>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Category</th>
                      <th>SKU</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageProducts.map((product) => (
                      <tr key={product.id} className={selectedProducts.has(product.id) ? 'selected' : ''}>
                        <td className="checkbox-col">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                            className="product-checkbox"
                          />
                        </td>
                        <td className="id-col">{product.id}</td>
                        <td className="name-col">{product.name || '-'}</td>
                        <td className="price-col">${parseFloat(product.price || 0).toFixed(2)}</td>
                        <td className="category-col">{product.category || '-'}</td>
                        <td className="sku-col">{product.sku || '-'}</td>
                        <td className="stock-col">{product.stock || 0}</td>
                        <td className="actions-col">
                          <button
                            onClick={() => handleDeleteSingle(product.id, product.name)}
                            disabled={deleting}
                            className="btn-delete"
                            title="Delete product"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    « First
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    ‹ Previous
                  </button>
                  
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next ›
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Last »
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* File Format Guidelines */}
        <div className="admin-section">
          <div className="admin-info">
            <h2>File Format Guidelines</h2>
            <div className="info-grid">
              <div className="info-card">
                <h3>Required Columns</h3>
                <ul>
                  <li><strong>name</strong> - Product name</li>
                  <li><strong>description</strong> - Product description</li>
                  <li><strong>image_url</strong> - Direct image URL</li>
                  <li><strong>price</strong> - Product price</li>
                </ul>
              </div>
              <div className="info-card">
                <h3>Optional Columns</h3>
                <ul>
                  <li>category - Product category</li>
                  <li>sku - Product SKU code</li>
                  <li>stock - Stock quantity</li>
                </ul>
              </div>
            </div>
            <div className="info-example">
              <h3>Example CSV Format:</h3>
              <pre>
{`name,description,image_url,price
"Product 1","Description here","https://example.com/image1.jpg",99.99
"Product 2","Another product","https://example.com/image2.jpg",149.99`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
