# frozen_string_literal: true

module Mutations
  class RecordCreate < BaseMutation
    # @param model_name [String]
    # @return [Class<RecordCreate>]
    def self.[](
      model_name,
      input_type:  default_input_type(model_name),
      input_name:  :input,
      output_type: default_output_type(model_name),
      output_name: default_output_name(output_type)
    )
      mutation = Class.new(self)

      mutation.define_singleton_method(:model) { @model ||= model_name.constantize }
      mutation.define_singleton_method(:model_input_name) { input_name }
      mutation.define_singleton_method(:model_output_name) { output_name }

      mutation.graphql_name "#{output_type.graphql_name}Create"
      mutation.description "Creates a new #{output_type.graphql_name}"

      mutation.argument(input_name, input_type, required: true)
      mutation.field(output_name, output_type, null: true)

      mutation
    end

    field :errors, [Types::ErrorType], null: true

    # @abstract
    # @return [Class<ActiveRecord::Base>]
    def self.model
      raise NotImplmentedError, "#{name}.model is not implemented"
    end

    # @abstract
    # @return [Symbol]
    def self.model_input_name
      raise NotImplmentedError, "#{name}.model_input_name is not implemented"
    end

    # @abstract
    # @return [Symbol]
    def self.model_output_name
      raise NotImplmentedError, "#{name}.model_output_name is not implemented"
    end

    # @param model_name [String]
    # @return [Class<Types::BaseInputObject>]
    def self.default_input_type(model_name)
      "Types::#{model_name}CreateInputType".safe_constantize || "Types::#{model_name}InputType".constantize
    end

    # @param model_name [String]
    # @return [Class<Types::BaseObject>]
    def self.default_output_type(model_name)
      "Types::#{model_name}Type".constantize
    end

    # @param output_type [Class<Types::BaseObject>, Module<Types::BaseInterface>]
    # @return [Symbol]
    def self.default_output_name(output_type)
      output_type.graphql_name.underscore.to_sym
    end

    def resolve(**arguments)
      record = build_record(**arguments)
      yield(record) if block_given?

      if record.save
        { self.class.model_output_name => record }
      else
        { errors: record.errors }
      end
    end

  protected

    def build_record(**arguments)
      input = arguments.fetch(self.class.model_input_name)

      self.class.model.new(input.to_h)
    end
  end
end
