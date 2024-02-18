import { gql } from '@apollo/client'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MutableRefObject, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { ERRORS_FRAGMENT, useErrors } from '../lib/errors'
import { CreateRoundButtonFragment, RoundInput, useCreateRoundMutation, usePlayersForRoundCreateLazyQuery } from '../lib/generated/graphql'
import { MATCH_FORM_INPUT_PLAYER_FRAGMENT } from './MatchFormInput'
import RoundModal from './RoundModal'

export const CREATE_ROUND_BUTTON_FRAGMENT = gql`
  fragment CreateRoundButton on Event {
    id
  }
`

gql`
  query PlayersForRoundCreate($id: ID!) {
    event(id: $id) {
      id
      players(activeOnly: true) {
        nodes {
          id
          ...MatchFormInputPlayer
        }
      }
    }
  }
  ${MATCH_FORM_INPUT_PLAYER_FRAGMENT}
`

gql`
  mutation CreateRound($eventId: ID!, $input: RoundInput!) {
    roundCreate(eventId: $eventId, input: $input) {
      round {
        id
      }
      errors {
        ...Errors
      }
    }
  }
  ${ERRORS_FRAGMENT}
`

const EMPTY_ROUND_CREATE_INPUT: RoundInput = {
  matches: []
}

export interface CreateRoundButtonProps extends Omit<React.ComponentProps<typeof Button>, 'onClick'> {
  event: CreateRoundButtonFragment
  onCreate: () => void
}

const CreateRoundButton: React.FC<CreateRoundButtonProps> = ({ event, onCreate, ...props }) => {
  const [showModal, setShowModal] = useState(false)
  const [input, setInput] = useState<RoundInput>(EMPTY_ROUND_CREATE_INPUT)
  const [errors, setErrors] = useErrors()

  const [loadPlayers, { data, loading: playersLoading }] = usePlayersForRoundCreateLazyQuery({
    variables: { id: event.id }
  })

  const [createRound, { loading }] = useCreateRoundMutation({
    variables: { eventId: event.id, input },
    onCompleted: ({ roundCreate }) => {
      setErrors(roundCreate?.errors)

      if (roundCreate?.round?.id) {
        // Reset input and modal state
        setInput(EMPTY_ROUND_CREATE_INPUT)
        setShowModal(false)

        onCreate()
      }
    }
  })

  return (
    <>
      <Button disabled={playersLoading} {...props} accessKey="n" onClick={() => {
        loadPlayers()
        setShowModal(true)
      }}>
        {playersLoading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
            Loading players...
          </>
        ) : (
          <>Start <u>N</u>ext Round</>
        )}
      </Button>
      {data?.event?.players?.nodes && (
        <RoundModal
          title="Start New Round"
          mode="create"
          show={showModal}
          players={data.event.players.nodes}
          event={data.event}
          input={input}
          errors={errors}
          disabled={loading}
          onHide={() => setShowModal(false)}
          onInputChange={(input) => {
            setInput(input)
            setErrors(null)
          }}
          onSubmit={() => createRound()}
        />
      )}
    </>
  )
}

export default CreateRoundButton
