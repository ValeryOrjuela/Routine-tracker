export default function Tabs({ active, onChange }) {
    const tabs = [
      { id: 'habits', label: 'Hábitos' },
      { id: 'calendar', label: 'Calendario' },
      { id: 'trophies', label: 'Trofeos 🏆' },
    ]
  
    return (
      <div style={{ display: 'flex', padding: '0 16px', marginBottom: 4 }}>
        {tabs.map(t => (
          <div
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              padding: '10px 16px', fontSize: 13, fontWeight: 500,
              color: active === t.id ? 'var(--deep)' : 'var(--muted)',
              cursor: 'pointer',
              borderBottom: active === t.id ? '2px solid var(--gold)' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {t.label}
          </div>
        ))}
      </div>
    )
  }