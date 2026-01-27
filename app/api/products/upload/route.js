import fs from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

const dataDir = path.join(process.cwd(), '../../../../data')
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

const parseCSV = (fileBuffer) => {
  return new Promise((resolve) => {
    const results = []
    const lines = fileBuffer.toString('utf8').split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        const obj = {}
        headers.forEach((header, index) => {
          obj[header] = values[index] || ''
        })
        results.push(obj)
      }
    }
    resolve(results)
  })
}

const parseExcel = (fileBuffer) => {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  return XLSX.utils.sheet_to_json(worksheet)
}

const normalizeProduct = (row, index) => {
  const getValue = (row, keys) => {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
        return String(row[key]).trim()
      }
    }
    return ''
  }

  return {
    id: row.id || `product-${Date.now()}-${index}`,
    name: getValue(row, ['name', 'product_name', 'product name', 'title', 'product']),
    description: getValue(row, ['description', 'product_description', 'product description', 'details']),
    price: parseFloat(getValue(row, ['price', 'product_price', 'product price', 'cost'])) || 0,
    category: getValue(row, ['category', 'product_category', 'product category', 'type']),
    sku: getValue(row, ['sku', 'product_sku', 'product sku', 'code']),
    stock: parseInt(getValue(row, ['stock', 'quantity', 'inventory', 'stock_quantity'])) || 0,
    image: getValue(row, ['image', 'image_url', 'image url', 'picture', 'photo']),
    createdAt: new Date().toISOString()
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    if (!body || !body.file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 })
    }

    let rows = []
    const fileBuffer = Buffer.from(body.file, 'base64')
    const fileExt = body.filename.split('.').pop().toLowerCase()

    if (fileExt === 'csv') {
      rows = await parseCSV(fileBuffer)
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      rows = parseExcel(fileBuffer)
    } else {
      return Response.json({ error: 'Invalid file type' }, { status: 400 })
    }

    if (rows.length === 0) {
      return Response.json({ error: 'File is empty or invalid format' }, { status: 400 })
    }

    const existingProducts = readProducts()
    const newProducts = rows.map((row, index) => normalizeProduct(row, index))

    const updatedProducts = [...existingProducts]
    newProducts.forEach(newProduct => {
      const existingIndex = updatedProducts.findIndex(p => p.id === newProduct.id)
      if (existingIndex >= 0) {
        updatedProducts[existingIndex] = { ...updatedProducts[existingIndex], ...newProduct }
      } else {
        updatedProducts.push(newProduct)
      }
    })

    writeProducts(updatedProducts)

    return Response.json({
      message: 'Products uploaded successfully',
      count: newProducts.length,
      total: updatedProducts.length
    })
  } catch (error) {
    console.error('Upload error:', error)
    return Response.json({ error: 'Failed to process file: ' + error.message }, { status: 500 })
  }
}

