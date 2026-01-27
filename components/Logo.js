'use client'

import Link from 'next/link'
import './Logo.css'

export default function Logo() {
  return (
    <Link href="/" className="logo-link">
      <img 
        src="/logo.png" 
        alt="BEFACH INTERNATIONAL" 
        className="logo-image"
      />
    </Link>
  )
}

