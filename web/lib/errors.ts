import { gql } from '@apollo/client'
import { useState } from 'react'
import { ErrorsFragment } from './generated/graphql'

export const ERRORS_FRAGMENT = gql`
  fragment Errors on Error {
    attribute
    message(full: true)
  }
`

export interface Errors {
  any(attribute: string): boolean

  get(attribute: string): string[]
  getBulk(attributes: string[]): string[]

  prefix(scope: string): Errors
}

class NullErrors implements Errors {
  any(attribute: string): boolean {
    return false
  }

  get(attribute: string): string[] {
    return []
  }
  getBulk(attributes: string[]): string[] {
    return []
  }

  prefix(scope: string): Errors {
    return this
  }
}

class ParsedErrors implements Errors {
  private _errors: { [key: string]: string[] } = {}

  constructor(errors: ErrorsFragment[]) {
    errors.forEach(({ attribute, message }) => {
      if (!this._errors[attribute]) {
        this._errors[attribute] = []
      }

      this._errors[attribute].push(message)
    })
  }

  any(attribute: string): boolean {
    return !!this._errors[attribute]
  }

  get(attribute: string): string[] {
    return this._errors[attribute] || []
  }
  getBulk(attributes: string[]): string[] {
    return attributes.flatMap((attribute) => this.get(attribute))
  }

  prefix(prefix: string): Errors {
    return new PrefixedErrors(this, prefix)
  }
}

class PrefixedErrors implements Errors {
  constructor(private _errors: Errors, private _prefix: string) {}

  any(attribute: string): boolean {
    return this._errors.any(`${this._prefix}.${attribute}`)
  }

  get(attribute: string): string[] {
    return this._errors.get(`${this._prefix}.${attribute}`)
  }
  getBulk(attributes: string[]): string[] {
    return attributes.flatMap((attribute) => this.get(attribute))
  }

  prefix(prefix: string): Errors {
    return new PrefixedErrors(this._errors, `${this._prefix}.${prefix}`)
  }
}

const NULL_ERRORS = new NullErrors()

export const useErrors = (): [Errors, (errors: ErrorsFragment[] | null | undefined) => void] => {
  const [errors, _setErrors] = useState<Errors>(NULL_ERRORS)

  const setErrors = (errors: ErrorsFragment[] | null | undefined) => {
    if (errors) {
      _setErrors(new ParsedErrors(errors))
    } else {
      _setErrors(NULL_ERRORS)
    }
  }

  return [errors, setErrors]
}
