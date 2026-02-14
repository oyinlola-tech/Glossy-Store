import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import * as api from '../../services/api';

export function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getAdminProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const remove = async (id: number) => {
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((item) => item.id !== id));
      toast.success('Product deleted');
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    }
  };

  if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Loading products...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-4">Admin Products</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Create/update forms can be added next. Listing and delete are active.</p>
      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex items-center justify-between">
            <div>
              <Link to={`/products/${product.id}`} className="font-semibold text-black dark:text-white hover:text-red-500">
                {product.name}
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">${Number(product.base_price || 0).toFixed(2)}</p>
            </div>
            <button onClick={() => remove(product.id)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
