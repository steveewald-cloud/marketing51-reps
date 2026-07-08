import React, { useEffect, useState } from 'react'
import axios from 'axios'

const NAV = '#1C2B35'
const GOLD = '#C9A84C'
const btn = (color = NAV) => ({
  background: color, color: '#fff', border: 'none', borderRadius: 6,
  padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600
})

export default function Quotas() {
  const [reps, setReps] = useState([])
  const [periods, setPeriods] = useState([])
  const [quotas, setQuotas] = useState([])
  const [periodForm, setPeriodForm] = useState({ label: '', start_date: '', end_date: '' })
  const [quotaForm, setQuotaForm] = useState({ rep_id: '', period_id: '', quota_amount: '' })
  const [addingPeriod, setAddingPeriod] = useState(false)
  const [addingQuota, setAddingQuota] = useState(false)

  const load = () => {
    axios.get('/api/reps/').then(r => setReps(r.data))
    axios.get('/api/quotas/periods').then(r => setPeriods(r.data))
    axios.get('/api/quotas/').then(r => setQuotas(r.data))
  }
  useEffect(() => { load() }, [])

  const savePeriod = async () => {
    await axios.post('/api/quotas/periods', periodForm)
    setPeriodForm({ label: '', start_date: '', end_date: '' })
    setAddingPeriod(false)
    load()
  }

  const saveQuota = async () => {
    await axios.post('/api/quotas/', { ...quotaForm, rep_id: parseInt(quotaForm.rep_id), period_id: parseInt(quotaForm.period_id), quota_amount: parseFloat(quotaForm.quota_amount) })
    setQuotaForm({ rep_id: '', period_id: '', quota_amount: '' })
    setAddingQuota(false)
    load()
  }

  const repName = id => reps.find(r => r.id === id)?.name || id
  const periodLabel = id => periods.find(p => p.id === id)?.label || id

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: NAV }}>Quotas</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn('#555')} onClick={() => setAddingPeriod(!addingPeriod)}>+ Period</button>
          <button style={btn(GOLD)} onClick={() => setAddingQuota(!addingQuota)}>+ Assign Quota</button>
        </div>
      </div>

      {addingPeriod && (
        <div style={{ background: '#fff', borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h3 style={{ marginBottom: 12, color: NAV }}>New Quota Period</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input placeholder="Label (e.g. Q1 2025)" value={periodForm.label}
              onChange={e => setPeriodForm({ ...periodForm, label: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }} />
            <input type="date" value={periodForm.start_date}
              onChange={e => setPeriodForm({ ...periodForm, start_date: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }} />
            <input type="date" value={periodForm.end_date}
              onChange={e => setPeriodForm({ ...periodForm, end_date: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }} />
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button style={btn(NAV)} onClick={savePeriod}>Save</button>
            <button style={btn('#aaa')} onClick={() => setAddingPeriod(false)}>Cancel</button>
          </div>
        </div>
      )}

      {addingQuota && (
        <div style={{ background: '#fff', borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h3 style={{ marginBottom: 12, color: NAV }}>Assign Quota to Rep</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <select value={quotaForm.rep_id} onChange={e => setQuotaForm({ ...quotaForm, rep_id: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}>
              <option value="">Select rep...</option>
              {reps.filter(r => r.status === 'active').map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <select value={quotaForm.period_id} onChange={e => setQuotaForm({ ...quotaForm, period_id: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}>
              <option value="">Select period...</option>
              {periods.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <input type="number" placeholder="Quota amount ($)" value={quotaForm.quota_amount}
              onChange={e => setQuotaForm({ ...quotaForm, quota_amount: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, width: 180 }} />
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button style={btn(NAV)} onClick={saveQuota}>Save</button>
            <button style={btn('#aaa')} onClick={() => setAddingQuota(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: NAV, color: '#fff' }}>
              {['Rep', 'Period', 'Quota'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 13 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quotas.map((q, i) => (
              <tr key={q.id} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                <td style={{ padding: '10px 14px' }}>{repName(q.rep_id)}</td>
                <td style={{ padding: '10px 14px' }}>{periodLabel(q.period_id)}</td>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: NAV }}>${Number(q.quota_amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {quotas.length === 0 && <p style={{ padding: 20, color: '#999' }}>No quotas assigned yet.</p>}
      </div>
    </div>
  )
}
