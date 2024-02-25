# frozen_string_literal: true

module Resolvers
  class RecordFind < BaseResolver
    # @param model_name [String]
    # @param type [Class<Types::BaseObject>, Module<Types::BaseInterface>]
    # @return [Class<RecordFind>]
    def self.[](model_name, type: default_type(model_name), &)
      resolver = Class.new(self)

      resolver.define_singleton_method(:model) { @model ||= model_name.constantize }
      resolver.description("Finds a #{type.graphql_name} by ID")

      resolver.type(type, null: false)
      resolver.argument(:id, 'ID', required: true)
      resolver.instance_eval(&) if block_given?

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
      record = find_record_by_id(id)
      yield(record) if block_given?

      record
    end

  protected

    # @param id [String]
    # @return [ActiveRecord::Base]
    # @raise [ActiveRecord::RecordNotFound]
    def find_record_by_id(id)
      dataloader.with(Sources::Record, self.class.model).load(id) or
        raise self.class.model.all.raise_record_not_found_exception!
    end
  end
end
