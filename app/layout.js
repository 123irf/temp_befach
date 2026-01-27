import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata = {
  title: 'BEFACH INTERNATIONAL - B2B Platform',
  description: 'Empowering your business growth with quality products',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="App">
          <Navbar />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  )
}


