import { Button } from 'react-bootstrap'
import { TimerListItemFragment } from '../../lib/generated/graphql'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBackwardFast, faPlay, faPause, faFastForward, faCircle, faTrash } from '@fortawesome/free-solid-svg-icons'

export interface TimerListItemControlsProps {
  timer: TimerListItemFragment
  onPause?(timer: TimerListItemFragment): void
  onUnpause?(timer: TimerListItemFragment): void
  onReset?(timer: TimerListItemFragment): void
  onSkipToNextPhase?(timer: TimerListItemFragment): void
  onClone?(timer: TimerListItemFragment): void
  onDelete?(timer: TimerListItemFragment): void
}

const TimerListItemControls: React.FC<TimerListItemControlsProps> = ({ timer, onPause, onUnpause, onReset, onSkipToNextPhase, onClone, onDelete }) => (
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
      onClick={() => onClone?.(timer)}
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
  </>
)

export default TimerListItemControls
