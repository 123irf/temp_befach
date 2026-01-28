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

export async function GET() {
  try {
    const products = readProducts()
    return Response.json(products)
  } catch (error) {
    console.error('Error reading products:', error)
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json()
    const { ids } = body
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Response.json({ error: 'No product IDs provided' }, { status: 400 })
    }
    
    const products = readProducts()
    const initialLength = products.length
    const filteredProducts = products.filter(p => !ids.includes(p.id))
    const deletedCount = initialLength - filteredProducts.length
    
    if (deletedCount === 0) {
      return Response.json({ error: 'No products found to delete' }, { status: 404 })
    }
    
    writeProducts(filteredProducts)
    
    return Response.json({ 
      message: `Successfully deleted ${deletedCount} product(s)`,
      deletedCount,
      total: filteredProducts.length
    })
  } catch (error) {
    console.error('Bulk delete error:', error)
    return Response.json({ error: 'Failed to delete products' }, { status: 500 })
  }
}

