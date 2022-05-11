import { gql } from '@apollo/client'
import { GetServerSideProps } from 'next'
import { Alert, Card, Dropdown, ListGroup } from 'react-bootstrap'
import CreateRoundButton, { CREATE_ROUND_BUTTON_FRAGMENT } from '../../../components/CreateRoundButton'
import EllipsisDropdown from '../../../components/EllipsisDropdown'
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
      ...CreateRoundButton
      players {
        totalCount
      }
      rounds(orderBy: NUMBER, orderByDirection: DESC) {
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
  ${CREATE_ROUND_BUTTON_FRAGMENT}
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
  const { data, refetch } = useEventMatchesQuery({
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
      <CreateRoundButton
        event={data.event}
        onCreate={() => refetch()}
        className="mb-3"
      />
      {data.event.rounds.map((round) => (
        <Card key={round.id} className="mb-3">
          <Card.Header>
            Match {round.number}
            <EllipsisDropdown align="end" className="float-end">
              <Dropdown.Item>Edit</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item className="text-danger">Delete</Dropdown.Item>
            </EllipsisDropdown>
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
