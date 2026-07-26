import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingBag, ChevronLeft, Minus, Plus, Loader2, Star, ShieldCheck, Truck } from 'lucide-react'
import type { Product } from '../../types/shop'
import { getProductById } from '../../utils/shop'
import VerifiedShopBadge from '../../components/shop/VerifiedShopBadge'

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!productId) return
    getProductById(productId)
      .then(setProduct)
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false))
  }, [productId, navigate])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!product) return null

  const displayPrice = product.salePrice ?? product.price
  const hasDiscount = product.salePrice !== null && product.salePrice < product.price
  const discountPercent = hasDiscount ? Math.round((1 - product.salePrice! / product.price) * 100) : 0
  const images = product.images?.length ? product.images : [{ url: '/placeholder.png', id: '', order: 0 }]

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Quay lại
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 mb-3">
            <img
              src={images[selectedImage]?.url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${
                    i === selectedImage ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>

          {product.shop && (
            <div className="flex items-center gap-1.5 mb-4">
              <ShoppingBag className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">{product.shop.name}</span>
              {product.shop.verification?.status === 'APPROVED' && <VerifiedShopBadge />}
            </div>
          )}

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-red-500">
              ₫{displayPrice.toLocaleString('vi-VN')}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ₫{product.price.toLocaleString('vi-VN')}
                </span>
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              {product.rating.toFixed(1)}
            </span>
            <span>Đã bán {product.soldCount}</span>
            <span>{product.reviewCount} đánh giá</span>
          </div>

          {product.category && (
            <div className="mb-4">
              <span className="text-sm text-gray-400">Danh mục: </span>
              <span className="text-sm font-medium text-gray-700">{product.category.name}</span>
            </div>
          )}

          {product.sku && (
            <div className="mb-4">
              <span className="text-sm text-gray-400">SKU: </span>
              <span className="text-sm text-gray-700">{product.sku}</span>
            </div>
          )}

          {product.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Mô tả sản phẩm</h3>
              <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Quantity selector */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm font-medium text-gray-700">Số lượng:</span>
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-800 min-w-[40px] text-center border-x border-gray-200">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm text-gray-400">{product.stock} sản phẩm có sẵn</span>
          </div>

          {product.stock === 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700 mb-4">
              Sản phẩm hiện đang hết hàng
            </div>
          )}

          <div className="flex gap-3">
            <button
              disabled={product.stock === 0}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Thêm vào giỏ hàng
            </button>
            <button
              disabled={product.stock === 0}
              className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mua ngay
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Bảo hành chính hãng
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Truck className="w-4 h-4 text-blue-500" />
              Miễn phí vận chuyển
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShoppingBag className="w-4 h-4 text-orange-500" />
              Đổi trả trong 7 ngày
            </div>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Phân loại</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
