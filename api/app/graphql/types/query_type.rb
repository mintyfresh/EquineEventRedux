# frozen_string_literal: true

module Types
  class QueryType < BaseObject
    field :event, resolver: Resolvers::Event
    field :events, resolver: Resolvers::Events

    field :match, resolver: Resolvers::Match

    field :player, resolver: Resolvers::Player

    field :round, resolver: Resolvers::Round
  end
end
