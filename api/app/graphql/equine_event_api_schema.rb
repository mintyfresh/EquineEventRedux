# frozen_string_literal: true

class EquineEventApiSchema < GraphQL::Schema
  mutation Types::MutationType
  query Types::QueryType

  # For batch-loading (see https://graphql-ruby.org/dataloader/overview.html)
  use GraphQL::Dataloader

  # GraphQL-Ruby calls this when something goes wrong while running a query:

  # Union and Interface Resolution
  def self.resolve_type(_abstract_type, object, _ctx)
    object.class.try(:graphql_type) || "Types::#{object.class.name}Type".constantize
  end
end
