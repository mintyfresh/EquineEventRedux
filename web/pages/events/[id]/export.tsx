import { gql } from '@apollo/client'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GetServerSideProps } from 'next'
import { Button, Card } from 'react-bootstrap'
import EventLayout, { EVENT_LAYOUT_FRAGMENT } from '../../../components/EventLayout'
import { EventExportQuery, EventExportQueryVariables } from '../../../lib/generated/graphql'
import { initializeApolloClient } from '../../../lib/graphql/client'
import { NextPageWithLayout } from '../../../lib/types/next-page'

const CopyableTextBlock: React.FC<{ value: string }> = ({ value }) => (
  <Card body>
    <Button
      variant="outline-secondary"
      className="float-end"
      onClick={() => navigator.clipboard.writeText(value)}
    >
      <FontAwesomeIcon icon={faCopy} />
      <span className="visually-hidden">Copy to clipboard</span>
    </Button>
    <pre className="mb-0">{value}</pre>
  </Card>
)

const EventStandingsExport: React.FC<EventExportQuery> = ({ event }) => {
  const data = event.players.nodes.map((player, index) =>
    `#${index + 1} - ` +
    `${player.name} [${player.winsCount}, ${player.lossesCount}, ${player.drawsCount}] - ` +
    `${player.score} pts - ` +
    `${player.opponentWinRate.toFixed(4)}%`
  ).join('\n')

  return (
    <CopyableTextBlock value={data} />
  )
}

const EventMatchesExport: React.FC<EventExportQuery> = ({ event }) => {
  const round = event.rounds[0];

  if (!round) {
    return (
      <Card body>
        <p>No matches have been played yet.</p>
      </Card>
    )
  }

  const prefix = `@Participant - Round ${round.number} pairings`
  const data = round.matches.map((match) =>
    `Table #${match.table} - ` +
    `${match.player1.name} [${match.player1.winsCount}, ${match.player1.lossesCount}, ${match.player1.drawsCount}] vs ` +
    (match.player2
      ? `${match.player2.name} [${match.player2.winsCount}, ${match.player2.lossesCount}, ${match.player2.drawsCount}]`
      : `BYE [0, 0, 0]`
    )
  ).join('\n')

  return (
    <CopyableTextBlock value={`${prefix}\n${data}`} />
  )
}

const EventChallongeExport: React.FC<EventExportQuery> = ({ event }) => {
  const data = event.players.nodes.map((player, index) =>
    `${index + 1}|` +
    `${player.name}|` +
    `${player.winsCount} - ${player.lossesCount} - ${player.drawsCount}|` +
    `0|` +
    `${player.score}|` +
    `0|` +
    `${player.opponentWinRate.toFixed(4)}|` +
    `0`
  ).join('\n')

  return (
    <CopyableTextBlock value={data} />
  )
}

const EVENT_EXPORT_QUERY = gql`
  query EventExport($id: ID!) {
    event(id: $id) {
      id
      ...EventLayout
      players(orderBy: SCORE, orderByDirection: DESC, activeOnly: true) {
        nodes {
          id
          name
          score
          winsCount
          lossesCount
          drawsCount
          opponentWinRate
        }
      }
      rounds(orderBy: NUMBER, orderByDirection: DESC) {
        id
        number
        matches {
          id
          table
          player1 {
            id
            name
            winsCount
            lossesCount
            drawsCount
          }
          player2 {
            id
            name
            winsCount
            lossesCount
            drawsCount
          }
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

  const { data } = await apolloClient.query<EventExportQuery, EventExportQueryVariables>({
    query: EVENT_EXPORT_QUERY,
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

const EventExportPage: NextPageWithLayout<EventExportQuery> = ({ event }) => {
  return (
    <>
      <div className="mb-3">
        <h2>Standings</h2>
        <EventStandingsExport event={event} />
      </div>
      <div className="mb-3">
        <h2>Matches</h2>
        <EventMatchesExport event={event} />
      </div>
      <div className="mb-3">
        <h2>Challonge formatted table</h2>
        <EventChallongeExport event={event} />
      </div>
    </>
  )
}

EventExportPage.getLayout = (page: React.ReactElement<EventExportQuery>) => (
  <EventLayout event={page.props.event}>
    {page}
  </EventLayout>
)

export default EventExportPage
