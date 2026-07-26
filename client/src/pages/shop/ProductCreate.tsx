import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Upload, Plus, Loader2, Info, ImagePlus } from 'lucide-react'
import type { Category } from '../../types/shop'
import { getCategories, createProduct } from '../../utils/shop'

interface VariantEntry {
  key: string
  name: string
  price: number
  stock: number
  sku: string
}

const ProductCreate: React.FC = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [sku, setSku] = useState('')
  const [stock, setStock] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState<VariantEntry[]>([
    { key: crypto.randomUUID(), name: '', price: 0, stock: 0, sku: '' },
  ])
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoadingCategories(false))
  }, [])

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const arr = Array.from(newFiles)
    const total = files.length + arr.length
    if (total > 10) {
      setErrors((e) => ({ ...e, images: 'Tối đa 10 ảnh' }))
      return
    }
    setErrors((e) => {
      const { images, ...rest } = e
      return rest
    })

    const valid: File[] = []
    const newPreviews: string[] = []

    for (const f of arr) {
      if (!f.type.startsWith('image/')) {
        setErrors((e) => ({ ...e, images: 'Chỉ chấp nhận file hình ảnh' }))
        continue
      }
      if (f.size > 5 * 1024 * 1024) {
        setErrors((e) => ({ ...e, images: 'File không được quá 5MB' }))
        continue
      }
      valid.push(f)
      newPreviews.push(URL.createObjectURL(f))
    }

    setFiles((prev) => [...prev, ...valid])
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}

    if (!name.trim()) errs.name = 'Vui lòng nhập tên sản phẩm'
    else if (name.length > 200) errs.name = 'Tên không quá 200 ký tự'

    if (!categoryId) errs.categoryId = 'Vui lòng chọn danh mục'

    if (description && description.length > 2000) errs.description = 'Mô tả không quá 2000 ký tự'

    if (files.length === 0) errs.images = 'Vui lòng chọn ít nhất 1 ảnh'

    const p = parseInt(price)
    if (!price || isNaN(p) || p <= 0) errs.price = 'Giá phải lớn hơn 0'

    if (salePrice) {
      const sp = parseInt(salePrice)
      if (isNaN(sp) || sp < 0) errs.salePrice = 'Giá khuyến mãi không hợp lệ'
      else if (sp > p) errs.salePrice = 'Giá khuyến mãi không được lớn hơn giá bán'
    }

    if (!hasVariants) {
      if (!stock || parseInt(stock) < 0) errs.stock = 'Số lượng tồn kho không hợp lệ'
    }

    if (hasVariants) {
      for (const v of variants) {
        if (!v.name.trim()) {
          errs.variants = 'Vui lòng nhập tên cho tất cả biến thể'
          break
        }
        if (v.price <= 0) {
          errs.variants = 'Giá biến thể phải lớn hơn 0'
          break
        }
        if (v.stock < 0) {
          errs.variants = 'Số lượng tồn kho biến thể không hợp lệ'
          break
        }
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('description', description.trim())
      formData.append('price', price)
      formData.append('categoryId', categoryId)
      if (salePrice) formData.append('salePrice', salePrice)
      if (sku.trim()) formData.append('sku', sku.trim())
      if (!hasVariants) {
        formData.append('stock', stock || '0')
      }
      files.forEach((f) => formData.append('images', f))

      if (hasVariants) {
        formData.append(
          'variants',
          JSON.stringify(
            variants.map((v) => ({
              name: v.name.trim(),
              price: v.price,
              stock: v.stock,
              sku: v.sku.trim() || undefined,
            })),
          ),
        )
      }

      await createProduct(formData)
      navigate('/shop/manage/products')
    } catch {
      setErrors((e) => ({ ...e, submit: 'Đã có lỗi xảy ra, vui lòng thử lại' }))
    } finally {
      setSubmitting(false)
    }
  }

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { key: crypto.randomUUID(), name: '', price: parseInt(price) || 0, stock: 0, sku: '' },
    ])
  }

  const updateVariant = (key: string, field: keyof VariantEntry, value: string | number) => {
    setVariants((prev) =>
      prev.map((v) => (v.key === key ? { ...v, [field]: value } : v)),
    )
  }

  const removeVariant = (key: string) => {
    setVariants((prev) => prev.filter((v) => v.key !== key))
  }

  const inputClass = (field: string) =>
    `w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${
      errors[field] ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-400'
    }`

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Thêm sản phẩm mới</h2>

      <div className="space-y-6">
        {/* Thong tin co ban */}
        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            Thông tin cơ bản
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Áo thun nam cotton"
                className={inputClass('name')}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={inputClass('categoryId')}
              >
                <option value="">Chọn danh mục</option>
                {loadingCategories ? (
                  <option disabled>Đang tải...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
              {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sản phẩm</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết về sản phẩm..."
                rows={4}
                className={inputClass('description')}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>
          </div>
        </section>

        {/* Hinh anh */}
        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ImagePlus className="w-4 h-4 text-blue-500" />
            Hình ảnh sản phẩm
          </h3>

          <div className="flex gap-3 flex-wrap">
            {previews.map((preview, i) => (
              <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img src={preview} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                    Chính
                  </span>
                )}
              </div>
            ))}

            {files.length < 10 && (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span className="text-[10px]">Upload</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
          {errors.images && <p className="text-xs text-red-500 mt-2">{errors.images}</p>}
          <p className="text-xs text-gray-400 mt-2">Hỗ trợ JPG, PNG, WebP. Tối đa 5MB/ảnh. Ảnh đầu tiên là ảnh chính.</p>
        </section>

        {/* Gia & Kho hang */}
        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Giá & Kho hàng</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá bán <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className={inputClass('price')}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₫</span>
              </div>
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá khuyến mãi</label>
              <div className="relative">
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="0"
                  className={inputClass('salePrice')}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₫</span>
              </div>
              {errors.salePrice && <p className="text-xs text-red-500 mt-1">{errors.salePrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Mã sản phẩm"
                className={inputClass('sku')}
              />
            </div>

            {!hasVariants && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn kho</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  className={inputClass('stock')}
                />
                {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
              </div>
            )}
          </div>
        </section>

        {/* Phan loai / Variants */}
        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Phân loại sản phẩm</h3>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Sản phẩm có biến thể
            </label>
          </div>

          {hasVariants && (
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-2">
                <div className="col-span-3">Tên phân loại</div>
                <div className="col-span-3">Giá</div>
                <div className="col-span-2">Kho</div>
                <div className="col-span-3">SKU</div>
                <div className="col-span-1" />
              </div>

              {variants.map((v, i) => (
                <div key={v.key} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <input
                      value={v.name}
                      onChange={(e) => updateVariant(v.key, 'name', e.target.value)}
                      placeholder={i === 0 ? 'VD: Đen / S' : ''}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                  <div className="col-span-3 relative">
                    <input
                      type="number"
                      value={v.price || ''}
                      onChange={(e) => updateVariant(v.key, 'price', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm outline-none focus:border-blue-400"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₫</span>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={v.stock || ''}
                      onChange={(e) => updateVariant(v.key, 'stock', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      value={v.sku}
                      onChange={(e) => updateVariant(v.key, 'sku', e.target.value)}
                      placeholder="SKU"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                  <div className="col-span-1">
                    {variants.length > 1 && (
                      <button
                        onClick={() => removeVariant(v.key)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {errors.variants && <p className="text-xs text-red-500">{errors.variants}</p>}

              <button
                onClick={addVariant}
                className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Thêm biến thể
              </button>
            </div>
          )}
        </section>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {errors.submit}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate('/shop/manage/products')}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Đang đăng...' : 'Đăng sản phẩm'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCreate
