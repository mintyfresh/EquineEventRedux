import { gql } from '@apollo/client'
import { useRef, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { ERRORS_FRAGMENT, useErrors } from '../lib/errors'
import { useCreatePlayerMutation } from '../lib/generated/graphql'
import FormControlErrors from './Form/FormControlErrors'

gql`
  mutation CreatePlayer($eventID: ID!, $input: PlayerInput!) {
    playerCreate(input: {
      eventId: $eventID,
      playerInput: $input
    }) {
      player {
        id
      }
      errors {
        ...Errors
      }
    }
  }
  ${ERRORS_FRAGMENT}
`

export interface CreatePlayerModalProps {
  event: { id: string }
  onCreate: () => void
}

const CreatePlayerModal: React.FC<CreatePlayerModalProps> = ({ event, onCreate }) => {
  const nameRef = useRef<HTMLInputElement>(null)

  const [show, setShow] = useState(false)
  const [name, setName] = useState('')
  const [paid, setPaid] = useState(false)
  const [createAnother, setCreateAnother] = useState(false)
  const [errors, setErrors] = useErrors()

  const [createPlayer, { loading }] = useCreatePlayerMutation({
    variables: {
      eventID: event.id,
      input: { name, paid }
    },
    onCompleted: ({ playerCreate }) => {
      setErrors(playerCreate?.errors)

      if (playerCreate?.player?.id) {
        onCreate()
        setShow(createAnother)

        setName('')
        setPaid(false)
        nameRef.current?.focus()
      }
    }
  })

  return (
    <>
      <Button className="mb-3" onClick={() => setShow(true)}>
        Create Player
      </Button>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        onEntered={() => nameRef.current?.focus()}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Player</Modal.Title>
        </Modal.Header>
        <Form onSubmit={(event) => {
          event.preventDefault()
          createPlayer()
        }}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                ref={nameRef}
                title="Name"
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                isInvalid={errors.any('name')}
                disabled={loading}
              />
              <FormControlErrors name="name" errors={errors} />
            </Form.Group>
            <Form.Group>
              <Form.Check
                title="Paid"
                label="Paid"
                checked={paid}
                onChange={(event) => setPaid(event.currentTarget.checked)}
                isInvalid={errors.any('paid')}
                disabled={loading}
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
    </>
  )
}

export default CreatePlayerModal
