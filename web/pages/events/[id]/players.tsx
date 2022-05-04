import { gql } from '@apollo/client'
import { GetServerSideProps } from 'next'
import { Card } from 'react-bootstrap'
import EventLayout, { EVENT_LAYOUT_FRAGMENT } from '../../../components/EventLayout'
import PlayerTable, { PLAYER_TABLE_FRAGMENT } from '../../../components/PlayerTable'
import { EventPlayersQuery, EventPlayersQueryVariables, useEventPlayersQuery } from '../../../lib/generated/graphql'
import { initializeApolloClient } from '../../../lib/graphql/client'
import { NextPageWithLayout } from '../../../lib/types/next-page'

const EVENT_PLAYERS_QUERY = gql`
  query EventPlayers($id: ID!) {
    event(id: $id) {
      id
      name
      ...EventLayout
      players(deleted: false) {
        ...PlayerTable
      }
    }
  }
  ${EVENT_LAYOUT_FRAGMENT}
  ${PLAYER_TABLE_FRAGMENT}
`

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const apolloClient = initializeApolloClient()

  if (!params || !params.id) {
    return { notFound: true }
  }

  const { data } = await apolloClient.query<EventPlayersQuery, EventPlayersQueryVariables>({
    query: EVENT_PLAYERS_QUERY,
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

const EventPlayersPage: NextPageWithLayout<EventPlayersQuery> = ({ event: { id } }) => {
  const { data, refetch } = useEventPlayersQuery({
    variables: { id }
  })

  if (!data?.event) {
    return null
  }

  return (
    <>
      {data.event.players.length > 0 ? (
        <PlayerTable
          players={data.event.players}
          onDelete={() => refetch()}
        />
      ) : (
        <Card body>
          <Card.Text>No players have been added to this event yet.</Card.Text>
        </Card>
      )}
    </>
  )
}

EventPlayersPage.getLayout = (page: React.ReactElement<EventPlayersQuery>) => (
  <EventLayout event={page.props.event}>
    {page}
  </EventLayout>
)

export default EventPlayersPage
