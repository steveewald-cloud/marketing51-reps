import React, { useEffect, useState } from 'react'
import axios from 'axios'

const NAV = '#1C2B35'
const GOLD = '#C9A84C'
const btn = (color = NAV) => ({
  background: color, color: '#fff', border: 'none', borderRadius: 6,
  padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600
})

export default function AttainmentPage() {
  const [reps, setReps] = useState([])
  const [periods, setPeriods] = useState([])
  const [summary, setSummary] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [form, setForm] = useState({ rep_id: '', period_id: '', amount: '' })
  const [adding, setAdding] = useState(false)

  const load = () => {
    axios.get('/api/reps/').then(r => setReps(r.data))
    axios.get('/api/quotas/periods').then(r => setPeriods(r.data))
  }
  useEffect(() => { load() }, [])

  useEffect(() => {
    if (selectedPeriod) {
      axios.get(`/api/attainment/summary/${selectedPeriod}`).then(r => setSummary(r.data))
    }
  }, [selectedPeriod])

  const save = async () => {
    await axios.post('/api/attainment/', {
      rep_id: parseInt(form.rep_id),
      period_id: parseInt(form.period_id),
      amount: parseFloat(form.amount)
    })
    setForm({ rep_id: '', period_id: '', amount: '' })
    setAdding(false)
    if (selectedPeriod) {
      axios.get(`/api/attainment/summary/${selectedPeriod}`).then(r => setSummary(r.data))
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: NAV }}>Attainment & Payouts</h2>
        <button style={btn(GOLD)} onClick={() => setAdding(!adding)}>+ Log Sale</button>
      </div>

      {adding && (
        <div style={{ background: '#fff', borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h3 style={{ marginBottom: 12, color: NAV }}>Log Attainment</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <select value={form.rep_id} onChange={e => setForm({ ...form, rep_id: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}>
              <option value="">Select rep...</option>
              {reps.filter(r => r.status === 'active').map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <select value={form.period_id} onChange={e => setForm({ ...form, period_id: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}>
              <option value="">Select period...</option>
              {periods.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <input type="number" placeholder="Amount ($)" value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, width: 160 }} />
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button style={btn(NAV)} onClick={save}>Save</button>
            <button style={btn('#aaa')} onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 600, color: NAV, marginRight: 12 }}>View Period:</label>
        <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}>
          <option value="">Select period...</option>
          {periods.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>

      {summary.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: NAV, color: '#fff' }}>
                {['Rep', 'Quota', 'Attainment', '% of Quota', 'Est. Payout'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 13 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.map((s, i) => (
                <tr key={s.rep_id} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{s.rep_name}</td>
                  <td style={{ padding: '10px 14px' }}>${Number(s.quota).toLocaleString()}</td>
                  <td style={{ padding: '10px 14px' }}>${Number(s.attainment).toLocaleString()}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ background: '#eee', borderRadius: 4, height: 10, width: 80, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(s.attainment_pct, 100)}%`, background: s.attainment_pct >= 100 ? 'green' : GOLD, height: '100%' }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: s.attainment_pct >= 100 ? 'green' : NAV }}>{s.attainment_pct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: 'green' }}>${Number(s.payout).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedPeriod && summary.length === 0 && <p style={{ color: '#999' }}>No attainment data for this period.</p>}
    </div>
  )
}
