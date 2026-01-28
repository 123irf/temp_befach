import fs from 'fs'
import path from 'path'

// Use /tmp directory for Vercel serverless functions (writable)
const dataDir = process.env.VERCEL 
  ? path.join('/tmp', 'data')
  : path.join(process.cwd(), '../../../data')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const sliderFile = path.join(dataDir, 'slider.json')

if (!fs.existsSync(sliderFile)) {
  fs.writeFileSync(sliderFile, JSON.stringify([], null, 2))
}

const readSlider = () => {
  try {
    const data = fs.readFileSync(sliderFile, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

export async function GET() {
  try {
    const slider = readSlider()
    return Response.json(slider)
  } catch (error) {
    console.error('Error reading slider:', error)
    return Response.json({ error: 'Failed to fetch slider images' }, { status: 500 })
  }
}


