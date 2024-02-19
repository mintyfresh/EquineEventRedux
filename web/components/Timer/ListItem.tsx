import { gql } from '@apollo/client'
import React, { useEffect, useMemo, useState } from 'react'
import { TimerListItemFragment } from '../../lib/generated/graphql'
import TimerListItemControls, { TimerListItemControlsProps } from './ListItemControls'

export const TIMER_LIST_ITEM_FRAGMENT = gql`
  fragment TimerListItem on Timer {
    id
    label
    isExpired
    expiresAt
    isPaused
    pausedAt
    preset {
      id
      phases {
        id
        name
        position
        durationInSeconds
        audioClip {
          id
          fileUrl
        }
      }
    }
  }
`

type TimerPhaseList = TimerListItemFragment['preset']['phases']
type TimerPhase = TimerPhaseList[0]

const MILLIS_PER_SECOND  = 1000
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR   = 60
const SECONDS_PER_HOUR   = SECONDS_PER_MINUTE * MINUTES_PER_HOUR

const calculateTimeRemaining = (expiresAt: Date, pausedAt: Date | null) => {
  const now = (pausedAt ?? new Date()).getTime()

  return Math.max(0, (expiresAt.getTime() - now) / MILLIS_PER_SECOND)
}

const calculateCurrentPhase = (phases: TimerPhaseList, timeRemaining: number) => {
  let cumulativeDuration = 0

  return phases.toReversed().find((phase) => {
    cumulativeDuration += phase.durationInSeconds

    return cumulativeDuration > timeRemaining
  })
}

const calculateTimeRemainingInPhase = (phases: TimerPhaseList, timeRemaining: number, currentPhase: TimerPhase | undefined) => {
  if (!currentPhase) {
    return 0
  }

  const followingPhases = phases.filter((phase) => phase.position > currentPhase.position)
  const totalTimeInFollowingPhases = followingPhases.reduce((total, phase) => total + phase.durationInSeconds, 0)

  return Math.max(0, timeRemaining - totalTimeInFollowingPhases)
}

export interface TimerListItemProps extends TimerListItemControlsProps {
  timer: TimerListItemFragment
  readOnly?: boolean
  onLabelUpdate?: (label: string) => void
}

const UPDATE_INTERVAL = 100

const TimerListItem: React.FC<TimerListItemProps> = ({ timer, readOnly, onLabelUpdate, onPause, onUnpause, onReset, onSkipToNextPhase, onClone, onDelete }) => {
  const [currentPhase, setCurrentPhase] = useState<TimerPhase | undefined>()
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  // A date representing the time at which the timer will expire.
  const expiresAt = useMemo(() => (
    new Date(timer.expiresAt)
  ), [timer.expiresAt])

  // A date representing the time at which the timer was paused, or null if the timer is not paused.
  const pausedAt = useMemo(() => (
    timer.pausedAt ? new Date(timer.pausedAt) : null
  ), [timer.pausedAt])

  useEffect(() => {
    const interval = setInterval(() => {
      const timeRemaining = calculateTimeRemaining(expiresAt, pausedAt)
      const currentPhase = calculateCurrentPhase(timer.preset?.phases ?? [], timeRemaining)
      const timeRemainingInPhase = calculateTimeRemainingInPhase(timer.preset?.phases ?? [], timeRemaining, currentPhase)

      setHours(Math.floor(timeRemainingInPhase / SECONDS_PER_HOUR))
      setMinutes(Math.floor((timeRemainingInPhase % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE))
      setSeconds(Math.floor(timeRemainingInPhase % SECONDS_PER_MINUTE))
      setCurrentPhase(currentPhase)
    }, UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [expiresAt, pausedAt, timer.preset.phases])

  return (
    <div className="text-center mb-5">
      <h3 className="mb-0 pb-0" style={{ 'fontSize': '70px', 'fontWeight': 'lighter' }}>
        {currentPhase?.name || 'No Label'}
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
            onBlur={(event) => onLabelUpdate?.(event.currentTarget.value)}
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
