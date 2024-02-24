import { faCrown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import { RoundListItemMatchesGridCardFragment } from '../../../lib/generated/graphql'

type MatchCardPlayer = RoundListItemMatchesGridCardFragment['player1'] | RoundListItemMatchesGridCardFragment['player2']

interface MatchCardPlayerProps {
  match: RoundListItemMatchesGridCardFragment
  player: MatchCardPlayer
  disabled?: boolean
  className?: string
  onSetWinner?: (matchId: string, winnerId: string) => void
}

const MatchCardPlayer: React.FC<MatchCardPlayerProps> = ({ match, player, disabled, className, onSetWinner }) => {
  if (!player) {
    return (
      <Card.Text className={'h5 px-1 py-2 ' + className}>
        <i className="text-muted">BYE</i>
      </Card.Text>
    )
  }

  return (
    <Card.Text
      className={'h5 px-1 py-2 ' + className}
      role="button"
      aria-disabled={disabled}
      onClick={() => !disabled && onSetWinner?.(match.id, player.id)}
    >
      <FontAwesomeIcon
        icon={faCrown}
        color={match.winnerId === player.id ? 'gold' : 'lightgrey'}
        className="me-2"
      />
      <span className={player.dropped ? 'text-decoration-line-through' : undefined}>
        {player.name}
      </span>
    </Card.Text>
  ) 
}

interface MatchCardDividerProps {
  match: RoundListItemMatchesGridCardFragment
  disabled?: boolean
  onSetDraw?: (matchId: string) => void
}

const MatchCardDivider: React.FC<MatchCardDividerProps> = ({ match, disabled, onSetDraw }) => {
  if (!match.player2) {
    return (
      <hr />
    )
  }

  return (
    <Row
      role="button"
      aria-disabled={disabled}
      onClick={() => !disabled && onSetDraw?.(match.id)}
    >
      <Col><hr /></Col>
      <Col xs="auto" className="my-auto">
        <h5 className={match.draw ? 'text-danger' : undefined}>
          {match.draw ? '<< TIE >>' : 'TIE'}
        </h5>
      </Col>
      <Col><hr /></Col>
    </Row>
  )
}

export interface RoundListItemMatchesGridCardProps {
  match: RoundListItemMatchesGridCardFragment
  disabled?: boolean
  onSetWinner?: (matchId: string, winnerId: string) => void
  onSetDraw?: (matchId: string) => void
}

const RoundListItemMatchesGridCard: React.FC<RoundListItemMatchesGridCardProps> = ({ match, disabled, onSetWinner, onSetDraw }) => {
  return (
    <Card className="text-center">
      <Card.Header>Table {match.table}</Card.Header>
      <MatchCardPlayer match={match} player={match.player1} disabled={disabled} onSetWinner={onSetWinner} className="pt-4" />
      <MatchCardDivider match={match} disabled={disabled} onSetDraw={onSetDraw} />
      <MatchCardPlayer match={match} player={match.player2} disabled={disabled} onSetWinner={onSetWinner} className="pb-4" />
    </Card>
  )
}

export default RoundListItemMatchesGridCard
