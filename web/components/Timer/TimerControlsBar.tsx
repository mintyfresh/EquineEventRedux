import React from 'react'
import { Button, Col, Dropdown, DropdownButton, Row } from 'react-bootstrap'
import TimerInlineCreateForm from './TimerInlineCreateForm'
import { gql } from '@apollo/client'
import { TIMER_LIST_ITEM_FRAGMENT } from './TimerListItem'
import { usePauseAllEventTimersMutation, useUnpauseAllEventTimersMutation } from '../../lib/generated/graphql'

gql`
  mutation PauseAllEventTimers($eventId: ID!) {
    eventPauseAllTimers(eventId: $eventId) {
      timers {
        ...TimerListItem
      }
    }
  }
  ${TIMER_LIST_ITEM_FRAGMENT}
`

gql`
  mutation UnpauseAllEventTimers($eventId: ID!) {
    eventUnpauseAllTimers(eventId: $eventId) {
      timers {
        ...TimerListItem
      }
    }
  }
  ${TIMER_LIST_ITEM_FRAGMENT}
`

export interface TimerControlsBarProps {
  eventId: string
  onTimerCreate?: (timerId: string) => void
}

const TimerControlsBar: React.FC<TimerControlsBarProps> = ({ eventId, onTimerCreate }) => {
  const showFullscreenView = () => {
    window.open('?fullscreen=true', 'Timers', 'menubar=no,toolbar=no,location=no,status=no,directories=no')
  }

  const [pauseAllTimers, {}] = usePauseAllEventTimersMutation({ variables: { eventId } })
  const [unpauseAllTimers, {}] = useUnpauseAllEventTimersMutation({ variables: { eventId } })

  return (
    <Row>
      <Col>
        <TimerInlineCreateForm
          eventId={eventId}
          onCreate={(timerId) => onTimerCreate?.(timerId)}
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

export default TimerControlsBar
