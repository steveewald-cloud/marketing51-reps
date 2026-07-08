import React, { useEffect, useState } from 'react'
import axios from 'axios'

const NAV = '#1C2B35'
const GOLD = '#C9A84C'

const btn = (color = NAV) => ({
  background: color, color: '#fff', border: 'none', borderRadius: 6,
  padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600
})

export default function Reps() {
  const [reps, setReps] = useState([])
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'rep', hired_date: '' })
  const [adding, setAdding] = useState(false)

  const load = () => axios.get('/api/reps/').then(r => setReps(r.data))
  useEffect(() => { load() }, [])

  const save = async () => {
    await axios.post('/api/reps/', form)
    setForm({ name: '', email: '', phone: '', role: 'rep', hired_date: '' })
    setAdding(false)
    load()
  }

  const deactivate = async (id) => {
    await axios.patch(`/api/reps/${id}`, { status: 'inactive' })
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: NAV }}>Reps</h2>
        <button style={btn(GOLD)} onClick={() => setAdding(!adding)}>+ Add Rep</button>
      </div>

      {adding && (
        <div style={{ background: '#fff', borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h3 style={{ marginBottom: 12, color: NAV }}>New Rep</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {['name', 'email', 'phone', 'hired_date'].map(f => (
              <input key={f} placeholder={f.replace('_', ' ')} value={form[f]}
                onChange={e => setForm({ ...form, [f]: e.target.value })}
                type={f === 'hired_date' ? 'date' : 'text'}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }} />
            ))}
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}>
              <option value="rep">Rep</option>
              <option value="leader">Leader</option>
            </select>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button style={btn(NAV)} onClick={save}>Save</button>
            <button style={{ ...btn('#aaa') }} onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: NAV, color: '#fff' }}>
              {['Name', 'Email', 'Phone', 'Role', 'Status', 'Hired', 'Action'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 13 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reps.map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                <td style={{ padding: '10px 14px' }}>{r.name}</td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{r.email}</td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{r.phone || '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: r.role === 'leader' ? GOLD : '#dde', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
                    {r.role}
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ color: r.status === 'active' ? 'green' : '#999', fontWeight: 600, fontSize: 13 }}>{r.status}</span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{r.hired_date || '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  {r.status === 'active' && (
                    <button style={btn('#c0392b')} onClick={() => deactivate(r.id)}>Deactivate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reps.length === 0 && <p style={{ padding: 20, color: '#999' }}>No reps yet. Add one above.</p>}
      </div>
    </div>
  )
}
