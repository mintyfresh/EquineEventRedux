# frozen_string_literal: true

module Resolvers
  class RoundProposePairings < BaseResolver
    description 'Generates a possible list of pairings for a round.'

    type [[Types::PlayerType, { null: true }]], null: false

    argument :round_id, ID, required: true
    argument :exclude_player_ids, [ID], required: false, default_value: [] do
      description 'Players to be excluded from pairing'
    end

    def resolve(round_id:, exclude_player_ids: [])
      round = ::Round.find(round_id)

      # TODO: Implement a proper pairing algorithm.
      round.event.players.active.where.not(id: exclude_player_ids).shuffle.in_groups_of(2).to_a
    end
  end
end
