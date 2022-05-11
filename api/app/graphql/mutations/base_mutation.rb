# frozen_string_literal: true

module Mutations
  class BaseMutation < GraphQL::Schema::Mutation
    argument_class Types::BaseArgument
    field_class Types::BaseField
    object_class Types::BaseObject

    # @return [void]
    def self.inherited(subclass)
      super
      subclass.description(description) if description
    end
  end
end
