import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX, X } from 'lucide-react';
import * as productService from '../services/productService';
import * as categoryService from '../services/categoryService';
import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name-asc', label: 'Name: A–Z' },
];

function sortProducts(products, sort) {
  const sorted = [...products];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted; // 'newest' — the API already orders by created_at DESC
  }
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const sort = searchParams.get('sort') || 'newest';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryService.listCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    productService
      .listProducts({ categoryId: categoryId || undefined, search: search || undefined })
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [categoryId, search]);

  const sortedProducts = useMemo(() => sortProducts(products, sort), [products, sort]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  function clearSearch() {
    updateParam('search', '');
  }

  const activeCategoryName = categories.find((c) => String(c.id) === categoryId)?.name;

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-gray-900 sm:text-2xl">
            {activeCategoryName ? activeCategoryName : 'Shop all products'}
          </h1>
          {search ? (
            <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              Results for <span className="font-medium text-gray-700">“{search}”</span>
              <button
                type="button"
                onClick={clearSearch}
                className="inline-flex items-center gap-0.5 text-primary-600 hover:text-primary-700"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </button>
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              {loading ? 'Loading…' : `${sortedProducts.length} product${sortedProducts.length === 1 ? '' : 's'}`}
            </p>
          )}
        </div>

        <label className="flex flex-shrink-0 items-center gap-2 text-sm text-gray-600">
          <span className="hidden sm:inline">Sort by</span>
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value === 'newest' ? '' : e.target.value)}
            aria-label="Sort products"
            className="max-w-[9.5rem] rounded-lg border border-gray-300 px-2 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:max-w-none sm:px-3"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="-mx-4 mt-4 flex flex-nowrap gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:mt-5 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => updateParam('categoryId', '')}
          className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
            !categoryId
              ? 'bg-primary-600 text-white shadow-sm'
              : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => updateParam('categoryId', String(c.id))}
            className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
              categoryId === String(c.id)
                ? 'bg-primary-600 text-white shadow-sm'
                : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center text-gray-500">
          <SearchX className="h-10 w-10 text-gray-300" aria-hidden="true" />
          <p className="text-sm">
            {search
              ? `No products match “${search}”.`
              : 'No products in this category yet.'}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
