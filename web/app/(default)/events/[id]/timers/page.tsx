'use client'

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { Alert } from 'react-bootstrap'
import TimerList from '../../../../../components/TimerList/TimerList'
import { EventTimersQuery, EventTimersQueryVariables, EventTimersDocument } from '../../../../../lib/generated/graphql'

export default function EventTimersPage({ params: { id, fullscreen } }: { params: { id: string, fullscreen?: boolean } }) {
  const { data } = useSuspenseQuery<EventTimersQuery, EventTimersQueryVariables>(EventTimersDocument, {
    variables: { eventId: id },
    fetchPolicy: 'cache-and-network'
  })

  const currentRound = data?.event?.currentRound

  if (!currentRound) {
    return (
      <Alert variant="warning">
        There is no round currently active to run timers for.
      </Alert>
    )
  }

  return (
    <TimerList
      timerList={currentRound}
      pinControlsToTop={fullscreen}
      readOnly={fullscreen}
    />
  )
}
