import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as api from '../../services/api';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<api.Category[]>([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [openParents, setOpenParents] = useState<number[]>([]);

  const load = async () => {
    try {
      const response = await api.getCategories({ tree: true });
      setCategories(response.categories || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCategory({
        name: name.trim(),
        parent_id: parentId ? Number(parentId) : undefined,
      });
      setName('');
      setParentId('');
      toast.success('Category created');
      await load();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create category');
    }
  };

  const remove = async (id: number) => {
    try {
      await api.deleteCategory(id);
      toast.success('Category deleted');
      await load();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Loading categories...</div>;

  const parentCategories = categories.filter((category) => !category.parent_id);
  const toggleParent = (id: number) => {
    setOpenParents((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6">Admin Categories</h1>
      <form onSubmit={create} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 grid md:grid-cols-3 gap-3 mb-6">
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Category name" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white" />
        <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white">
          <option value="">No Parent</option>
          {parentCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <button className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600">Create Category</button>
      </form>

      <div className="space-y-3">
        {parentCategories.map((category) => {
          const isOpen = openParents.includes(category.id);
          const subcategories = category.subcategories || [];
          return (
            <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-black dark:text-white">{category.name}</p>
                  {subcategories.length ? (
                    <button onClick={() => toggleParent(category.id)} className="text-xs text-red-500 hover:underline">
                      {isOpen ? 'Hide' : 'Show'} subcategories
                    </button>
                  ) : null}
                </div>
                <button onClick={() => remove(category.id)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
              </div>
              {isOpen && subcategories.length ? (
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 pb-4">
                  <div className="pt-3 space-y-2">
                    {subcategories.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded px-3 py-2">
                        <span className="text-sm text-gray-700 dark:text-gray-200">{sub.name}</span>
                        <button onClick={() => remove(sub.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
