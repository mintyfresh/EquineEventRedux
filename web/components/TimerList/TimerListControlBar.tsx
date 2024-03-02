import React from 'react'
import { Button, Col, Dropdown, DropdownButton, Row } from 'react-bootstrap'
import { TimerListItemFragment, useBulkDeleteRoundTimersMutation, usePauseAllRoundTimersMutation, useUnpauseAllRoundTimersMutation } from '../../lib/generated/graphql'
import TimerListInlineForm from './TimerListInlineForm'

export interface TimerListControlBarProps {
  roundId: string
  pinToTop?: boolean
  readOnly?: boolean
  onColumnsSelect?(columns: number): void
  onTimerCreate?(timer: TimerListItemFragment): void
}

const TimerListControlBar: React.FC<TimerListControlBarProps> = ({ roundId, pinToTop, readOnly, onColumnsSelect, onTimerCreate }) => {
  const showFullscreenView = () => {
    window.open('timers/fullscreen', 'Timers', 'menubar=no,toolbar=no,location=no,status=no,directories=no')
  }

  const [pauseAllTimers, {}] = usePauseAllRoundTimersMutation({ variables: { roundId } })
  const [unpauseAllTimers, {}] = useUnpauseAllRoundTimersMutation({ variables: { roundId } })
  const [bulkDeleteTimers] = useBulkDeleteRoundTimersMutation()

  return (
    <Row {...(pinToTop ? { style: { position: 'absolute', top: 10, right: 20, zIndex: 1000 } } : {})}>
      <Col>
        {!readOnly && (
          <TimerListInlineForm
            roundId={roundId}
            onCreate={onTimerCreate}
          />
        )}
      </Col>
      <Col xs="auto">
        {!readOnly && (
          <Button variant="outline-secondary" onClick={showFullscreenView}>
            Pop-out fullscreen
          </Button>
        )}
        {onColumnsSelect && (
          <DropdownButton id="timer-controls-bar-dropdown" title="Columns" variant="outline-secondary" align="end" className="d-inline-block ms-2">
            {[1, 2, 3, 4].map((columns) => (
              <Dropdown.Item key={columns} onClick={() => onColumnsSelect(columns)}>
                {columns}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        )}
        {!readOnly && (
          <DropdownButton id="timer-controls-bar-dropdown" title="Tools" variant="outline-secondary" align="end" className="d-inline-block ms-2">
            <Dropdown.Item onClick={() => pauseAllTimers()}>
              Pause all timers
            </Dropdown.Item>
            <Dropdown.Item onClick={() => unpauseAllTimers()}>
              Unpause all timers
            </Dropdown.Item>
            <Dropdown.Item onClick={() =>
              confirm('Are you sure you want to clear all expired timers?') &&
                bulkDeleteTimers({ variables: { roundId, expiredOnly: true } })
            }>
              Clear expired timers
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item className="text-danger" onClick={() =>
              confirm('Are you sure you want to clear all timers? This cannot be undone!') &&
                confirm('This will delete all timers, including active ones. Are you really sure?') &&
                bulkDeleteTimers({ variables: { roundId, expiredOnly: false } })
            }>
              Clear all timers
            </Dropdown.Item>
          </DropdownButton>
        )}
      </Col>
    </Row>
  )
}

export default TimerListControlBar
