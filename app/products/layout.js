// Force dynamic rendering for products page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function ProductsLayout({ children }) {
  return <>{children}</>
}

