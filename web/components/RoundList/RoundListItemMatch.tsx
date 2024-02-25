import { Card } from 'react-bootstrap'
import { RoundListItemMatchFragment } from '../../lib/generated/graphql'
import { RoundViewMode } from './RoundListItem'
import RoundListItemMatchList from './Match/RoundListItemMatchList'
import RoundListItemMatchGrid from './Match/RoundListItemMatchGrid'

export interface RoundListItemMatchProps {
  round: RoundListItemMatchFragment
  viewMode?: RoundViewMode
  disabled?: boolean
  onSetWinner?(matchId: string, winnerId: string): void
  onSetDraw?(matchId: string): void
}

const RoundListItemMatch: React.FC<RoundListItemMatchProps> = ({ round, viewMode, disabled, onSetWinner, onSetDraw }) => {
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
        <RoundListItemMatchList
          round={round}
          disabled={disabled}
          onSetWinner={onSetWinner}
          onSetDraw={onSetDraw}
        />
      )

    case RoundViewMode.Grid:
      return (
        <Card.Body className="pb-0">
          <RoundListItemMatchGrid
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

export default RoundListItemMatch
