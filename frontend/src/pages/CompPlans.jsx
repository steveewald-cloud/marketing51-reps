import React, { useEffect, useState } from 'react'
import axios from 'axios'

const NAV = '#1C2B35'
const GOLD = '#C9A84C'
const btn = (color = NAV) => ({
  background: color, color: '#fff', border: 'none', borderRadius: 6,
  padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600
})

export default function CompPlans() {
  const [plans, setPlans] = useState([])
  const [reps, setReps] = useState([])
  const [form, setForm] = useState({ name: '', description: '', base_rate: '', accelerator_threshold: '1.0', accelerator_rate: '0.08' })
  const [adding, setAdding] = useState(false)
  const [assigning, setAssigning] = useState(null)
  const [assignRep, setAssignRep] = useState('')

  const load = () => {
    axios.get('/api/comp-plans/').then(r => setPlans(r.data))
    axios.get('/api/reps/').then(r => setReps(r.data))
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    await axios.post('/api/comp-plans/', {
      ...form,
      base_rate: parseFloat(form.base_rate),
      accelerator_threshold: parseFloat(form.accelerator_threshold),
      accelerator_rate: parseFloat(form.accelerator_rate),
    })
    setForm({ name: '', description: '', base_rate: '', accelerator_threshold: '1.0', accelerator_rate: '0.08' })
    setAdding(false)
    load()
  }

  const assign = async () => {
    if (!assignRep) return
    await axios.post('/api/comp-plans/assign', { rep_id: parseInt(assignRep), comp_plan_id: assigning })
    setAssigning(null)
    setAssignRep('')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: NAV }}>Compensation Plans</h2>
        <button style={btn(GOLD)} onClick={() => setAdding(!adding)}>+ New Plan</button>
      </div>

      {adding && (
        <div style={{ background: '#fff', borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h3 style={{ marginBottom: 12, color: NAV }}>New Compensation Plan</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input placeholder="Plan name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }} />
            <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }} />
            <input placeholder="Base rate (e.g. 0.05 = 5%)" value={form.base_rate} onChange={e => setForm({ ...form, base_rate: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }} />
            <input placeholder="Accelerator threshold (e.g. 1.0 = 100%)" value={form.accelerator_threshold} onChange={e => setForm({ ...form, accelerator_threshold: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }} />
            <input placeholder="Accelerator rate (e.g. 0.08 = 8%)" value={form.accelerator_rate} onChange={e => setForm({ ...form, accelerator_rate: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }} />
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button style={btn(NAV)} onClick={save}>Save</button>
            <button style={btn('#aaa')} onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      {assigning && (
        <div style={{ background: '#fff', borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h3 style={{ marginBottom: 12, color: NAV }}>Assign Plan to Rep</h3>
          <select value={assignRep} onChange={e => setAssignRep(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, marginRight: 12 }}>
            <option value="">Select rep...</option>
            {reps.filter(r => r.status === 'active').map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button style={btn(NAV)} onClick={assign}>Assign</button>
          <button style={{ ...btn('#aaa'), marginLeft: 8 }} onClick={() => setAssigning(null)}>Cancel</button>
        </div>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {plans.map(p => (
          <div key={p.id} style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ color: NAV, marginBottom: 4 }}>{p.name}</h3>
                {p.description && <p style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>{p.description}</p>}
                <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#555' }}>
                  <span>Base Rate: <strong style={{ color: NAV }}>{(p.base_rate * 100).toFixed(1)}%</strong></span>
                  <span>Accelerator kicks in at: <strong style={{ color: NAV }}>{(p.accelerator_threshold * 100).toFixed(0)}% of quota</strong></span>
                  <span>Accelerator Rate: <strong style={{ color: 'green' }}>{(p.accelerator_rate * 100).toFixed(1)}%</strong></span>
                </div>
              </div>
              <button style={btn(GOLD)} onClick={() => setAssigning(p.id)}>Assign to Rep</button>
            </div>
          </div>
        ))}
        {plans.length === 0 && <p style={{ color: '#999' }}>No compensation plans yet.</p>}
      </div>
    </div>
  )
}
