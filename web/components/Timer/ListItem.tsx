import { gql } from '@apollo/client'
import React, { useEffect, useMemo, useState } from 'react'
import { TimerListItemFragment } from '../../lib/generated/graphql'
import TimerListItemControls, { TimerListItemControlsProps } from './ListItemControls'

export const TIMER_LIST_ITEM_FRAGMENT = gql`
  fragment TimerListItem on Timer {
    id
    label
    isPaused
    isEnded
    timeRemaining
    currentPhase {
      id
      name
      durationInSeconds
      audioClip {
        id
        fileUrl
      }
    }
    previousPhase {
      id
      name
      durationInSeconds
      audioClip {
        id
        fileUrl
      }
    }
  }
`

export interface TimerListItemProps extends TimerListItemControlsProps {
  timer: TimerListItemFragment
  readOnly?: boolean
  onLabelUpdate?: (label: string) => void
}

const UPDATE_INTERVAL = 10

const MILLIS_PER_SECOND  = 1000
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR   = 60
const SECONDS_PER_HOUR   = SECONDS_PER_MINUTE * MINUTES_PER_HOUR

const TimerListItem: React.FC<TimerListItemProps> = ({ timer, readOnly, onLabelUpdate, onPause, onUnpause, onReset, onSkipToNextPhase, onClone, onDelete }) => {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  const expiresAt = useMemo(() => (
    new Date(Date.now() + (timer.timeRemaining * MILLIS_PER_SECOND))
  ), [timer.id, timer.timeRemaining])

  useEffect(() => {
    const interval = setInterval(() => {
      const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / MILLIS_PER_SECOND))

      setHours(Math.floor(timeRemaining / SECONDS_PER_HOUR))
      setMinutes(Math.floor((timeRemaining % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE))
      setSeconds(timeRemaining % SECONDS_PER_MINUTE)
    }, UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [expiresAt])

  return (
    <div className="text-center mb-5">
      <h3 className="mb-0 pb-0" style={{ 'fontSize': '70px', 'fontWeight': 'lighter' }}>
        {timer.currentPhase?.name || timer.previousPhase?.name || 'No Label'}
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
