import { useState, useEffect } from 'react'

const DEFAULT_STATE = {
  userName: 'Amiga',
  groups: [
    {
      id: 'g1', name: 'Espiritual', emoji: '🙏', color: 'sage', retention: '1y',
      habits: [
        { id: 'h1', name: 'Devocional', desc: 'Leer un devocional', emoji: '📖', freq: { type: 'daily' }, startDate: new Date().toISOString().slice(0,10), done: {}, streak: 0 },
        { id: 'h2', name: 'Oraciones', desc: 'Orar o participar en oración', emoji: '🙏', freq: { type: 'daily' }, startDate: new Date().toISOString().slice(0,10), done: {}, streak: 0 },
        { id: 'h3', name: 'Sermones', desc: 'Ver o ir a un sermón', emoji: '🎵', freq: { type: 'biweekly' }, startDate: new Date().toISOString().slice(0,10), done: {}, streak: 0 },
        { id: 'h4', name: 'Grupo Conexión', desc: 'Asistir al grupo', emoji: '✨', freq: { type: 'monthly' }, startDate: new Date().toISOString().slice(0,10), done: {}, streak: 0 },
      ]
    },
    {
      id: 'g2', name: 'Rutina diaria', emoji: '🌱', color: 'blush', retention: '3m',
      habits: [
        { id: 'h5', name: 'Desayuno', desc: 'Preparar el desayuno', emoji: '🍳', freq: { type: 'daily' }, startDate: new Date().toISOString().slice(0,10), done: {}, streak: 0 },
        { id: 'h6', name: 'Almuerzo', desc: 'Preparar el almuerzo', emoji: '🥗', freq: { type: 'specific_days', days: [1,2,3,4,5] }, startDate: new Date().toISOString().slice(0,10), done: {}, streak: 0 },
      ]
    }
  ],
  trophies: [
    { id: 't1', groupId: 'g1', reward: 'unas flores especiales', durationType: 'days', durationValue: 5, startDate: new Date().toISOString().slice(0,10), claimed: false }
  ]
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function isExpected(habit, date) {
  const f = habit.freq || { type: 'daily' }
  const dow = date.getDay()
  switch (f.type) {
    case 'daily': return true
    case 'specific_days': return (f.days || []).includes(dow)
    case 'count_week': {
      const n = f.count || 2
      const wd = dow === 0 ? 6 : dow - 1
      return wd < n
    }
    case 'biweekly': {
      const start = new Date(habit.startDate || todayKey())
      start.setHours(0,0,0,0)
      const target = new Date(date)
      target.setHours(0,0,0,0)
      const diff = Math.floor((target - start) / 86400000)
      if (diff < 0) return false
      return diff % 14 < 7
    }
    case 'monthly': {
      const start = new Date(habit.startDate || todayKey())
      start.setHours(0,0,0,0)
      const target = new Date(date)
      target.setHours(0,0,0,0)
      const diff = Math.floor((target - start) / 86400000)
      if (diff < 0) return false
      return diff % 30 < 7
    }
    default: return true
  }
}

function getWeekProgress(group) {
  const today = new Date()
  const dow = today.getDay()
  const mon = new Date(today)
  mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
  mon.setHours(0,0,0,0)
  let done = 0, total = 0
  group.habits.forEach(h => {
    const f = h.freq || { type: 'daily' }
    if (f.type === 'biweekly' || f.type === 'monthly') {
      let windowActive = false, windowDone = false
      for (let i = 0; i < 7; i++) {
        const d = new Date(mon)
        d.setDate(mon.getDate() + i)
        if (isExpected(h, d)) {
          windowActive = true
          if (h.done[d.toISOString().slice(0,10)]) windowDone = true
        }
      }
      if (windowActive) { total++; if (windowDone) done++ }
    } else {
      for (let i = 0; i < 7; i++) {
        const d = new Date(mon)
        d.setDate(mon.getDate() + i)
        if (isExpected(h, d)) {
          total++
          if (h.done[d.toISOString().slice(0,10)]) done++
        }
      }
    }
  })
  return total ? Math.round(done / total * 100) : 0
}

function getTrophyProgress(trophy, groups) {
  const group = groups.find(g => g.id === trophy.groupId)
  if (!group) return 0
  const start = new Date(trophy.startDate)
  const now = new Date()
  let targetDays
  if (trophy.durationType === 'date') {
    targetDays = Math.max(1, Math.floor((new Date(trophy.durationValue) - start) / 86400000))
  } else {
    const mult = { days: 1, weeks: 7, months: 30 }
    targetDays = (trophy.durationValue || 1) * (mult[trophy.durationType] || 1)
  }
  const elapsed = Math.floor((now - start) / 86400000)
  const check = Math.min(elapsed, targetDays)
  let perfect = 0, expDays = 0
  for (let i = 0; i < check; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const key = d.toISOString().slice(0,10)
    const exp = group.habits.filter(h => isExpected(h, d))
    if (!exp.length) continue
    expDays++
    if (exp.every(h => h.done[key])) perfect++
  }
  return expDays > 0 ? Math.min(100, Math.round(perfect / expDays * 100)) : 0
}

export function useHabits() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('habitState4')
      return saved ? JSON.parse(saved) : DEFAULT_STATE
    } catch {
      return DEFAULT_STATE
    }
  })

  useEffect(() => {
    localStorage.setItem('habitState4', JSON.stringify(state))
  }, [state])

  function toggleDone(groupId, habitId) {
    const tk = todayKey()
    setState(prev => {
      const groups = prev.groups.map(g => {
        if (g.id !== groupId) return g
        return {
          ...g,
          habits: g.habits.map(h => {
            if (h.id !== habitId) return h
            const wasDone = !!h.done[tk]
            const done = { ...h.done }
            if (wasDone) delete done[tk]
            else done[tk] = true
            return { ...h, done, streak: wasDone ? Math.max(0, (h.streak||0)-1) : (h.streak||0)+1 }
          })
        }
      })
      return { ...prev, groups }
    })
  }

  function addGroup(group) {
    setState(prev => ({ ...prev, groups: [...prev.groups, { ...group, id: 'g'+Date.now(), habits: [] }] }))
  }

  function updateGroup(groupId, updates) {
    setState(prev => ({ ...prev, groups: prev.groups.map(g => g.id === groupId ? { ...g, ...updates } : g) }))
  }

  function deleteGroup(groupId) {
    setState(prev => ({
      ...prev,
      groups: prev.groups.filter(g => g.id !== groupId),
      trophies: prev.trophies.filter(t => t.groupId !== groupId)
    }))
  }

  function addHabit(groupId, habit) {
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => g.id !== groupId ? g : {
        ...g, habits: [...g.habits, { ...habit, id: 'h'+Date.now(), startDate: todayKey(), done: {}, streak: 0 }]
      })
    }))
  }

  function updateHabit(groupId, habitId, updates) {
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => g.id !== groupId ? g : {
        ...g, habits: g.habits.map(h => h.id !== habitId ? h : { ...h, ...updates })
      })
    }))
  }

  function deleteHabit(groupId, habitId) {
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => g.id !== groupId ? g : {
        ...g, habits: g.habits.filter(h => h.id !== habitId)
      })
    }))
  }

  function addTrophy(trophy) {
    setState(prev => ({ ...prev, trophies: [...prev.trophies, { ...trophy, id: 't'+Date.now(), startDate: todayKey(), claimed: false }] }))
  }

  function updateTrophy(trophyId, updates) {
    setState(prev => ({ ...prev, trophies: prev.trophies.map(t => t.id !== trophyId ? t : { ...t, ...updates }) }))
  }

  function deleteTrophy(trophyId) {
    setState(prev => ({ ...prev, trophies: prev.trophies.filter(t => t.id !== trophyId) }))
  }

  function claimTrophy(trophyId) {
    updateTrophy(trophyId, { claimed: true })
  }

  function setUserName(name) {
    setState(prev => ({ ...prev, userName: name }))
  }

  return {
    state,
    todayKey,
    isExpected,
    getWeekProgress,
    getTrophyProgress,
    toggleDone,
    addGroup, updateGroup, deleteGroup,
    addHabit, updateHabit, deleteHabit,
    addTrophy, updateTrophy, deleteTrophy, claimTrophy,
    setUserName,
  }
}