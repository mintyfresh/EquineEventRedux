import { gql } from '@apollo/client'
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { Alert, Button, Card, ListGroup } from 'react-bootstrap'
import EventLayout, { EVENT_LAYOUT_FRAGMENT } from '../../../components/EventLayout'
import PlayerPairingsModal from '../../../components/PlayerPairingsModal'
import { EventMatchesQuery, EventMatchesQueryVariables, useEventMatchesQuery } from '../../../lib/generated/graphql'
import { initializeApolloClient } from '../../../lib/graphql/client'
import { NextPageWithLayout } from '../../../lib/types/next-page'

const EVENT_MATCHES_QUERY = gql`
  query EventMatches($id: ID!) {
    event(id: $id) {
      id
      name
      ...EventLayout
      players {
        totalCount
      }
      rounds {
        id
        number
        matches {
          id
          player1 {
            id
            name
          }
          player2 {
            id
            name
          }
          winnerId
          draw
        }
      }
    }
  }
  ${EVENT_LAYOUT_FRAGMENT}
`

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const apolloClient = initializeApolloClient()

  if (!params || !params.id) {
    return { notFound: true }
  }

  const { data } = await apolloClient.query<EventMatchesQuery, EventMatchesQueryVariables>({
    query: EVENT_MATCHES_QUERY,
    variables: { id: params.id as string },
    fetchPolicy: 'network-only'
  })

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      event: data.event
    }
  }
}

const EventMatchesPage: NextPageWithLayout<EventMatchesQuery> = ({ event: { id }}) => {
  const [show, setShow] = useState(false)

  const { data } = useEventMatchesQuery({
    variables: { id }
  })

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
      <Button
        variant="primary"
        disabled={data.event.players.totalCount === 0}
        onClick={() => setShow(true)} className="mb-3"
      >
        Create Match
      </Button>
      <PlayerPairingsModal show={show} onHide={() => setShow(false)} event={data.event} />
      {data.event.rounds.map((round) => (
        <Card key={round.id}>
          <Card.Header>
            Match {round.number}
          </Card.Header>
          <Card.Body>
            {round.matches.length > 0 ? (
              <ListGroup variant="flush">
                {round.matches.map((match) => (
                  <ListGroup.Item key={match.id}>
                    {match.player1.name} vs {match.player2?.name || 'N/A'}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <Card.Text>No pairings have been added to this match yet.</Card.Text>
            )}
          </Card.Body>
        </Card>
      ))}
      {data.event.rounds.length === 0 && (
        <Card body>
          <Card.Text>No matches have been added to this event yet.</Card.Text>
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
