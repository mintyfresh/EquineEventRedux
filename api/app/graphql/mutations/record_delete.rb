# frozen_string_literal: true

module Mutations
  class RecordDelete < BaseMutation
    # @param model [Class<ActiveRecord::Base>]
    # @return [Class<RecordDelete>]
    def self.[](model)
      mutation = Class.new(self)

      mutation.define_singleton_method(:model) { model }
      mutation.graphql_name "Delete#{mutation.model_graphql_type.graphql_name}"
      mutation.description "Deletes an existing #{mutation.model_graphql_type.graphql_name} by ID"

      mutation.argument(:id, 'ID', required: true)
      mutation.field(:success, 'Boolean', null: true)
      mutation.field(:errors, [Types::ErrorType], null: true)

      mutation
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

      if record.destroy
        { success: true }
      else
        { errors: record.errors }
      end
    end
  end
end
