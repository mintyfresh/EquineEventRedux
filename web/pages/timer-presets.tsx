import { gql } from '@apollo/client'
import { GetServerSideProps } from 'next'
import { initializeApolloClient } from '../lib/graphql/client'
import { TimerPresetsQuery, useTimerPresetsQuery } from '../lib/generated/graphql'
import { Alert, Button, Card, Col, Row } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

const TIMER_PRESETS_QUERY = gql`
  query TimerPresets {
    timerPresets {
      nodes {
        id
        name
        isSystem
        phasesCount
        totalDurationHumanized
        phases(limit: 3) {
          id
          name
          durationHumanized
          audioClip {
            id
          }
        }
      }
    }
  }

`

export const getServerSideProps: GetServerSideProps = async () => {
  const apolloClient = initializeApolloClient()

  await apolloClient.query<TimerPresetsQuery>({
    query: TIMER_PRESETS_QUERY
  })

  return {
    props: {
      initialApolloState: apolloClient.cache.extract()
    }
  }
}

const TimerPresetsPage = () => {
  const { data } = useTimerPresetsQuery()

  return (
    <>
      <h1 className="mb-3">Timer Presets</h1>
      <Row className="mb-3">
        <Col>
          <Link href="/timer-presets/new" passHref>
            <Button as="a" variant="primary">Create new preset</Button>
          </Link>
        </Col>
      </Row>
      {data?.timerPresets?.nodes?.every((preset) => preset.isSystem) && (
        <Alert variant="info">
          <p>
            Timer presets define reusable configurations for timers.
            Each preset consists of a series of one or more phases, with each phase having a name and a duration.
            Optionally, a phase can include an audio-cue to play to signal its end.
          </p>
          <p className="mb-0">
            We&apos;ve provided a couple of system-defined presets to get you started.
            You can rename and modify them as needed, or create your own from scratch.
          </p>
        </Alert>
      )}
      {data?.timerPresets?.nodes?.map((preset) => (
        <Card key={preset.id} body className="mb-3">
          <Row>
            <Col>
              <Card.Title><h4>{preset.name}</h4></Card.Title>
            </Col>
            <Col xs="auto">
              <Button variant="outline-secondary">Edit</Button>
            </Col>
          </Row>
          <Card.Text>
            {preset.phasesCount} phases, {preset.totalDurationHumanized} total
            {preset.isSystem && <span className="text-muted"> (system-defined)</span>}
          </Card.Text>
          <Card.Subtitle className="mb-2">Phases</Card.Subtitle>
          <Row>
            {preset.phases.map((phase) => (
              <Col key={phase.id} md={4} lg={3} className="mb-0">
                <Card body>
                  <Card.Title>
                    {phase.name}
                    {phase.audioClip && (
                      <FontAwesomeIcon
                        icon={faVolumeUp}
                        className="ms-2 small text-muted"
                        title="Includes an audio-cue"
                      />
                    )}
                  </Card.Title>
                  <Card.Text>
                    {phase.durationHumanized}
                  </Card.Text>
                </Card>
              </Col>
            ))}
            {preset.phasesCount > 3 && (
              <Col md={12} lg={3}>
                <Card body className="h-100">
                  <Card.Text>
                    <b>And {preset.phasesCount - 3} more...</b>
                  </Card.Text>
                </Card>
              </Col>
            )}
          </Row>
        </Card>
      ))}
    </>
  )
}

export default TimerPresetsPage
