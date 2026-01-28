import fs from 'fs'
import path from 'path'

// Use /tmp directory for Vercel serverless functions (writable)
const dataDir = process.env.VERCEL 
  ? path.join('/tmp', 'data')
  : path.join(process.cwd(), '../../../../data')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const productsFile = path.join(dataDir, 'products.json')

if (!fs.existsSync(productsFile)) {
  fs.writeFileSync(productsFile, JSON.stringify([], null, 2))
}

const readProducts = () => {
  try {
    const data = fs.readFileSync(productsFile, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

const writeProducts = (products) => {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2))
}

export async function GET(request, { params }) {
  try {
    const { id } = params
    const products = readProducts()
    const product = products.find(p => p.id === id)
    
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return Response.json(product)
  } catch (error) {
    console.error('Error reading product:', error)
    return Response.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const products = readProducts()
    const index = products.findIndex(p => p.id === id)
    
    if (index === -1) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }
    
    products.splice(index, 1)
    writeProducts(products)
    
    return Response.json({ message: 'Product deleted successfully', total: products.length })
  } catch (error) {
    console.error('Delete error:', error)
    return Response.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

