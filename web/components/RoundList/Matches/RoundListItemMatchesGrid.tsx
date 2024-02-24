import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { RoundListItemMatchesGridFragment } from '../../../lib/generated/graphql'
import RoundMatchesGridCard from './RoundListItemMatchesGridCard'

export interface RoundListItemMatchesGridProps {
  round: RoundListItemMatchesGridFragment
  disabled?: boolean
  onSetWinner?: (matchId: string, winnerId: string) => void
  onSetDraw?: (matchId: string) => void
}

const RoundListItemMatchesGrid: React.FC<RoundListItemMatchesGridProps> = ({ round, disabled, onSetWinner, onSetDraw }) => {
  return (
    <Row>
      {round.matches.map((match) =>
        <Col key={match.id} lg="3" className="mb-3">
          <RoundMatchesGridCard
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

export default RoundListItemMatchesGrid
