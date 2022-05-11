# frozen_string_literal: true

module Mutations
  class EventGeneratePairings < BaseMutation
    description 'Generates a possible list of pairings for a round.'

    field :pairings, [Types::PairingType], null: false

    argument :event_id, ID, required: true
    argument :player_ids, [ID], required: true do
      description 'Players for which pairings should be generated.'
    end

    def resolve(event_id:, player_ids:)
      event   = ::Event.find(event_id)
      players = event.players.active.find(player_ids)

      # TODO: Implement a proper pairing algorithm.
      pairings = players.shuffle.in_groups_of(2).to_a
      pairings = pairings.map { |(player1, player2)| { player1:, player2: } }

      { pairings: }
    end
  end
end
