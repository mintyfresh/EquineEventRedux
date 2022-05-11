import { Dropdown } from 'react-bootstrap'
import EllipsisDropdown from '../EllipsisDropdown'

const RoundControlsDropdown = () => (
  <EllipsisDropdown align="end" className="float-end">
    <Dropdown.Item>Edit</Dropdown.Item>
    <Dropdown.Divider />
    <Dropdown.Item className="text-danger">Delete</Dropdown.Item>
  </EllipsisDropdown>
)

export default RoundControlsDropdown
