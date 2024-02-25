import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ComponentPropsWithoutRef, forwardRef, MouseEventHandler, PropsWithChildren } from 'react'
import { Dropdown } from 'react-bootstrap'

const ellipsis = <FontAwesomeIcon icon={faEllipsisH} />

export type EllipsisDropdownProps = PropsWithChildren<ComponentPropsWithoutRef<typeof Dropdown>>

const EllipsisDropdown: React.FC<EllipsisDropdownProps> = ({ children, disabled, ...props }) => {
  const EllipsisToggle = forwardRef<HTMLAnchorElement, { onClick: MouseEventHandler<HTMLAnchorElement> }>(({ onClick }, ref) => {
    if (disabled) {
      return (
        <span className="text-secondary user-select-none" ref={ref} title="Toggle dropdown" aria-disabled={disabled}>
          {ellipsis}
        </span>
      )
    }

    return (
      <a className="text-secondary user-select-none" role="button" ref={ref} title="Toggle dropdown" onClick={(event) => {
        event.preventDefault()
        onClick(event)
      }}>
        {ellipsis}
      </a>
    )
  })
  
  EllipsisToggle.displayName = 'EllipsisToggle'
  
  return (
    <Dropdown {...props} aria-disabled={disabled}>
      <Dropdown.Toggle as={EllipsisToggle} />
      <Dropdown.Menu>
        {children}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default EllipsisDropdown
