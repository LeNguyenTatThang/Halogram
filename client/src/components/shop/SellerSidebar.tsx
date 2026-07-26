import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  TicketPercent,
  Gift,
  Settings,
} from 'lucide-react'

const links = [
  { to: '/shop/manage', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
  { to: '/shop/manage/products', label: 'Sản phẩm', icon: Package },
  { to: '/shop/manage/orders', label: 'Đơn hàng', icon: ShoppingCart },
  { to: '/shop/manage/inventory', label: 'Kho hàng', icon: Warehouse },
  { to: '/shop/manage/vouchers', label: 'Voucher', icon: TicketPercent },
  { to: '/shop/manage/promotions', label: 'Ưu đãi', icon: Gift },
  { to: '/shop/manage/settings', label: 'Cài đặt Shop', icon: Settings },
]

const SellerSidebar: React.FC = () => {
  return (
    <aside className="w-56 flex-shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">Quản lý Halo Shop</h2>
      </div>
      <nav className="p-2 space-y-0.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={!!link.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default SellerSidebar
