import { useState, useEffect, useCallback } from 'react'

let showToastFn = null

export function useToast() {
  const show = useCallback((msg) => {
    if (showToastFn) showToastFn(msg)
  }, [])
  return { showToast: show }
}

export default function Toast() {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    showToastFn = (message) => {
      setMsg(message)
      setVisible(true)
      setTimeout(() => setVisible(false), 2200)
    }
    return () => { showToastFn = null }
  }, [])

  return (
    <div className={`toast ${visible ? 'show' : ''}`}>
      {msg}
    </div>
  )
}