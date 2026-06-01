import { useState, useEffect } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/client'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'

const EMPTY_FORM = { name: '', sku: '', price: '', quantity: '', description: '' }

function ProductForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.name.trim())   e.name     = 'Name is required'
    if (!form.sku.trim())    e.sku      = 'SKU is required'
    if (form.price === '' || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid non-negative price required'
    if (form.quantity === '' || isNaN(form.quantity) || Number(form.quantity) < 0) e.quantity = 'Valid non-negative quantity required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ ...form, price: Number(form.price), quantity: Number(form.quantity) })
  }

  return (
    <form onSubmit={submit}>
      <div className="form-row">
        <div className="form-group">
          <label>Product Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. MacBook Pro 14" />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>
        <div className="form-group">
          <label>SKU *</label>
          <input value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="e.g. MBP-14-M3" />
          {errors.sku && <div className="field-error">{errors.sku}</div>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Price ($) *</label>
          <input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
          {errors.price && <div className="field-error">{errors.price}</div>}
        </div>
        <div className="form-group">
          <label>Quantity *</label>
          <input type="number" min="0" step="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="0" />
          {errors.quantity && <div className="field-error">{errors.quantity}</div>}
        </div>
      </div>
      <div className="form-group">
        <label>Description</label>
        <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional description" />
      </div>
      <div className="modal-footer" style={{ padding: '16px 0 0', borderTop: '1px solid var(--border)' }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : (initial ? 'Update Product' : 'Add Product')}
        </button>
      </div>
    </form>
  )
}

export default function Products() {
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const load = () => {
    setLoading(true)
    getProducts().then(r => setProducts(r.data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleAdd = async (data) => {
    setSaving(true)
    try {
      await createProduct(data)
      toast('Product added successfully')
      setShowAdd(false)
      load()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to add product', 'error')
    } finally { setSaving(false) }
  }

  const handleEdit = async (data) => {
    setSaving(true)
    try {
      await updateProduct(editing.id, data)
      toast('Product updated')
      setEditing(null)
      load()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to update product', 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await deleteProduct(deleting.id)
      toast('Product deleted')
      setDeleting(null)
      load()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to delete product', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="page-header page-actions">
        <div>
          <h2>Products</h2>
          <p>Manage your product catalog and inventory</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Product</button>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading products…</div> : products.length === 0 ? (
          <div className="empty"><div className="empty-icon">📦</div><p>No products yet. Add your first one!</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>SKU</th><th>Price</th><th>Qty in Stock</th><th>Added</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong>{p.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.description}</div>}</td>
                    <td><code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>{p.sku}</code></td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge-danger' : p.quantity < 10 ? 'badge-warning' : 'badge-completed'}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleting(p)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <Modal title="Add Product" onClose={() => setShowAdd(false)}>
          <ProductForm onSubmit={handleAdd} loading={saving} />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Product" onClose={() => setEditing(null)}>
          <ProductForm
            initial={{ name: editing.name, sku: editing.sku, price: editing.price, quantity: editing.quantity, description: editing.description || '' }}
            onSubmit={handleEdit}
            loading={saving}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          message={`Delete "${deleting.name}" (SKU: ${deleting.sku})? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={saving}
        />
      )}
    </div>
  )
}
