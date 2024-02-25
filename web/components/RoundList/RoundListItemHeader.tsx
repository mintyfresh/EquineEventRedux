import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Card } from 'react-bootstrap'
import { RoundListItemHeaderFragment } from '../../lib/generated/graphql'
import RoundListItemDropdown from './RoundListItemDropdown'

export interface RoundListItemHeaderProps extends React.ComponentProps<typeof Card.Header> {
  round: RoundListItemHeaderFragment
  disabled?: boolean
  expanded?: boolean
  onExpand?(expanded: boolean): void
  onDelete?(round: RoundListItemHeaderFragment): void
}

const RoundListItemHeader: React.FC<RoundListItemHeaderProps> = ({ round, disabled, expanded, onExpand, onDelete, style, ...props }) => {
  return (
    <Card.Header
      {...props}
      style={expanded ? style : { ...style, borderBottom: 'none' }}
    >
      Round {round.number}
      {round.isComplete && ' (Complete)'}
      <FontAwesomeIcon
        icon={expanded ? faChevronDown : faChevronUp}
        className="ms-2"
        role="button"
        onClick={() => onExpand?.(!expanded)}
      />
      <RoundListItemDropdown
        round={round}
        disabled={disabled}
        onDelete={() => onDelete?.(round)}
      />
    </Card.Header>
  )
}

export default RoundListItemHeader
