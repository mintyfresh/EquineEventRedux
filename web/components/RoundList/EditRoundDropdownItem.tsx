import { gql } from '@apollo/client'
import { useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { ERRORS_FRAGMENT, useErrors } from '../../lib/errors'
import { EditRoundDropdownItemFragment, RoundInput, usePlayersForEditRoundLazyQuery, useUpdateRoundMutation } from '../../lib/generated/graphql'
import { MATCH_FORM_INPUT_PLAYER_FRAGMENT } from '../MatchFormInput'
import RoundModal from '../RoundModal'

export const EDIT_ROUND_DROPDOWN_ITEM_FRAGMENT = gql`
  fragment EditRoundDropdownItem on Round {
    id
    number
    matches {
      id
      table
      winnerId
      draw
      player1 {
        id
        ...MatchFormInputPlayer
      }
      player2 {
        id
        ...MatchFormInputPlayer
      }
    }
  }
  ${MATCH_FORM_INPUT_PLAYER_FRAGMENT}
`

gql`
  query PlayersForEditRound($roundID: ID!) {
    round(id: $roundID) {
      id
      players(deleted: ALL) {
        id
        ...MatchFormInputPlayer
      }
      unpairedPlayers(activeOnly: true, deleted: NON_DELETED) {
        id
        ...MatchFormInputPlayer
      }
    }
  }
  ${EDIT_ROUND_DROPDOWN_ITEM_FRAGMENT}
  ${MATCH_FORM_INPUT_PLAYER_FRAGMENT}
`

gql`
  mutation UpdateRound($roundID: ID!, $roundInput: RoundInput!) {
    roundUpdate(id: $roundID, input: $roundInput) {
      round {
        id
        ...EditRoundDropdownItem
      }
      errors {
        ...Errors
      }
    }
  }
  ${EDIT_ROUND_DROPDOWN_ITEM_FRAGMENT}
  ${ERRORS_FRAGMENT}
`

const buildRoundInput = (round: EditRoundDropdownItemFragment): RoundInput => ({
  matches: round.matches.map((match) => ({
    id: match.id,
    table: match.table,
    player1Id: match.player1.id,
    player2Id: match.player2?.id ?? ''
  }))
})

export interface EditRoundDropdownItemProps {
  event: { id: string }
  round: EditRoundDropdownItemFragment
}

const EditRoundDropdownItem: React.FC<EditRoundDropdownItemProps> = ({ event, round }) => {
  const [visible, setVisible] = useState(false)
  const [input, setInput] = useState<RoundInput>(buildRoundInput(round))
  const [errors, setErrors] = useErrors()

  const [loadPlayers, { data, loading: playersLoading }] = usePlayersForEditRoundLazyQuery({
    variables: { roundID: round.id }
  })

  const [updateRound, { loading }] = useUpdateRoundMutation({
    variables: { roundID: round.id, roundInput: input },
    onCompleted: ({ roundUpdate }) => {
      setErrors(roundUpdate?.errors)

      if (roundUpdate?.round) {
        setVisible(false)
        setInput(buildRoundInput(roundUpdate.round))
      }
    }
  })

  const showModal = () => {
    loadPlayers()
    setVisible(true)
  }

  const hideModal = () => {
    setVisible(false)
    setInput(buildRoundInput(round))
  }

  return (
    <>
      <Dropdown.Item disabled={playersLoading} onClick={showModal}>
        Edit
      </Dropdown.Item>
      {data?.round?.players && (
        <RoundModal
          title={`Edit Round ${round.number}`}
          mode="update"
          show={visible}
          players={data.round.players.concat(data.round.unpairedPlayers)}
          event={event}
          input={input}
          errors={errors}
          disabled={loading}
          onHide={hideModal}
          onInputChange={setInput}
          onSubmit={() => updateRound()}
        />
      )}
    </>
  )
}

export default EditRoundDropdownItem
