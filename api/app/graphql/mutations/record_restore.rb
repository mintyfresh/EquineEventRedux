# frozen_string_literal: true

module Mutations
  class RecordRestore < BaseMutation
    # @param model_name [String]
    # @param output_type [Class<Types::BaseObject>, Module<Types::BaseInterface>]
    # @param output_name [Symbol]
    # @return [Class<RecordRestore>]
    def self.[](
      model_name,
      output_type: default_output_type(model_name),
      output_name: default_output_name(output_type)
    )
      mutation = Class.new(self)

      mutation.define_singleton_method(:model) { @model ||= model.constantize }
      mutation.define_singleton_method(:model_input_name) { input_name }

      mutation.graphql_name "#{output_type.graphql_name}Restore"
      mutation.description "Restores a deleted #{output_type.graphql_name} by ID"

      mutation.field(output_name, output_type, null: true)

      mutation
    end

    argument :id, ID, required: true

    field :errors, [Types::ErrorType], null: true

    # @abstract
    # @return [Class<ActiveRecord::Base>]
    def self.model
      raise NotImplmentedError, "#{name}.model is not implemented"
    end

    # @abstract
    # @return [Symbol]
    def self.model_output_name
      raise NotImplmentedError, "#{name}.model_output_name is not implemented"
    end

    # @param model_name [String]
    # @return [Class<Types::BaseObject>, Module<Types::BaseInterface>]
    def self.default_output_type(model_name)
      "Types::#{model_name}Type".constantize
    end

    # @param output_type [Class<Types::BaseObject>, Module<Types::BaseInterface>]
    # @return [Symbol]
    def self.default_output_name(output_type)
      output_type.graphql_name.underscore.to_sym
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
