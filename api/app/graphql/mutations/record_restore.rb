# frozen_string_literal: true

module Mutations
  class RecordRestore < BaseMutation
    # @param model [Class<ActiveRecord::Base>]
    # @return [Class<RecordRestore>]
    def self.[](model)
      mutation = Class.new(self)

      mutation.define_singleton_method(:model) { model }
      mutation.graphql_name "Restore#{mutation.model_output_type.graphql_name}"
      mutation.description "Restores a deleted #{mutation.model_output_type.graphql_name} by ID"

      mutation.argument(:id, 'ID', required: true)
      mutation.field(mutation.model_output_name, mutation.model_output_type, null: true)
      mutation.field(:errors, [Types::ErrorType], null: true)

      mutation
    end

    # @abstract
    # @return [Class<ActiveRecord::Base>]
    def self.model
      raise NotImplmentedError, "#{name}#model is not implemented"
    end

    # @return [Symbol]
    def self.model_output_name
      model.model_name.singular.to_sym
    end

    # @return [Class<Types::BaseObject>]
    def self.model_output_type
      "Types::#{model.name}Type".constantize
    end

    def resolve(id:)
      record = self.class.model.find(id)
      yield(record) if block_given?

      if record.restore
        { self.class.model_output_name => record }
      else
        { errors: record.errors }
      end
    end
  end
end
