import { useState, useEffect } from 'react'
import { getOrders, getOrder, createOrder, deleteOrder, getCustomers, getProducts } from '../api/client'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'

function OrderForm({ onSubmit, loading }) {
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    getCustomers().then(r => setCustomers(r.data))
    getProducts().then(r => setProducts(r.data))
  }, [])

  const addItem = () => setItems(prev => [...prev, { product_id: '', quantity: 1 }])
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i))
  const setItem = (i, field, val) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: val } : it))

  const validate = () => {
    const e = {}
    if (!customerId) e.customer = 'Select a customer'
    if (items.some(it => !it.product_id)) e.items = 'Select a product for each line'
    if (items.some(it => !it.quantity || Number(it.quantity) < 1)) e.items = 'Quantity must be at least 1'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const getTotal = () => items.reduce((sum, it) => {
    const p = products.find(p => p.id === Number(it.product_id))
    return sum + (p ? p.price * Number(it.quantity || 0) : 0)
  }, 0)

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      customer_id: Number(customerId),
      items: items.map(it => ({ product_id: Number(it.product_id), quantity: Number(it.quantity) })),
    })
  }

  return (
    <form onSubmit={submit}>
      <div className="form-group">
        <label>Customer *</label>
        <select value={customerId} onChange={e => { setCustomerId(e.target.value); setErrors(er => ({ ...er, customer: '' })) }}>
          <option value="">Select customer…</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
        </select>
        {errors.customer && <div className="field-error">{errors.customer}</div>}
      </div>

      <div className="form-group">
        <label>Order Items *</label>
        {items.map((item, i) => (
          <div className="order-item-row" key={i}>
            <select value={item.product_id} onChange={e => setItem(i, 'product_id', e.target.value)}>
              <option value="">Select product…</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price.toFixed(2)} (stock: {p.quantity})</option>)}
            </select>
            <input
              type="number" min="1" value={item.quantity}
              onChange={e => setItem(i, 'quantity', e.target.value)}
              placeholder="Qty"
            />
            {items.length > 1 && (
              <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => removeItem(i)} title="Remove">✕</button>
            )}
          </div>
        ))}
        {errors.items && <div className="field-error">{errors.items}</div>}
        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={addItem}>+ Add Item</button>
      </div>

      <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 16px', marginBottom: 4 }}>
        <strong style={{ fontSize: 14 }}>Estimated Total: ${getTotal().toFixed(2)}</strong>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Final total calculated by server</div>
      </div>

      <div className="modal-footer" style={{ padding: '16px 0 0', borderTop: '1px solid var(--border)' }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Placing Order…' : 'Place Order'}
        </button>
      </div>
    </form>
  )
}

function OrderDetailModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrder(orderId).then(r => setOrder(r.data)).finally(() => setLoading(false))
  }, [orderId])

  return (
    <Modal title={`Order #${orderId}`} onClose={onClose} large>
      {loading ? <div className="loading">Loading…</div> : !order ? <div>Not found</div> : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div><div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Customer</div><div style={{ marginTop: 4 }}>{order.customer_name}</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Status</div><div style={{ marginTop: 4 }}><span className={`badge badge-${order.status}`}>{order.status}</span></div></div>
            <div><div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Date</div><div style={{ marginTop: 4 }}>{new Date(order.created_at).toLocaleString()}</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total</div><div style={{ marginTop: 4, fontWeight: 700, fontSize: 16 }}>${order.total_amount.toFixed(2)}</div></div>
          </div>
          <table>
            <thead><tr><th>Product</th><th>Unit Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
            <tbody>
              {order.items.map(it => (
                <tr key={it.id}>
                  <td>{it.product_name}</td>
                  <td>${it.unit_price.toFixed(2)}</td>
                  <td>{it.quantity}</td>
                  <td><strong>${(it.unit_price * it.quantity).toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  )
}

export default function Orders() {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [viewId, setViewId] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const load = () => {
    setLoading(true)
    getOrders().then(r => setOrders(r.data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async (data) => {
    setSaving(true)
    try {
      await createOrder(data)
      toast('Order placed successfully')
      setShowAdd(false)
      load()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to place order', 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await deleteOrder(deleting.id)
      toast('Order cancelled and stock restored')
      setDeleting(null)
      load()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to cancel order', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="page-header page-actions">
        <div>
          <h2>Orders</h2>
          <p>Place and manage customer orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ New Order</button>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading orders…</div> : orders.length === 0 ? (
          <div className="empty"><div className="empty-icon">🛒</div><p>No orders yet.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td><strong>#{o.id}</strong></td>
                    <td>{o.customer_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                    <td><strong>${o.total_amount.toFixed(2)}</strong></td>
                    <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setViewId(o.id)}>View</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleting(o)}>Cancel</button>
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
        <Modal title="New Order" onClose={() => setShowAdd(false)} large>
          <OrderForm onSubmit={handleCreate} loading={saving} />
        </Modal>
      )}

      {viewId && <OrderDetailModal orderId={viewId} onClose={() => setViewId(null)} />}

      {deleting && (
        <ConfirmDialog
          message={`Cancel Order #${deleting.id} (${deleting.customer_name}, $${deleting.total_amount.toFixed(2)})? Stock will be restored.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={saving}
        />
      )}
    </div>
  )
}
