import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import * as productService from '../../services/productService';
import * as categoryService from '../../services/categoryService';
import { getImageUrl } from '../../services/api';
import ImageCropper from '../../components/ImageCropper';

const emptyForm = {
  categoryId: '',
  name: '',
  description: '',
  price: '',
  compareAtPrice: '',
  sku: '',
  stockQuantity: '0',
  lowStockThreshold: '5',
  isActive: true,
  isFeatured: false,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]); // existing images (edit mode only)
  const [newFiles, setNewFiles] = useState([]); // already-cropped files, uploaded on save
  const [cropQueue, setCropQueue] = useState([]); // picked files still waiting to be cropped
  const [cropTotal, setCropTotal] = useState(0);
  const [cropError, setCropError] = useState('');

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageActionError, setImageActionError] = useState('');
  const [imageActionId, setImageActionId] = useState(null);

  useEffect(() => {
    categoryService.listCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    productService
      .getProduct(id)
      .then((product) => {
        setForm({
          categoryId: String(product.category_id),
          name: product.name,
          description: product.description || '',
          price: String(product.price),
          compareAtPrice: product.compare_at_price !== null ? String(product.compare_at_price) : '',
          sku: product.sku || '',
          stockQuantity: String(product.stock_quantity),
          lowStockThreshold: String(product.low_stock_threshold),
          isActive: Boolean(product.is_active),
          isFeatured: Boolean(product.is_featured),
        });
        setImages(product.images);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  function handleChange(e) {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  const MAX_IMAGES = 6;

  const previews = useMemo(() => newFiles.map((f) => URL.createObjectURL(f)), [newFiles]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  // Picked files go through the cropper one by one; cropped results are what get uploaded.
  function handleFileChange(e) {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    setCropError('');
    const room = MAX_IMAGES - images.length - newFiles.length;
    if (picked.length > room) {
      setCropError(`You can add ${Math.max(room, 0)} more image(s) — a product can have up to ${MAX_IMAGES}.`);
    }
    const accepted = picked.slice(0, Math.max(room, 0));
    setCropTotal(accepted.length);
    setCropQueue(accepted);
  }

  function handleCropDone(file) {
    setNewFiles((prev) => [...prev, file]);
    setCropQueue((prev) => prev.slice(1));
  }

  function handleCropCancel() {
    setCropQueue([]);
  }

  function removeNewFile(i) {
    setNewFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (location.state?.success) {
      navigate(location.pathname, { replace: true, state: null });
    }
    setSubmitting(true);
    try {
      const payload = { ...form, images: newFiles };
      if (isEditing) {
        await productService.updateProduct(id, payload);
        setNewFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        const refreshed = await productService.getProduct(id);
        setImages(refreshed.images);
        setSuccess('Product updated successfully.');
      } else {
        const created = await productService.createProduct(payload);
        navigate(`/admin/products/${created.id}/edit`, {
          replace: true,
          state: { success: 'Product created successfully.' },
        });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSetPrimary(imageId) {
    setImageActionError('');
    setImageActionId(imageId);
    try {
      await productService.setPrimaryImage(id, imageId);
      setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === imageId })));
    } catch (err) {
      setImageActionError(err.message || 'Could not update the primary image.');
    } finally {
      setImageActionId(null);
    }
  }

  async function handleDeleteImage(imageId) {
    if (!window.confirm('Remove this image?')) return;
    setImageActionError('');
    setImageActionId(imageId);
    try {
      await productService.deleteProductImage(id, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      setImageActionError(err.message || 'Could not remove this image.');
    } finally {
      setImageActionId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/products" className="text-sm font-medium text-gray-500 hover:text-gray-700">
          ← Products
        </Link>
      </div>
      <h1 className="mt-2 text-xl font-semibold text-gray-900">
        {isEditing ? 'Edit product' : 'New product'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                SKU
              </label>
              <input
                id="sku"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="compareAtPrice" className="block text-sm font-medium text-gray-700">
                Compare-at price
              </label>
              <input
                id="compareAtPrice"
                name="compareAtPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.compareAtPrice}
                onChange={handleChange}
                placeholder="Optional"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">
                Stock quantity
              </label>
              <input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                min="0"
                value={form.stockQuantity}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              {isEditing && (
                <p className="mt-1 text-xs text-gray-500">
                  For restocks, damage write-offs, or returns, use{' '}
                  <Link to={`/admin/products/${id}/stock`} className="font-medium text-primary-600 hover:underline">
                    Adjust stock
                  </Link>{' '}
                  instead — it keeps a logged history. This field is best for the initial count
                  or a one-off correction.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">
                Low-stock threshold
              </label>
              <input
                id="lowStockThreshold"
                name="lowStockThreshold"
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                You'll see this product flagged on the dashboard and /admin/stock once stock
                drops to or below this number.
              </p>
            </div>

            {isEditing && (
              <label className="flex items-center gap-2 pt-6 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                Active (visible to shoppers)
              </label>
            )}

            <label className="flex items-start gap-2 text-sm text-gray-700 sm:col-span-2">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span>
                Featured product
                <span className="block text-xs text-gray-500">
                  Shown in the home page's featured section and the Editor's pick.
                </span>
              </span>
            </label>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Images</h2>
          <p className="mt-1 text-xs text-gray-500">
            JPEG, PNG, WEBP, or GIF. Up to 6 images, 5MB each. The first image is the primary one
            shown to shoppers unless you choose another below.
          </p>

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((img) => (
                <div key={img.id} className="group relative">
                  <img
                    src={getImageUrl(img.url)}
                    alt=""
                    className={`aspect-square w-full rounded-lg object-cover ring-2 ${
                      img.isPrimary ? 'ring-primary-500' : 'ring-transparent'
                    }`}
                  />
                  {img.isPrimary && (
                    <span className="absolute left-1 top-1 rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-medium text-white">
                      Primary
                    </span>
                  )}
                  <div className="mt-1 flex justify-between text-xs">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(img.id)}
                        disabled={imageActionId === img.id}
                        className="font-medium text-primary-600 hover:text-primary-700 disabled:opacity-60"
                      >
                        Make primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      disabled={imageActionId === img.id}
                      className="ml-auto font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {imageActionError && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{imageActionError}</p>
          )}

          <div className="mt-4">
            <label htmlFor="images" className="block text-sm font-medium text-gray-700">
              {isEditing ? 'Add more images' : 'Upload images'}
            </label>
            <input
              ref={fileInputRef}
              id="images"
              name="images"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
            />
            {cropError && <p className="mt-2 text-xs text-red-600">{cropError}</p>}
            {newFiles.length > 0 && (
              <>
                <p className="mt-2 text-xs text-gray-500">
                  {newFiles.length} cropped image(s) ready — will upload when you save.
                </p>
                <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {newFiles.map((f, i) => (
                    <div key={`${f.name}-${i}`} className="relative">
                      <img
                        src={previews[i]}
                        alt=""
                        className="aspect-square w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewFile(i)}
                        className="mt-1 text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {(success || location.state?.success) && (
          <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
            {success || location.state.success}
          </p>
        )}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        {cropQueue.length > 0 && (
          <ImageCropper
            file={cropQueue[0]}
            index={cropTotal - cropQueue.length}
            total={cropTotal}
            onDone={handleCropDone}
            onCancel={handleCropCancel}
          />
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create product'}
          </button>
          <Link
            to="/admin/products"
            className="inline-flex items-center rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
