import { gql } from '@apollo/client'
import { GetServerSideProps } from 'next'
import { Card, ListGroup } from 'react-bootstrap'
import EventLayout, { EVENT_LAYOUT_FRAGMENT } from '../../../components/EventLayout'
import { EventMatchesQuery, EventMatchesQueryVariables, useEventMatchesQuery } from '../../../lib/generated/graphql'
import { initializeApolloClient } from '../../../lib/graphql/client'
import { NextPageWithLayout } from '../../../lib/types/next-page'

const EVENT_MATCHES_QUERY = gql`
  query EventMatches($id: ID!) {
    event(id: $id) {
      id
      name
      ...EventLayout
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
  const { data } = useEventMatchesQuery({
    variables: { id }
  })

  if (!data?.event) {
    return null
  }

  return (
    <>
      {data.event.rounds.map((round) => (
        <Card key={round.id}>
          <Card.Header>
            Round {round.number}
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
              <Card.Text>No pairings have been added to this round yet.</Card.Text>
            )}
          </Card.Body>
        </Card>
      ))}
    </>
  )
}

EventMatchesPage.getLayout = (page: React.ReactElement<EventMatchesQuery>) => (
  <EventLayout event={page.props.event}>
    {page}
  </EventLayout>
)

export default EventMatchesPage
