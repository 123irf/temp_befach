import fs from 'fs'
import path from 'path'

// Use /tmp directory for Vercel serverless functions (writable)
const dataDir = process.env.VERCEL 
  ? path.join('/tmp', 'data')
  : path.join(process.cwd(), '../../../../data')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const sliderFile = path.join(dataDir, 'slider.json')

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

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { title, subtitle, image } = body
    
    const slider = readSlider()
    const index = slider.findIndex(s => s.id === id)

    if (index === -1) {
      return Response.json({ error: 'Slide not found' }, { status: 404 })
    }

    slider[index] = {
      ...slider[index],
      title: title || slider[index].title,
      subtitle: subtitle || slider[index].subtitle,
      image: image || slider[index].image
    }

    writeSlider(slider)
    return Response.json({ message: 'Slide updated successfully', slide: slider[index] })
  } catch (error) {
    console.error('Update error:', error)
    return Response.json({ error: 'Failed to update slide' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const slider = readSlider()
    const index = slider.findIndex(s => s.id === id)

    if (index === -1) {
      return Response.json({ error: 'Slide not found' }, { status: 404 })
    }

    slider.splice(index, 1)
    writeSlider(slider)

    return Response.json({ message: 'Slide deleted successfully' })
  } catch (error) {
    console.error('Delete error:', error)
    return Response.json({ error: 'Failed to delete slide' }, { status: 500 })
  }
}


