import { Button, Card, Col, Collapse, Form, Row } from 'react-bootstrap'
import { TimerCloneWithOffsetInput, TimerListItemFragment } from '../../lib/generated/graphql'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBackwardFast, faPlay, faPause, faFastForward, faCircle, faTrash, faCirclePause } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

export interface TimerListItemControlsProps {
  timer: TimerListItemFragment
  onPause?(timer: TimerListItemFragment): void
  onUnpause?(timer: TimerListItemFragment): void
  onReset?(timer: TimerListItemFragment): void
  onSkipToNextPhase?(timer: TimerListItemFragment): void
  onClone?(timer: TimerListItemFragment, input: TimerCloneWithOffsetInput): void
  onDelete?(timer: TimerListItemFragment): void
}

const TimerListItemControls: React.FC<TimerListItemControlsProps> = ({ timer, onPause, onUnpause, onReset, onSkipToNextPhase, onClone, onDelete }) => {
  const [open, setOpen] = useState(false)
  const [startPaused, setStartPaused] = useState(false)

  return (
    <>
      <Button
        title="Reset"
        variant="outline-secondary"
        className="mx-1"
        style={{ 'borderWidth': '2px'}}
        onClick={() => onReset?.(timer)}
      >
        <FontAwesomeIcon icon={faBackwardFast} color="black" />
      </Button>
      <Button
        title="Resume"
        variant="outline-secondary"
        className="mx-1"
        style={{ 'borderWidth': '2px'}}
        disabled={!timer.isPaused || timer.isExpired}
        onClick={() => onUnpause?.(timer)}
      >
        <FontAwesomeIcon icon={faPlay} color="black" />
      </Button>
      <Button
        title="Pause"
        variant="outline-secondary"
        className="mx-1"
        style={{ 'borderWidth': '2px'}}
        disabled={timer.isPaused || timer.isExpired}
        onClick={() => onPause?.(timer)}
      >
        <FontAwesomeIcon icon={faPause} color="black" />
      </Button>
      <Button
        title="Skip to next step"
        variant="outline-secondary"
        className="mx-1"
        style={{ 'borderWidth': '2px'}}
        disabled={timer.isExpired}
        onClick={() => onSkipToNextPhase?.(timer)}
      >
        <FontAwesomeIcon icon={faFastForward} color="black" />
      </Button>
      <Button
        title="Clone"
        variant="outline-secondary"
        className="mx-1"
        style={{ 'borderWidth': '2px'}}
        onClick={() => { setOpen(!open) }}
      >
        <FontAwesomeIcon icon={faCircle} color="black" />
      </Button>
      <Button
        title="Delete"
        variant="outline-secondary"
        className="mx-1"
        style={{ 'borderWidth': '2px'}}
        onClick={() => onDelete?.(timer)}
      >
        <FontAwesomeIcon icon={faTrash} color="black" />
      </Button>
      <Collapse in={open}>
        <Row className="mt-3">
          <Col xs="auto" className="mx-auto">
            <Card body>
              {[0, 1, 3, 5, 10].map((minutes) => (
                <Button
                  key={minutes}
                  title={`+${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`}
                  variant="outline-secondary"
                  className="mx-1"
                  style={{ 'borderWidth': '2px'}}
                  onClick={() => onClone?.(timer, { offsetInSeconds: minutes * 60, paused: startPaused })}
                >
                  +{minutes}
                </Button>
              ))}
              <Button
                title="Start paused"
                variant="outline-secondary"
                className="mx-1"
                style={{ 'borderWidth': '2px'}}
                onClick={() => setStartPaused(!startPaused)}
              >
                <FontAwesomeIcon icon={faCirclePause} color={startPaused ? 'green' : 'gray'} />
              </Button>
            </Card>
          </Col>
        </Row>
      </Collapse>
    </>
  )
}

export default TimerListItemControls
