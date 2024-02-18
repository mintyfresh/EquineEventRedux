import { gql } from '@apollo/client'
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { Alert, Button, ButtonToolbar, Card } from 'react-bootstrap'
import CreateRoundButton, { CREATE_ROUND_BUTTON_FRAGMENT } from '../../../components/CreateRoundButton'
import EventLayout, { EVENT_LAYOUT_FRAGMENT } from '../../../components/EventLayout'
import Round, { ROUND_FRAGMENT } from '../../../components/Round'
import RoundList, { ROUND_LIST_ITEM_FRAGMENT } from '../../../components/RoundList'
import { ERRORS_FRAGMENT } from '../../../lib/errors'
import { DeletedFilter, EventMatchesQuery, EventMatchesQueryVariables, useEventMatchesQuery, useSetMatchResolutionMutation } from '../../../lib/generated/graphql'
import { initializeApolloClient } from '../../../lib/graphql/client'
import { NextPageWithLayout } from '../../../lib/types/next-page'

const EVENT_MATCHES_QUERY = gql`
  query EventMatches($id: ID!, $deleted: DeletedFilter) {
    event(id: $id) {
      id
      name
      ...EventLayout
      ...CreateRoundButton
      rounds(deleted: $deleted, orderBy: NUMBER, orderByDirection: DESC) {
        ...RoundListItem
        ...Round
      }
      players {
        totalCount
      }
    }
  }
  ${EVENT_LAYOUT_FRAGMENT}
  ${CREATE_ROUND_BUTTON_FRAGMENT}
  ${ROUND_LIST_ITEM_FRAGMENT}
  ${ROUND_FRAGMENT}
`

gql`
  mutation SetMatchResolution($id: ID!, $winnerId: ID, $draw: Boolean!) {
    matchUpdate(id: $id, input: { winnerId: $winnerId, draw: $draw }) {
      match {
        id
        winnerId
        draw
        round {
          id
          isComplete
        }
      }
      errors {
        ...Errors
      }
    }
  }
  ${ERRORS_FRAGMENT}
`

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const apolloClient = initializeApolloClient()

  if (!params || !params.id) {
    return { notFound: true }
  }

  const { data } = await apolloClient.query<EventMatchesQuery, EventMatchesQueryVariables>({
    query: EVENT_MATCHES_QUERY,
    variables: { id: params.id as string, deleted: undefined },
    fetchPolicy: 'network-only'
  })

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      id: params.id,
      event: data.event
    }
  }
}

const EventMatchesPage: NextPageWithLayout<{ id: string }> = ({ id }) => {
  const [view, setView] = useState<'legacy' | 'modern'>('modern')
  const [deleted, setDeleted] = useState<boolean>(false)

  const { data, refetch } = useEventMatchesQuery({
    variables: { id, deleted: deleted ? DeletedFilter.Deleted : undefined }
  })

  const [setResolution, { loading: settingResolution }] = useSetMatchResolutionMutation()

  const onSetWinner = (matchId: string, winnerId: string) => {
    setResolution({ variables: { id: matchId, winnerId, draw: false } })
  }

  const onSetDraw = (matchId: string) => {
    setResolution({ variables: { id: matchId, winnerId: null, draw: true } })
  }

  // useEffect(() => {
  //   const view = localStorage.getItem('event-matches-view') as 'legacy' | 'modern'
  //   view && setView(view)
  // }, [])

  // useEffect(() => {
  //   localStorage.setItem('event-matches-view', view)
  // }, [view])

  if (!data?.event) {
    return null
  }

  return (
    <>
      {data.event.players.totalCount === 0 && (
        <Alert variant="warning">
          No players have been added to this event yet.
        </Alert>
      )}
      <ButtonToolbar className="mb-3 d-print-none">
        {!deleted && (
          <CreateRoundButton
            event={data.event}
            onCreate={() => refetch()}
          />
        )}
        <Button variant="outline-secondary" className="ms-auto" onClick={() => setDeleted(!deleted)}>
          {deleted ? 'Hide' : 'Show'} Deleted
        </Button>
        <Button variant="outline-secondary" className="ms-2" onClick={() => setView(view === 'legacy' ? 'modern' : 'legacy')} title="Toggle view">
          Switch to {view === 'legacy' ? 'modern' : 'legacy'} view
        </Button>
      </ButtonToolbar>
      {view === 'legacy' ? (
        <RoundList
          event={data.event}
          rounds={data.event.rounds}
          disabled={settingResolution}
          onSetWinner={onSetWinner}
          onSetDraw={onSetDraw}
          onDelete={() => refetch()}
        />
      ) : (
        <div>
          {data.event.rounds.map((round) =>
            <Round
              key={round.id}
              className="mb-3"
              event={data.event}
              round={round}
              onSetWinner={onSetWinner}
              onSetDraw={onSetDraw}
              onDelete={() => refetch()}
            />
          )}
        </div>
      )}
      {data.event.rounds.length === 0 && (
        <Card body>
          <Card.Text>
            {deleted ? (
              <>No matches have been deleted from this event yet.</>
            ) : (
              <>No matches have been added to this event yet.</>
            )}
          </Card.Text>
        </Card>
      )}
    </>
  )
}

EventMatchesPage.getLayout = (page: React.ReactElement<EventMatchesQuery>) => (
  <EventLayout event={page.props.event}>
    {page}
  </EventLayout>
)

export default EventMatchesPage
