'use client'

import { gql } from '@apollo/client'
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, Card } from 'react-bootstrap'
import { EventExportQuery, EventExportQueryVariables } from '../../../../lib/generated/graphql'
import { EVENT_LAYOUT_FRAGMENT } from '../../../../components/EventLayout'

const copyToClipboard = (value: string) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(value)
    return
  }

  const textArea = document.createElement('textarea')
  textArea.value = value

  textArea.style.position = 'absolute'
  textArea.style.left = '-999999px'
  textArea.style.opacity = '0'

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    document.execCommand('copy')
  } catch (err) {
    console.error('Unable to copy', err)
  } finally {
    document.body.removeChild(textArea)
  }
}

const CopyableTextBlock: React.FC<{ value: string }> = ({ value }) => {  
  return (
    <Card body>
      <Button
        variant="outline-secondary"
        className="float-end"
        onClick={() => copyToClipboard(value)}
      >
        <FontAwesomeIcon icon={faCopy} />
        <span className="visually-hidden">Copy to clipboard</span>
      </Button>
      <pre className="mb-0">{value}</pre>
    </Card>
  )
}

const EventStandingsExport: React.FC<EventExportQuery> = ({ event }) => {
  const players = event.players.nodes

  const data = players.map((player, index) =>
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
      players(orderBy: SCORE, orderByDirection: DESC) {
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

export default function EventExportPage({ params: { id } }: { params: { id: string } }) {
  const { data } = useQuery<EventExportQuery, EventExportQueryVariables>(EVENT_EXPORT_QUERY, {
    variables: { id }
  })

  if (!data?.event) {
    return null
  }

  return (
    <>
      <div className="mb-3">
        <h2>Standings</h2>
        <EventStandingsExport event={data.event} />
      </div>
      <div className="mb-3">
        <h2>Matches</h2>
        <EventMatchesExport event={data.event} />
      </div>
      <div className="mb-3">
        <h2>Challonge formatted table</h2>
        <EventChallongeExport event={data.event} />
      </div>
    </>
  )
}
