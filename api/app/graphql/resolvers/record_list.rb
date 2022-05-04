# frozen_string_literal: true

module Resolvers
  class RecordList < BaseResolver
    # @param model [Class<ActiveRecord::Base>]
    # @return [Class<RecordList>]
    def self.[](model)
      resolver = Class.new(self)

      resolver.define_singleton_method(:model) { model }
      resolver.description "Finds a list of #{resolver.model_graphql_type.graphql_name} objects"

      resolver.type(resolver.model_connection_type, null: false)

      resolver
    end

    # @abstract
    # @return [Class<ActiveRecord::Base>]
    def self.model
      raise NotImplmentedError, "#{name}#model is not implemented"
    end

    # @return [Class<Types::BaseObject>]
    def self.model_graphql_type
      "Types::#{model.name}Type".constantize
    end

    # @return [Class<Types::BaseConnection>]
    def self.model_connection_type
      model_graphql_type.connection_type
    end

    def resolve
      self.class.model.all
    end
  end
end
