import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingCart, TrendingUp, Eye, ArrowRight } from 'lucide-react'
import type { Shop, Product } from '../../types/shop'
import { getMyShop, getMyProducts } from '../../utils/shop'

const SellerDashboard: React.FC = () => {
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, sold: 0 })

  useEffect(() => {
    getMyShop().then((s) => setShop(s))
    getMyProducts({ limit: 5 })
      .then((res) => {
        setProducts(res.products)
        setStats({
          total: res.pagination.total,
          active: res.products.filter((p) => p.status === 'ACTIVE').length,
          sold: res.products.reduce((sum, p) => sum + p.soldCount, 0),
        })
      })
      .catch(() => {})
  }, [])

  if (!shop) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Bạn chưa có Shop</h2>
        <p className="text-gray-400 mb-6">Đăng ký trở thành chủ shop để bắt đầu bán hàng</p>
        <Link
          to="/shop/manage/settings"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Đăng ký Shop
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  const cards = [
    { label: 'Sản phẩm', value: stats.total, icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'Đang bán', value: stats.active, icon: Eye, color: 'text-green-600 bg-green-50' },
    { label: 'Đã bán', value: stats.sold, icon: TrendingUp, color: 'text-orange-600 bg-orange-50' },
    { label: 'Đơn hàng', value: 0, icon: ShoppingCart, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Tổng quan</h2>
        <p className="text-sm text-gray-400 mt-0.5">Chào mừng trở lại, {shop.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className={`inline-flex p-2 rounded-lg ${card.color} mb-3`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-400">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Sản phẩm gần đây</h3>
          <Link
            to="/shop/manage/products"
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {products.slice(0, 5).map((product) => (
            <div key={product.id} className="flex items-center gap-3 px-4 py-3">
              <img
                src={product.images?.[0]?.url || '/placeholder.png'}
                alt={product.name}
                className="w-10 h-10 rounded object-cover bg-gray-100"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                <p className="text-xs text-gray-400">₫{product.price.toLocaleString('vi-VN')}</p>
              </div>
              <span className="text-xs text-gray-400">Đã bán {product.soldCount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SellerDashboard
