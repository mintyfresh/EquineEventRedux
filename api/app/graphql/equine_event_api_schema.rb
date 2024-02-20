# frozen_string_literal: true

class EquineEventApiSchema < GraphQL::Schema
  mutation Types::MutationType
  query Types::QueryType
  subscription Types::SubscriptionType

  # For batch-loading (see https://graphql-ruby.org/dataloader/overview.html)
  use GraphQL::Dataloader
  use GraphQL::Subscriptions::ActionCableSubscriptions,
      broadcast: true, default_broadcastable: true
  # NOTE: Here we marked all fields are "broadcastable" by default.
  #       This means that updates to any field not marked as "broadcastable: false"
  #       will be evaluated once and the same result will be broadcast to all subscribers.
  #       (As opposed to "broadcastable: false", which will be re-evaluated for each subscriber.)

  # GraphQL-Ruby calls this when something goes wrong while running a query:

  # Union and Interface Resolution
  def self.resolve_type(_abstract_type, object, _ctx)
    object.class.try(:graphql_type) || "Types::#{object.class.name}Type".constantize
  end
end
