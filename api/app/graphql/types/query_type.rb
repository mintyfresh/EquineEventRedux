# frozen_string_literal: true

module Types
  class QueryType < BaseObject
    include GraphQL::Types::Relay::HasNodeField
    include GraphQL::Types::Relay::HasNodesField

    field :event, resolver: Resolvers::Event
    field :events, resolver: Resolvers::Events

    field :match, resolver: Resolvers::Match

    field :player, resolver: Resolvers::Player

    field :round, resolver: Resolvers::Round
  end
end
