import { gql } from '@apollo/client'
import { faCrown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Card, Col, Row } from 'react-bootstrap'
import { MatchCardFragment } from '../lib/generated/graphql'
import React from 'react'

export const MATCH_CARD_FRAGMENT = gql`
  fragment MatchCard on Match {
    id
    table
    winnerId
    draw
    player1 {
      id
      name
      dropped
    }
    player2 {
      id
      name
      dropped
    }
  }

`

type MatchCardPlayer = MatchCardFragment['player1'] | MatchCardFragment['player2']

interface MatchCardPlayerProps {
  match: MatchCardFragment
  player: MatchCardPlayer
  className?: string
  onSetWinner?: (matchId: string, winnerId: string) => void
}

const MatchCardPlayer: React.FC<MatchCardPlayerProps> = ({ match, player, className, onSetWinner }) => {
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
      onClick={() => onSetWinner?.(match.id, player.id)}
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
  match: MatchCardFragment
  onSetDraw?: (matchId: string) => void
}

const MatchCardDivider: React.FC<MatchCardDividerProps> = ({ match, onSetDraw }) => {
  if (!match.player2) {
    return (
      <hr />
    )
  }

  return (
    <Row
      role="button"
      onClick={() => onSetDraw?.(match.id)}
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

export interface MatchCardProps {
  match: MatchCardFragment
  onSetWinner?: (matchId: string, winnerId: string) => void
  onSetDraw?: (matchId: string) => void
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onSetWinner, onSetDraw }) => {
  return (
    <Card className="text-center">
      <Card.Header>Table {match.table}</Card.Header>
      <MatchCardPlayer match={match} player={match.player1} onSetWinner={onSetWinner} className="pt-4" />
      <MatchCardDivider match={match} onSetDraw={onSetDraw} />
      <MatchCardPlayer match={match} player={match.player2} onSetWinner={onSetWinner} className="pb-4" />
    </Card>
  )
}

export default MatchCard
