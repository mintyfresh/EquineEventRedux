import { gql } from '@apollo/client'
import { useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { ERRORS_FRAGMENT, useErrors } from '../../lib/errors'
import { EditPlayerDropdownItemFragment, PlayerInput, useEditPlayerMutation } from '../../lib/generated/graphql'
import PlayerModal from '../PlayerModal'

export const EDIT_PLAYER_DROPDOWN_ITEM_FRAGMENT = gql`
  fragment EditPlayerDropdownItem on Player {
    id
    name
    paid
    dropped
  }
`

gql`
  mutation EditPlayer($id: ID!, $input: PlayerInput!) {
    playerUpdate(input: {
      id: $id,
      playerInput: $input
    }) {
      player {
        id
        ...EditPlayerDropdownItem
      }
      errors {
        ...Errors
      }
    }
  }
  ${EDIT_PLAYER_DROPDOWN_ITEM_FRAGMENT}
  ${ERRORS_FRAGMENT}
`

export interface EditPlayerDropdownItemProps {
  player: EditPlayerDropdownItemFragment
}

const EditPlayerDropdownItem: React.FC<EditPlayerDropdownItemProps> = ({ player }) => {
  const [showModal, setShowModal] = useState(false)
  const [input, setInput] = useState<PlayerInput>({
    name: player.name,
    paid: player.paid
  })
  const [errors, setErrors] = useErrors()

  const [editPlayer, { loading }] = useEditPlayerMutation({
    variables: { id: player.id, input },
    onCompleted: ({ playerUpdate }) => {
      setErrors(playerUpdate?.errors)

      if (playerUpdate?.player?.id) {
        // Hide modal on success
        setShowModal(false)
      }
    }
  })

  return (
    <>
      <Dropdown.Item onClick={() => setShowModal(true)}>Edit</Dropdown.Item>
      <PlayerModal
        title={`Edit ${player.name}`}
        mode="update"
        show={showModal}
        onHide={() => setShowModal(false)}
        input={input}
        onChange={setInput}
        errors={errors}
        disabled={loading}
        onSubmit={(_, focus) => editPlayer({
          // Re-focus inputs once request is complete
          onCompleted: () => focus()
        })}
      />
    </>
  )
}

export default EditPlayerDropdownItem
