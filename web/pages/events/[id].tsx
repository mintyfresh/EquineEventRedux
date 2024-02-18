import { gql } from '@apollo/client'
import { GetServerSideProps } from 'next'
import EventLayout, { EVENT_LAYOUT_FRAGMENT } from '../../components/EventLayout'
import { EventShowQuery, EventShowQueryVariables, useEventShowQuery } from '../../lib/generated/graphql'
import { initializeApolloClient } from '../../lib/graphql/client'
import { NextPageWithLayout } from '../../lib/types/next-page'

const EVENT_SHOW_QUERY = gql`
  query EventShow($id: ID!) {
    event(id: $id) {
      id
      name
      ...EventLayout
    }
  }
  ${EVENT_LAYOUT_FRAGMENT}
`

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const apolloClient = initializeApolloClient()

  if (!params || !params.id) {
    return { notFound: true }
  }

  const { data } = await apolloClient.query<EventShowQuery, EventShowQueryVariables>({
    query: EVENT_SHOW_QUERY,
    variables: { id: params.id as string },
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

const EventShowPage: NextPageWithLayout<{ id: string }> = ({ id }) => {
  const { data } = useEventShowQuery({
    variables: { id }
  })

  return (
    <section>
      <b>TODO:</b> Placeholder for event details page
    </section>
  )
}

EventShowPage.getLayout = (page: React.ReactElement<EventShowQuery>) => (
  <EventLayout event={page.props.event}>
    {page}
  </EventLayout>
)

export default EventShowPage
