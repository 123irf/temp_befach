import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Simple credentials - in production, use environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function POST(request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Validate credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Create a simple session token
      const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64')
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour session

      // Set cookie
      const cookieStore = cookies()
      cookieStore.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
      })

      return NextResponse.json({
        success: true,
        message: 'Login successful',
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to process login' },
      { status: 500 }
    )
  }
}

