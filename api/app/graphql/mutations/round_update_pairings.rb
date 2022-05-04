# frozen_string_literal: true

module Mutations
  class RoundUpdatePairings < BaseMutation
    description 'Updates the Match pairings for a Round'

    field :round, Types::RoundType, null: true
    field :errors, [Types::ErrorType], null: true

    argument :round_id, ID, required: true do
      description 'The ID of the Round to update'
    end
    argument :pairings, [[ID, { null: true }]], required: true do
      description 'The IDs of the Players to pair'
    end

    def resolve(round_id:, pairings:)
      round = ::Round.find(round_id)

      if round.update_pairings(pairings)
        { round: }
      else
        { errors: round.errors }
      end
    end
  end
end
