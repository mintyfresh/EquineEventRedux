# frozen_string_literal: true

module Resolvers
  class RecordFind < BaseResolver
    # @param model_name [String]
    # @param type [Class<Types::BaseObject>, Module<Types::BaseInterface>]
    # @return [Class<RecordFind>]
    def self.[](model_name, type: default_type(model_name))
      resolver = Class.new(self)

      resolver.define_singleton_method(:model) { @model ||= model_name.constantize }
      resolver.description("Finds a #{type.graphql_name} by ID")

      resolver.type(type, null: false)
      resolver.argument(:id, 'ID', required: true)

      resolver
    end

    # @abstract
    # @return [Class<ActiveRecord::Base>]
    def self.model
      raise NotImplmentedError, "#{name}.model is not implemented"
    end

    # @param model_name [String]
    # @return [Class<Types::BaseObject>, Module<Types::BaseInterface>]
    def self.default_type(model_name)
      "Types::#{model_name}Type".constantize
    end

    def resolve(id:)
      record = self.class.model.find(id)
      yield(record) if block_given?

      record
    end
  end
end
