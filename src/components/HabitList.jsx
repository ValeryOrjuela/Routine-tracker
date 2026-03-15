import { useState } from 'react'
import Modal from './Modal'
import { EMOJIS_GROUP, EMOJIS_HABIT, GROUP_COLORS, RETENTION_OPTIONS, FREQ_LABELS } from '../constants'
import { useToast } from './Toast'

function EmojiPicker({ emojis, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
      {emojis.map(e => (
        <div key={e} className={`emoji-opt ${selected === e ? 'selected' : ''}`} onClick={() => onSelect(e)}>
          {e}
        </div>
      ))}
    </div>
  )
}

function PillPicker({ options, selected, onSelect, multi = false }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
      {options.map(o => {
        const id = typeof o === 'string' ? o : o.id
        const label = typeof o === 'string' ? o : o.label
        const isSel = multi ? selected.includes(id) : selected === id
        return (
          <div key={id} className={`pill ${isSel ? 'selected' : ''}`} onClick={() => onSelect(id)}>
            {label}
          </div>
        )
      })}
    </div>
  )
}

function MiniWeek({ habit, isExpected }) {
  const today = new Date()
  const tok = today.toISOString().slice(0, 10)
  const dow = today.getDay()
  const mon = new Date(today)
  mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))

  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginTop: 4 }}>
      {Array.from({ length: 7 }, (_, i) => {
        const d = new Date(mon)
        d.setDate(mon.getDate() + i)
        const k = d.toISOString().slice(0, 10)
        const exp = isExpected(habit, d)
        const done = habit.done[k]
        const isToday = k === tok

        let bg = 'var(--border)'
        let border = 'none'
        if (!exp) bg = 'var(--border)', border = 'none'
        if (done) bg = 'var(--sage)'
        if (isToday && !done && exp) { bg = 'transparent'; border = '1.5px solid var(--bark)' }

        return (
          <div key={k} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: bg, border,
            opacity: !exp ? 0.2 : 1
          }} />
        )
      })}
    </div>
  )
}

function HabitRow({ habit, groupId, groupColor, isExpected, onToggleDone, onEdit }) {
  const tok = new Date().toISOString().slice(0, 10)
  const isDone = !!habit.done[tok]
  const color = GROUP_COLORS.find(c => c.id === groupColor) || GROUP_COLORS[0]

  return (
    <div style={{
      padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: '1px solid var(--warm)', transition: 'background 0.15s'
    }}>
      <div style={{ fontSize: 20, flexShrink: 0 }}>{habit.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {habit.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{habit.desc}</div>
        <div style={{
          fontSize: 10, color: 'var(--bark)', background: 'var(--warm)',
          borderRadius: 6, padding: '2px 7px', display: 'inline-block', marginTop: 3, fontWeight: 500
        }}>
          {FREQ_LABELS[habit.freq?.type] || 'Diario'}
        </div>
        <MiniWeek habit={habit} isExpected={isExpected} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <button onClick={() => onEdit(habit)} style={{
          background: 'none', border: 'none', fontSize: 13,
          cursor: 'pointer', color: 'var(--muted)', padding: 4, opacity: 0.6
        }}>✏️</button>
        {(habit.streak || 0) > 0 && (
          <div style={{
            fontSize: 11, color: 'var(--earth)', background: 'var(--gold-light)',
            borderRadius: 8, padding: '3px 8px', fontWeight: 500, whiteSpace: 'nowrap'
          }}>🔥 {habit.streak}d</div>
        )}
        <button
          onClick={() => onToggleDone(groupId, habit.id)}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            border: isDone ? 'none' : '2px solid var(--border)',
            background: isDone ? color.done : 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 16, transition: 'all 0.2s',
            color: 'white'
          }}
        >
          {isDone ? '✓' : ''}
        </button>
      </div>
    </div>
  )
}

function HabitModal({ open, onClose, groupId, habit, onSave, onDelete }) {
  const isEdit = !!habit
  const [name, setName] = useState(habit?.name || '')
  const [desc, setDesc] = useState(habit?.desc || '')
  const [emoji, setEmoji] = useState(habit?.emoji || '📖')
  const [freqType, setFreqType] = useState(habit?.freq?.type || 'daily')
  const [days, setDays] = useState(habit?.freq?.days || [])
  const [count, setCount] = useState(habit?.freq?.count || 2)
  const { showToast } = useToast()

  const DAY_LABELS = ['D','L','M','X','J','V','S']
  const DAY_VALUES = [0,1,2,3,4,5,6]

  function toggleDay(d) {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  function handleSave() {
    if (!name.trim()) { showToast('Escribe un nombre'); return }
    if (freqType === 'specific_days' && !days.length) { showToast('Selecciona al menos un día'); return }
    const freq = { type: freqType }
    if (freqType === 'specific_days') freq.days = days
    if (freqType === 'count_week') freq.count = count
    onSave({ name: name.trim(), desc: desc.trim(), emoji, freq })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar hábito' : 'Nuevo hábito'}>
      <label className="field-label">Nombre</label>
      <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Devocional, Gym..." />
      <label className="field-label">Descripción</label>
      <input className="field-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ej: Leer un devocional cada mañana" />
      <label className="field-label">Ícono</label>
      <EmojiPicker emojis={EMOJIS_HABIT} selected={emoji} onSelect={setEmoji} />
      <label className="field-label">Frecuencia</label>
      <PillPicker
        options={[
          { id: 'daily', label: 'Diario' },
          { id: 'specific_days', label: 'Días específicos' },
          { id: 'count_week', label: 'X veces/semana' },
          { id: 'biweekly', label: 'Cada 2 semanas' },
          { id: 'monthly', label: '1 vez/mes' },
        ]}
        selected={freqType}
        onSelect={setFreqType}
      />
      {freqType === 'specific_days' && (
        <>
          <label className="field-label">¿Qué días?</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 12 }}>
            {DAY_VALUES.map((d, i) => (
              <div key={d} className={`day-toggle ${days.includes(d) ? 'selected' : ''}`} onClick={() => toggleDay(d)}>
                {DAY_LABELS[i]}
              </div>
            ))}
          </div>
        </>
      )}
      {freqType === 'count_week' && (
        <>
          <label className="field-label">¿Cuántas veces a la semana?</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <button onClick={() => setCount(c => Math.max(1, c - 1))} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'white', fontSize: 18, cursor: 'pointer' }}>−</button>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: 'var(--deep)', minWidth: 24, textAlign: 'center' }}>{count}</span>
            <button onClick={() => setCount(c => Math.min(7, c + 1))} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'white', fontSize: 18, cursor: 'pointer' }}>+</button>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>veces por semana</span>
          </div>
        </>
      )}
      <button className="btn-primary" onClick={handleSave}>
        {isEdit ? 'Guardar cambios' : 'Agregar hábito'}
      </button>
      {isEdit && (
        <button className="btn-danger" onClick={() => { onDelete(); onClose() }}>
          🗑 Eliminar hábito
        </button>
      )}
    </Modal>
  )
}

function GroupModal({ open, onClose, group, onSave, onDelete }) {
  const isEdit = !!group
  const [name, setName] = useState(group?.name || '')
  const [emoji, setEmoji] = useState(group?.emoji || '🌱')
  const [color, setColor] = useState(group?.color || 'sage')
  const [retention, setRetention] = useState(group?.retention || '1m')
  const { showToast } = useToast()

  function handleSave() {
    if (!name.trim()) { showToast('Escribe un nombre'); return }
    onSave({ name: name.trim(), emoji, color, retention })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar grupo' : 'Nuevo grupo'}>
      <label className="field-label">Nombre del grupo</label>
      <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Espiritual, Salud..." />
      <label className="field-label">Ícono</label>
      <EmojiPicker emojis={EMOJIS_GROUP} selected={emoji} onSelect={setEmoji} />
      <label className="field-label">Color</label>
      <PillPicker options={GROUP_COLORS.map(c => ({ id: c.id, label: c.label }))} selected={color} onSelect={setColor} />
      <label className="field-label">Guardar data por</label>
      <PillPicker options={RETENTION_OPTIONS} selected={retention} onSelect={setRetention} />
      <button className="btn-primary" onClick={handleSave}>
        {isEdit ? 'Guardar cambios' : 'Crear grupo'}
      </button>
      {isEdit && (
        <button className="btn-danger" onClick={() => { onDelete(); onClose() }}>
          🗑 Eliminar grupo y sus hábitos
        </button>
      )}
    </Modal>
  )
}

export default function HabitList({ state, isExpected, getWeekProgress, toggleDone, addGroup, updateGroup, deleteGroup, addHabit, updateHabit, deleteHabit }) {
  const [collapsed, setCollapsed] = useState({})
  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [habitModalOpen, setHabitModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [activeGroupId, setActiveGroupId] = useState(null)
  const { showToast } = useToast()

  function toggleCollapse(gid) {
    setCollapsed(prev => ({ ...prev, [gid]: !prev[gid] }))
  }

  function openAddGroup() {
    setEditingGroup(null)
    setGroupModalOpen(true)
  }

  function openEditGroup(g) {
    setEditingGroup(g)
    setGroupModalOpen(true)
  }

  function openAddHabit(gid) {
    setActiveGroupId(gid)
    setEditingHabit(null)
    setHabitModalOpen(true)
  }

  function openEditHabit(gid, habit) {
    setActiveGroupId(gid)
    setEditingHabit(habit)
    setHabitModalOpen(true)
  }

  function handleSaveGroup(data) {
    if (editingGroup) {
      updateGroup(editingGroup.id, data)
      showToast('Grupo actualizado ✨')
    } else {
      addGroup(data)
      showToast('Grupo creado 🌱')
    }
  }

  function handleSaveHabit(data) {
    if (editingHabit) {
      updateHabit(activeGroupId, editingHabit.id, data)
      showToast('Hábito actualizado ✨')
    } else {
      addHabit(activeGroupId, data)
      showToast('Hábito agregado ✨')
    }
  }

  return (
    <div>
      <div style={{ padding: '4px 16px' }}>
        {state.groups.map(g => {
          const pct = getWeekProgress(g)
          const color = GROUP_COLORS.find(c => c.id === g.color) || GROUP_COLORS[0]
          const isCollapsed = collapsed[g.id]

          return (
            <div key={g.id} style={{
              background: 'white', borderRadius: 18, border: '1px solid var(--border)',
              marginBottom: 14, overflow: 'hidden', boxShadow: '0 2px 12px var(--shadow)'
            }}>
              {/* Group header */}
              <div
                onClick={() => toggleCollapse(g.id)}
                style={{ padding: '16px 18px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 12, background: color.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {g.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600, color: 'var(--deep)' }}>{g.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{g.habits.length} hábito{g.habits.length !== 1 ? 's' : ''} · {g.retention}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); openEditGroup(g) }} style={{ background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', opacity: 0.5, padding: 6 }}>✏️</button>
                <div style={{ fontSize: 12, color: 'var(--muted)', transition: 'transform 0.3s', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▼</div>
              </div>

              {/* Weekly bar */}
              {!isCollapsed && (
                <>
                  <div style={{ padding: '0 18px 14px', borderBottom: '1px solid var(--warm)' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 5 }}>Progreso semanal</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--warm)', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 10, background: color.bar, width: `${pct}%`, transition: 'width 0.5s cubic-bezier(0.34,1.56,0.64,1)' }} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{pct}%</div>
                    </div>
                  </div>

                  {/* Habits */}
                  <div style={{ padding: '4px 0 8px' }}>
                    {g.habits.map(h => (
                      <HabitRow
                        key={h.id}
                        habit={h}
                        groupId={g.id}
                        groupColor={g.color}
                        isExpected={isExpected}
                        onToggleDone={toggleDone}
                        onEdit={(habit) => openEditHabit(g.id, habit)}
                      />
                    ))}
                    <div style={{ justifyContent: 'center', padding: '10px 18px', display: 'flex' }}>
                      <button onClick={() => openAddHabit(g.id)} style={{
                        background: 'none', border: 'none', fontSize: 12,
                        color: 'var(--muted)', cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5
                      }}>＋ Agregar hábito</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Add group button */}
      <button onClick={openAddGroup} style={{
        margin: '0 16px 16px', width: 'calc(100% - 32px)',
        background: 'transparent', border: '2px dashed var(--border)',
        borderRadius: 14, padding: 14, fontFamily: 'DM Sans, sans-serif',
        fontSize: 14, color: 'var(--muted)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
      }}>＋ Nuevo grupo</button>

      {/* Modals */}
      <GroupModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        group={editingGroup}
        onSave={handleSaveGroup}
        onDelete={() => {
          deleteGroup(editingGroup.id)
          showToast('Grupo eliminado')
        }}
      />
      <HabitModal
        open={habitModalOpen}
        onClose={() => setHabitModalOpen(false)}
        groupId={activeGroupId}
        habit={editingHabit}
        onSave={handleSaveHabit}
        onDelete={() => {
          deleteHabit(activeGroupId, editingHabit.id)
          showToast('Hábito eliminado')
        }}
      />
    </div>
  )
}

// Export openAddGroup for Header button
export { }