# frozen_string_literal: true

module Resolvers
  class EventProposeMatches < BaseResolver
    description 'Generates a possible list of matches for a round.'

    type [[Types::PlayerType, { null: true }]], null: false

    argument :event_id, ID, required: true
    argument :exclude_player_ids, [ID], required: false, default_value: [] do
      description 'Players to be excluded from pairing'
    end

    def resolve(event_id:, exclude_player_ids: [])
      event = ::Event.find(event_id)

      # TODO: Implement a proper pairing algorithm.
      event.players.active.where.not(id: exclude_player_ids).shuffle.in_groups_of(2).to_a
    end
  end
end
