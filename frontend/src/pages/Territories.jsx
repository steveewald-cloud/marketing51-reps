import React, { useEffect, useState } from 'react'
import axios from 'axios'

const NAV = '#1C2B35'
const GOLD = '#C9A84C'
const btn = (color = NAV) => ({
  background: color, color: '#fff', border: 'none', borderRadius: 6,
  padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600
})

export default function Territories() {
  const [territories, setTerritories] = useState([])
  const [reps, setReps] = useState([])
  const [form, setForm] = useState({ name: '', region: '', state: '', zip_codes: '' })
  const [adding, setAdding] = useState(false)
  const [assigning, setAssigning] = useState(null)
  const [selectedRep, setSelectedRep] = useState('')

  const load = () => {
    axios.get('/api/territories/').then(r => setTerritories(r.data))
    axios.get('/api/reps/').then(r => setReps(r.data))
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    const payload = { ...form, zip_codes: form.zip_codes ? form.zip_codes.split(',').map(z => z.trim()) : [] }
    await axios.post('/api/territories/', payload)
    setForm({ name: '', region: '', state: '', zip_codes: '' })
    setAdding(false)
    load()
  }

  const assign = async () => {
    if (!selectedRep) return
    await axios.post(`/api/territories/${assigning}/assign`, { rep_id: parseInt(selectedRep) })
    setAssigning(null)
    setSelectedRep('')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: NAV }}>Territories</h2>
        <button style={btn(GOLD)} onClick={() => setAdding(!adding)}>+ Add Territory</button>
      </div>

      {adding && (
        <div style={{ background: '#fff', borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h3 style={{ marginBottom: 12, color: NAV }}>New Territory</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['name', 'Territory Name'], ['region', 'Region'], ['state', 'State'], ['zip_codes', 'Zip Codes (comma separated)']].map(([f, label]) => (
              <input key={f} placeholder={label} value={form[f]}
                onChange={e => setForm({ ...form, [f]: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }} />
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button style={btn(NAV)} onClick={save}>Save</button>
            <button style={btn('#aaa')} onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      {assigning && (
        <div style={{ background: '#fff', borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h3 style={{ marginBottom: 12, color: NAV }}>Assign Rep to Territory</h3>
          <select value={selectedRep} onChange={e => setSelectedRep(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, marginRight: 12 }}>
            <option value="">Select rep...</option>
            {reps.filter(r => r.status === 'active').map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button style={btn(NAV)} onClick={assign}>Assign</button>
          <button style={{ ...btn('#aaa'), marginLeft: 8 }} onClick={() => setAssigning(null)}>Cancel</button>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: NAV, color: '#fff' }}>
              {['Name', 'Region', 'State', 'Zip Codes', 'Action'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 13 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {territories.map((t, i) => (
              <tr key={t.id} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{t.name}</td>
                <td style={{ padding: '10px 14px' }}>{t.region || '—'}</td>
                <td style={{ padding: '10px 14px' }}>{t.state || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#666' }}>
                  {t.zip_codes && t.zip_codes.length > 0 ? t.zip_codes.join(', ') : '—'}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button style={btn(GOLD)} onClick={() => setAssigning(t.id)}>Assign Rep</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {territories.length === 0 && <p style={{ padding: 20, color: '#999' }}>No territories yet.</p>}
      </div>
    </div>
  )
}
