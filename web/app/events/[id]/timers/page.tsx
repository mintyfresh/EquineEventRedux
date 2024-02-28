'use client'

import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { Alert } from 'react-bootstrap'
import TimerList from '../../../../components/TimerList/TimerList'
import { EventTimersDocument, EventTimersQuery, EventTimersQueryVariables } from '../../../../lib/generated/graphql'
import { useSearchParams } from 'next/navigation'

export default function EventTimersPage({ params: { id } }: { params: { id: string } }) {
  const params = useSearchParams()
  const fullscreen = params?.get('fullscreen') === 'true'
  console.log('Fullscreen:', fullscreen)

  const { data } = useQuery<EventTimersQuery, EventTimersQueryVariables>(EventTimersDocument,{
    variables: { eventId: id }
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

// EventTimersPage.getLayout = (page: React.ReactElement<EventTimersPageProps>) => (
//   page.props.fullscreen ? (
//     <Container fluid style={{ 'minHeight': '100vh' }} className="d-flex flex-column justify-content-center">
//       {page}
//     </Container>
//   ) : (
//     <EventLayout event={page.props.event}>
//       {page}
//     </EventLayout>
//   )
// )
