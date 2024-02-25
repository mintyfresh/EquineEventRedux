import { faStopwatch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { RoundListItemMatchWithTimerFragment, RoundListItemMatchWithTimerFragmentDoc, useRoundListItemMatchTimerCreatedSubscription, useRoundListItemMatchTimerDeletedSubscription, useRoundListItemMatchTimerUpdatedSubscription } from '../../../lib/generated/graphql'
import Timer from '../../Timer/Timer'

export interface RoundListItemMatchTimerProps {
  round: { id: string, primaryTimer?: { id: string } | null }
  match: RoundListItemMatchWithTimerFragment
}

const RoundListItemMatchTimer: React.FC<RoundListItemMatchTimerProps> = ({ round, match }) => {
  useRoundListItemMatchTimerCreatedSubscription({
    skip: !round.primaryTimer, // skip if there's no parent timer
    variables: { roundId: round.id },
    fetchPolicy: 'no-cache', // manage cache manually
    onData({ client, data: { data } }) {
      if (!data?.timerCreated?.timer) return

      const newTimer = data.timerCreated.timer

      // skip if this is not our timer
      if (newTimer.matchId !== match.id) return

      // set this as the current timer
      client.cache.updateFragment<RoundListItemMatchWithTimerFragment>(
        {
          id: client.cache.identify(match),
          fragment: RoundListItemMatchWithTimerFragmentDoc,
          fragmentName: 'RoundListItemMatchTimer'
        },
        (data) => data && ({
          ...data, timer: newTimer,
        })
      )
    }
  })

  useRoundListItemMatchTimerUpdatedSubscription({
    skip: !match.timer,
    variables: { roundId: round.id },
    fetchPolicy: 'no-cache', // manage cache manually
    onData({ client, data: { data } }) {
      if (!data?.timerUpdated?.timer) return

      const updatedTimer = data.timerUpdated.timer

      // skip if this is not our timer
      if (updatedTimer.matchId !== match.id) return

      // update the current timer
      client.cache.updateFragment<RoundListItemMatchWithTimerFragment>(
        {
          id: client.cache.identify(match),
          fragment: RoundListItemMatchWithTimerFragmentDoc,
          fragmentName: 'RoundListItemMatchTimer'
        },
        (data) => data && ({
          ...data, timer: updatedTimer,
        })
      )
    }
  })

  useRoundListItemMatchTimerDeletedSubscription({
    skip: !match.timer,
    variables: { roundId: round.id },
    fetchPolicy: 'no-cache', // manage cache manually
    onData({ client, data: { data } }) {
      if (!data?.timerDeleted?.timerId) return

      const deletedTimer = data.timerDeleted.timerId

      // skip if this is not our timer
      if (deletedTimer !== match.timer?.id) return

      // remove the current timer
      client.cache.updateFragment<RoundListItemMatchWithTimerFragment>(
        {
          id: client.cache.identify(match),
          fragment: RoundListItemMatchWithTimerFragmentDoc,
          fragmentName: 'RoundListItemMatchTimer'
        },
        (data) => data && ({
          ...data, timer: null,
        })
      )
    }
  
  })

  if (!round.primaryTimer) {
    return null
  }

  if (!match.timer) {
    return (
      <a role="button">
        <FontAwesomeIcon
          icon={faStopwatch}
        />
      </a>
    )
  }

  return (
    <Timer
      timer={match.timer}
      formatter={(hours, minutes, seconds, phase) => (
        <>
          {phase?.name ?? 'Done'}{' - '}
          {hours > 0 && `${hours.toString().padStart(2, '0')}:`}
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </>
      )}
    />
  )
}

export default RoundListItemMatchTimer
