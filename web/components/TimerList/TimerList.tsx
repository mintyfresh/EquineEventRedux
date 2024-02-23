import React from 'react'
import { Alert, Col, Row } from 'react-bootstrap'
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
          roundId={timerList.id}
          onTimerCreate={onTimerCreate}
        />
      )}
      {timerList.timers.length > 0 ? (
        <Row className="justify-content-center">
          {timerList.timers.map((timer) => (
            <Col key={timer.id} className="pb-5" md="6">
              <TimerListItem
                timerList={timerList}
                timer={timer}
                readOnly={readOnly}
                onCreate={onTimerCreate}
                onUpdate={onTimerUpdate}
                onDelete={onTimerDelete}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info" className="mt-3">
          No timers have been set for this round yet.
        </Alert>
      )}
    </>
  )
}

export default TimerList
