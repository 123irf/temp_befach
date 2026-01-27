import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), '../../../../data')
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

const writeSlider = (slider) => {
  fs.writeFileSync(sliderFile, JSON.stringify(slider, null, 2))
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { image, title, subtitle } = body

    if (!image) {
      return Response.json({ error: 'No image uploaded' }, { status: 400 })
    }

    const slider = readSlider()
    const newSlide = {
      id: Date.now().toString(),
      image: image,
      title: title || 'Welcome to BEFACH',
      subtitle: subtitle || 'Empowering Your Business Growth'
    }

    slider.push(newSlide)
    writeSlider(slider)

    return Response.json({
      message: 'Slider image uploaded successfully',
      slide: newSlide
    })
  } catch (error) {
    console.error('Slider upload error:', error)
    return Response.json({ error: 'Failed to upload image: ' + error.message }, { status: 500 })
  }
}


