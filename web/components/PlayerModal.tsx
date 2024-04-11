import { useEffect, useRef, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { Errors } from '../lib/errors'
import { PlayerCreateInput, PlayerInput } from '../lib/generated/graphql'
import FormControlErrors from './Form/FormControlErrors'

export interface PlayerModalProps<Input extends PlayerInput | PlayerCreateInput> {
  title: string
  mode: 'create' | 'update'
  show: boolean
  disabled: boolean
  input: Input
  errors: Errors
  onHide: () => void
  onChange: (input: Input) => void
  onSubmit: (createAnother: boolean, focus: () => void) => void
}

export default function PlayerModal<Input extends PlayerInput | PlayerCreateInput>({ title, mode, show, disabled, input, errors, onHide, onChange, onSubmit }: PlayerModalProps<Input>) {
  const nameRef = useRef<HTMLInputElement>(null)

  const [focusName, setFocusName] = useState(false)
  const [createAnother, setCreateAnother] = useState(false)

  // Focus name on next update if requested
  useEffect(() => {
    if (focusName) {
      nameRef.current?.focus()
      setFocusName(false)
    }
  }, [focusName])

  return (
    <Modal
      show={show}
      onHide={onHide}
      onEntered={() => nameRef.current?.focus()}
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(event) => {
        event.preventDefault()
        onSubmit(createAnother, () => setFocusName(true))
      }}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label><u>N</u>ame</Form.Label>
            <Form.Control
              ref={nameRef}
              title="Name"
              value={input.name || ''}
              onChange={(event) => onChange({ ...input, name: event.currentTarget.value })}
              isInvalid={errors.any('name')}
              disabled={disabled}
              accessKey="n"
              autoComplete="don't"
            />
            <FormControlErrors name="name" errors={errors} />
          </Form.Group>
          <Form.Group>
            <Form.Check
              title="Paid"
              label={<><u>P</u>aid</>}
              checked={input.paid || false}
              onChange={(event) => onChange({ ...input, paid: event.currentTarget.checked })}
              isInvalid={errors.any('paid')}
              disabled={disabled}
              accessKey="p"
            />
          </Form.Group>
          <Form.Group>
            <Form.Check
              title="Dropped"
              label={<>D<u>r</u>opped</>}
              checked={input.dropped || false}
              onChange={(event) => onChange({ ...input, dropped: event.currentTarget.checked })}
              isInvalid={errors.any('dropped')}
              disabled={disabled}
              accessKey="r"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          {mode === 'create' && (
            <Form.Check
              type="checkbox"
              label={<><u>C</u>reate another player</>}
              checked={createAnother}
              onChange={(event) => setCreateAnother(event.currentTarget.checked)}
              className="me-auto"
              accessKey="c"
            />
          )}
          <Button type="submit">
            {mode === 'create' ? 'Create' : 'Update'} Player
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
