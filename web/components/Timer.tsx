import { useState } from 'react'
import { ButtonToolbar, Button, Form } from 'react-bootstrap'
import { useTimerStack } from '../lib/timer-stack'

const ONE_MINUTE = 60 * 1000
const SETUP_DURATION = ONE_MINUTE * 3

interface TimerData {
  label: string
  audio?: string
}

export const Timer: React.FC = () => {
  const [skipSetup, setSkipSetup] = useState(false)

  const { data, isActive, minutes, seconds, pushTimer, clearTimers } = useTimerStack<TimerData>({
    onExpired: ({ audio }) => {
      audio && new Audio(audio).play()
    }
  })

  const pushSetupTimer = () => {
    pushTimer(skipSetup ? 1 : SETUP_DURATION, { label: 'Setup', audio: 'sounds/begin.wav' })
  }

  const pushGameTimer = (duration: number) => {
    pushTimer(duration, { label: 'Time Remaining', audio: 'sounds/over.wav' })
  }

  const pushCleanupTimer = () => {
    pushTimer(5 * ONE_MINUTE, { label: 'Games Ends In', audio: 'sounds/time.wav' })
  }

  return (
    <>
      <ButtonToolbar className="gap-2">
        <Button
          variant="outline-secondary"
          disabled={isActive}
          onClick={() => {
            pushSetupTimer()
            pushGameTimer(35 * ONE_MINUTE)
            pushCleanupTimer()
          }}
        >
          35 minutes
        </Button>
        <Button
          variant="outline-secondary"
          disabled={isActive}
          onClick={() => {
            pushSetupTimer()
            pushGameTimer(45 * ONE_MINUTE)
          }}
        >
          45 minutes
        </Button>
        <Form.Check
          type="switch"
          id="timer-skip-setup"
          label="Skip setup"
          className="my-auto"
          disabled={isActive}
          checked={skipSetup}
          onChange={(event) => setSkipSetup(event.currentTarget.checked)}
        />
        <Button
          variant="outline-danger"
          className="ms-auto"
          disabled={!isActive}
          onClick={() => clearTimers()}
        >
          Stop
        </Button>
      </ButtonToolbar>
      <div className="position-absolute top-50 start-50 translate-middle text-center">
        <div style={{ fontSize: '75px' }} className="display-1">
          {data?.label || 'Time Remaining'}
        </div>
        <div style={{ fontSize: '200px' }}>
          {minutes.toString().padStart(2, '0')} : {seconds.toString().padStart(2, '0')}
        </div>
      </div>
    </>
  )
}
