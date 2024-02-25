import React, { useEffect, useState } from 'react'
import { TimerListFragment, TimerListItemFragment, useUpdateTimerMutation } from '../../lib/generated/graphql'
import Timer from '../Timer/Timer'
import TimerListItemControls from './TimerListItemControls'

export interface TimerListItemProps {
  timerList: TimerListFragment
  timer: TimerListItemFragment
  readOnly?: boolean
  onCreate?(timer: TimerListItemFragment): void
  onUpdate?(timer: TimerListItemFragment): void
  onDelete?(timer: TimerListItemFragment): void
}

const TimerListItem: React.FC<TimerListItemProps> = ({ timerList, timer, readOnly, onCreate, onUpdate, onDelete }) => {
  const [label, setLabel] = useState(timer.label)

  const [updateTimer, {}] = useUpdateTimerMutation({
    onCompleted({ timerUpdate }) {
      if (timerUpdate?.timer) {
        onUpdate?.(timerUpdate.timer)
      }
    }
  })

  useEffect(() => {
    setLabel(timer.label)
  }, [timer.label])

  return (
    <div className="text-center mb-5">
      <Timer
        timer={timer}
        audioEnabled={true}
        formatter={(hours, minutes, seconds, phase) => (
          <>
            <h3 className="mb-0 pb-0" style={{ 'fontSize': '70px', 'fontWeight': 'lighter' }}>
              {phase?.name ?? 'Done'}
            </h3>
            <div className="mb-3" style={{ 'fontSize': '200px', 'fontWeight': 'lighter', 'lineHeight': '12rem' }}>
              {hours > 0 && (
                hours.toString().padStart(2, '0') + ':'
              )}
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
          </>
        )}
      />
      {(timer.label || !readOnly) && (
        <div className="mb-3">
          <input
            type="text"
            value={label ?? ''}
            onChange={(event) => setLabel(event.currentTarget.value)}
            placeholder="Click to add label"
            readOnly={readOnly}
            style={{ 'fontSize': '36px', 'fontWeight': 'lighter', 'textAlign': 'center', 'border': 'none', 'borderBottom': readOnly ? 'none' : '1px solid #000' }}
            onBlur={(event) => updateTimer({ variables: { id: timer.id, input: { label: event.currentTarget.value } } })}
            onKeyPress={(event) => event.key === 'Enter' && event.currentTarget.blur()}
          />
        </div>
      )}
      {readOnly || (
        <div className="mx-auto">
          <TimerListItemControls
            timerList={timerList}
            timer={timer}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  )
}

export default TimerListItem
