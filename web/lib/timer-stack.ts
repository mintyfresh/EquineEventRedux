import { useState, useEffect } from 'react'

const ONE_MINUTE = 60 * 1000

export interface Timer<T> {
  duration: number
  data: T
}

export const useTimerStack = function<T>({ onExpired }: { onExpired?: (data: T) => void }) {
  const [isActive, setActive] = useState(false)
  const [timers, setTimers] = useState<Timer<T>[]>([])
  const [remaining, setRemaining] = useState(0)
  const [intervalID, setIntervalID] = useState<number | null>(null)

  const timer = timers[0]

  const intervalHandler = () => {
    setRemaining((remaining) => remaining - 1000)
  }

  useEffect(() => {
    if (isActive && timers.length === 0) {
      setActive(false)
    }
  }, [isActive, timers])

  useEffect(() => {
    if (isActive && !intervalID) {
      setIntervalID(window.setInterval(intervalHandler, 1000))
      return
    }

    if (!isActive && intervalID) {
      window.clearInterval(intervalID)
      setIntervalID(null)
    }
  }, [isActive, intervalID])

  useEffect(() => {
    if (timers.length > 0 && remaining <= 0) {
      const nextTimer = timers[1]

      if (nextTimer) {
        setRemaining(nextTimer.duration)
      }

      setTimers(timers.slice(1))
      onExpired?.(timers[0].data)
    }
  }, [remaining, timers, onExpired])

  const pushTimer = (duration: number, data: T) => {
    setTimers((timers) => [...timers, { duration, data }])
    setRemaining((remaining) => remaining || duration)
    setActive(true)
  }

  const clearTimers = () => {
    setActive(false)
    setRemaining(0)
    setTimers([])
  }

  const seconds = timer ? Math.floor((remaining / 1000) % 60) : 0
  const minutes = timer ? Math.floor((remaining / ONE_MINUTE) % 60) : 0
  const hours   = timer ? Math.floor((remaining / ONE_MINUTE / 60) % 24) : 0
  const days    = timer ? Math.floor((remaining / ONE_MINUTE / 60 / 24)) : 0

  return {
    remaining,
    seconds,
    minutes,
    hours,
    days,
    isActive,
    pushTimer,
    clearTimers,
    data: timer?.data
  }
}
