import React, { useEffect, useMemo, useState } from 'react'
import { TimerFragment, TimerPhaseFragment } from '../../lib/generated/graphql'

const UPDATE_INTERVAL = 250

const MILLIS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR

function calculateTimeRemaining(expiresAt: Date, pausedAt: Date | null, latency: number): number {
  const now = pausedAt ? pausedAt.getTime() : Date.now() - latency

  return Math.max(0, (expiresAt.getTime() - now) / MILLIS_PER_SECOND)
}

function calculateCurrentPhase<Phase extends TimerPhaseFragment>(phases: Phase[], timeElapsed: number): Phase | null {
  return phases.find((phase) => {
    const phaseStart = phase.offsetFromStart
    const phaseEnd   = phaseStart + phase.durationInSeconds

    return phaseStart <= timeElapsed && timeElapsed < phaseEnd
  }) ?? null
}

function calculateTimeRemainingInPhase<Phase extends TimerPhaseFragment>(timeRemaining: number, currentPhase: Phase | null): number {
  if (!currentPhase) {
    return 0
  }

  return Math.max(0, timeRemaining - currentPhase.offsetFromEnd)
}

export interface TimerProps<Timer extends TimerFragment, Phase extends TimerPhaseFragment = Timer['phases'][0]> extends React.HTMLAttributes<HTMLSpanElement> {
  timer: Timer
  audioEnabled?: boolean
  formatter(hours: number, minutes: number, seconds: number, phase: Phase | null, timer: Timer): React.ReactNode | string
}

function Timer<Timer extends TimerFragment & { phases: Phase[] }, Phase extends TimerPhaseFragment = Timer['phases'][0]>({ timer, audioEnabled, formatter, ...props }: TimerProps<Timer, Phase>) {
  const [phase, setPhase] = useState<Phase | null>(null)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [audioClip, setAudioClip] = useState<HTMLAudioElement | null>(null)

  // A date representing the time at which the server last processed the timer.
  const instant = useMemo(() => new Date(timer.instant), [timer.instant])

  // The latency between the request executing and this component rendering.
  const latency = useMemo(() => Date.now() - instant.getTime(), [instant])

  // A date representing the time at which the timer will expire.
  const expiresAt = useMemo(() => new Date(timer.expiresAt), [timer.expiresAt])

  // A date representing the time at which the timer was paused, or null if the timer is not paused.
  const pausedAt = useMemo(() => timer.pausedAt ? new Date(timer.pausedAt) : null, [timer.pausedAt])

  // Preload audio clips mapped to the phases they correspond to.
  const audioClips = useMemo(
    () => new Map<string, HTMLAudioElement | null>(
      timer.phases.map((phase) => [phase.id, phase.audioClip ? new Audio(phase.audioClip.fileUrl) : null])
    ),
    [timer.phases]
  )

  useEffect(() => {
    const interval = setInterval(() => {
      const timeRemaining = calculateTimeRemaining(expiresAt, pausedAt, latency)
      const timeElapsed = timer.totalDurationInSeconds - timeRemaining
      const currentPhase = calculateCurrentPhase<Phase>(timer.phases, timeElapsed)
      const timeRemainingInPhase = calculateTimeRemainingInPhase<Phase>(timeRemaining, currentPhase)

      setHours(Math.floor(timeRemainingInPhase / SECONDS_PER_HOUR))
      setMinutes(Math.floor((timeRemainingInPhase % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE))
      setSeconds(Math.floor(timeRemainingInPhase % SECONDS_PER_MINUTE))

      setPhase((previousPhase) => {
        // if we switched phases, and there was an expired phase (this is not the first), and it was to the subsequent phase
        // (this avoids situations where the phase is reset to the first, or the timer somehow jumps past the final phase)
        if (previousPhase !== currentPhase && previousPhase && (currentPhase?.position ?? Infinity) > previousPhase.position) {
          console.log('Phase changed:', currentPhase?.id, 'from', previousPhase?.id)
          // queue the audio clip rather than playing it immediately
          // (this block might be called more than once before the audio is played, so we need to ensure it's only played once)
          setAudioClip(audioClips.get(previousPhase.id) ?? null)
        }

        return currentPhase
      })
    }, UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [latency, expiresAt, pausedAt, timer.totalDurationInSeconds, timer.phases])

  useEffect(() => {    
    // Play the queued audio clip.
    if (audioClip) {
      console.log('Playing queued audio clip:', audioClip)

      try {
        if (audioEnabled) {
          audioClip.play()
        }
      } catch (error) {
        console.error(error)
      } finally {
        setAudioClip(null)
      }
    }
  }, [audioEnabled, audioClip])

  return (
    <span {...props}>
      {formatter(hours, minutes, seconds, phase, timer)}
    </span>
  )
}

export default Timer
