# frozen_string_literal: true

module Mutations
  class EventGeneratePairings < BaseMutation
    description 'Generates a possible list of pairings for a round.'

    field :pairings, [Types::PairingType], null: false

    argument :event_id, ID, required: true
    argument :round_id, ID, required: true

    def resolve(event_id:, round_id:)
      event = ::Event.find(event_id)
      round = event.rounds.find(round_id)

      pairings = event.generate_pairings(round)
      pairings = pairings.map { |(player1, player2)| { player1:, player2: } }

      { pairings: }
    end
  end
end
