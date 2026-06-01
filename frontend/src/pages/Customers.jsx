import { useState, useEffect } from 'react'
import { getCustomers, createCustomer, deleteCustomer } from '../api/client'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'

const EMPTY_FORM = { name: '', email: '', phone: '' }

function CustomerForm({ onSubmit, loading }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (ev) => { ev.preventDefault(); if (validate()) onSubmit(form) }

  return (
    <form onSubmit={submit}>
      <div className="form-group">
        <label>Full Name *</label>
        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Jane Smith" />
        {errors.name && <div className="field-error">{errors.name}</div>}
      </div>
      <div className="form-group">
        <label>Email Address *</label>
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
        {errors.email && <div className="field-error">{errors.email}</div>}
      </div>
      <div className="form-group">
        <label>Phone Number</label>
        <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
      </div>
      <div className="modal-footer" style={{ padding: '16px 0 0', borderTop: '1px solid var(--border)' }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Add Customer'}
        </button>
      </div>
    </form>
  )
}

export default function Customers() {
  const toast = useToast()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = () => {
    setLoading(true)
    getCustomers().then(r => setCustomers(r.data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleAdd = async (data) => {
    setSaving(true)
    try {
      await createCustomer(data)
      toast('Customer added successfully')
      setShowAdd(false)
      load()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to add customer', 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await deleteCustomer(deleting.id)
      toast('Customer deleted')
      setDeleting(null)
      load()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to delete customer', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="page-header page-actions">
        <div>
          <h2>Customers</h2>
          <p>Manage your customer records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Customer</button>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading customers…</div> : customers.length === 0 ? (
          <div className="empty"><div className="empty-icon">👥</div><p>No customers yet. Add your first one!</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Added</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.email}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{c.phone || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleting(c)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <Modal title="Add Customer" onClose={() => setShowAdd(false)}>
          <CustomerForm onSubmit={handleAdd} loading={saving} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          message={`Delete customer "${deleting.name}" (${deleting.email})? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={saving}
        />
      )}
    </div>
  )
}
