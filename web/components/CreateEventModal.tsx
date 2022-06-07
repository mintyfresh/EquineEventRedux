import { gql } from '@apollo/client'
import { useRef, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { ERRORS_FRAGMENT, useErrors } from '../lib/errors'
import { useCreateEventMutation } from '../lib/generated/graphql'
import FormControlErrors from './Form/FormControlErrors'

gql`
  mutation CreateEvent($input: EventInput!) {
    eventCreate(input: $input) {
      event {
        id
        name
      }
      errors {
        ...Errors
      }
    }
  }
  ${ERRORS_FRAGMENT}
`

interface CreateEventModalProps {
  onCreate: () => void
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ onCreate }) => {
  const nameRef = useRef<HTMLInputElement>(null)

  const [show, setShow] = useState(false)
  const [name, setName] = useState('')
  const [errors, setErrors] = useErrors()

  const [createEvent, { loading }] = useCreateEventMutation({
    variables: { input: { name } },
    onCompleted: ({ eventCreate }) => {
      setErrors(eventCreate?.errors)

      if (eventCreate?.event?.id) {
        onCreate()
        setShow(false)
        setName('')
      }
    }
  })

  return (
    <>
      <Button className="mb-3" accessKey="n" onClick={() => setShow(true)}>
        Create <u>N</u>ew Event
      </Button>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        onEntered={() => nameRef.current?.focus()}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Event</Modal.Title>
        </Modal.Header>
        <Form onSubmit={(event) => {
          event.preventDefault()
          createEvent()
        }}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                title="Name"
                ref={nameRef}
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                disabled={loading}
                isInvalid={errors.any('name')}
              />
              <FormControlErrors name="name" errors={errors} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit">
              Create Event
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default CreateEventModal
