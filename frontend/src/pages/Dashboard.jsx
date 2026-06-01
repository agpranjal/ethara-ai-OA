import { useState, useEffect } from 'react'
import { getDashboardSummary } from '../api/client'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDashboardSummary()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading dashboard…</div>
  if (error)   return <div className="loading" style={{ color: 'var(--danger)' }}>{error}</div>

  const stats = [
    { label: 'Total Products',  value: data.total_products,  icon: '📦', color: '#dbeafe' },
    { label: 'Total Customers', value: data.total_customers, icon: '👥', color: '#dcfce7' },
    { label: 'Total Orders',    value: data.total_orders,    icon: '🛒', color: '#fef9c3' },
    { label: 'Total Revenue',   value: `$${data.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: '💰', color: '#fce7f3' },
  ]

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your inventory and order activity</p>
      </div>

      <div className="stat-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label} style={{ borderTop: `3px solid ${s.color}` }}>
            <div className="icon">{s.icon}</div>
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--warning)', fontSize: 16 }}>⚠️</span>
          <strong style={{ fontSize: 14 }}>Low Stock Products</strong>
          <span className="badge badge-warning" style={{ marginLeft: 4 }}>{data.low_stock_products.length}</span>
        </div>
        {data.low_stock_products.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">✅</div>
            <p>All products are well-stocked!</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Qty Remaining</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock_products.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>{p.sku}</code></td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                        {p.quantity === 0 ? 'Out of stock' : `${p.quantity} left`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
