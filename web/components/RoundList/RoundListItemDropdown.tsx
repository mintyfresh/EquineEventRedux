import { Dropdown } from 'react-bootstrap'
import { RoundListItemDropdownFragment, useDeleteRoundMutation } from '../../lib/generated/graphql'
import EllipsisDropdown from '../EllipsisDropdown'
import EditRoundDropdownItem from './EditRoundDropdownItem'

export interface RoundListItemDropdownProps {
  round: RoundListItemDropdownFragment
  disabled?: boolean
  onDelete?(): void
}

const RoundListItemDropdown: React.FC<RoundListItemDropdownProps> = ({ round, disabled, onDelete }) => {
  const [deleteRound, { loading }] = useDeleteRoundMutation({
    variables: { id: round.id },
    onCompleted: ({ roundDelete }) => {
      roundDelete?.success && onDelete?.()
    }
  })

  return (
    <EllipsisDropdown disabled={disabled} align="end" className="float-end d-print-none">
      <EditRoundDropdownItem round={round} />
      <Dropdown.Divider />
      <Dropdown.Item
        className="text-danger"
        disabled={loading || disabled}
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

export default RoundListItemDropdown
