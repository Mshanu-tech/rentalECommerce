import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as productService from '../../services/productService';
import * as categoryService from '../../services/categoryService';
import { getImageUrl } from '../../services/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');

  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  function loadProducts() {
    setLoading(true);
    productService
      .listProducts({ categoryId: categoryId || undefined, search: search || undefined })
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    categoryService.listCategories().then(setCategories).catch(() => {});
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadProducts, [categoryId]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadProducts();
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This also removes its images.`)) return;
    setDeleteError('');
    setDeletingId(product.id);
    try {
      await productService.deleteProduct(product.id);
      loadProducts();
    } catch (err) {
      setDeleteError(err.message || 'Could not delete this product.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your catalog and product images.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700"
        >
          Add product
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 min-w-[200px] gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Search
          </button>
        </form>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {deleteError && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{deleteError}</p>
      )}
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading…</p>
        ) : products.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No products match. Try adding one.</p>
        ) : (
          <>
          {/* Phones: one card per product */}
          <ul className="divide-y divide-gray-100 md:hidden">
            {products.map((product) => {
              const img = product.images.find((i) => i.isPrimary) || product.images[0];
              return (
                <li key={product.id} className="flex gap-3 p-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {img && <img src={getImageUrl(img.url)} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {product.category_name} · ₹{product.price.toFixed(2)} · Stock {product.stock_quantity}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          product.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {product.is_featured ? (
                        <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          ★ Featured
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 flex gap-4 text-sm font-medium">
                      <Link to={`/admin/products/${product.id}/stock`} className="text-gray-500">Stock</Link>
                      <Link to={`/admin/products/${product.id}/edit`} className="text-primary-600">Edit</Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                        className="text-red-600 disabled:opacity-60"
                      >
                        {deletingId === product.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <table className="hidden w-full text-left text-sm md:table">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
                return (
                  <tr key={product.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {primaryImage && (
                            <img
                              src={getImageUrl(primaryImage.url)}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.name}
                            {product.is_featured ? (
                              <span className="ml-2 inline-flex rounded-full bg-amber-50 px-2 py-0.5 align-middle text-[10px] font-semibold text-amber-700">
                                ★ Featured
                              </span>
                            ) : null}
                          </p>
                          <p className="text-xs text-gray-400">{product.sku || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{product.category_name}</td>
                    <td className="px-4 py-3 text-gray-900">₹{product.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          product.stock_quantity === 0
                            ? 'font-medium text-red-700'
                            : product.isLowStock
                              ? 'font-medium text-amber-700'
                              : 'text-gray-500'
                        }
                      >
                        {product.stock_quantity}
                      </span>
                      {product.isLowStock && (
                        <span className="ml-1 text-xs text-amber-600">
                          ({product.stock_quantity === 0 ? 'out of stock' : 'low'})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          product.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/products/${product.id}/stock`}
                        className="mr-3 text-sm font-medium text-gray-500 hover:text-gray-700"
                      >
                        Stock
                      </Link>
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="mr-3 text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
                      >
                        {deletingId === product.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </>
        )}
      </div>
    </div>
  );
}
