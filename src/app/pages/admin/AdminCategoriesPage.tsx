import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as api from '../../services/api';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<api.Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const response = await api.getCategories({ tree: false });
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
        description: description.trim() || undefined,
        parent_id: parentId ? Number(parentId) : undefined,
      });
      setName('');
      setDescription('');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6">Admin Categories</h1>
      <form onSubmit={create} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 grid md:grid-cols-4 gap-3 mb-6">
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Category name" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white" />
        <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white">
          <option value="">No Parent</option>
          {parentCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <button className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600">Create Category</button>
      </form>

      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex items-center justify-between">
            <div>
              <p className="font-semibold text-black dark:text-white">{category.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{category.description || 'No description'}</p>
              {category.parent_id ? <p className="text-xs text-gray-400 dark:text-gray-500">Subcategory</p> : null}
            </div>
            <button onClick={() => remove(category.id)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
