import { gql } from '@apollo/client'
import { GetServerSideProps } from 'next'
import { Alert, Card } from 'react-bootstrap'
import CreateRoundButton, { CREATE_ROUND_BUTTON_FRAGMENT } from '../../../components/CreateRoundButton'
import EventLayout, { EVENT_LAYOUT_FRAGMENT } from '../../../components/EventLayout'
import RoundList, { ROUND_LIST_ITEM_FRAGMENT } from '../../../components/RoundList'
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
      rounds(orderBy: NUMBER, orderByDirection: DESC) {
        ...RoundListItem
      }
      players {
        totalCount
      }
    }
  }
  ${EVENT_LAYOUT_FRAGMENT}
  ${CREATE_ROUND_BUTTON_FRAGMENT}
  ${ROUND_LIST_ITEM_FRAGMENT}
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
      <RoundList
        rounds={data.event.rounds}
        onDelete={() => refetch()}
      />
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
