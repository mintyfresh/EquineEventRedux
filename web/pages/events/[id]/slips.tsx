import { gql } from '@apollo/client'
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { Button, ButtonToolbar, Card, Col, Form, Row } from 'react-bootstrap'
import EventLayout, { EVENT_LAYOUT_FRAGMENT } from '../../../components/EventLayout'
import Slip, { SLIP_EVENT_FRAGMENT, SLIP_MATCH_FRAGMENT, SLIP_ROUND_FRAGMENT } from '../../../components/Slip'
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
      rounds(orderBy: NUMBER, orderByDirection: DESC) {
        id
        ...SlipRound
        matches {
          ...SlipMatch
        }
      }
    }
  }
  ${EVENT_LAYOUT_FRAGMENT}
  ${SLIP_EVENT_FRAGMENT}
  ${SLIP_ROUND_FRAGMENT}
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
  const [round, setRound] = useState<EventSlipsQuery['event']['rounds'][0] | null>(null)

  const { data } = useEventSlipsQuery({
    variables: { id },
    onCompleted: ({ event }) => {
      setRound(event.rounds[0])
    }
  })

  if (!data?.event) {
    return null
  }

  if (!round) {
    return (
      <Card body>
        <Card.Text>
          No rounds have been added to this event yet.
        </Card.Text>
      </Card>
    )
  }

  return (
    <>
      <ButtonToolbar as={Row} className="mb-3 d-print-none">
        <Col xs="auto">
          <Form.Select
            title="Round"
            onChange={(event) => setRound(data.event.rounds.find(({ id }) => id === event.target.value) || null)}
          >
            {data.event.rounds.map((round) => (
              <option key={round.id} value={round.id}>
                Round {round.number}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col xs="auto" className="ms-auto">
          <Button variant="outline-secondary" accessKey="p" onClick={() => window.print()}>
            <u>P</u>rint
          </Button>
        </Col>
      </ButtonToolbar>
      {round.matches.length > 0 ? (
        round.matches.map((match) => (
          <Slip
            key={match.id}
            event={data.event}
            round={round}
            match={match}
          />
        ))
      ) : (
        <Card body>
          <Card.Text>
            No matches have been added to this round yet.
          </Card.Text>
        </Card>
      )}
    </>
  )
}

EventSlipsPage.getLayout = (page: React.ReactElement<EventSlipsQuery>) => (
  <EventLayout event={page.props.event}>
    {page}
  </EventLayout>
)

export default EventSlipsPage
