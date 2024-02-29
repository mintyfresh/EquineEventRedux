'use client'

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { useEffect, useState } from 'react'
import { Button, ButtonToolbar, Card, Col, Form, Row } from 'react-bootstrap'
import Slip from './Slip'
import { EventSlipsDocument, EventSlipsQuery, EventSlipsQueryVariables } from '../../../../../lib/generated/graphql'

export default function EventSlipsPage({ params: { id } }: { params: { id: string } }) {
  const [round, setRound] = useState<EventSlipsQuery['event']['rounds'][0] | null>(null)

  const { data: { event } } = useSuspenseQuery<EventSlipsQuery, EventSlipsQueryVariables>(EventSlipsDocument, {
    variables: { id }
  })

  useEffect(() => {
    if (event) {
      setRound(event.rounds[0])
    }
  }, [event])

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
            onChange={({ target }) => setRound(event.rounds.find(({ id }) => id === target.value) || null)}
          >
            {event.rounds.map((round) => (
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
            event={event}
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
