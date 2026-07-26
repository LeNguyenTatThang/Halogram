import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react'
import type { Product, ProductStatus } from '../../types/shop'
import { getMyProducts, deleteProduct } from '../../utils/shop'
import HalogramLoading from '../../components/ui/HalogramLoading'

const STATUS_TABS = [
  { value: '', label: 'Tất cả' },
  { value: 'ACTIVE', label: 'Đang bán' },
  { value: 'OUT_OF_STOCK', label: 'Hết hàng' },
  { value: 'INACTIVE', label: 'Đã ẩn' },
  { value: 'ARCHIVED', label: 'Đã lưu trữ' },
]

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Đang bán',
  INACTIVE: 'Đã ẩn',
  OUT_OF_STOCK: 'Hết hàng',
  ARCHIVED: 'Đã lưu trữ',
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  OUT_OF_STOCK: 'bg-orange-100 text-orange-700',
  ARCHIVED: 'bg-red-100 text-red-600',
}

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'sold', label: 'Bán chạy' },
  { value: 'name', label: 'Tên A-Z' },
]

const ProductManage: React.FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('createdAt')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyProducts({ search, status, sort, page, limit: 15 })
      setProducts(res.products)
      setTotalPages(res.pagination.totalPages)
      setTotal(res.pagination.total)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [search, status, sort, page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = (value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setSearch(value)
      setPage(1)
    }, 300)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id)
      setConfirmDelete(null)
      fetchProducts()
    } catch {
      setConfirmDelete(null)
    }
  }

  const formatPrice = (price: number) =>
    '₫' + price.toLocaleString('vi-VN')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quản lý sản phẩm</h2>
          <p className="text-sm text-gray-400 mt-0.5">{total} sản phẩm</p>
        </div>
        <button
          onClick={() => navigate('/shop/manage/products/create')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setStatus(tab.value); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  status === tab.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1) }}
              className="ml-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <HalogramLoading size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Chưa có sản phẩm nào</p>
            <button
              onClick={() => navigate('/shop/manage/products/create')}
              className="mt-3 text-blue-600 text-sm font-semibold hover:underline"
            >
              + Thêm sản phẩm đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 min-w-[250px]">Sản phẩm</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">Giá</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">Kho</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">Đã bán</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Trạng thái</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0]?.url || '/placeholder.png'}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate max-w-[250px]">{product.name}</p>
                          {product.sku && (
                            <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="font-medium text-gray-800">{formatPrice(product.price)}</span>
                      {product.salePrice && (
                        <>
                          <br />
                          <span className="text-xs text-red-500 line-through">{formatPrice(product.salePrice)}</span>
                        </>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">{product.stock}</td>
                    <td className="py-3 px-4 text-right">{product.soldCount}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[product.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABEL[product.status] || product.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => navigate(`/shop/manage/products/${product.id}/edit`)}
                          className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {product.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => setConfirmDelete(product.id)}
                            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-400">
              Trang {page} / {totalPages}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                    page === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Xóa sản phẩm</h3>
            <p className="text-sm text-gray-500 mb-6">
              Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductManage
