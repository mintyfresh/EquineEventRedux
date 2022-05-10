import { useRef, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { Errors } from '../lib/errors'
import { PlayerInput } from '../lib/generated/graphql'
import FormControlErrors from './Form/FormControlErrors'

export interface PlayerModalProps {
  title: string
  show: boolean
  disabled: boolean
  input: PlayerInput
  errors: Errors
  onHide: () => void
  onChange: (input: PlayerInput) => void
  onSubmit: (createAnother: boolean) => void
}

const PlayerModal: React.FC<PlayerModalProps> = ({ title, show, disabled, input, errors, onHide, onChange, onSubmit }) => {
  const nameRef = useRef<HTMLInputElement>(null)

  const [createAnother, setCreateAnother] = useState(false)

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
        onSubmit(createAnother)
      }}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              ref={nameRef}
              title="Name"
              value={input.name || ''}
              onChange={(event) => onChange({ ...input, name: event.currentTarget.value })}
              isInvalid={errors.any('name')}
              disabled={disabled}
            />
            <FormControlErrors name="name" errors={errors} />
          </Form.Group>
          <Form.Group>
            <Form.Check
              title="Paid"
              label="Paid"
              checked={input.paid || false}
              onChange={(event) => onChange({ ...input, paid: event.currentTarget.checked })}
              isInvalid={errors.any('paid')}
              disabled={disabled}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Form.Check
            type="checkbox"
            label="Create another player"
            checked={createAnother}
            onChange={(event) => setCreateAnother(event.currentTarget.checked)}
            className="me-auto"
          />
          <Button type="submit">
            Create Player
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default PlayerModal
