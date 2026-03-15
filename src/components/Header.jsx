import { useState } from 'react'
import { DAYS_ES, MONTHS_SHORT } from '../constants'
import Modal from './Modal'

export default function Header({ userName, setUserName, onAddGroup, state, isExpected }) {
  const [nameOpen, setNameOpen] = useState(false)
  const [nameInput, setNameInput] = useState('')

  const now = new Date()
  const today = now.toISOString().slice(0, 10)

  // Build week days (Mon → Sun)
  const dow = now.getDay()
  const mon = new Date(now)
  mon.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d
  })

  function hasActivity(date) {
    const key = date.toISOString().slice(0, 10)
    return state.groups.some(g => g.habits.some(h => h.done[key]))
  }

  return (
    <>
      {/* Header bar */}
      <div style={{
        background: 'var(--deep)', padding: '28px 24px 0',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--bark)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>
              {DAYS_ES[now.getDay()]}, {now.getDate()} {MONTHS_SHORT[now.getMonth()]}
            </div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 300, color: 'var(--cream)' }}>
              Hola, <span style={{ fontStyle: 'italic', fontWeight: 600, color: 'var(--gold)' }}>{userName}</span> ✨
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={() => { setNameInput(userName); setNameOpen(true) }} style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--cream)', fontSize: 14, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>✏️</button>
            <button onClick={onAddGroup} style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--cream)', fontSize: 18, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>＋</button>
          </div>
        </div>

        {/* Week strip */}
        <div style={{ display: 'flex', gap: 6, paddingBottom: 20 }}>
          {weekDays.map(d => {
            const key = d.toISOString().slice(0, 10)
            const isToday = key === today
            const hasAct = hasActivity(d)
            return (
              <div key={key} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 10 }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--bark)', marginBottom: 5 }}>
                  {DAYS_ES[d.getDay()].slice(0, 3)}
                </div>
                <div style={{
                  fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600,
                  color: isToday ? 'var(--deep)' : 'var(--cream)',
                  width: 32, height: 32, borderRadius: '50%',
                  background: isToday ? 'var(--gold)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
                }}>
                  {d.getDate()}
                </div>
                <div style={{
                  width: 4, height: 4, borderRadius: '50%',
                  margin: '4px auto 0',
                  background: hasAct ? 'var(--sage)' : 'transparent'
                }} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Edit name modal */}
      <Modal open={nameOpen} onClose={() => setNameOpen(false)} title="Tu nombre">
        <label className="field-label">¿Cómo te llamas?</label>
        <input
          className="field-input"
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          placeholder="Ej: Sofía"
        />
        <button className="btn-primary" onClick={() => {
          setUserName(nameInput.trim() || 'Amiga')
          setNameOpen(false)
        }}>Guardar</button>
      </Modal>
    </>
  )
}