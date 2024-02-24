import React, { useState } from 'react'
import { Card, Collapse } from 'react-bootstrap'
import { RoundListItemFragment } from '../../lib/generated/graphql'
import RoundListItemHeader from './RoundListItemHeader'
import RoundListItemMatches from './RoundListItemMatches'

export enum RoundViewMode {
  List = 'list',
  Grid = 'grid'
}

export interface RoundListItemProps {
  round: RoundListItemFragment
  viewMode?: RoundViewMode
  disabled?: boolean
  onSetWinner?(matchId: string, winnerId: string): void
  onSetDraw?(matchId: string): void
  onDelete?(round: RoundListItemFragment): void
}

const RoundListItem: React.FC<RoundListItemProps> = ({ round, viewMode, disabled, onSetWinner, onSetDraw, onDelete }) => {
  const [expanded, setExpanded] = useState(!round.isComplete)

  return (
    <Card className="mb-3" style={{ breakInside: 'avoid' }}>
      <RoundListItemHeader
        round={round}
        expanded={expanded}
        onExpand={setExpanded}
        onDelete={onDelete}
      />
      <Collapse in={expanded}>
        <div>
          <RoundListItemMatches
            round={round}
            viewMode={viewMode}
            disabled={disabled}
            onSetWinner={onSetWinner}
            onSetDraw={onSetDraw}
          />
        </div>
      </Collapse>
    </Card>
  )
}

export default RoundListItem
