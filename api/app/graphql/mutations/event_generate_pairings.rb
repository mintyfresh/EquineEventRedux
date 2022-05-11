# frozen_string_literal: true

module Mutations
  class EventGeneratePairings < BaseMutation
    description 'Generates a possible list of pairings for a round.'

    field :pairings, [Types::PairingType], null: false

    argument :event_id, ID, required: true
    argument :exclude_player_ids, [ID], required: false, default_value: [] do
      description 'Players to be excluded from pairing'
    end

    def resolve(event_id:, exclude_player_ids: [])
      event = ::Event.find(event_id)

      # TODO: Implement a proper pairing algorithm.
      pairings = event.players.active.where.not(id: exclude_player_ids).shuffle.in_groups_of(2).to_a

      { pairings: pairings.map { |(player1, player2)| { player1:, player2: } } }
    end
  end
end
