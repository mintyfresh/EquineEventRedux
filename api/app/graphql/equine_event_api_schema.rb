# frozen_string_literal: true

class EquineEventApiSchema < GraphQL::Schema
  mutation Types::MutationType
  query Types::QueryType

  # For batch-loading (see https://graphql-ruby.org/dataloader/overview.html)
  use GraphQL::Dataloader

  # GraphQL-Ruby calls this when something goes wrong while running a query:

  # Union and Interface Resolution
  #
  # @param object [ActiveRecord::Base]
  # @return [Class<GraphQL::Schema::Object>, Module<GraphQL::Schema::Interface>]
  def self.resolve_type(_abstract_type, object, _context)
    object.class.try(:graphql_type) || "Types::#{object.class.name}Type".constantize
  end

  # @param object [ActiveRecord::Base]
  # @return [String]
  def self.id_from_object(object, _type, _context)
    object.to_gid_param
  end

  # @param id [String]
  # @return [ActiveRecord::Base, nil]
  def self.object_from_id(id, _context)
    GlobalID.find(id)
  rescue ActiveRecord::RecordNotFound
    nil
  end
end
