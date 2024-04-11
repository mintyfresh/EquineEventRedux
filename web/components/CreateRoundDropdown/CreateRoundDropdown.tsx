import { useSuspenseQuery } from '@apollo/client'
import { useState } from 'react'
import { ButtonGroup, Dropdown } from 'react-bootstrap'
import { CreateRoundDropdownPlayersDocument, CreateRoundDropdownPlayersQuery, CreateRoundDropdownPlayersQueryVariables, RoundCreateCustomInput, useCreateCustomRoundMutation } from '../../lib/generated/graphql'
import RoundModal from '../RoundModal'
import CreateRoundButton from './CreateRoundButton'
import { useErrors } from '../../lib/errors'

export interface CreateRoundDropdownProps {
  event: { id: string }
  disabled?: boolean
  onCreate?(): void
}

export default function CreateRoundDropdown({ event, disabled, onCreate }: CreateRoundDropdownProps) {
  const [showRoundModal, setShowRoundModal] = useState(false)
  const [input, setInput] = useState<RoundCreateCustomInput>({ eventId: event.id })
  const [errors, setErrors] = useErrors()

  const { data: { event: { players } } } = useQuery<CreateRoundDropdownPlayersQuery, CreateRoundDropdownPlayersQueryVariables>(
    CreateRoundDropdownPlayersDocument,
    {
      variables: { eventId: event.id }
    }
  )

  const [createCustomRound, { loading }] = useCreateCustomRoundMutation({
    variables: { input },
    onCompleted({ roundCreateCustom }) {
      setErrors(roundCreateCustom?.errors)

      if (roundCreateCustom?.round?.id) {
        onCreate?.()
        setShowRoundModal(false)
      }
    }
  })

  return (
    <>
      <Dropdown as={ButtonGroup}>
        <CreateRoundButton
          event={event}
          disabled={disabled || loading}
          onCreate={onCreate}
        />
        <Dropdown.Toggle split disabled={disabled} />
        <Dropdown.Menu align="end">
          <Dropdown.Item
            disabled={disabled || loading}
            onClick={() => setShowRoundModal(true)}
          >
            Create custom round
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <RoundModal
        title="Start New Round"
        mode="create"
        show={showRoundModal}
        event={event}
        players={players.nodes}
        input={input}
        errors={errors}
        disabled={loading}
        onHide={() => setShowRoundModal(false)}
        onInputChange={(input) => {
          setInput(input)
          setErrors(null)
        }}
        onSubmit={() => createCustomRound()}
      />
    </>
  )
}
