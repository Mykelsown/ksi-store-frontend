import { useEffect, useState } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../api/addresses";
import { useApp } from "../context/useApp";
import "./AddressBook.css";

const EMPTY_FORM = {
  label: "",
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Nigeria",
  isDefault: false,
};

export default function AddressBook() {
  const { showToast } = useApp();
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadAddresses = async () => {
    try {
      const response = await getAddresses();
      const payload = response?.data || response;
      setAddresses(Array.isArray(payload) ? payload : []);
    } catch {
      setAddresses([]);
    }
  };

  useEffect(() => {
    void loadAddresses();
  }, []);

  const startAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (address) => {
    setForm({ ...address });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateAddress(editingId, form);
        showToast?.("Address updated");
      } else {
        await createAddress(form);
        showToast?.("Address saved");
      }
      setShowForm(false);
      await loadAddresses();
    } catch (err) {
      showToast?.(err?.response?.data?.message || "Couldn't save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAddress(id);
      showToast?.("Address removed");
      await loadAddresses();
    } catch (err) {
      showToast?.(err?.response?.data?.message || "Couldn't remove address");
    }
  };

  return (
    <div className="address-book">
      {addresses.length === 0 && !showForm && (
        <p>No saved addresses yet.</p>
      )}

      {!showForm && (
        <div className="address-list">
          {addresses.map((address) => (
            <div key={address.id} className="address-card">
              <div className="address-card-header">
                <strong>{address.label}</strong>
                {address.isDefault && (
                  <span className="address-default-badge">
                    <Star size={12} fill="currentColor" /> Default
                  </span>
                )}
              </div>
              <p>{address.fullName}</p>
              <p>
                {address.street}, {address.city}, {address.state}{" "}
                {address.zipCode}, {address.country}
              </p>
              <p>{address.phone}</p>
              <div className="address-card-actions">
                <button onClick={() => startEdit(address)}>
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(address.id)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <form className="address-form" onSubmit={handleSubmit}>
          <div className="address-form-grid">
            <input
              placeholder="Label (e.g. Home)"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              required
            />
            <input
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <input
              placeholder="Street address"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              required
              style={{ gridColumn: "1 / -1" }}
            />
            <input
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
            <input
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              required
            />
            <input
              placeholder="Zip code"
              value={form.zipCode}
              onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
              required
            />
            <input
              placeholder="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              required
            />
          </div>
          <label className="address-default-check">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm({ ...form, isDefault: e.target.checked })
              }
            />
            Set as default address
          </label>
          <div className="address-form-actions">
            <button
              type="button"
              className="btn-outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      ) : (
        <button className="btn-outline address-add-btn" onClick={startAdd}>
          <Plus size={16} /> Add Address
        </button>
      )}
    </div>
  );
}
