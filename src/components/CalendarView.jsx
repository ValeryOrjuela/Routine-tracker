import { useState } from 'react'
import { MONTHS_ES } from '../constants'

function CalCard({ habit, year, month, isExpected }) {
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayNum = new Date().getDate()
  const isCurMonth = year === new Date().getFullYear() && month === new Date().getMonth()
  const blanks = firstDow === 0 ? 6 : firstDow - 1

  return (
    <div style={{
      flexShrink: 0, width: 150, background: 'white',
      border: '1px solid var(--border)', borderRadius: 14,
      padding: 12, boxShadow: '0 2px 8px var(--shadow)'
    }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {habit.emoji} {habit.name}
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 3 }}>
        {['L','M','X','J','V','S','D'].map(d => (
          <div key={d} style={{ fontSize: 7, textAlign: 'center', color: 'var(--muted)', textTransform: 'uppercase' }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {Array.from({ length: blanks }, (_, i) => (
          <div key={`b${i}`} style={{ aspectRatio: 1 }} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const date = new Date(year, month, d)
          const isDone = !!habit.done[key]
          const isToday = isCurMonth && d === todayNum
          const na = !isExpected(habit, date)

          let bg = 'transparent'
          let color = 'var(--muted)'
          let borderRadius = 4

          if (isDone) { bg = 'var(--sage-light)'; color = 'var(--sage)'; borderRadius = '50%' }
          else if (isToday) { bg = 'var(--gold-light)'; color = 'var(--earth)'; borderRadius = '50%' }

          return (
            <div key={d} style={{
              aspectRatio: 1, borderRadius, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 8, background: bg, color,
              fontWeight: isDone || isToday ? 600 : 400,
              opacity: na && !isDone ? 0.25 : 1
            }}>
              {d}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CalendarView({ state, isExpected }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  function changeMonth(dir) {
    let m = month + dir
    let y = year
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setMonth(m)
    setYear(y)
  }

  return (
    <div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: 'var(--deep)', padding: '20px 20px 10px' }}>
        Calendario
      </div>

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px 14px' }}>
        <button onClick={() => changeMonth(-1)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600, color: 'var(--deep)', flex: 1 }}>
          {MONTHS_ES[month]} {year}
        </div>
        <button onClick={() => changeMonth(1)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
      </div>

      {/* Groups */}
      {state.groups.filter(g => g.habits.length > 0).map(g => (
        <CalGroup key={g.id} group={g} year={year} month={month} isExpected={isExpected} />
      ))}
    </div>
  )
}

function CalGroup({ group, year, month, isExpected }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div
        onClick={() => setCollapsed(p => !p)}
        style={{
          fontFamily: 'Fraunces, serif', fontSize: 14, fontWeight: 600,
          color: 'var(--deep)', padding: '10px 0 8px',
          borderBottom: '1px solid var(--warm)', marginBottom: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
        }}
      >
        <span>{group.emoji} {group.name}</span>
        <span style={{ fontSize: 11, color: 'var(--muted)', transition: 'transform 0.2s', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▼</span>
      </div>

      {!collapsed && (
        <div className="no-scrollbar" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
          {group.habits.map(h => (
            <CalCard key={h.id} habit={h} year={year} month={month} isExpected={isExpected} />
          ))}
        </div>
      )}
    </div>
  )
}