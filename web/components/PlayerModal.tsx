import { useRef, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { Errors } from '../lib/errors'
import { PlayerInput } from '../lib/generated/graphql'
import FormControlErrors from './Form/FormControlErrors'

export interface PlayerModalProps {
  title: string
  mode: 'create' | 'update'
  show: boolean
  disabled: boolean
  input: PlayerInput
  errors: Errors
  onHide: () => void
  onChange: (input: PlayerInput) => void
  onSubmit: (createAnother: boolean, focus: () => void) => void
}

const PlayerModal: React.FC<PlayerModalProps> = ({ title, mode, show, disabled, input, errors, onHide, onChange, onSubmit }) => {
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
        onSubmit(createAnother, () => nameRef.current?.focus())
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

export default PlayerModal
