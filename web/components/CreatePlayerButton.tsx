import { gql } from '@apollo/client'
import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { ERRORS_FRAGMENT, useErrors } from '../lib/errors'
import { CreatePlayerButtonFragment, PlayerInput, useCreatePlayerMutation } from '../lib/generated/graphql'
import PlayerModal from './PlayerModal'

const defaultPlayerInput: PlayerInput = {
  paid: true
}

gql`
  mutation CreatePlayer($eventID: ID!, $input: PlayerInput!) {
    playerCreate(eventId: $eventID, input: $input) {
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

export interface CreatePlayerButtonProps extends Omit<React.ComponentProps<typeof Button>, 'onClick'> {
  event: CreatePlayerButtonFragment
  onCreate: () => void
}

const CreatePlayerButton: React.FC<CreatePlayerButtonProps> = ({ event, onCreate, ...props }) => {
  const [showModal, setShowModal] = useState(false)
  const [input, setInput] = useState<PlayerInput>(defaultPlayerInput)
  const [errors, setErrors] = useErrors()

  const [createPlayer, { loading }] = useCreatePlayerMutation({
    variables: { eventID: event.id, input },
    onCompleted: ({ playerCreate }) => {
      setErrors(playerCreate?.errors)

      if (playerCreate?.player?.id) {
        // Clear name after successful creation
        setInput({  ...input, name: '' })
        onCreate()
      }
    }
  })

  return (
    <>
      <Button {...props} accessKey="n" onClick={() => setShowModal(true)}>
        Create <u>n</u>ew player
      </Button>
      <PlayerModal
        title="Create Player"
        mode="create"
        show={showModal}
        onHide={() => setShowModal(false)}
        input={input}
        onChange={setInput}
        errors={errors}
        disabled={loading}
        onSubmit={(createAnother, focus) => {
          createPlayer().then((result) => {
            if (result.data?.playerCreate?.player?.id) {
              createAnother ? focus() : setShowModal(false)
            }
          })
        }}
      />
    </>
  )
}

export default CreatePlayerButton
