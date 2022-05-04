# frozen_string_literal: true

module Resolvers
  class RoundProposePairings < BaseResolver
    type [[Types::PlayerType, { null: true }]], null: false

    argument :round_id, ID, required: true

    def resolve(round_id:)
      round = ::Round.find(round_id)

      # TODO: Implement a proper pairing algorithm.
      round.event.players.shuffle.in_groups_of(2).to_a
    end
  end
end
