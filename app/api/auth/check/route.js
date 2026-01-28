import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = cookies()
    const session = cookieStore.get('admin_session')

    if (session && session.value) {
      return NextResponse.json({
        authenticated: true,
      })
    } else {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}

