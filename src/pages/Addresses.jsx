import { useEffect, useState } from 'react';
import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import * as addressService from '../services/addressService';
import AddressForm from '../components/AddressForm';

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // address being edited, or null for "new"
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    addressService
      .listAddresses()
      .then(setAddresses)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(payload) {
    await addressService.createAddress(payload);
    setFormOpen(false);
    load();
  }

  async function handleUpdate(payload) {
    await addressService.updateAddress(editing.id, payload);
    setEditing(null);
    load();
  }

  async function handleDelete(id) {
    setBusyId(id);
    try {
      await addressService.deleteAddress(id);
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleSetDefault(id) {
    setBusyId(id);
    try {
      await addressService.setDefaultAddress(id);
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Your addresses</h1>
        {!formOpen && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add address
          </button>
        )}
      </div>

      {formOpen && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">New address</h2>
          <AddressForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} />
        </div>
      )}

      {loading ? (
        <div className="mt-6 space-y-3">
          <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      ) : addresses.length === 0 && !formOpen ? (
        <div className="mt-10 text-center text-sm text-gray-500">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-gray-300" aria-hidden="true" />
          You haven't saved any addresses yet.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {addresses.map((address) =>
            editing?.id === address.id ? (
              <div key={address.id} className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-sm font-semibold text-gray-900">Edit address</h2>
                <AddressForm
                  initialValue={editing}
                  onSubmit={handleUpdate}
                  onCancel={() => setEditing(null)}
                  submitLabel="Save changes"
                />
              </div>
            ) : (
              <div
                key={address.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{address.fullName}</p>
                    {address.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                        <Star className="h-3 w-3 fill-primary-700" aria-hidden="true" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-gray-600">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''}
                  </p>
                  <p className="text-gray-600">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-gray-600">{address.country}</p>
                  <p className="mt-1 text-gray-400">{address.phone}</p>
                </div>

                <div className="flex flex-shrink-0 items-center gap-1">
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(address.id)}
                      disabled={busyId === address.id}
                      title="Set as default"
                      className="rounded-full p-2 text-gray-400 transition hover:bg-gray-50 hover:text-primary-600 disabled:opacity-50"
                    >
                      <Star className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFormOpen(false);
                      setEditing(address);
                    }}
                    title="Edit"
                    className="rounded-full p-2 text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(address.id)}
                    disabled={busyId === address.id}
                    title="Delete"
                    className="rounded-full p-2 text-gray-400 transition hover:bg-gray-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
