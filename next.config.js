/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
    unoptimized: true
  },
  // Ensure dynamic rendering for pages using useSearchParams
  output: 'standalone'
}

module.exports = nextConfig


