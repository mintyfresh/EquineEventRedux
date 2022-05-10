import { gql } from '@apollo/client'
import { GetServerSideProps } from 'next'
import EventLayout, { EVENT_LAYOUT_FRAGMENT } from '../../../components/EventLayout'
import Slip, { SLIP_EVENT_FRAGMENT, SLIP_MATCH_FRAGMENT } from '../../../components/Slip'
import { EventSlipsQuery, EventSlipsQueryVariables, useEventSlipsQuery } from '../../../lib/generated/graphql'
import { initializeApolloClient } from '../../../lib/graphql/client'
import { NextPageWithLayout } from '../../../lib/types/next-page'

const EVENT_SLIPS_QUERY = gql`
  query EventSlips($id: ID!) {
    event(id: $id) {
      id
      name
      ...EventLayout
      ...SlipEvent
      rounds {
        id
        number
        matches {
          ...SlipMatch
        }
      }
    }
  }
  ${EVENT_LAYOUT_FRAGMENT}
  ${SLIP_EVENT_FRAGMENT}
  ${SLIP_MATCH_FRAGMENT}
`

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const apolloClient = initializeApolloClient()

  if (!params || !params.id) {
    return { notFound: true }
  }

  const { data } = await apolloClient.query<EventSlipsQuery, EventSlipsQueryVariables>({
    query: EVENT_SLIPS_QUERY,
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

const EventSlipsPage: NextPageWithLayout<EventSlipsQuery> = ({ event: { id }}) => {
  const { data } = useEventSlipsQuery({
    variables: { id }
  })

  if (!data?.event) {
    return null
  }

  return (
    <>
      {data.event.rounds.flatMap((round) => (
        round.matches.map((match) => (
          <Slip key={match.id} event={data.event} match={match} />
        ))
      ))}
    </>
  )
}

EventSlipsPage.getLayout = (page: React.ReactElement<EventSlipsQuery>) => (
  <EventLayout event={page.props.event}>
    {page}
  </EventLayout>
)

export default EventSlipsPage
