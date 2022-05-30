# frozen_string_literal: true

module Mutations
  class RecordDelete < BaseMutation
    # @param model_name [String]
    # @param type [Class<Types::BaseObject>, Module<Types::BaseInterface>]
    # @return [Class<RecordDelete>]
    def self.[](model_name, type: default_type(model_name))
      mutation = Class.new(self)

      mutation.define_singleton_method(:model) { @model ||= model_name.constantize }

      mutation.graphql_name "#{type.graphql_name}Delete"
      mutation.description "Deletes an existing #{type.graphql_name} by ID"

      mutation
    end

    argument :id, ID, required: true

    field :success, Boolean, null: true
    field :errors, [Types::ErrorType], null: true

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

      if record.destroy
        { success: true }
      else
        { errors: record.errors }
      end
    end
  end
end
