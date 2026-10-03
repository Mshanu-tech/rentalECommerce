import { useEffect, useState } from 'react';
import * as categoryService from '../../services/categoryService';

const emptyForm = { name: '', description: '', isActive: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [editingId, setEditingId] = useState(null); // null = "creating new"
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  function loadCategories() {
    setLoading(true);
    categoryService
      .listCategories()
      .then(setCategories)
      .catch((err) => setListError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(loadCategories, []);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
  }

  function startEdit(category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description || '',
      isActive: Boolean(category.is_active),
    });
    setFormError('');
  }

  function handleChange(e) {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, form);
      } else {
        await categoryService.createCategory(form);
      }
      startCreate();
      loadCategories();
    } catch (err) {
      setFormError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(category) {
    if (!window.confirm(`Delete "${category.name}"? This can't be undone.`)) return;
    setDeleteError('');
    setDeletingId(category.id);
    try {
      await categoryService.deleteCategory(category.id);
      if (editingId === category.id) startCreate();
      loadCategories();
    } catch (err) {
      setDeleteError(err.message || 'Could not delete this category.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Categories</h1>
      <p className="mt-1 text-sm text-gray-500">Group products so shoppers can browse by type.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-1"
        >
          <h2 className="text-sm font-semibold text-gray-900">
            {editingId ? 'Edit category' : 'New category'}
          </h2>

          <div className="mt-4 space-y-4">
            <div>
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {editingId && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
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
          </div>

          {formError && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{formError}</p>
          )}

          <div className="mt-5 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Create category'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={startCreate}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
          {deleteError && (
            <p className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{deleteError}</p>
          )}
          {listError && (
            <p className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{listError}</p>
          )}

          {loading ? (
            <p className="p-6 text-sm text-gray-500">Loading…</p>
          ) : categories.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No categories yet — create the first one.</p>
          ) : (
            <div className="overflow-x-auto">
<table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900">{category.name}</td>
                    <td className="px-4 py-3 text-gray-500">{category.slug}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          category.is_active
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        className="mr-3 text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        disabled={deletingId === category.id}
                        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
                      >
                        {deletingId === category.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
</div>
          )}
        </div>
      </div>
    </div>
  );
}
