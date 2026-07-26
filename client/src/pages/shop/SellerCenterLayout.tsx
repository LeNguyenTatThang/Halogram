import { Outlet, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import SellerSidebar from '../../components/shop/SellerSidebar'

const SellerCenterLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-gray-200">
        <Link
          to="/shop"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-800">Halo Shop</h1>
          <p className="text-xs text-gray-400">Seller Center</p>
        </div>
      </div>
      <div className="flex">
        <SellerSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default SellerCenterLayout
