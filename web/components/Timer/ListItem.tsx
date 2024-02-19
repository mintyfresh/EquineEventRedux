import { gql } from '@apollo/client'
import React, { useEffect, useMemo, useState } from 'react'
import { TimerListItemFragment } from '../../lib/generated/graphql'
import TimerListItemControls, { TimerListItemControlsProps } from './ListItemControls'

export const TIMER_LIST_ITEM_FRAGMENT = gql`
  fragment TimerListItem on Timer {
    id
    label
    instant
    isExpired
    expiresAt
    isPaused
    pausedAt
    totalDurationInSeconds
    phases {
      id
      name
      position
      durationInSeconds
      offsetFromStart
      offsetFromEnd
      audioClip {
        id
        fileUrl
      }
    }
  }
`

type TimerPhaseList = TimerListItemFragment['phases']
type TimerPhase = TimerPhaseList[0]

const MILLIS_PER_SECOND  = 1000
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR   = 60
const SECONDS_PER_HOUR   = SECONDS_PER_MINUTE * MINUTES_PER_HOUR

const calculateTimeRemaining = (expiresAt: Date, pausedAt: Date | null, latency: number) => {
  const now = pausedAt ? pausedAt.getTime() : Date.now() - latency

  return Math.max(0, (expiresAt.getTime() - now) / MILLIS_PER_SECOND)
}

const calculateCurrentPhase = (phases: TimerPhaseList, timeElapsed: number) => {
  return phases.find((phase) => {
    const phaseStart = phase.offsetFromStart
    const phaseEnd   = phaseStart + phase.durationInSeconds

    return phaseStart <= timeElapsed && timeElapsed < phaseEnd
  }) ?? null
}

const calculateTimeRemainingInPhase = (timeRemaining: number, currentPhase: TimerPhase | null) => {
  if (!currentPhase) {
    return 0
  }

  return Math.max(0, timeRemaining - currentPhase.offsetFromEnd)
}

export interface TimerListItemProps extends TimerListItemControlsProps {
  timer: TimerListItemFragment
  readOnly?: boolean
  onLabelUpdate?: (timer: TimerListItemFragment, label: string) => void
}

const UPDATE_INTERVAL = 100

const TimerListItem: React.FC<TimerListItemProps> = ({ timer, readOnly, onLabelUpdate, onPause, onUnpause, onReset, onSkipToNextPhase, onClone, onDelete }) => {
  const [currentPhase, setCurrentPhase] = useState<TimerPhase | null>(null)
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
        new Audio(audioClip).play()
      } catch (error) {
        console.error(error)
      } finally {
        setAudioClip(null)
      }
    }
  }, [audioClip])

  return (
    <div className="text-center mb-5">
      <h3 className="mb-0 pb-0" style={{ 'fontSize': '70px', 'fontWeight': 'lighter' }}>
        {currentPhase?.name || 'Done'}
      </h3>
      <div className="mb-3" style={{ 'fontSize': '200px', 'fontWeight': 'lighter', 'lineHeight': '12rem' }}>
        {hours > 0 && (
          hours.toString().padStart(2, '0') + ':'
        )}
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
      {(timer.label || !readOnly) && (
        <div className="mb-3">
          <input
            type="text"
            defaultValue={timer.label ?? ''}
            placeholder="Click to add label"
            readOnly={readOnly}
            style={{ 'fontSize': '36px', 'fontWeight': 'lighter', 'textAlign': 'center', 'border': 'none', 'borderBottom': readOnly ? 'none' : '1px solid #000' }}
            onBlur={(event) => onLabelUpdate?.(timer, event.currentTarget.value)}
            onKeyPress={(event) => event.key === 'Enter' && event.currentTarget.blur()}
          />
        </div>
      )}
      {readOnly || (
        <div className="mx-auto">
          <TimerListItemControls
            timer={timer}
            onPause={onPause}
            onUnpause={onUnpause}
            onReset={onReset}
            onSkipToNextPhase={onSkipToNextPhase}
            onClone={onClone}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  )
}

export default TimerListItem
