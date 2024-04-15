'use client'

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, Card } from 'react-bootstrap'
import { EventExportDocument, EventExportQuery, EventExportQueryVariables } from '../../../../../lib/generated/graphql'

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
    `${player.name} [${player.winsCount}, ${player.lossesCount}, ${player.__typename === 'SwissPlayer' && player.drawsCount}] - ` +
    `${player.__typename === 'SwissPlayer' && player.score} pts - ` +
    `${player.opponentWinRate.toFixed(4)}%`
  ).join('\n')

  return (
    <CopyableTextBlock value={data} />
  )
}

const EventMatchesExport: React.FC<EventExportQuery> = ({ event }) => {
  const round = event.rounds[0]

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
    `${match.player1.name} [${match.player1.winsCount}, ${match.player1.lossesCount}, ${match.player1.__typename === 'SwissPlayer' && match.player1.drawsCount}] vs ` +
    (match.player2?.__typename === 'SwissPlayer'
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
    `${player.winsCount} - ${player.lossesCount} - ${player.__typename === 'SwissPlayer' && player.drawsCount}|` +
    `0|` +
    `${player.__typename === 'SwissPlayer' && player.score}|` +
    `0|` +
    `${player.opponentWinRate.toFixed(4)}|` +
    `0`
  ).join('\n')

  return (
    <CopyableTextBlock value={data} />
  )
}

export default function EventExportPage({ params: { id } }: { params: { id: string } }) {
  const { data } = useSuspenseQuery<EventExportQuery, EventExportQueryVariables>(EventExportDocument, {
    variables: { id },
    fetchPolicy: 'cache-and-network'
  })

  if (!data?.event) {
    return null
  }

  if (data.event.__typename !== 'SwissEvent') {
    return (
      <Card body>
        <p className="mb-0">Only Swiss events are supported for export.</p>
      </Card>
    )
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
