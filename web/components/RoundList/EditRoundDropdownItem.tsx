import { gql } from '@apollo/client'
import { useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { ERRORS_FRAGMENT } from '../../lib/errors'
import { EditRoundDropdownItemFragment, RoundInput, usePlayersForEditRoundLazyQuery, useUpdateRoundMutation } from '../../lib/generated/graphql'
import RoundModal, { ROUND_MODAL_PLAYER_FRAGMENT } from '../RoundModal'

export const EDIT_ROUND_DROPDOWN_ITEM_FRAGMENT = gql`
  fragment EditRoundDropdownItem on Round {
    id
    matches {
      id
      player1 {
        id
        name
      }
      player2 {
        id
        name
      }
    }
  }
`

gql`
  query PlayersForEditRound($roundID: ID!) {
    round(id: $roundID) {
      id
      players(deleted: ALL) {
        id
        ...RoundModalPlayer
      }
    }
  }
  ${EDIT_ROUND_DROPDOWN_ITEM_FRAGMENT}
  ${ROUND_MODAL_PLAYER_FRAGMENT}
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
  pairings: round.matches.map((match) => ({ player1Id: match.player1.id, player2Id: match.player2?.id }))
})

export interface EditRoundDropdownItemProps {
  event: { id: string }
  round: EditRoundDropdownItemFragment
}

const EditRoundDropdownItem: React.FC<EditRoundDropdownItemProps> = ({ event, round }) => {
  const [visible, setVisible] = useState(false)
  const [input, setInput] = useState<RoundInput>(buildRoundInput(round))

  const [loadPlayers, { data, loading: playersLoading }] = usePlayersForEditRoundLazyQuery({
    variables: { roundID: round.id }
  })

  const [updateRound, { loading }] = useUpdateRoundMutation({
    variables: { roundID: round.id, roundInput: input },
    onCompleted: ({ roundUpdate }) => {
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
          event={event}
          players={data.round.players}
          show={visible}
          onHide={hideModal}
          input={input}
          onChange={setInput}
          disabled={loading}
          onSubmit={() => updateRound()}
        />
      )}
    </>
  )
}

export default EditRoundDropdownItem
