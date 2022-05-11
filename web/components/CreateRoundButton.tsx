import { gql } from '@apollo/client'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { ERRORS_FRAGMENT } from '../lib/errors'
import { CreateRoundButtonFragment, RoundCreateInput, useCreateRoundMutation, usePlayersForRoundCreateLazyQuery } from '../lib/generated/graphql'
import RoundModal, { ROUND_MODAL_PLAYER_FRAGMENT } from './RoundModal'

export const CREATE_ROUND_BUTTON_FRAGMENT = gql`
  fragment CreateRoundButton on Event {
    id
  }
`

gql`
  query PlayersForRoundCreate($id: ID!) {
    event(id: $id) {
      id
      players(activeOnly: true) {
        nodes {
          id
          ...RoundModalPlayer
        }
      }
    }
  }
  ${ROUND_MODAL_PLAYER_FRAGMENT}
`

gql`
  mutation CreateRound($eventId: ID!, $input: RoundCreateInput!) {
    roundCreate(eventId: $eventId, input: $input) {
      round {
        id
      }
      errors {
        ...Errors
      }
    }
  }
  ${ERRORS_FRAGMENT}
`

const EMPTY_ROUND_CREATE_INPUT: RoundCreateInput = {
  matches: []
}

export interface CreateRoundButtonProps {
  event: CreateRoundButtonFragment
  onCreate: () => void
}

const CreateRoundButton: React.FC<CreateRoundButtonProps> = ({ event, onCreate }) => {
  const [showModal, setShowModal] = useState(false)
  const [input, setInput] = useState<RoundCreateInput>(EMPTY_ROUND_CREATE_INPUT)

  const [loadPlayers, { data, loading: playersLoading }] = usePlayersForRoundCreateLazyQuery({
    variables: { id: event.id },
    onCompleted: ({ event }) => {
      if (event?.players?.nodes?.length) {
        setInput({
          ...input,
          // Generate empty matches for each player
          matches: event.players.nodes.map((player) => (
            { player1Id: player.id, player2Id: null }
          ))
        })
      }
    }
  })

  const [createRound, { loading }] = useCreateRoundMutation({
    variables: { eventId: event.id, input },
    onCompleted: ({ roundCreate }) => {
      if (roundCreate?.round?.id) {
        // Clear inputs after successful creation
        setInput(EMPTY_ROUND_CREATE_INPUT)
        setShowModal(false)
        onCreate()
      }
    }
  })

  return (
    <>
      <Button disabled={playersLoading} onClick={() => {
        loadPlayers()
        setShowModal(true)
      }}>
        {playersLoading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
            Loading players...
          </>
        ) : (
          'Start Next Round'
        )}
      </Button>
      {data?.event?.players?.nodes && (
        <RoundModal
          players={data.event.players.nodes}
          show={showModal}
          onHide={() => setShowModal(false)}
          disabled={loading}
          input={input}
          onChange={setInput}
          onSubmit={() => createRound()}
        />
      )}
      <br></br>
      <pre>{JSON.stringify(input, null, 2)}</pre>
    </>
  )
}

export default CreateRoundButton
