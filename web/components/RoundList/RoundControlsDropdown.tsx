import { gql } from '@apollo/client'
import { Dropdown } from 'react-bootstrap'
import { ERRORS_FRAGMENT } from '../../lib/errors'
import { RoundControlsDropdownFragment, useDeleteRoundMutation } from '../../lib/generated/graphql'
import EllipsisDropdown from '../EllipsisDropdown'

export const ROUND_CONTROLS_DROPDOWN_FRAGMENT = gql`
  fragment RoundControlsDropdown on Round {
    id
  }
`

gql`
  mutation DeleteRound($id: ID!) {
    roundDelete(id: $id) {
      success
      errors {
        ...Errors
      }
    }
  }
  ${ERRORS_FRAGMENT}
`

export interface RoundControlsDropdownProps {
  round: RoundControlsDropdownFragment
  onDelete?: () => void
}

const RoundControlsDropdown: React.FC<RoundControlsDropdownProps> = ({ round, onDelete }) => {
  const [deleteRound, { loading }] = useDeleteRoundMutation({
    variables: { id: round.id },
    onCompleted: ({ roundDelete }) => {
      roundDelete?.success && onDelete?.()
    }
  })

  return (
    <EllipsisDropdown align="end" className="float-end">
      <Dropdown.Item disabled={loading}>Edit</Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item
        className="text-danger"
        disabled={loading}
        onClick={() => {
          if (confirm('Are you sure you want to delete this round?')) {
            deleteRound()
          }
        }}
      >
        Delete
      </Dropdown.Item>
    </EllipsisDropdown>
  )
}

export default RoundControlsDropdown
