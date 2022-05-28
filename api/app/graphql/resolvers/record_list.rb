# frozen_string_literal: true

module Resolvers
  class RecordList < BaseResolver
    # @param model_name [String]
    # @param type [Class<Types::BaseConnection>]
    # @return [Class<RecordList>]
    def self.[](model_name, type: default_type(model_name))
      resolver = Class.new(self)

      resolver.define_singleton_method(:model) { @model ||= model_name.constantize }
      resolver.description "Finds a list of #{type.node_type.graphql_name} objects"

      resolver.type(type, null: false)

      resolver
    end

    # @abstract
    # @return [Class<ActiveRecord::Base>]
    def self.model
      raise NotImplmentedError, "#{name}.model is not implemented"
    end

    # @param model_name [String]
    # @return [Class<Types::BaseConnection>]
    def self.default_type(model_name)
      "Types::#{model_name}ConnectionType".safe_constantize || "Types::#{model_name}Type".constantize.connection_type
    end

    def resolve
      self.class.model.all
    end
  end
end
