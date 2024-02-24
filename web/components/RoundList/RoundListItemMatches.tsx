import { Card } from 'react-bootstrap'
import { RoundListItemMatchesFragment } from '../../lib/generated/graphql'
import { RoundViewMode } from './RoundListItem'
import RoundListItemMatchesList from './Matches/RoundListItemMatchesList'
import RoundListItemMatchesGrid from './Matches/RoundListItemMatchesGrid'

export interface RoundListItemMatchesProps {
  round: RoundListItemMatchesFragment
  viewMode?: RoundViewMode
  disabled?: boolean
  onSetWinner?(matchId: string, winnerId: string): void
  onSetDraw?(matchId: string): void
}

const RoundListItemMatches: React.FC<RoundListItemMatchesProps> = ({ round, viewMode, disabled, onSetWinner, onSetDraw }) => {
  if (round.matches.length === 0) {
    return (
      <Card.Body>
        <Card.Text>No pairings have been added to this match yet.</Card.Text>
      </Card.Body>
    )
  }

  switch (viewMode) {
    case RoundViewMode.List:
      return (
        <RoundListItemMatchesList
          round={round}
          disabled={disabled}
          onSetWinner={onSetWinner}
          onSetDraw={onSetDraw}
        />
      )

    case RoundViewMode.Grid:
      return (
        <Card.Body className="pb-0">
          <RoundListItemMatchesGrid
            round={round}
            disabled={disabled}
            onSetWinner={onSetWinner}
            onSetDraw={onSetDraw}
          />
        </Card.Body>
      )

    default:
      return null
  }
}

export default RoundListItemMatches
