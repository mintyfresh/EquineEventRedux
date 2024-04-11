import Link, { LinkProps } from 'next/link'
import { usePathname } from 'next/navigation'
import React, { Children } from 'react'

const ActiveLink = ({ children, ...props }: React.PropsWithChildren<LinkProps>) => {
  const pathname = usePathname()
  const active = pathname === props.href
  const child = Children.only(children)

  if (!active) {
    return (
      <Link {...props}>{child}</Link>
    )
  }

  return (
    <Link {...props}>
      {React.cloneElement(child as any, { active: true })}
    </Link>
  )
}

export default ActiveLink
