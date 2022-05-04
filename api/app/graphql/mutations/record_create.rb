# frozen_string_literal: true

module Mutations
  class RecordCreate < BaseMutation
    # @param model [Class<ActiveRecord::Base>]
    # @return [Class<RecordCreate>]
    def self.[](model)
      mutation = Class.new(self)

      mutation.define_singleton_method(:model) { model }
      mutation.graphql_name "Create#{mutation.model_output_type.graphql_name}"
      mutation.description "Creates a new #{mutation.model_output_type.graphql_name}"

      mutation.argument(mutation.model_input_name, mutation.model_input_type, required: true)
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
    def self.model_input_name
      :"#{model.model_name.singular}_input"
    end

    # @return [Class<Types::BaseInputObject>]
    def self.model_input_type
      "Types::#{model.name}InputType".constantize
    end

    # @return [Symbol]
    def self.model_output_name
      model.model_name.singular.to_sym
    end

    # @return [Class<Types::BaseObject>]
    def self.model_output_type
      "Types::#{model.name}Type".constantize
    end

    def resolve(**arguments, &)
      input  = arguments.fetch(self.class.model_input_name)
      record = self.class.model.new(input.to_h, &)

      if record.save
        { self.class.model_output_name => record }
      else
        { errors: record.errors }
      end
    end
  end
end
