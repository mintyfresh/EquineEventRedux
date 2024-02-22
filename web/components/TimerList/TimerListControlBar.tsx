import React from 'react'
import { Button, Col, Dropdown, DropdownButton, Row } from 'react-bootstrap'
import { TimerListItemFragment, usePauseAllEventTimersMutation, useUnpauseAllEventTimersMutation } from '../../lib/generated/graphql'
import TimerListInlineForm from './TimerListInlineForm'

export interface TimerListControlBarProps {
  eventId: string
  onTimerCreate?: (timer: TimerListItemFragment) => void
}

const TimerListControlBar: React.FC<TimerListControlBarProps> = ({ eventId, onTimerCreate }) => {
  const showFullscreenView = () => {
    window.open('?fullscreen=true', 'Timers', 'menubar=no,toolbar=no,location=no,status=no,directories=no')
  }

  const [pauseAllTimers, {}] = usePauseAllEventTimersMutation({ variables: { eventId } })
  const [unpauseAllTimers, {}] = useUnpauseAllEventTimersMutation({ variables: { eventId } })

  return (
    <Row>
      <Col>
        <TimerListInlineForm
          eventId={eventId}
          onCreate={onTimerCreate}
        />
      </Col>
      <Col xs="auto">
        <Button variant="outline-secondary" className="me-2" onClick={showFullscreenView}>
          Pop-out fullscreen
        </Button>
        <DropdownButton id="timer-controls-bar-dropdown" title="Tools" variant="outline-secondary" align="end" className="d-inline-block">
          <Dropdown.Item onClick={() => pauseAllTimers()}>
            Pause all timers
          </Dropdown.Item>
          <Dropdown.Item onClick={() => unpauseAllTimers()}>
            Unpause all timers
          </Dropdown.Item>
          <Dropdown.Item>Clear expired timers</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item className="text-danger">Clear all timers</Dropdown.Item>
        </DropdownButton>
      </Col>
    </Row>
  )
}

export default TimerListControlBar
