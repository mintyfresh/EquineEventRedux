import { gql } from '@apollo/client'
import { useState } from 'react'
import { ErrorsFragment } from './generated/graphql'

export const ERRORS_FRAGMENT = gql`
  fragment Errors on Error {
    attribute
    message(full: true)
  }
`

export class Errors {
  errors: { [key: string]: string[] } = {}

  constructor(errors: ErrorsFragment[]) {
    errors.forEach(({ attribute, message }) => {
      if (!this.errors[attribute]) {
        this.errors[attribute] = []
      }

      this.errors[attribute].push(message)
    })
  }

  static none(): Errors {
    return new Errors([])
  }

  any(attribute: string): boolean {
    return !!this.errors[attribute]
  }

  get(attribute: string): string[] {
    return this.errors[attribute] || []
  }
}

export const useErrors = (): [Errors, (errors: Errors | ErrorsFragment[] | null | undefined) => void] => {
  const [errors, _setErrors] = useState<Errors>(Errors.none())

  const setErrors = (errors: Errors | ErrorsFragment[] | null | undefined) => {
    if (errors instanceof Errors) {
      _setErrors(errors)
    } else if (errors) {
      _setErrors(new Errors(errors))
    } else {
      _setErrors(Errors.none())
    }
  }

  return [errors, setErrors]
}
