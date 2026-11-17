import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Utensils, Clock, CheckCircle2, RefreshCw, ChefHat, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export default function RestaurantDashboard() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordRes, menuRes] = await Promise.all([
        api.getRestaurantOrders(),
        api.getRestaurantMenu()
      ]);
      if (ordRes.data?.orders) setOrders(ordRes.data.orders);
      if (menuRes.data?.menu) setMenu(menuRes.data.menu);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.updateRestaurantOrderStatus(orderId, { status: newStatus });
      setActionSuccess(`Order marked as ${newStatus}`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="app-container" style={{ padding: '3rem 0 5rem 0' }}>
      
      {/* Header Banner */}
      <div className="luxury-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-sage-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Culinary & Service Fulfillment Console
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0 6px 0', fontFamily: 'var(--font-serif)' }}>
            Kitchen & Dining Orders Display
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Logged in as <strong>Chef Carlos Rossi (Executive Chef & In-Stay F&B Manager)</strong>
          </p>
        </div>

        <button onClick={loadData} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          <RefreshCw size={15} /> Refresh Kitchen Board
        </button>
      </div>

      {actionSuccess && (
        <div className="badge-available" style={{ width: '100%', padding: '12px 18px', marginBottom: '1.5rem', fontSize: '0.9rem', borderRadius: '8px' }}>
          <Check size={16} /> {actionSuccess}
        </div>
      )}

      {/* Orders Board */}
      <div className="luxury-card" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>
          Incoming Guest Room Service & Dining Orders
        </h2>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            No pending dining orders. Kitchen queue is clear.
          </div>
        ) : (
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Destination</th>
                <th>Items Ordered</th>
                <th>Total (₹)</th>
                <th>Folio Status</th>
                <th>Preparation Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => {
                let itemsList = [];
                try {
                  itemsList = typeof ord.items_json === 'string' ? JSON.parse(ord.items_json) : ord.items_json;
                } catch (e) {
                  itemsList = [{ name: ord.items_json || 'Artisan Meal' }];
                }

                return (
                  <tr key={ord.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-sage-dark)' }}>{ord.id}</td>
                    <td><strong>Suite #{ord.room_number}</strong></td>
                    <td>
                      {itemsList.map((it, idx) => (
                        <div key={idx} style={{ fontSize: '0.86rem' }}>
                          • {it.qty || 1}x {it.name}
                        </div>
                      ))}
                    </td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(ord.total_amount)}</td>
                    <td>
                      <span className="badge-available" style={{ fontSize: '0.72rem' }}>
                        ✓ Billed to Room
                      </span>
                    </td>
                    <td>
                      <span className={ord.status === 'DELIVERED' ? 'badge-available' : ord.status === 'ON_THE_WAY' ? 'badge-sand' : 'badge-pending'}>
                        {ord.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {ord.status === 'RECEIVED' && (
                          <button onClick={() => handleUpdateStatus(ord.id, 'PREPARING')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                            Prepare
                          </button>
                        )}
                        {ord.status === 'PREPARING' && (
                          <button onClick={() => handleUpdateStatus(ord.id, 'ON_THE_WAY')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                            Dispatch
                          </button>
                        )}
                        {ord.status !== 'DELIVERED' && (
                          <button onClick={() => handleUpdateStatus(ord.id, 'DELIVERED')} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                            Delivered
                          </button>
                        )}
                        {ord.status === 'DELIVERED' && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--status-available-text)', fontWeight: 600 }}>✓ Complete</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Menu Catalog Overview */}
      <div className="luxury-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'var(--font-serif)' }}>
          Active In-Room Dining & Beverage Catalog
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {menu.slice(0, 6).map((m) => (
            <div key={m.id} style={{ border: '1px solid var(--border-light)', borderRadius: '10px', overflow: 'hidden' }}>
              <img src={m.image} alt={m.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
              <div style={{ padding: '10px 14px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{m.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ color: 'var(--accent-sage-dark)', fontWeight: 700 }}>{formatCurrency(m.price)}</span>
                  <span className="badge-sand" style={{ fontSize: '0.7rem' }}>{m.prep_time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
