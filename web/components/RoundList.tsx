import { RoundListItemFragment } from '../lib/generated/graphql'
import RoundListItem, { RoundViewMode } from './RoundList/RoundListItem'

export interface RoundListProps {
  rounds: RoundListItemFragment[]
  viewMode?: RoundViewMode
  disabled?: boolean
  onSetWinner?(matchId: string, winnerId: string): void
  onSetDraw?(matchId: string): void
  onDelete?(round: RoundListItemFragment): void
}

const RoundList: React.FC<RoundListProps> = ({ rounds, viewMode, disabled, onSetWinner, onSetDraw, onDelete }) => {
  return (
    <>
      {rounds.map((round) => (
        <RoundListItem
          key={round.id}
          round={round}
          viewMode={viewMode}
          disabled={disabled}
          onSetWinner={onSetWinner}
          onSetDraw={onSetDraw}
          onDelete={onDelete}
        />
      ))}
    </>
  )
}

export default RoundList
