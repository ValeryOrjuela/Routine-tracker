import { useState } from 'react'
import Modal from './Modal'
import { useToast } from './Toast'

function TrophyModal({ open, onClose, trophy, groups, onSave, onDelete }) {
  const isEdit = !!trophy
  const [groupId, setGroupId] = useState(trophy?.groupId || groups[0]?.id || '')
  const [reward, setReward] = useState(trophy?.reward || '')
  const [durationType, setDurationType] = useState(trophy?.durationType || 'days')
  const [durationValue, setDurationValue] = useState(
    typeof trophy?.durationValue === 'number' ? trophy.durationValue : 30
  )
  const [dateValue, setDateValue] = useState(
    typeof trophy?.durationValue === 'string' ? trophy.durationValue : ''
  )
  const { showToast } = useToast()

  const today = new Date().toISOString().slice(0, 10)

  const typeOptions = [
    { id: 'days',   label: '📅 Días' },
    { id: 'weeks',  label: '📆 Semanas' },
    { id: 'months', label: '🗓 Meses' },
    { id: 'date',   label: '📌 Fecha' },
  ]

  const numLabels = { days: '¿Cuántos días?', weeks: '¿Cuántas semanas?', months: '¿Cuántos meses?' }
  const numUnits  = { days: 'días al 100%',   weeks: 'semanas al 100%',   months: 'meses al 100%' }
  const numMax    = { days: 365, weeks: 52, months: 12 }

  function changeNum(dir) {
    setDurationValue(v => Math.max(1, Math.min(numMax[durationType] || 365, v + dir)))
  }

  function handleSave() {
    if (!reward.trim()) { showToast('Escribe un premio'); return }
    if (durationType === 'date' && !dateValue) { showToast('Selecciona una fecha'); return }
    onSave({
      groupId,
      reward: reward.trim(),
      durationType,
      durationValue: durationType === 'date' ? dateValue : durationValue,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar meta' : 'Nueva meta 🏆'}>
      <label className="field-label">Grupo</label>
      <select className="field-input" value={groupId} onChange={e => setGroupId(e.target.value)}>
        {groups.map(g => <option key={g.id} value={g.id}>{g.emoji} {g.name}</option>)}
      </select>

      <label className="field-label">Premio que te darás</label>
      <input
        className="field-input" value={reward}
        onChange={e => setReward(e.target.value)}
        placeholder="Ej: unos tenis nuevos, salida especial..."
      />

      <label className="field-label">Tipo de duración</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {typeOptions.map(o => (
          <div
            key={o.id}
            className={`pill ${durationType === o.id ? 'selected' : ''}`}
            onClick={() => setDurationType(o.id)}
          >
            {o.label}
          </div>
        ))}
      </div>

      {durationType !== 'date' ? (
        <>
          <label className="field-label">{numLabels[durationType]}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <button onClick={() => changeNum(-1)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'white', fontSize: 18, cursor: 'pointer' }}>−</button>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: 'var(--deep)', minWidth: 24, textAlign: 'center' }}>{durationValue}</span>
            <button onClick={() => changeNum(1)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'white', fontSize: 18, cursor: 'pointer' }}>+</button>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{numUnits[durationType]}</span>
          </div>
        </>
      ) : (
        <>
          <label className="field-label">Fecha límite</label>
          <input type="date" className="field-input" min={today} value={dateValue} onChange={e => setDateValue(e.target.value)} />
        </>
      )}

      <button className="btn-primary" onClick={handleSave}>
        {isEdit ? 'Guardar cambios' : 'Crear meta'}
      </button>
      {isEdit && (
        <button className="btn-danger" onClick={() => { onDelete(); onClose() }}>
          🗑 Eliminar meta
        </button>
      )}
    </Modal>
  )
}

function TrophyCard({ trophy, group, pct, onClaim, onEdit }) {
  let msg = ''
  if (pct < 20)       msg = `¡Sigue así! Pronto podrás conseguir tu ${trophy.reward} 💪`
  else if (pct < 50)  msg = `¡Ya vas al ${pct}%! Vas bien para tu ${trophy.reward} 🌟`
  else if (pct < 80)  msg = `¡Más de la mitad! Casi tienes tu ${trophy.reward} 🔥`
  else if (pct < 100) msg = `¡Un poco más y tendrás tu ${trophy.reward}! ✨`
  else                msg = `🎉 ¡FELICIDADES! ¡Ve a reclamar tu ${trophy.reward}!`

  function durationLabel() {
    if (trophy.durationType === 'date') return `hasta ${trophy.durationValue}`
    const u = { days: 'día', weeks: 'semana', months: 'mes' }
    const v = trophy.durationValue
    return `${v} ${u[trophy.durationType] || 'día'}${v !== 1 ? 's' : ''}`
  }

  return (
    <div style={{
      flexShrink: 0, width: 210, position: 'relative',
      background: trophy.claimed ? 'linear-gradient(135deg,#F0F7F0,#E0F0E0)' : 'linear-gradient(135deg,#FFF8EE,#FFF3D6)',
      border: `1px solid ${trophy.claimed ? 'var(--sage-light)' : '#EDD9A3'}`,
      borderRadius: 18, padding: 16,
      boxShadow: '0 2px 12px rgba(212,168,83,0.12)'
    }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>{trophy.claimed ? '🏆' : '🎯'}</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 900, color: 'var(--gold)', position: 'absolute', top: 14, right: 14 }}>
        {pct}%
      </div>
      <button onClick={onEdit} style={{ position: 'absolute', top: 10, left: 10, background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', opacity: 0.5 }}>✏️</button>
      <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
        {group.emoji} {group.name}
      </div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 13, fontWeight: 600, color: 'var(--deep)', margin: '4px 0 8px', lineHeight: 1.3 }}>
        {durationLabel()} al 100% → {trophy.reward}
      </div>
      <div style={{ height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 10, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ height: '100%', borderRadius: 10, background: 'linear-gradient(90deg,var(--gold),#F5C842)', width: `${pct}%`, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--earth)', lineHeight: 1.4, fontStyle: 'italic' }}>{msg}</div>

      {pct >= 100 && !trophy.claimed && (
        <button onClick={onClaim} style={{
          marginTop: 10, width: '100%', background: 'var(--deep)', color: 'var(--gold)',
          border: 'none', borderRadius: 10, padding: 8, fontSize: 12, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: 6
        }}>🏆 ¡Reclamar premio!</button>
      )}
      {trophy.claimed && (
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'var(--sage)' }}>✅ Premio reclamado</div>
      )}
    </div>
  )
}

function CelebrationModal({ open, trophy, onClaim }) {
  if (!open || !trophy) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)'
    }} onClick={e => { if (e.target === e.currentTarget) onClaim() }}>
      <div className="celebration-card" style={{
        background: 'linear-gradient(135deg,#FFF8EE,#FFF3D6)',
        border: '2px solid var(--gold)', borderRadius: 24,
        padding: '32px 24px', maxWidth: 300, width: '90%', textAlign: 'center'
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🏆</div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 900, color: 'var(--deep)', marginBottom: 8 }}>¡Lo lograste!</div>
        <div style={{ fontSize: 14, color: 'var(--earth)', lineHeight: 1.5, marginBottom: 20 }}>
          ¡Completaste tu meta!<br />Ya puedes reclamar: <strong>{trophy.reward}</strong> 🎊
        </div>
        <button onClick={onClaim} style={{
          background: 'var(--deep)', color: 'var(--gold)', border: 'none',
          borderRadius: 14, padding: '14px 28px', fontSize: 15, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
        }}>🎉 ¡Reclamar mi premio!</button>
      </div>
    </div>
  )
}

export default function TrophyView({ state, getTrophyProgress, addTrophy, updateTrophy, deleteTrophy, claimTrophy }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTrophy, setEditingTrophy] = useState(null)
  const [celebration, setCelebration] = useState(null)
  const { showToast } = useToast()

  function handleSave(data) {
    if (editingTrophy) {
      updateTrophy(editingTrophy.id, data)
      showToast('Meta actualizada 🏆')
    } else {
      addTrophy(data)
      showToast('Meta creada 🏆')
    }
  }

  function handleClaim(trophyId) {
    claimTrophy(trophyId)
    setCelebration(null)
    showToast('🏆 ¡Premio reclamado! Felicidades ✨')
  }

  return (
    <div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: 'var(--deep)', padding: '20px 20px 10px' }}>
        Metas & Trofeos
      </div>

      <div className="no-scrollbar" style={{ display: 'flex', gap: 12, padding: '0 16px 20px', overflowX: 'auto' }}>
        {state.trophies.length === 0 && (
          <div style={{ padding: 20, color: 'var(--muted)', fontSize: 13 }}>Aún no tienes metas. ¡Agrega una!</div>
        )}
        {state.trophies.map(t => {
          const group = state.groups.find(g => g.id === t.groupId)
          if (!group) return null
          const pct = getTrophyProgress(t, state.groups)
          return (
            <TrophyCard
              key={t.id}
              trophy={t}
              group={group}
              pct={pct}
              onClaim={() => setCelebration(t)}
              onEdit={() => { setEditingTrophy(t); setModalOpen(true) }}
            />
          )
        })}
      </div>

      <button onClick={() => { setEditingTrophy(null); setModalOpen(true) }} style={{
        margin: '0 16px 16px', width: 'calc(100% - 32px)',
        background: 'transparent', border: '2px dashed var(--border)',
        borderRadius: 14, padding: 14, fontFamily: 'DM Sans, sans-serif',
        fontSize: 14, color: 'var(--muted)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
      }}>🏆 Agregar meta</button>

      <TrophyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        trophy={editingTrophy}
        groups={state.groups}
        onSave={handleSave}
        onDelete={() => {
          deleteTrophy(editingTrophy.id)
          showToast('Meta eliminada')
        }}
      />

      <CelebrationModal
        open={!!celebration}
        trophy={celebration}
        onClaim={() => handleClaim(celebration?.id)}
      />
    </div>
  )
}