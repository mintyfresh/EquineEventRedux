import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Card } from 'react-bootstrap'
import { RoundListItemHeaderFragment, RoundListItemHeaderFragmentDoc, useRoundListItemHeaderTimerCreatedSubscription, useRoundListItemHeaderTimerDeletedSubscription, useRoundListItemHeaderTimerUpdatedSubscription } from '../../lib/generated/graphql'
import Timer from '../Timer/Timer'
import RoundListItemDropdown from './RoundListItemDropdown'

export interface RoundListItemHeaderProps extends React.ComponentProps<typeof Card.Header> {
  round: RoundListItemHeaderFragment
  disabled?: boolean
  expanded?: boolean
  onExpand?(expanded: boolean): void
  onDelete?(round: RoundListItemHeaderFragment): void
}

const RoundListItemHeader: React.FC<RoundListItemHeaderProps> = ({ round, disabled, expanded, onExpand, onDelete, style, ...props }) => {
  const timer = round.primaryTimer

  useRoundListItemHeaderTimerCreatedSubscription({
    skip: !!timer && !timer.isExpired, // skip if we already have a timer
    variables: { roundId: round.id },
    fetchPolicy: 'no-cache', // manage cache manually
    onData({ client, data: { data } }) {
      if (!data?.timerCreated?.timer) return

      const newTimer = data.timerCreated.timer

      // skip if we already have a timer and this isn't it
      if (timer && !timer.isExpired && timer.id !== newTimer.id) {
        return
      }

      // skip if the new timer is match-specific
      if (newTimer.matchId) return

      // set this as the current timer
      client.cache.updateFragment<RoundListItemHeaderFragment>(
        {
          id: client.cache.identify(round),
          fragment: RoundListItemHeaderFragmentDoc,
          fragmentName: 'RoundListItemHeader'
        },
        (data) => data && ({
          ...data, primaryTimer: newTimer,
        })
      )
    }
  })

  useRoundListItemHeaderTimerUpdatedSubscription({
    skip: !timer,
    variables: { roundId: round.id },
    fetchPolicy: 'no-cache', // manage cache manually
    onData({ client, data: { data } }) {
      if (!data?.timerUpdated?.timer) return

      const updatedTimer = data.timerUpdated.timer

      // skip if this is not our timer
      if (timer?.id !== updatedTimer.id) return

      // update the current timer
      client.cache.updateFragment<RoundListItemHeaderFragment>(
        {
          id: client.cache.identify(round),
          fragment: RoundListItemHeaderFragmentDoc,
          fragmentName: 'RoundListItemHeader',
          overwrite: true
        },
        (data) => data && ({
          ...data, primaryTimer: updatedTimer,
        })
      )
    }
  })

  useRoundListItemHeaderTimerDeletedSubscription({
    skip: !timer,
    variables: { roundId: round.id },
    fetchPolicy: 'no-cache', // manage cache manually
    onData({ client, data: { data } }) {
      if (!data?.timerDeleted?.timerId) return

      // skip if this is not our timer
      if (timer?.id !== data.timerDeleted.timerId) return

      // remove the current timer
      client.cache.updateFragment<RoundListItemHeaderFragment>(
        {
          id: client.cache.identify(round),
          fragment: RoundListItemHeaderFragmentDoc,
          fragmentName: 'RoundListItemHeader',
          overwrite: true
        },
        (data) => data && ({
          ...data, primaryTimer: null,
        })
      )
    }
  })

  return (
    <Card.Header
      {...props}
      style={expanded ? style : { ...style, borderBottom: 'none' }}
    >
      <a role="button" onClick={() => onExpand?.(!expanded)} style={{ textDecoration: 'none' }}>
        <FontAwesomeIcon
          icon={expanded ? faChevronDown : faChevronUp}
          className="me-2 user-select-none"
        />
        Round {round.number}
        {round.isComplete && ' (Complete)'}
      </a>
      {timer && (
        <Timer
          timer={timer}
          className="ms-1 text-muted"
          formatter={(hours, minutes, seconds, phase) => (
            phase && (
              <>
                - {phase.name}{' - '}
                {hours > 0 && (
                  hours.toString().padStart(2, '0') + ':'
                )}
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </>
            )
          )}
        />
      )}
      <RoundListItemDropdown
        round={round}
        disabled={disabled}
        onDelete={() => onDelete?.(round)}
      />
    </Card.Header>
  )
}

export default RoundListItemHeader
