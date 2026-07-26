import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import type { Product } from '../../types/shop'
import VerifiedShopBadge from './VerifiedShopBadge'

interface ProductCardProps {
  product: Product
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const imageUrl = product.images?.[0]?.url || '/placeholder.png'
  const displayPrice = product.salePrice ?? product.price
  const hasDiscount = product.salePrice !== null && product.salePrice !== undefined && product.salePrice < product.price
  const discountPercent = hasDiscount ? Math.round((1 - product.salePrice! / product.price) * 100) : 0

  return (
    <Link
      to={`/shop/products/${product.id}`}
      className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Sold out</span>
          </div>
        )}
      </div>

      <div className="p-2.5">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="text-base font-bold text-red-500">
            ₫{displayPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              ₫{product.price.toLocaleString()}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-0.5">
            ★ {product.rating.toFixed(1)}
          </span>
          <span>Đã bán {product.soldCount}</span>
        </div>

        <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
          {product.shop && (
            <>
              <ShoppingBag className="w-3 h-3" />
              <span className="truncate">{product.shop.name}</span>
              {product.shop.verification?.status === 'APPROVED' && (
                <VerifiedShopBadge />
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
