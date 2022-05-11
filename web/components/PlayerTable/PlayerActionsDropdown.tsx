import { gql } from '@apollo/client'
import { Dropdown } from 'react-bootstrap'
import { PlayerActionsDropdownFragment, PlayerActionsUpdateMutationVariables, usePlayerActionsDeleteMutation, usePlayerActionsUpdateMutation } from '../../lib/generated/graphql'
import EllipsisDropdown from '../EllipsisDropdown'
import EditPlayerDropdownItem, { EDIT_PLAYER_DROPDOWN_ITEM_FRAGMENT } from './EditPlayerDropdownItem'

export const PLAYER_ACTIONS_DROPDOWN_FRAGMENT = gql`
  fragment PlayerActionsDropdown on Player {
    id
    paid
    dropped
    ...EditPlayerDropdownItem
  }
  ${EDIT_PLAYER_DROPDOWN_ITEM_FRAGMENT}
`

gql`
  mutation PlayerActionsUpdate($id: ID!, $input: PlayerInput!) {
    playerUpdate(id: $id, input: $input) {
      player {
        id
        ...PlayerActionsDropdown
      }
      errors {
        attribute
        message
      }
    }
  }
  ${PLAYER_ACTIONS_DROPDOWN_FRAGMENT}
`

gql`
  mutation PlayerActionsDelete($id: ID!) {
    playerDelete(id: $id) {
      success
      errors {
        attribute
        message
      }
    }
  }
`

export interface PlayerActionsDropdownProps {
  player: PlayerActionsDropdownFragment;
  onDelete?: () => void;
}

const PlayerActionsDropdown: React.FC<PlayerActionsDropdownProps> = ({ player, onDelete }) => {
  const [updatePlayer, { loading: updateLoading }] = usePlayerActionsUpdateMutation()
  const [deletePlayer, { loading: deleteLoading }] = usePlayerActionsDeleteMutation({
    onCompleted: ({ playerDelete }) => {
      playerDelete?.success && onDelete?.()
    }
  })

  const loading = updateLoading || deleteLoading

  const updatePlayerAttribute = (attribute: keyof PlayerActionsUpdateMutationVariables['input'], value: boolean) => {
    updatePlayer({ variables: { id: player.id, input: { [attribute]: value } } })
  }

  return (
    <EllipsisDropdown align="end">
      <EditPlayerDropdownItem player={player} />
      <Dropdown.Item disabled={loading} onClick={() => updatePlayerAttribute('paid', !player.paid)}>
        Mark {player.paid ? 'unpaid' : 'paid'}
      </Dropdown.Item>
      <Dropdown.Item disabled={loading} onClick={() => updatePlayerAttribute('dropped', !player.dropped)}>
        {player.dropped ? 'Restore' : 'Drop'}
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item className="text-danger" onClick={() => {
        if (confirm(`Are you sure you want to delete ${player.name}?`)) {
          deletePlayer({ variables: { id: player.id } })
        }
      }}>
        Delete
      </Dropdown.Item>
    </EllipsisDropdown>
  )
}

export default PlayerActionsDropdown
