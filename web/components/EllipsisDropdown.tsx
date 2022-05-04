import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ComponentPropsWithoutRef, forwardRef, MouseEventHandler, PropsWithChildren } from 'react'
import { Dropdown } from 'react-bootstrap'

const EllipsisToggle = forwardRef<HTMLAnchorElement, { onClick: MouseEventHandler<HTMLAnchorElement> }>(({ onClick }, ref) => (
  <a className="text-secondary" href="#" ref={ref} onClick={(event) => {
    event.preventDefault()
    onClick(event)
  }}>
    <FontAwesomeIcon icon={faEllipsisH} />
  </a>
))

EllipsisToggle.displayName = 'EllipsisToggle'

export type EllipsisDropdownProps = PropsWithChildren<ComponentPropsWithoutRef<typeof Dropdown>>

const EllipsisDropdown: React.FC<EllipsisDropdownProps> = ({ children, ...props }) => (
  <Dropdown {...props}>
    <Dropdown.Toggle as={EllipsisToggle} />
    <Dropdown.Menu>
      {children}
    </Dropdown.Menu>
  </Dropdown>
)

export default EllipsisDropdown
