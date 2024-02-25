import { IconDefinition, faBackwardFast, faCircle, faCirclePause, faFastForward, faPause, faPlay, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { Button, Card, Col, Collapse, Form, Row } from 'react-bootstrap'
import { TimerListFragment, TimerListItemFragment, useCloneTimerWithExtensionMutation, useDeleteTimerMutation, usePauseTimerMutation, useResetTimerMutation, useSkipTimerToNextPhaseMutation, useUnpauseTimerMutation } from '../../lib/generated/graphql'

interface TimerControlsButtonProps extends React.ComponentProps<typeof Button> {
  icon: IconDefinition
  color?: string
  ref?: React.ForwardedRef<HTMLButtonElement>
}

const TimerControlsButton: React.FC<TimerControlsButtonProps> = ({ icon, color, ref, ...props }) => (
  <Button
    variant="outline-secondary"
    className="mx-1"
    style={{ 'borderWidth': '2px' }}
    {...props}
    ref={ref}
  >
    <FontAwesomeIcon icon={icon} color={color ?? 'black'} />
  </Button>

)

export interface TimerListItemControlsProps {
  timerList: TimerListFragment
  timer: TimerListItemFragment
  onCreate?(timer: TimerListItemFragment): void
  onUpdate?(timer: TimerListItemFragment): void
  onDelete?(timer: TimerListItemFragment): void
}

const TimerListItemControls: React.FC<TimerListItemControlsProps> = ({ timerList, timer, onCreate, onUpdate, onDelete }) => {
  const [open, setOpen] = useState(false)
  const [startPaused, setStartPaused] = useState(false)
  const [matchId, setMatchId] = useState<string | null>(null)

  const [resetTimer, {}] = useResetTimerMutation({
    variables: { id: timer.id },
    onCompleted({ timerReset }) {
      if (timerReset?.timer) {
        onUpdate?.(timerReset.timer)
      }
    }
  })
  const [pauseTimer, {}] = usePauseTimerMutation({
    variables: { id: timer.id },
    onCompleted({ timerPause }) {
      if (timerPause?.timer) {
        onUpdate?.(timerPause.timer)
      }
    }
  })
  const [unpauseTimer, {}] = useUnpauseTimerMutation({
    variables: { id: timer.id },
    onCompleted({ timerUnpause }) {
      if (timerUnpause?.timer) {
        onUpdate?.(timerUnpause.timer)
      }
    }
  })
  const [skipToNextPhase, {}] = useSkipTimerToNextPhaseMutation({
    variables: { id: timer.id },
    onCompleted({ timerSkipToNextPhase }) {
      if (timerSkipToNextPhase?.timer) {
        onUpdate?.(timerSkipToNextPhase.timer)
      }
    }
  })
  const [deleteTimer, {}] = useDeleteTimerMutation({
    variables: { id: timer.id },
    onCompleted({ timerDelete }) {
      if (timerDelete?.success) {
        onDelete?.(timer)
      }
    }
  })
  const [cloneWithExtension, {}] = useCloneTimerWithExtensionMutation({
    onCompleted({ timerCloneWithExtension }) {
      if (timerCloneWithExtension?.timer) {
        onCreate?.(timerCloneWithExtension.timer)
      }
    }
  })

  // Only allow cloning to a match that doesn't already have a timer.
  const matches = timerList.matches.filter((match) => !match.timer?.id)

  return (
    <>
      <TimerControlsButton
        title="Reset"
        onClick={() => (
          confirm('Are you sure you want to reset this timer?') &&
            resetTimer()
        )}
        icon={faBackwardFast}
      />
      <TimerControlsButton
        title="Resume"
        disabled={!timer.isPaused || timer.isExpired}
        onClick={() => unpauseTimer()}
        icon={faPlay}
      />
      <TimerControlsButton
        title="Pause"
        disabled={timer.isPaused || timer.isExpired}
        onClick={() => pauseTimer()}
        icon={faPause}
      />
      <TimerControlsButton
        title="Skip to next step"
        disabled={timer.isExpired}
        onClick={() => skipToNextPhase()}
        icon={faFastForward}
      />
      <TimerControlsButton
        title="Clone"
        onClick={() => setOpen(!open)}
        icon={faCircle}
      />
      <TimerControlsButton
        title="Delete"
        onClick={() => (
          confirm('Are you sure you want to delete this timer?') &&
            deleteTimer()
        )}
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
                  onClick={() => cloneWithExtension({
                    variables: { id: timer.id, input: { extensionInSeconds: minutes * 60, matchId, paused: startPaused } }
                  })}
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
              <Form.Select
                title="Assign extension to a table"
                className="mt-2"
                placeholder="Assign extension to a table"
                value={matchId ?? ''}
                onChange={(event) => setMatchId(event.currentTarget.value || null)}
              >
                <option value=""></option>
                {matches.map((match) => (
                  <option key={match.id} value={match.id}>
                    Table {match.table} - {match.player1.name} vs. {match.player2?.name ?? 'BYE'}
                  </option>
                ))}
              </Form.Select>
            </Card>
          </Col>
        </Row>
      </Collapse>
    </>
  )
}

export default TimerListItemControls
