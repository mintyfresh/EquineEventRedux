import { gql } from '@apollo/client'
import { Dropdown } from 'react-bootstrap'
import { PlayerActionsDropdownFragment, PlayerActionsUpdateMutationVariables, usePlayerActionsDeleteMutation, usePlayerActionsRestoreMutation, usePlayerActionsUpdateMutation } from '../../lib/generated/graphql'
import EllipsisDropdown from '../EllipsisDropdown'
import EditPlayerDropdownItem, { EDIT_PLAYER_DROPDOWN_ITEM_FRAGMENT } from './EditPlayerDropdownItem'

export const PLAYER_ACTIONS_DROPDOWN_FRAGMENT = gql`
  fragment PlayerActionsDropdown on Player {
    id
    paid
    dropped
    deleted
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

gql`
  mutation PlayerActionsRestore($id: ID!) {
    playerRestore(id: $id) {
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

export interface PlayerActionsDropdownProps {
  player: PlayerActionsDropdownFragment
  onDelete?: () => void
  onRestore?: () => void
}

const PlayerActionsDropdown: React.FC<PlayerActionsDropdownProps> = ({ player, onDelete, onRestore }) => {
  const [updatePlayer, { loading: updateLoading }] = usePlayerActionsUpdateMutation()
  const [deletePlayer, { loading: deleteLoading }] = usePlayerActionsDeleteMutation({
    variables: { id: player.id },
    onCompleted: ({ playerDelete }) => {
      playerDelete?.success && onDelete?.()
    }
  })
  const [restorePlayer, { loading: restoreLoading }] = usePlayerActionsRestoreMutation({
    variables: { id: player.id },
    onCompleted: ({ playerRestore }) => {
      playerRestore?.player && onRestore?.()
    }
  })

  const loading = updateLoading || deleteLoading || restoreLoading

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
      {player.deleted ? (
        <Dropdown.Item onClick={() => restorePlayer()}>
          Restore
        </Dropdown.Item>
      ) : (
        <Dropdown.Item className="text-danger" onClick={() => {
          if (confirm(`Are you sure you want to delete ${player.name}?`)) {
            deletePlayer()
          }
        }}>
          Delete
        </Dropdown.Item>
      )}
    </EllipsisDropdown>
  )
}

export default PlayerActionsDropdown
