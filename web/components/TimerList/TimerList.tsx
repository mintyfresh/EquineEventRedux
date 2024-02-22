import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { TimerListFragment, TimerListItemFragment } from '../../lib/generated/graphql'
import TimerListControlBar from './TimerListControlBar'
import TimerListItem from './TimerListItem'

export interface TimerListProps {
  timerList: TimerListFragment
  onTimerCreate?(timer: TimerListItemFragment): void
  onTimerUpdate?(timer: TimerListItemFragment): void
  onTimerDelete?(timer: TimerListItemFragment): void
  readOnly?: boolean
}

const TimerList: React.FC<TimerListProps> = ({ timerList, onTimerCreate, onTimerUpdate, onTimerDelete, readOnly }) => {
  return (
    <>
      {!readOnly && (
        <TimerListControlBar
          eventId={timerList.id}
          onTimerCreate={onTimerCreate}
        />
      )}
      <Row className="justify-content-center">
        {timerList.timers.map((timer) => (
          <Col key={timer.id} className="pb-5" md="6">
            <TimerListItem
              timer={timer}
              readOnly={readOnly}
              onCreate={onTimerCreate}
              onUpdate={onTimerUpdate}
              onDelete={onTimerDelete}
            />
          </Col>
        ))}
      </Row>
    </>
  )
}

export default TimerList
