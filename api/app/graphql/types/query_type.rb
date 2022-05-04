# frozen_string_literal: true

module Types
  class QueryType < BaseObject
    field :event, resolver: Resolvers::Event
    field :events, resolver: Resolvers::Events

    field :match, resolver: Resolvers::Match

    field :player, resolver: Resolvers::Player

    field :round, resolver: Resolvers::Round
    field :round_propose_pairings, resolver: Resolvers::RoundProposePairings
  end
end
