import { useEffect, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import type { Category, Product } from '../../types/shop'
import { getCategories, getProducts } from '../../utils/shop'
import CategoryList from '../../components/shop/CategoryList'
import SearchBar from '../../components/shop/SearchBar'
import ProductGrid from '../../components/shop/ProductGrid'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'sold', label: 'Best selling' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
]

const HaloShopPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryId, setCategoryId] = useState<string | undefined>()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const handleCategoryChange = (id?: string) => {
    setCategoryId(id)
    setPage(1)
  }

  const handleSearchChange = (q: string) => {
    setSearch(q)
    setPage(1)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value)
    setPage(1)
  }

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false

    getProducts({ categoryId, search, sort, page, limit: 20 })
      .then((res) => {
        if (cancelled) return
        setProducts(res.products)
        setTotalPages(res.pagination.totalPages)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [categoryId, search, sort, page])

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingBag className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Halo Shop</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar onSearch={handleSearchChange} placeholder="Search products, shops..." />
        </div>
        <select
          value={sort}
          onChange={handleSortChange}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <CategoryList
          categories={categories}
          selectedId={categoryId}
          onSelect={handleCategoryChange}
        />
      </div>

      <ProductGrid products={products} loading={loading} />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded text-sm ${
                page === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default HaloShopPage
