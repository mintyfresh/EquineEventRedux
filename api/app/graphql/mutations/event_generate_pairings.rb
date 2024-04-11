# frozen_string_literal: true

module Mutations
  class EventGeneratePairings < BaseMutation
    description 'Generates a possible list of pairings for a round.'

    field :pairings, [Types::PairingType], null: false

    argument :event_id, ID, required: true
    argument :round_id, ID, required: false

    def resolve(event_id:, round_id: nil)
      event = ::Event.find(event_id)

      if round_id.present?
        round_number = event.rounds.find(round_id)
      else
        round_number = event.next_round_number
      end

      pairings = event.generate_pairings(round_number)
      pairings = pairings.map { |(player1, player2)| { player1:, player2: } }

      { pairings: }
    end
  end
end
