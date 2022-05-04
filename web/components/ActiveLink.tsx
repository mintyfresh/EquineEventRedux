import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/router'
import React, { Children } from 'react'

const ActiveLink = ({ children, ...props }: React.PropsWithChildren<LinkProps>) => {
  const { asPath } = useRouter()
  const active = asPath === props.href || asPath === props.as

  if (!active) {
    return (
      <Link {...props}>{children}</Link>
    )
  }

  const child = Children.only(children)

  return (
    <Link {...props}>
      {React.cloneElement(child as any, { active: true })}
    </Link>
  )
}

export default ActiveLink
