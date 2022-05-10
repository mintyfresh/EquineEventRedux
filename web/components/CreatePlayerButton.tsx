import { gql } from '@apollo/client'
import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { ERRORS_FRAGMENT, useErrors } from '../lib/errors'
import { CreatePlayerButtonFragment, PlayerInput, useCreatePlayerMutation } from '../lib/generated/graphql'
import PlayerModal from './PlayerModal'

gql`
  mutation CreatePlayer($eventID: ID!, $input: PlayerInput!) {
    playerCreate(input: {
      eventId: $eventID,
      playerInput: $input
    }) {
      player {
        id
      }
      errors {
        ...Errors
      }
    }
  }
  ${ERRORS_FRAGMENT}
`

export const CREATE_PLAYER_BUTTON_FRAGMENT = gql`
  fragment CreatePlayerButton on Event {
    id
  }
`

export interface CreatePlayerButtonProps {
  event: CreatePlayerButtonFragment
  onCreate: () => void
}

const CreatePlayerButton: React.FC<CreatePlayerButtonProps> = ({ event, onCreate }) => {
  const [showModal, setShowModal] = useState(false)
  const [input, setInput] = useState<PlayerInput>({})
  const [errors, setErrors] = useErrors()

  const [createPlayer, { loading }] = useCreatePlayerMutation({
    onCompleted: ({ playerCreate }) => {
      setErrors(playerCreate?.errors)

      if (playerCreate?.player?.id) {
        // Clear inputs after successful creation
        setInput({})
        onCreate()
      }
    }
  })

  const onSubmit = (createAnother: boolean) => {
    createPlayer({
      variables: { eventID: event.id, input },
      onCompleted: ({ playerCreate }) => {
        if (playerCreate?.player?.id) {
          // Close modal unless we want to create another
          setShowModal(createAnother)
        }
      }
    })
  }

  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        Create Player
      </Button>
      <PlayerModal
        title="Create Player"
        show={showModal}
        onHide={() => setShowModal(false)}
        input={input}
        onChange={setInput}
        errors={errors}
        disabled={loading}
        onSubmit={onSubmit}
      />
    </>
  )
}

export default CreatePlayerButton
