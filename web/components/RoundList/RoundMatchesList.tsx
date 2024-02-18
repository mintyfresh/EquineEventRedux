import { gql } from '@apollo/client'
import { Dropdown, ListGroup } from 'react-bootstrap'
import { RoundMatchListFragment, RoundMatchListItemFragment } from '../../lib/generated/graphql'
import EllipsisDropdown from '../EllipsisDropdown'
import PlayerNameWithBadges, { PLAYER_NAME_WITH_BADGES_FRAGMENT } from '../Players/PlayerNameWithBadges'

export const ROUND_MATCH_LIST_ITEM_FRAGMENT = gql`
  fragment RoundMatchListItem on Match {
    id
    player1 {
      id
      ...PlayerNameWithBadges
    }
    player2 {
      id
      ...PlayerNameWithBadges
    }
    winnerId
    draw
    table
  }
  ${PLAYER_NAME_WITH_BADGES_FRAGMENT}
`

export const ROUND_MATCH_LIST_FRAGMENT = gql`
  fragment RoundMatchList on Round {
    isComplete
    matches {
      ...RoundMatchListItem
    }
  }
  ${ROUND_MATCH_LIST_ITEM_FRAGMENT}
`

export interface RoundMatchesListProps {
  round: RoundMatchListFragment
  disabled?: boolean
  onSetWinner?: (matchId: string, winnerId: string) => void
  onSetDraw?: (matchId: string) => void
}

const RoundMatchesList: React.FC<RoundMatchesListProps> = ({ round, disabled, onSetWinner, onSetDraw }) => {
  const resolution = (match: RoundMatchListItemFragment) => {
    if (match.draw) {
      return ' - Draw'
    }

    if (match.winnerId) {
      return ' - Winner: ' + (match.winnerId === match.player1.id ? match.player1.name : match.player2?.name || '???')
    }

    return null
  }

  return (
    <ListGroup variant="flush">
      {round.matches.map((match) => (
        <ListGroup.Item key={match.id}>
          Table {match.table} - <PlayerNameWithBadges player={match.player1} /> vs.{' '}
          {match.player2 ? <PlayerNameWithBadges player={match.player2} /> : <span className="text-muted">No-one</span>}
          {resolution(match)}
          {match.player2 && (
            <EllipsisDropdown align="end" className="float-end d-print-none">
              <Dropdown.Header>Table {match.table}</Dropdown.Header>
              <Dropdown.Item
                disabled={disabled || match.winnerId === match.player1.id}
                onClick={() => onSetWinner?.(match.id, match.player1.id)}
              >
                Select {match.player1.name} as winner
              </Dropdown.Item>
              <Dropdown.Item
                disabled={disabled || match.winnerId === match.player2.id}
                onClick={() => match.player2 && onSetWinner?.(match.id, match.player2.id)}
              >
                Select {match.player2.name} as winner
              </Dropdown.Item>
              <Dropdown.Item
                disabled={disabled || match.draw}
                onClick={() => onSetDraw?.(match.id)}
              >
                Mark as a draw
              </Dropdown.Item>
            </EllipsisDropdown>
          )}
        </ListGroup.Item>
      ))}
    </ListGroup>
  )
}

export default RoundMatchesList
