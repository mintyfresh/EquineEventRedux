import { Dropdown, ListGroup } from 'react-bootstrap'
import { RoundListItemMatchListFragment, RoundListItemMatchListItemFragment } from '../../../lib/generated/graphql'
import EllipsisDropdown from '../../EllipsisDropdown'
import PlayerNameWithBadges from '../../Players/PlayerNameWithBadges'
import RoundListItemMatchTimer from './RoundListItemMatchTimer'

export interface RoundListItemMatchListProps {
  round: RoundListItemMatchListFragment
  disabled?: boolean
  onSetWinner?: (matchId: string, winnerId: string) => void
  onSetDraw?: (matchId: string) => void
}

const RoundListItemMatchList: React.FC<RoundListItemMatchListProps> = ({ round, disabled, onSetWinner, onSetDraw }) => {
  const resolution = (match: RoundListItemMatchListItemFragment) => {
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
          <span className="text-muted">
            {round.primaryTimer && ' - '}
            <RoundListItemMatchTimer round={round} match={match} />
          </span>
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
              {match.drawPermitted && (
                <Dropdown.Item
                  disabled={disabled || match.draw}
                  onClick={() => onSetDraw?.(match.id)}
                >
                  Mark as a draw
                </Dropdown.Item>
              )}
            </EllipsisDropdown>
          )}
        </ListGroup.Item>
      ))}
    </ListGroup>
  )
}

export default RoundListItemMatchList
