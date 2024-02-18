import { gql } from '@apollo/client'
import MatchCard, { MATCH_CARD_FRAGMENT } from './MatchCard'
import { RoundFragment } from '../lib/generated/graphql'
import React, { useState } from 'react'
import { Card, Col, Collapse, Row } from 'react-bootstrap'
import RoundControlsDropdown from './RoundList/RoundControlsDropdown'
import { EDIT_ROUND_DROPDOWN_ITEM_FRAGMENT } from './RoundList/EditRoundDropdownItem'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'

export const ROUND_FRAGMENT = gql`
  fragment Round on Round {
    id
    number
    isComplete
    matches {
      ...MatchCard
    }
    ...EditRoundDropdownItem
  }
  ${MATCH_CARD_FRAGMENT}
  ${EDIT_ROUND_DROPDOWN_ITEM_FRAGMENT}
`

export interface RoundProps extends React.ComponentProps<typeof Card> {
  event: { id: string }
  round: RoundFragment
  onSetWinner?: (matchId: string, winnerId: string) => void
  onSetDraw?: (matchId: string) => void
  onDelete?: (round: RoundFragment) => void
}

const Round: React.FC<RoundProps> = ({ event, round, onSetWinner, onSetDraw, onDelete, ...props }) => {
  const [collapsed, setCollapsed] = useState(round.isComplete)

  return (
    <>
      <Card {...props}>
        <Card.Header>
          Round {round.number}
          {round.isComplete && ' (Complete)'}
          <FontAwesomeIcon
            icon={collapsed ? faChevronDown : faChevronUp}
            className="ms-2"
            role="button"
            onClick={() => setCollapsed(!collapsed)}
          />
          <RoundControlsDropdown
            event={event}
            round={round}
            onDelete={() => onDelete?.(round)}
          />
        </Card.Header>
        <Collapse in={!collapsed}>
          <Card.Body className="pb-0">
            {round.matches.length ? (
              <Row>
                {round.matches.map((match) =>
                  <Col key={match.id} lg="3" className="mb-3">
                    <MatchCard
                      match={match}
                      onSetWinner={onSetWinner}
                      onSetDraw={onSetDraw}
                    />
                  </Col>
                )}
              </Row>
            ) : (
              <Card.Text className="mb-3">
                No pairings have been added to this match yet.
              </Card.Text>
            )}
          </Card.Body>
        </Collapse>
      </Card>
    </>
  )
}

export default Round
