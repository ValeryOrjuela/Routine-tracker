import { MONTHS_ES } from '../constants'

export default function Summary({ state, isExpected, getWeekProgress }) {
  const today = new Date()
  const tok = today.toISOString().slice(0, 10)
  const dow = today.getDay()
  const mon = new Date(today)
  mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
  mon.setHours(0, 0, 0, 0)

  let doneToday = 0, totalToday = 0, wDone = 0, wTotal = 0

  state.groups.forEach(g => g.habits.forEach(h => {
    if (h.done[tok]) doneToday++
    totalToday++
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon)
      d.setDate(mon.getDate() + i)
      const k = d.toISOString().slice(0, 10)
      if (isExpected(h, d)) {
        wTotal++
        if (h.done[k]) wDone++
      }
    }
  }))

  const streaks = state.groups.flatMap(g => g.habits.map(h => h.streak || 0))
  const bestStreak = Math.max(0, ...streaks)
  const weekPct = wTotal ? Math.round(wDone / wTotal * 100) : 0

  const chips = [
    { icon: '✅', value: `${doneToday}/${totalToday}`, label: 'hoy' },
    { icon: '🔥', value: bestStreak, label: 'racha' },
    { icon: '📅', value: `${weekPct}%`, label: 'semana' },
  ]

  return (
    <div className="no-scrollbar" style={{
      padding: '14px 24px', display: 'flex', gap: 10, overflowX: 'auto'
    }}>
      {chips.map(c => (
        <div key={c.label} style={{
          flexShrink: 0, background: 'white', border: '1px solid var(--border)',
          borderRadius: 20, padding: '7px 14px', display: 'flex', alignItems: 'center',
          gap: 7, fontSize: 12, fontWeight: 500, color: 'var(--muted)',
          boxShadow: '0 1px 4px var(--shadow)'
        }}>
          <span style={{ fontSize: 16 }}>{c.icon}</span>
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: 'var(--text)', lineHeight: 1 }}>
              {c.value}
            </div>
            <div>{c.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}