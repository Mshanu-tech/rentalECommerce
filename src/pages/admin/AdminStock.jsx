import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as productService from '../../services/productService';
import { getImageUrl } from '../../services/api';

export default function AdminStock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    productService
      .getLowStockProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const outOfStock = products.filter((p) => p.stock_quantity === 0);
  const lowStock = products.filter((p) => p.stock_quantity > 0);

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Stock alerts</h1>
        <p className="mt-1 text-sm text-gray-500">
          Active products that are out of stock or at/below their own low-stock threshold.
        </p>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="mt-6 h-48 animate-pulse rounded-2xl bg-gray-100" />
      ) : products.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
          Nothing needs attention right now — every active product is above its low-stock
          threshold.
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {outOfStock.length > 0 && (
            <StockTable title={`Out of stock (${outOfStock.length})`} products={outOfStock} tone="red" />
          )}
          {lowStock.length > 0 && (
            <StockTable title={`Low stock (${lowStock.length})`} products={lowStock} tone="amber" />
          )}
        </div>
      )}
    </div>
  );
}

function StockTable({ title, products, tone }) {
  return (
    <div>
      <h2 className={`text-sm font-semibold ${tone === 'red' ? 'text-red-700' : 'text-amber-700'}`}>{title}</h2>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Threshold</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => {
              const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
              return (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {primaryImage && (
                          <img src={getImageUrl(primaryImage.url)} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.sku || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{product.category_name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-medium ${
                        product.stock_quantity === 0 ? 'text-red-700' : 'text-amber-700'
                      }`}
                    >
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{product.low_stock_threshold}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/products/${product.id}/stock`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      Adjust stock
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
