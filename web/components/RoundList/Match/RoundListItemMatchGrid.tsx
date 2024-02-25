import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { RoundListItemMatchGridFragment } from '../../../lib/generated/graphql'
import RoundMatchesGridCard from './RoundListItemMatchGridCard'

export interface RoundListItemMatchGridProps {
  round: RoundListItemMatchGridFragment
  disabled?: boolean
  onSetWinner?: (matchId: string, winnerId: string) => void
  onSetDraw?: (matchId: string) => void
}

const RoundListItemMatchGrid: React.FC<RoundListItemMatchGridProps> = ({ round, disabled, onSetWinner, onSetDraw }) => {
  return (
    <Row>
      {round.matches.map((match) =>
        <Col key={match.id} lg="3" className="mb-3">
          <RoundMatchesGridCard
            round={round}
            match={match}
            disabled={disabled}
            onSetWinner={onSetWinner}
            onSetDraw={onSetDraw}
          />
        </Col>
      )}
    </Row>
  )
}

export default RoundListItemMatchGrid
