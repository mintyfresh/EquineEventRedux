import React, { useEffect, useMemo, useState } from 'react'
import { TimerFragment, TimerPhaseFragment } from '../../lib/generated/graphql'

const UPDATE_INTERVAL = 250

const MILLIS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR

const calculateTimeRemaining = (expiresAt: Date, pausedAt: Date | null, latency: number) => {
  const now = pausedAt ? pausedAt.getTime() : Date.now() - latency

  return Math.max(0, (expiresAt.getTime() - now) / MILLIS_PER_SECOND)
}

const calculateCurrentPhase = (phases: TimerPhaseFragment[], timeElapsed: number) => {
  return phases.find((phase) => {
    const phaseStart = phase.offsetFromStart
    const phaseEnd   = phaseStart + phase.durationInSeconds

    return phaseStart <= timeElapsed && timeElapsed < phaseEnd
  }) ?? null
}

const calculateTimeRemainingInPhase = (timeRemaining: number, currentPhase: TimerPhaseFragment | null) => {
  if (!currentPhase) {
    return 0
  }

  return Math.max(0, timeRemaining - currentPhase.offsetFromEnd)
}

export interface TimerProps extends React.HTMLAttributes<HTMLSpanElement> {
  timer: TimerFragment
  audioEnabled?: boolean
  formatter(hours: number, minutes: number, seconds: number, phase: TimerPhaseFragment | null, timer: TimerFragment): React.ReactNode | string
}

const Timer: React.FC<TimerProps> = ({ timer, audioEnabled, formatter, ...props }) => {
  const [currentPhase, setCurrentPhase] = useState<TimerPhaseFragment | null>(null)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [audioClip, setAudioClip] = useState<string | null>(null)

  // A date representing the time at which the server last processed the timer.
  const instant = useMemo(() => new Date(timer.instant), [timer.instant])

  // The latency between the request executing and this component rendering.
  const latency = useMemo(() => Date.now() - instant.getTime(), [instant])

  // A date representing the time at which the timer will expire.
  const expiresAt = useMemo(() => new Date(timer.expiresAt), [timer.expiresAt])

  // A date representing the time at which the timer was paused, or null if the timer is not paused.
  const pausedAt = useMemo(() => timer.pausedAt ? new Date(timer.pausedAt) : null, [timer.pausedAt])

  useEffect(() => {
    const interval = setInterval(() => {
      const timeRemaining = calculateTimeRemaining(expiresAt, pausedAt, latency)
      const timeElapsed = timer.totalDurationInSeconds - timeRemaining
      const currentPhase = calculateCurrentPhase(timer.phases, timeElapsed)
      const timeRemainingInPhase = calculateTimeRemainingInPhase(timeRemaining, currentPhase)

      setHours(Math.floor(timeRemainingInPhase / SECONDS_PER_HOUR))
      setMinutes(Math.floor((timeRemainingInPhase % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE))
      setSeconds(Math.floor(timeRemainingInPhase % SECONDS_PER_MINUTE))

      setCurrentPhase((existingPhase) => {
        // Queue the audio clip for the phase transition, if it exists.
        // (This block might get called a couple of times, so we queue it so that it only plays once.)
        if (existingPhase?.audioClip && existingPhase?.id !== currentPhase?.id) {
          setAudioClip(existingPhase.audioClip.fileUrl)
        }

        return currentPhase
      })
    }, UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [latency, expiresAt, pausedAt, timer.totalDurationInSeconds, timer.phases])

  useEffect(() => {
    // Play the queued audio clip.
    if (audioClip) {
      try {
        audioEnabled &&
          new Audio(audioClip).play()
      } catch (error) {
        console.error(error)
      } finally {
        setAudioClip(null)
      }
    }
  }, [audioEnabled, audioClip])

  return (
    <span {...props}>
      {formatter(hours, minutes, seconds, currentPhase, timer)}
    </span>
  )
}

export default Timer
