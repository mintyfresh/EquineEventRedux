import { IconDefinition, faBackwardFast, faCircle, faCirclePause, faFastForward, faPause, faPlay, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { Button, Card, Col, Collapse, Row } from 'react-bootstrap'
import { TimerCloneWithExtensionInput, TimerListItemFragment } from '../../lib/generated/graphql'

interface TimerControlsButtonProps extends React.ComponentProps<typeof Button> {
  icon: IconDefinition
  color?: string
}

const TimerControlsButton: React.FC<TimerControlsButtonProps> = ({ icon, color, ...props }) => (
  <Button
    variant="outline-secondary"
    className="mx-1"
    style={{ 'borderWidth': '2px' }}
    {...props}
  >
    <FontAwesomeIcon icon={icon} color={color ?? 'black'} />
  </Button>

)

export interface TimerListItemControlsProps {
  timer: TimerListItemFragment
  onPause?(timer: TimerListItemFragment): void
  onUnpause?(timer: TimerListItemFragment): void
  onReset?(timer: TimerListItemFragment): void
  onSkipToNextPhase?(timer: TimerListItemFragment): void
  onClone?(timer: TimerListItemFragment, input: TimerCloneWithExtensionInput): void
  onDelete?(timer: TimerListItemFragment): void
}

const TimerListItemControls: React.FC<TimerListItemControlsProps> = ({ timer, onPause, onUnpause, onReset, onSkipToNextPhase, onClone, onDelete }) => {
  const [open, setOpen] = useState(false)
  const [startPaused, setStartPaused] = useState(false)

  return (
    <>
      <TimerControlsButton
        title="Reset"
        onClick={() => onReset?.(timer)}
        icon={faBackwardFast}
      />
      <TimerControlsButton
        title="Resume"
        disabled={!timer.isPaused || timer.isExpired}
        onClick={() => onUnpause?.(timer)}
        icon={faPlay}
      />
      <TimerControlsButton
        title="Pause"
        disabled={timer.isPaused || timer.isExpired}
        onClick={() => onPause?.(timer)}
        icon={faPause}
      />
      <TimerControlsButton
        title="Skip to next step"
        disabled={timer.isExpired}
        onClick={() => onSkipToNextPhase?.(timer)}
        icon={faFastForward}
      />
      <TimerControlsButton
        title="Clone"
        onClick={() => { setOpen(!open) }}
        icon={faCircle}
      />
      <TimerControlsButton
        title="Delete"
        onClick={() => onDelete?.(timer)}
        icon={faTrash}
      />
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
                  onClick={() => onClone?.(timer, { extensionInSeconds: minutes * 60, paused: startPaused })}
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
