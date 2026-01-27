'use client'

import Link from 'next/link'
import Logo from './Logo'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <Logo />
            <p className="footer-description">
              Empowering your business growth with quality products and exceptional service.
            </p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/products">Products</Link>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-title">Contact</h4>
            <ul className="footer-contact">
              <li>Email: info@befach.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Business St, City, Country</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-title">Follow Us</h4>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">Twitter</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">LinkedIn</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} BEFACH INTERNATIONAL. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}


