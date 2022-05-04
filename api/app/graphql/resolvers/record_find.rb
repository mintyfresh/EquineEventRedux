# frozen_string_literal: true

module Resolvers
  class RecordFind < BaseResolver
    # @param model [Class<ActiveRecord::Base>]
    # @return [Class<RecordFind>]
    def self.[](model)
      resolver = Class.new(self)

      resolver.define_singleton_method(:model) { model }
      resolver.description "Finds a #{resolver.model_graphql_type.graphql_name} by ID"

      resolver.type(resolver.model_graphql_type, null: false)
      resolver.argument(:id, 'ID', required: true)

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

    def resolve(id:)
      record = self.class.model.find(id)
      yield(record) if block_given?

      record
    end
  end
end
